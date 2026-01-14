from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Date, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

import os

# Use /app/data for Docker, or ./data for local development
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.join(BASE_DIR, "data")
if not os.path.exists(DB_DIR):
    os.makedirs(DB_DIR)

DATABASE_URL = f"sqlite:///{os.path.join(DB_DIR, 'conferences.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Association table for Paper <-> Author
paper_authors = Table(
    'paper_authors', Base.metadata,
    Column('paper_id', Integer, ForeignKey('papers.id')),
    Column('author_id', Integer, ForeignKey('authors.id'))
)

class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, index=True) # 'arxiv' or 'pubmed'
    external_id = Column(String, unique=True, index=True) # arxiv_id or pmid
    doi = Column(String, nullable=True)
    title = Column(String, nullable=False)
    abstract = Column(Text, nullable=True)
    published_date = Column(Date, index=True)
    ingestion_date = Column(DateTime, default=datetime.utcnow)
    
    # Metadata
    categories = Column(String) # Comma separated for simplicity in MVP
    venue = Column(String, nullable=True)
    journal_ref = Column(String, nullable=True)
    
    authors = relationship("Author", secondary=paper_authors, back_populates="papers")

class Author(Base):
    __tablename__ = "authors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    normalized_name = Column(String, index=True)
    papers = relationship("Paper", secondary=paper_authors, back_populates="authors")

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
