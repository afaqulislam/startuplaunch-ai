from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

import models
from api import deps
from database import get_db

router = APIRouter()


@router.get("/summary")
async def admin_summary(
    db: AsyncSession = Depends(deps.get_db),
    _: models.User = Depends(deps.get_current_admin),
):
    """Admin-only platform summary.

    Guarded by require_role("admin"), so a regular 'user' role always receives
    a 403 here regardless of any client-side UI hiding."""

    async def scalar(query):
        result = await db.execute(query)
        return result.scalar()

    users = await scalar(select(func.count(models.User.id)))
    projects = await scalar(select(func.count(models.Project.id)))
    completed = await scalar(
        select(func.count(models.Project.id)).where(models.Project.status == "completed")
    )
    analyzing = await scalar(
        select(func.count(models.Project.id)).where(models.Project.status == "analyzing")
    )
    failed = await scalar(
        select(func.count(models.Project.id)).where(models.Project.status == "failed")
    )
    pending = await scalar(
        select(func.count(models.Project.id)).where(models.Project.status == "pending")
    )
    return {
        "users": users,
        "projects": projects,
        "projects_by_status": {
            "completed": completed,
            "analyzing": analyzing,
            "failed": failed,
            "pending": pending,
        },
    }