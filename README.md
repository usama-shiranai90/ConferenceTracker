# Conference Paper Trend Tracker (Cortex)

## Overview
Cortex is a specialized tool for tracking research trends in Machine Learning (ArXiv cs.LG) and BioMedical fields (PubMed). It visualizes the rise and fall of research topics over time using BERTopic and Changepoint detection.

**Goal**: Identify "Innovation Bursts" (e.g., when Transformers overtook CNNs).

## Tech Stack (The "Hireable" Stack)
*   **Frontend**: React + Vite (Modern, Fast)
*   **Visualization**: Recharts (Responsive, React-native)
*   **Backend**: FastAPI (Python) - High-performance API
*   **Data Science**: BERTopic, Scikit-learn, ArXiv API
*   **Styling**: Custom CSS (Glassmorphism/Cyberpunk Theme)

## Quick Start

### 1. Backend Setup (Python)
Navigate to the `backend` folder:
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
# source venv/bin/activate
pip install -r requirements.txt
```

Run the API:
```bash
python main.py
```
The API will run at `http://localhost:8000`. Swagger docs at `/docs`.

### 2. Frontend Setup (React)
Navigate to the `frontend` folder (in a new terminal):
```bash
cd frontend
npm install
npm run dev
```
The UI will run at `http://localhost:5173`.

## Project Structure
*   `/backend`: Python FastAPI application for fetching and processing paper data.
*   `/frontend`: React Vite application for the dashboard interface.

## Next Steps
*   Implement real ArXiv fetching in `backend/main.py` using the `arxiv` library.
*   Integrate `BERTopic` model to classify paper abstracts dynamically.
