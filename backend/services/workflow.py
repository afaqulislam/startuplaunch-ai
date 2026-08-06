import logging
from sqlalchemy import select
from models import Project, Report
from agents.orchestrator import orchestrator
from database import SessionLocal

logger = logging.getLogger(__name__)


async def analyze_project_workflow(project_id: int):
    logger.info(f"[Workflow] Starting analysis for project_id={project_id}")
    async with SessionLocal() as db:
        project = await db.get(Project, project_id)
        if not project:
            logger.error(f"[Workflow] Project {project_id} not found!")
            return

        try:
            idea_description = f"Title: {project.title}\nDescription: {project.description}\nTarget Audience: {project.target_audience}\nIndustry: {project.industry}"
            logger.info(f"[Workflow] Sending idea to orchestrator: {idea_description[:100]}...")

            final_report = await orchestrator.run_analysis(idea_description)
            logger.info(f"[Workflow] Orchestrator finished successfully!")

            # Extract executive summary
            executive_decision = final_report.get("executive_decision", {})
            executive_summary = executive_decision.get("executive_summary", "") if isinstance(executive_decision, dict) else str(executive_decision)

            # Delete existing report if re-analyzing
            existing_report_result = await db.execute(select(Report).where(Report.project_id == project.id))
            existing_report = existing_report_result.scalars().first()
            if existing_report:
                await db.delete(existing_report)
                await db.flush()

            report = Report(
                project_id=project.id,
                content=final_report,
                executive_summary=executive_summary
            )
            db.add(report)
            project.status = "completed"
            project.analysis_started_at = None
            await db.commit()
            logger.info(f"[Workflow] Project {project_id} marked as COMPLETED.")

        except Exception as e:
            logger.error(f"[Workflow] FAILED for project {project_id}: {e}", exc_info=True)
            project.status = "failed"
            project.analysis_started_at = None
            await db.commit()
