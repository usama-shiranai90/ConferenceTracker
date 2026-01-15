import json
import os
from sqlalchemy.orm import Session
from database import UserProfile, Paper
import logging

# Configure Google Generative AI
try:
    import google.generativeai as genai
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False
    genai = None
except Exception:
    HAS_GEMINI = False

logger = logging.getLogger(__name__)

def get_profile(db: Session):
    return db.query(UserProfile).first()

def update_profile(db: Session, name: str, title: str, proposal: str):
    profile = db.query(UserProfile).first()
    if not profile:
        profile = UserProfile(name=name, title=title, proposal=proposal)
        db.add(profile)
    else:
        profile.name = name
        profile.title = title
        profile.proposal = proposal
    
    db.commit()
    return profile

def analyze_profile(db: Session, profile_id: int):
    profile = db.query(UserProfile).filter(UserProfile.id == profile_id).first()
    if not profile:
        return None

    trajectory = "Analysis unavailable."
    conferences = []
    
    if HAS_GEMINI and os.environ.get("GEMINI_API_KEY"):
        try:
            model = genai.GenerativeModel('gemini-pro')
            
            prompt = f"""
            You are a Research Advisor AI. RESPONSE MUST BE RAW JSON ONLY. NO MARKDOWN.
            Analyze the following research proposal:
            Title: {profile.title}
            Proposal: {profile.proposal}

            Output valid JSON with the following structure:
            {{
                "trajectory": "A 2-3 sentence description of the research trajectory and future potential.",
                "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
                "conferences": ["Conf1", "Conf2", "Conf3", "Conf4", "Conf5"]
            }}
            """
            
            response = model.generate_content(prompt)
            # Remove any markdown code block formatting if present
            content = response.text.replace("```json", "").replace("```", "").strip()
            
            result = json.loads(content)
            trajectory = result.get("trajectory", "No trajectory found.")
            conferences = result.get("conferences", [])
            keywords = result.get("keywords", [])
            
        except Exception as e:
            logger.error(f"Gemini analysis failed: {e}")
            trajectory = f"Gemini analysis failed: {e}. Using fallback."
            keywords = profile.title.split() if profile.title else ["AI"]
            conferences = ["NeurIPS", "ICML", "CVPR"]
    else:
        # Fallback/Mock logic
        trajectory = "This research appears to focus on advancing current methodologies. Future trajectories likely involve scalability and cross-domain applications. (Gemini API Key missing)"
        conferences = ["NeurIPS", "ICML", "AAAI", "CVPR", "ECCV"]
        keywords = profile.title.split() if profile.title else ["AI"]

    # Search local papers based on keywords (simple OR search)
    # In a real app, uses vector search
    found_papers = []
    if keywords:
        # Simple naive search
        query_filters = [Paper.title.ilike(f"%{kw}%") for kw in keywords if len(kw) > 3]
        if query_filters:
            from sqlalchemy import or_
            matches = db.query(Paper).filter(or_(*query_filters)).limit(5).all()
            for p in matches:
                found_papers.append({
                    "title": p.title,
                    "venue": p.venue or "ArXiv",
                    "year": p.published_date.year if p.published_date else 2024
                })

    # Save results
    profile.trajectory = trajectory
    profile.suggested_conferences = json.dumps(conferences)
    profile.suggested_papers = json.dumps(found_papers)
    db.commit()
    
    return profile
