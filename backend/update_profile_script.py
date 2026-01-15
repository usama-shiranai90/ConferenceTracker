from sqlalchemy.orm import Session
from database import SessionLocal, UserProfile, init_db

def update_user_profile():
    db = SessionLocal()
    try:
        # Create or update profile
        profile = db.query(UserProfile).first()
        if not profile:
            profile = UserProfile()
            db.add(profile)
        
        profile.name = "Researcher"
        profile.title = "AI in Medication Prescription & Healthcare"
        profile.proposal = """Research focus on Medication Prescription, Healthcare, Medication Error, Prescription Recommendation, Prescription Generation.
        
Methodologies: Algorithms, Longitudinal/Time series analysis, Machine Learning, AI, LLM, RAG.

Goal: To improve patient safety and prescription accuracy using advanced AI and retrieval-augmented generation techniques."""
        
        db.commit()
        print("Profile updated successfully.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    update_user_profile()
