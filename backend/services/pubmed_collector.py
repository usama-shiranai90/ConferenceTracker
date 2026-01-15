from pymed import PubMed
import time
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import Paper, Author, SessionLocal

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PubMedCollector:
    def __init__(self, db: Session):
        self.db = db
        # FR-1.1.2: Tool: Pymed, Email required for 10 req/s limit usually, 
        # simplified here.
        self.pubmed = PubMed(tool="ConferenceTracker", email="user@example.com")

    def fetch_papers(self, days_back=30, max_results=50):
        """
        FR-1.1.2: PubMed Medical AI Paper Fetching
        Query: ("machine learning" OR "deep learning" OR "artificial intelligence") 
               AND (medical subject headings) - Simplified loosely for now
        """
        # Constructing query
        start_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y/%m/%d")
        # PubMed query syntax
        # Expanded for User's specific interests: Medication, Prescription, Error, etc.
        core_ai = '("machine learning" OR "deep learning" OR "artificial intelligence" OR "large language model" OR "LLM" OR "RAG")'
        domain = '("medicine" OR "medical" OR "clinical" OR "healthcare")'
        specifics = '("medication" OR "prescription" OR "drug" OR "pharmac*" OR "medication error" OR "longitudinal" OR "time series")'
        
        query = f'({core_ai} AND {domain} AND {specifics})'
        query += f' AND ("{start_date}"[Date - Publication] : "3000"[Date - Publication])'

        logger.info(f"Fetching PubMed papers with query: {query}")

        try:
            results = self.pubmed.query(query, max_results=max_results)
            
            for result in results:
                self._process_paper(result)
                # Internal rate limiting of pymed might handle it, but adding small safety
                time.sleep(0.34) # ~3 req/s to be safe without key
        except Exception as e:
            logger.error(f"Error during PubMed fetching: {e}")

    def _process_paper(self, result):
        try:
            # Pymed returns formatted objects
            # ID check
            pmid = result.pubmed_id.split()[0] if result.pubmed_id else None
            doi = result.doi if result.doi else None
            
            if not pmid and not doi:
                return 

            external_id = f"PMID:{pmid}" if pmid else f"DOI:{doi}"
            
            # FR-1.2.1 Deduplication
            existing = self.db.query(Paper).filter(Paper.external_id == external_id).first()
            if existing:
                return

            # Basic Validation
            if not result.abstract or len(str(result.abstract)) < 50:
                 # FR-1.1.2: Filter papers with missing abstracts
                return

            paper = Paper(
                source="pubmed",
                external_id=external_id,
                doi=doi,
                title=result.title,
                abstract=result.abstract,
                published_date=result.publication_date,
                categories="Medical AI",
                venue=result.journal,
                journal_ref=result.journal
            )

            # Authors
            paper_authors = []
           
            if hasattr(result, 'authors') and result.authors:
                for a in result.authors:
                    # Generic handling of pymed author dict
                    # {'lastname': '...', 'firstname': '...', 'initials': '...'}
                    lastname = a.get('lastname', '')
                    firstname = a.get('firstname', '')
                    name = f"{firstname} {lastname}".strip()
                    
                    if not name: 
                        continue

                    author_db = self.db.query(Author).filter(Author.name == name).first()
                    if not author_db:
                        author_db = Author(name=name, normalized_name=name.lower())
                        self.db.add(author_db)
                        self.db.flush()
                    paper_authors.append(author_db)

            paper.authors = paper_authors
            self.db.add(paper)
            self.db.commit()

        except Exception as e:
            logger.error(f"Failed to process PubMed paper: {e}")
            self.db.rollback()

def run_pubmed_collection():
    db = SessionLocal()
    try:
        collector = PubMedCollector(db)
        collector.fetch_papers(days_back=7, max_results=20)
    finally:
        db.close()
