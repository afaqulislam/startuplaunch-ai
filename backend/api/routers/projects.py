from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, update, or_
from typing import List, Optional

import models, schemas
from api import deps
from services import workflow
from database import _is_sqlite
from core.ratelimit import analyze_limiter, rate_limit

router = APIRouter()

# A run is considered stuck (e.g. the server restarted mid-run) once this long
# has passed since it started, allowing the user to re-dispatch the swarm.
ANALYSIS_TIMEOUT_SECONDS = 600


@router.post("/", response_model=schemas.ProjectResponse)
async def create_project(project: schemas.ProjectCreate, db: AsyncSession = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    data = project.model_dump()
    # Optional fields that were left blank come through as "" after stripping;
    # normalize them to NULL so the UI can rely on null-checking.
    data["target_audience"] = data["target_audience"] or None
    data["industry"] = data["industry"] or None
    new_project = models.Project(**data, user_id=current_user.id)
    db.add(new_project)
    await db.commit()
    await db.refresh(new_project)
    return new_project


@router.get("/", response_model=List[schemas.ProjectResponse])
async def read_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = Query(None, max_length=200),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    # Filtering happens server-side so search + pagination compose correctly
    # beyond the first page of projects (a client-side filter can only see the
    # rows it has already fetched).
    conditions = [models.Project.user_id == current_user.id]
    if search:
        term = f"%{search.strip()}%"
        conditions.append(
            or_(
                models.Project.title.ilike(term),
                models.Project.description.ilike(term),
                models.Project.industry.ilike(term),
            )
        )
    if status:
        conditions.append(models.Project.status == status)

    result = await db.execute(
        select(models.Project)
        .where(*conditions)
        .order_by(models.Project.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    projects = result.scalars().all()
    return projects


@router.get("/{project_id}", response_model=schemas.ProjectDetailResponse)
async def read_project(project_id: int, db: AsyncSession = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    result = await db.execute(
        select(models.Project)
        .options(selectinload(models.Project.report))
        .where(models.Project.id == project_id, models.Project.user_id == current_user.id)
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    response = schemas.ProjectDetailResponse.model_validate(project)
    return response


@router.post("/{project_id}/analyze")
async def analyze_project(project_id: int, background_tasks: BackgroundTasks, db: AsyncSession = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    # Bound LLM spend: each user can only dispatch the expensive swarm so often.
    await rate_limit(analyze_limiter, f"user:{current_user.id}")

    # Verify project exists and belongs to user
    result = await db.execute(select(models.Project).where(models.Project.id == project_id, models.Project.user_id == current_user.id))
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    now = datetime.now(timezone.utc)
    threshold = now - timedelta(seconds=ANALYSIS_TIMEOUT_SECONDS)
    # SQLite stores datetimes without a timezone, so compare against a naive
    # UTC value there; Postgres keeps the tz-aware timestamptz column.
    threshold_value = threshold.replace(tzinfo=None) if _is_sqlite else threshold

    # Atomically claim the run. The check-and-set is a single UPDATE so two
    # concurrent requests can't both pass the "pending" check and dispatch the
    # swarm twice (wasting LLM credits). A stale run from a crash/restart
    # (started beyond the timeout) is still claimable.
    claim = (
        update(models.Project)
        .where(
            models.Project.id == project_id,
            models.Project.user_id == current_user.id,
            or_(
                models.Project.status != "analyzing",
                models.Project.analysis_started_at.is_(None),
                models.Project.analysis_started_at < threshold_value,
            ),
        )
        .values(status="analyzing", analysis_started_at=now)
    )
    claimed = await db.execute(claim)
    await db.commit()
    if claimed.rowcount == 0:
        raise HTTPException(status_code=400, detail="Project is currently being analyzed")

    # Trigger background task for AI Agent Workflow
    background_tasks.add_task(workflow.analyze_project_workflow, project_id)

    return {"message": "Analysis started"}


@router.delete("/{project_id}")
async def delete_project(project_id: int, db: AsyncSession = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    result = await db.execute(
        select(models.Project)
        .options(selectinload(models.Project.report))
        .where(models.Project.id == project_id, models.Project.user_id == current_user.id)
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Report is removed via the ORM cascade (and DB-level ON DELETE CASCADE).
    await db.delete(project)
    await db.commit()
    return {"message": "Project deleted successfully"}
