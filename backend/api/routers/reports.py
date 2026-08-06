from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

import models, schemas
from api import deps

router = APIRouter()

@router.get("/{report_id}", response_model=schemas.ReportResponse)
async def read_report(report_id: int, db: AsyncSession = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    # Fetch report
    result = await db.execute(select(models.Report).where(models.Report.id == report_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Verify user owns the project associated with the report
    project_result = await db.execute(select(models.Project).where(models.Project.id == report.project_id))
    project = project_result.scalars().first()
    
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this report")
        
    return report
