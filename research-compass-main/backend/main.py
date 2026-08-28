"""
🔬 THE AUTONOMOUS RESEARCH SCIENTIST - FASTAPI BACKEND SERVICE
High-performance Python backend for academic paper discovery, AI synthesis, and Pandas experimental data analysis.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import httpx
import json
import io
import pandas as pd
import numpy as np

app = FastAPI(
    title="The Autonomous Research Scientist API",
    description="Evidence-driven scientific intelligence and automated research discovery engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# PYDANTIC SCHEMAS
# -------------------------------------------------------------
class PaperSearchRequest(BaseModel):
    query: str
    year_from: Optional[int] = None
    year_to: Optional[int] = None
    limit: int = 12
    sort: str = "relevance_score"
    open_access: bool = False

class PaperItem(BaseModel):
    id: str
    title: str
    authors: List[str]
    abstract: str
    year: int
    doi: Optional[str] = ""
    url: Optional[str] = ""
    venue: Optional[str] = "Academic Publication"
    citation_count: int = 0
    source: str = "OpenAlex"
    open_access: bool = False
    concepts: List[str] = []

class AnalyzePaperRequest(BaseModel):
    paper: PaperItem

class ResearchGapRequest(BaseModel):
    research_question: str
    papers: List[PaperItem]

class HypothesisRequest(BaseModel):
    research_question: str
    gaps: List[Dict[str, Any]]
    papers: List[PaperItem]

class ExperimentDesignRequest(BaseModel):
    research_question: str
    hypothesis: Dict[str, Any]
    papers: List[PaperItem]

class ChatRequest(BaseModel):
    user_query: str
    research_question: str
    papers: List[PaperItem]
    chat_history: Optional[List[Dict[str, str]]] = []

# -------------------------------------------------------------
# ENDPOINTS
# -------------------------------------------------------------

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "The Autonomous Research Scientist API",
        "tagline": "From Research Questions to Evidence-Driven Discoveries",
    }

@app.post("/api/research/search")
async def search_literature(req: PaperSearchRequest):
    """
    Primary scientific paper discovery using OpenAlex with Semantic Scholar fallback.
    """
    openalex_url = "https://api.openalex.org/works"
    params = {
        "search": req.query,
        "per_page": min(req.limit, 50),
    }
    
    filters = []
    if req.year_from and req.year_to:
        filters.append(f"publication_year:{req.year_from}-{req.year_to}")
    elif req.year_from:
        filters.append(f"publication_year:>{req.year_from - 1}")
    elif req.year_to:
        filters.append(f"publication_year:<{req.year_to + 1}")
    if req.open_access:
        filters.append("is_oa:true")
    if filters:
        params["filter"] = ",".join(filters)

    results: List[Dict[str, Any]] = []

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(openalex_url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                for item in data.get("results", []):
                    # Inverted index abstract reconstruction
                    inv_idx = item.get("abstract_inverted_index") or {}
                    words = []
                    for word, positions in inv_idx.items():
                        for pos in positions:
                            words.append((pos, word))
                    words.sort(key=lambda x: x[0])
                    abstract = " ".join([w[1] for w in words]) if words else "Abstract not indexed."

                    authors = [a.get("author", {}).get("display_name", "") for a in item.get("authorships", [])]
                    doi = (item.get("doi") or "").replace("https://doi.org/", "")
                    venue = item.get("primary_location", {}).get("source", {}).get("display_name", "Academic Venue")

                    results.append({
                        "id": item.get("id"),
                        "external_id": item.get("id"),
                        "title": item.get("title") or item.get("display_name") or "Untitled Paper",
                        "authors": [a for a in authors if a],
                        "abstract": abstract,
                        "year": item.get("publication_year") or 2024,
                        "doi": doi,
                        "url": item.get("primary_location", {}).get("landing_page_url") or (f"https://doi.org/{doi}" if doi else item.get("id")),
                        "venue": venue,
                        "citation_count": item.get("cited_by_count", 0),
                        "source": "OpenAlex",
                        "open_access": bool(item.get("open_access", {}).get("is_oa", False)),
                        "concepts": [c.get("display_name") for c in item.get("concepts", []) if c.get("score", 0) > 0.3],
                    })
        except Exception as e:
            print(f"OpenAlex request failed: {e}")

    return {"count": len(results), "papers": results}

@app.post("/api/research/analyze-results")
async def analyze_results_file(file: UploadFile = File(...)):
    """
    Parses CSV/XLSX experimental result files using Pandas and computes comprehensive metrics.
    """
    contents = await file.read()
    filename = file.filename or "experiment_results.csv"

    try:
        if filename.endswith(".xlsx") or filename.endswith(".xls"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    columns = list(df.columns)
    numeric_cols = list(df.select_dtypes(include=[np.number]).columns)
    categorical_cols = list(df.select_dtypes(exclude=[np.number]).columns)

    metrics = []
    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) > 0:
            metrics.append({
                "name": col,
                "mean": round(float(series.mean()), 4),
                "std": round(float(series.std()) if len(series) > 1 else 0.0, 4),
                "min": round(float(series.min()), 4),
                "max": round(float(series.max()), 4),
                "median": round(float(series.median()), 4),
            })

    # Prepare chart rows
    records = df.head(100).to_dict(orient="records")

    return {
        "file_name": filename,
        "row_count": len(df),
        "columns": columns,
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols,
        "metrics": metrics,
        "data_preview": records,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
