import arxiv
import time
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import Paper, Author, SessionLocal
from dateutil import parser
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CATEGORIES = ["cs.LG", "cs.AI", "cs.CV", "cs.CL", "stat.ML"]

class ArxivCollector:
    def __init__(self, db: Session):
        self.db = db
        self.client = arxiv.Client(
            page_size=100,
            delay_seconds=3.0,  # FR-1.1.1: Respect rate limit of 1 request per 3 seconds
            num_retries=3
        )

    def fetch_papers(self, days_back=30, max_results=200):
        """
        Fetch papers from ArXiv for the specified categories.
        FR-1.1.1: Fetch papers from cs.LG, etc.
        """
        query = " OR ".join([f"cat:{cat}" for cat in CATEGORIES])
        
        # FR-1.1.1: Retrieve papers from date range (simulated by sort order for now, 
        # but strictly ArXiv API doesn't allow easy date range filtering in search query directly 
        # without using submittedDate syntax, which is robust)
        # Using submittedDate is better.
        
        start_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y%m%d%H%M")
        end_date = datetime.now().strftime("%Y%m%d%H%M")
        
        # Proper date range query: submittedDate:[202301010000 TO 202301312359]
        # Extending query
        date_query = f"submittedDate:[{start_date} TO {end_date}]"
        full_query = f"({query}) AND {date_query}"
        
        logger.info(f"Fetching ArXiv papers with query: {full_query}")

        search = arxiv.Search(
            query=full_query,
            max_results=max_results,
            sort_by=arxiv.SortCriterion.SubmittedDate,
            sort_order=arxiv.SortOrder.Descending
        )

        count = 0
        try:
            for result in self.client.results(search):
                self._process_paper(result)
                count += 1
                if count % 10 == 0:
                    logger.info(f"Processed {count} papers...")
        except Exception as e:
            logger.error(f"Error during fetching: {e}")
            # FR-1.1.1: Retry logic is handled by arxiv.Client(num_retries=3), 
            # but we catch top level errors here.

    def _process_paper(self, result):
        try:
            # FR-1.2.1: Deduplication
            # Check ID
            existing = self.db.query(Paper).filter(Paper.external_id == result.entry_id).first()
            if existing:
                return # Skip duplicate

            # Validate FR-1.2.2
            if not result.title or not result.authors:
                return
            if len(result.summary) < 50:
                return

            # Venue extraction (FR-1.1.4)
            venue = None
            if result.journal_ref:
                venue = result.journal_ref
            elif result.comment:
                # Simple heuristic for venue in comments
                comments = result.comment.lower()
                for v in ["neurips", "icml", "iclr", "cvpr", "acl", "emnlp"]:
                    if v in comments:
                        venue = v.upper()
                        break

            paper = Paper(
                source="arxiv",
                external_id=result.entry_id,
                doi=result.doi,
                title=result.title,
                abstract=result.summary,
                published_date=result.published.date(),
                categories=", ".join(result.categories),
                venue=venue,
                journal_ref=result.journal_ref
            )

            # Authors
            paper_authors = []
            for author_obj in result.authors:
                # FR-1.2.3: Basic Author Name Normalization (Simple Trim)
                # Full fuzzy matching would go here
                name = author_obj.name.strip()
                author_db = self.db.query(Author).filter(Author.name == name).first()
                if not author_db:
                    author_db = Author(name=name, normalized_name=name.lower())
                    self.db.add(author_db)
                    self.db.flush() # get ID
                paper_authors.append(author_db)
            
            paper.authors = paper_authors
            self.db.add(paper)
            self.db.commit()

        except Exception as e:
            logger.error(f"Failed to process paper {result.entry_id}: {e}")
            self.db.rollback()

def run_arxiv_collection():
    db = SessionLocal()
    try:
        collector = ArxivCollector(db)
        # Testing with small number of days and results first
        collector.fetch_papers(days_back=7, max_results=50)
    finally:
        db.close()
