from fastapi import FastAPI, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from dotenv import load_dotenv
import os

load_dotenv()

# Import DB and Services
from database import init_db, get_db, Paper, Author, SessionLocal
from services.scheduler import start_scheduler, run_manual_update

app = FastAPI(title="Conference Trend Tracker API")

# Initialize DB
init_db()

# Start Scheduler
start_scheduler()

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ArticleDTO(BaseModel):
    title: str
    venue: Optional[str] = None
    published_date: Optional[date] = None
    source: str

class AuthorDTO(BaseModel):
    id: int
    name: str
    paper_count: int
    citations: int = 0
    influence_score: float = 0.0

class TrendData(BaseModel):
    year: int
    topic: str
    frequency: int

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Trend Tracker API is running with Scheduler"}

@app.get("/api/trigger-update")
async def trigger_update(background_tasks: BackgroundTasks):
    """
    Manually trigger data collection pipeline (FR-1.3.1)
    """
    background_tasks.add_task(run_manual_update)
    return {"message": "Data collection triggered in background"}

@app.get("/api/trends", response_model=List[TrendData])
def get_trends(db: Session = Depends(get_db)):
    """
    Get trend data from real collected papers.
    Aggregates papers by Year and Category (Topic).
    """
    # Aggregate by Year and Category
    # SQLite doesn't have a simple 'year' extraction in common SQL across dialects easily without func, 
    # but for SQLite we can use strftime or just fetch and process in python if dataset is small.
    # Given we might have many papers later, SQL is better. 
    # SQLite: strftime('%Y', published_date)
    
    results = db.query(
        func.strftime('%Y', Paper.published_date).label('year'),
        Paper.categories,
        func.count(Paper.id).label('count')
    ).group_by('year', Paper.categories).all()
    
    data = []
    for r in results:
        if not r.year: continue
        # Categories might be comma separated, we take the first one or primary one for simplicity
        topic = r.categories.split(',')[0] if r.categories else "Uncategorized"
        
        data.append({
            "year": int(r.year),
            "topic": topic.strip(),
            "frequency": r.count
        })
    
    # Check if data is empty (no papers yet), return empty list or fallback?
    # Returning empty list is correct behavior for real data.
    return data

@app.get("/api/papers", response_model=List[ArticleDTO])
def get_papers(db: Session = Depends(get_db)):
    papers = db.query(Paper).order_by(Paper.published_date.desc()).limit(20).all()
    return [
        ArticleDTO(
            title=p.title,
            venue=p.venue,
            published_date=p.published_date,
            source=p.source
        ) for p in papers
    ]

@app.get("/api/authors", response_model=List[AuthorDTO])
def get_authors(db: Session = Depends(get_db)):
    """
    Get top authors by paper count.
    """
    # Join Author with Paper to count
    # We want to select Author and count(Paper)
    # This requires a join through the association table 'paper_authors' implicitly handled by relationship
    
    # However, doing a simple sort in python is easier for MVP if the authors table isn't huge.
    # Or proper SQL query:
    
    authors = db.query(Author).all()
    
    # Sort by paper count
    # This is inefficient for large DB, but fine for MVP.
    sorted_authors = sorted(authors, key=lambda a: len(a.papers), reverse=True)[:50]
    
    return [
        AuthorDTO(
            id=a.id,
            name=a.name,
            paper_count=len(a.papers),
            citations=0, # Placeholder until citations logic is added
            influence_score=0.0 # Placeholder
        ) for a in sorted_authors
    ]

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    """
    Get dashboard hero metrics.
    """
    total_papers = db.query(Paper).count()
    total_authors = db.query(Author).count()
    # Estimate topics from unique categories for now, until Topic Model is fully trained and saving to a dedicated Topic table
    # or use the logic from get_trends
    unique_categories = db.query(Paper.categories).distinct().count()
    
    return {
        "total_papers": total_papers,
        "total_authors": total_authors,
        "total_topics": unique_categories
    }

from services.profile_service import get_profile, update_profile, analyze_profile

# ... existing code ...

class ProfileDTO(BaseModel):
    name: str = ""
    title: str = ""
    proposal: str = ""

@app.get("/api/profile")
def read_profile(db: Session = Depends(get_db)):
    profile = get_profile(db)
    if not profile:
        return {"name": "", "title": "", "proposal": "", "trajectory": "", "suggested_conferences": [], "suggested_papers": []}
    
    import json
    return {
        "name": profile.name,
        "title": profile.title,
        "proposal": profile.proposal,
        "trajectory": profile.trajectory,
        "suggested_conferences": json.loads(profile.suggested_conferences) if profile.suggested_conferences else [],
        "suggested_papers": json.loads(profile.suggested_papers) if profile.suggested_papers else []
    }

@app.post("/api/profile")
def save_profile(dto: ProfileDTO, db: Session = Depends(get_db)):
    profile = update_profile(db, dto.name, dto.title, dto.proposal)
    return {"status": "success", "id": profile.id}

@app.post("/api/profile/analyze")
def trigger_analysis(db: Session = Depends(get_db)):
    profile = get_profile(db)
    if not profile:
        return {"error": "Profile not found"}
    
    updated_profile = analyze_profile(db, profile.id)
    import json
    return {
        "trajectory": updated_profile.trajectory,
        "suggested_conferences": json.loads(updated_profile.suggested_conferences) if updated_profile.suggested_conferences else [],
        "suggested_papers": json.loads(updated_profile.suggested_papers) if updated_profile.suggested_papers else []
    }

# ============================================================================
# RESEARCH DISCOVERY ENDPOINTS
# ============================================================================
from services.discovery_service import (
    search_papers, get_topic_clusters, get_research_insights,
    get_recommended_papers, get_trend_analysis
)

class SearchQuery(BaseModel):
    query: str
    limit: int = 20

@app.post("/api/search")
def api_search_papers(body: SearchQuery, db: Session = Depends(get_db)):
    """Semantic search for papers based on query."""
    results = search_papers(db, body.query, body.limit)
    return {"results": results, "count": len(results)}

@app.get("/api/topics/clusters")
def api_topic_clusters(db: Session = Depends(get_db)):
    """Get topic clusters with paper counts and samples."""
    clusters = get_topic_clusters(db)
    return {"topics": clusters}

@app.get("/api/research/insights")
def api_research_insights(db: Session = Depends(get_db)):
    """Get AI-powered research insights based on collected data and user profile."""
    insights = get_research_insights(db)
    return insights

@app.get("/api/research/recommended")
def api_recommended_papers(db: Session = Depends(get_db)):
    """Get papers recommended for the user based on their profile."""
    papers = get_recommended_papers(db)
    return {"papers": papers}

@app.get("/api/research/trends")
def api_trend_analysis(db: Session = Depends(get_db)):
    """Get publication trend analysis over time."""
    analysis = get_trend_analysis(db)
    return analysis

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
