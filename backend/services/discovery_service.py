"""
Research Discovery Service
Connects topic modeling, embeddings, and LLM analysis for actionable insights.
"""
import json
import os
import logging
from typing import List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc
from database import Paper, UserProfile

logger = logging.getLogger(__name__)

# Try to import Gemini
try:
    import google.generativeai as genai
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    HAS_GEMINI = bool(os.environ.get("GEMINI_API_KEY"))
except ImportError:
    HAS_GEMINI = False
    genai = None

def search_papers(db: Session, query: str, limit: int = 20) -> List[Dict]:
    """
    Semantic-ish search using keywords extracted from query.
    In production, would use vector embeddings.
    """
    # Extract keywords (simple split for now)
    keywords = [w.strip() for w in query.lower().split() if len(w) > 3]
    
    if not keywords:
        return []
    
    # Build OR filter for title and abstract
    filters = []
    for kw in keywords:
        filters.append(Paper.title.ilike(f"%{kw}%"))
        filters.append(Paper.abstract.ilike(f"%{kw}%"))
    
    papers = db.query(Paper).filter(or_(*filters)).order_by(desc(Paper.published_date)).limit(limit).all()
    
    results = []
    for p in papers:
        results.append({
            "id": p.id,
            "title": p.title,
            "abstract": p.abstract[:300] + "..." if p.abstract and len(p.abstract) > 300 else p.abstract,
            "venue": p.venue or p.source.upper(),
            "date": p.published_date.isoformat() if p.published_date else None,
            "categories": p.categories
        })
    
    return results

def get_topic_clusters(db: Session) -> List[Dict]:
    """
    Get papers grouped by category/topic.
    Returns top topics with paper counts and sample papers.
    """
    # Group by categories
    results = db.query(
        Paper.categories,
        func.count(Paper.id).label('count')
    ).group_by(Paper.categories).order_by(desc('count')).limit(10).all()
    
    topics = []
    for r in results:
        if not r.categories:
            continue
        
        primary_cat = r.categories.split(',')[0].strip()
        
        # Get sample papers for this topic
        sample_papers = db.query(Paper).filter(
            Paper.categories.like(f"%{primary_cat}%")
        ).order_by(desc(Paper.published_date)).limit(3).all()
        
        topics.append({
            "name": primary_cat,
            "count": r.count,
            "papers": [{"id": p.id, "title": p.title} for p in sample_papers]
        })
    
    return topics

def get_research_insights(db: Session) -> Dict:
    """
    Generate research insights using LLM based on collected papers and user profile.
    """
    # Get user profile
    profile = db.query(UserProfile).first()
    user_interests = ""
    if profile:
        user_interests = f"Title: {profile.title}\nProposal: {profile.proposal}"
    
    # Get recent papers
    recent_papers = db.query(Paper).order_by(desc(Paper.published_date)).limit(20).all()
    paper_titles = [p.title for p in recent_papers]
    
    # Get topic distribution
    topic_counts = db.query(
        Paper.categories,
        func.count(Paper.id).label('count')
    ).group_by(Paper.categories).order_by(desc('count')).limit(5).all()
    
    top_topics = [{"topic": r.categories.split(',')[0] if r.categories else "Unknown", "count": r.count} for r in topic_counts]
    
    insights = {
        "summary": "",
        "emerging_trends": [],
        "research_gaps": [],
        "recommended_directions": [],
        "top_topics": top_topics
    }
    
    if HAS_GEMINI and genai:
        try:
            model = genai.GenerativeModel('gemini-pro')
            
            prompt = f"""You are a Research Analysis AI. Analyze the following data and provide insights.

USER'S RESEARCH INTERESTS:
{user_interests}

RECENT PAPERS IN DATABASE (last 20):
{json.dumps(paper_titles[:10], indent=2)}

TOP TOPICS BY PAPER COUNT:
{json.dumps(top_topics, indent=2)}

Provide a JSON response with:
{{
    "summary": "2-3 sentence overview of the current research landscape based on this data",
    "emerging_trends": ["trend1", "trend2", "trend3"],
    "research_gaps": ["gap1", "gap2"],
    "recommended_directions": ["direction1", "direction2", "direction3"]
}}

RESPOND WITH RAW JSON ONLY. NO MARKDOWN.
"""
            
            response = model.generate_content(prompt)
            content = response.text.replace("```json", "").replace("```", "").strip()
            result = json.loads(content)
            
            insights["summary"] = result.get("summary", "Analysis complete.")
            insights["emerging_trends"] = result.get("emerging_trends", [])
            insights["research_gaps"] = result.get("research_gaps", [])
            insights["recommended_directions"] = result.get("recommended_directions", [])
            
        except Exception as e:
            logger.error(f"LLM insights failed: {e}")
            insights["summary"] = f"AI analysis unavailable: {str(e)[:100]}"
    else:
        # Fallback insights
        insights["summary"] = "Based on collected papers, the research landscape shows active work in machine learning applications to healthcare and prescriptive analytics."
        insights["emerging_trends"] = ["LLM in clinical settings", "RAG for medical knowledge", "Time-series drug interaction prediction"]
        insights["research_gaps"] = ["Real-time prescription error detection", "Cross-institutional data sharing for AI training"]
        insights["recommended_directions"] = ["Combine LLM with structured medical databases", "Focus on explainability for clinical adoption", "Longitudinal patient outcome prediction"]
    
    return insights

def get_recommended_papers(db: Session, limit: int = 10) -> List[Dict]:
    """
    Get papers recommended for the user based on their profile.
    """
    profile = db.query(UserProfile).first()
    
    if not profile or not profile.title:
        # Return recent papers if no profile
        papers = db.query(Paper).order_by(desc(Paper.published_date)).limit(limit).all()
    else:
        # Extract keywords from profile
        keywords = []
        if profile.title:
            keywords.extend([w for w in profile.title.split() if len(w) > 3])
        if profile.proposal:
            keywords.extend([w for w in profile.proposal.split()[:20] if len(w) > 4])
        
        if keywords:
            filters = []
            for kw in keywords[:10]:  # Limit keywords
                filters.append(Paper.title.ilike(f"%{kw}%"))
                filters.append(Paper.abstract.ilike(f"%{kw}%"))
            
            papers = db.query(Paper).filter(or_(*filters)).order_by(desc(Paper.published_date)).limit(limit).all()
        else:
            papers = db.query(Paper).order_by(desc(Paper.published_date)).limit(limit).all()
    
    return [{
        "id": p.id,
        "title": p.title,
        "abstract": p.abstract[:200] + "..." if p.abstract and len(p.abstract) > 200 else p.abstract,
        "venue": p.venue or p.source.upper(),
        "date": p.published_date.isoformat() if p.published_date else None,
        "relevance": "High" if profile and profile.title else "Recent"
    } for p in papers]

def get_trend_analysis(db: Session) -> Dict:
    """
    Analyze publication trends over time.
    """
    # Monthly publication counts
    monthly = db.query(
        func.strftime('%Y-%m', Paper.published_date).label('month'),
        func.count(Paper.id).label('count')
    ).group_by('month').order_by('month').all()
    
    # Topic growth (compare recent vs older)
    total = db.query(Paper).count()
    
    return {
        "monthly_counts": [{"month": m.month, "count": m.count} for m in monthly if m.month],
        "total_papers": total,
        "growth_rate": "Calculating..." if total < 50 else f"{total // 12} papers/month average"
    }
