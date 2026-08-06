from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from typing import List

import models, schemas
from api import deps
from services import workflow

router = APIRouter()

# A run is considered stuck (e.g. the server restarted mid-run) once this long
# has passed since it started, allowing the user to re-dispatch the swarm.
ANALYSIS_TIMEOUT_SECONDS = 600


@router.post("/", response_model=schemas.ProjectResponse)
async def create_project(project: schemas.ProjectCreate, db: AsyncSession = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    new_project = models.Project(**project.model_dump(), user_id=current_user.id)
    db.add(new_project)
    await db.commit()
    await db.refresh(new_project)
    return new_project


@router.get("/", response_model=List[schemas.ProjectResponse])
async def read_projects(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    result = await db.execute(
        select(models.Project)
        .where(models.Project.user_id == current_user.id)
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
    # Verify project exists and belongs to user
    result = await db.execute(select(models.Project).where(models.Project.id == project_id, models.Project.user_id == current_user.id))
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    now = datetime.now(timezone.utc)

    if project.status == "analyzing":
        started = project.analysis_started_at
        if started is not None and started.tzinfo is None:
            started = started.replace(tzinfo=timezone.utc)
        stale = started is None or (now - started).total_seconds() > ANALYSIS_TIMEOUT_SECONDS
        if not stale:
            raise HTTPException(status_code=400, detail="Project is currently being analyzed")
        # Stale run left behind by a crash/restart: allow re-dispatch.

    project_id_value = project.id
    project.status = "analyzing"
    project.analysis_started_at = now
    await db.commit()

    # Trigger background task for AI Agent Workflow
    background_tasks.add_task(workflow.analyze_project_workflow, project_id_value)

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
