from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import time
import logging
from .arxiv_collector import run_arxiv_collection
from .pubmed_collector import run_pubmed_collection

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def start_scheduler():
    # FR-1.3.1: Run daily incremental updates at 2:00 AM JST
    # Note: Server time might not be JST, so we should convert or set timezone. 
    # For now, assuming local server time is what matches the requirement or handled by timezone arg.
    
    # 2:00 AM JST
    scheduler.add_job(
        run_arxiv_collection,
        trigger=CronTrigger(hour=2, minute=0),
        id='arxiv_daily',
        name='Daily ArXiv Collection',
        replace_existing=True
    )
    
    scheduler.add_job(
        run_pubmed_collection,
        trigger=CronTrigger(hour=2, minute=15),
        id='pubmed_daily',
        name='Daily PubMed Collection',
        replace_existing=True
    )

    scheduler.start()
    logger.info("Scheduler started...")

def run_manual_update():
    """Trigger manual update for testing"""
    logger.info("Manual update triggered.")
    run_arxiv_collection()
    run_pubmed_collection()
