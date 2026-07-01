import asyncio
import logging
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select, func
from app.database import AsyncSessionLocal
from app.models.request import Request
from app.models.system_config import SystemConfig

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def check_escalations():
    logger.info("Running escalation check...")
    async with AsyncSessionLocal() as db:
        try:
            config_row = await db.execute(
                select(SystemConfig).where(SystemConfig.id == 1)
            )
            config = config_row.scalar_one_or_none()
            escalation_hours = float(config.escalation_hours) if config else 72.0

            cutoff = datetime.now(timezone.utc)

            from app.services.notification import notify_admins_escalation
            from app.models.enums import AuditAction

            pending_statuses = ["pending_hod", "pending_hod_exams", "pending_manager"]
            result = await db.execute(
                select(Request).where(
                    Request.status.in_(pending_statuses),
                    Request.submitted_at.isnot(None),
                )
            )
            overdue = []
            for req in result.scalars().all():
                if req.submitted_at:
                    elapsed = (cutoff - req.submitted_at).total_seconds() / 3600
                    if elapsed >= escalation_hours:
                        overdue.append(req)

            for req in overdue:
                await notify_admins_escalation(db, req)
                logger.info(f"Escalation triggered for request {req.request_id}")

            await db.commit()
            logger.info(f"Escalation check complete — {len(overdue)} overdue requests found")
        except Exception as e:
            logger.error(f"Escalation check failed: {e}")
            await db.rollback()


async def start_scheduler():
    scheduler.add_job(check_escalations, "interval", minutes=15, id="escalation_check")
    scheduler.start()
    logger.info("Background scheduler started (escalation check every 15 min)")
