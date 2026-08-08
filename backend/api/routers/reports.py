import re

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

import models, schemas
from api import deps
from services.pdf_export import build_report_pdf

router = APIRouter()


async def _get_owned_report(
    report_id: int,
    db: AsyncSession,
    current_user: models.User,
) -> tuple[models.Report, models.Project]:
    result = await db.execute(select(models.Report).where(models.Report.id == report_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Verify user owns the project associated with the report
    project_result = await db.execute(
        select(models.Project).where(models.Project.id == report.project_id)
    )
    project = project_result.scalars().first()

    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this report")
    return report, project


@router.get("/{report_id}", response_model=schemas.ReportResponse)
async def read_report(
    report_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    report, _ = await _get_owned_report(report_id, db, current_user)
    return report


@router.get("/{report_id}/pdf")
async def export_report_pdf(
    report_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    """Generate a professional, server-side PDF of the validation report.

    Built with reportlab so every device gets the same document instead of a
    browser print-to-PDF of the web page."""
    report, project = await _get_owned_report(report_id, db, current_user)

    slug = re.sub(r"[^\w\- ]+", "", project.title).strip().replace(" ", "_")
    filename = f"{slug or 'report'}.pdf"

    pdf_bytes = build_report_pdf(project, report)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
