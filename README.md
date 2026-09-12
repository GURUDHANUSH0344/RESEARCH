# 🔬 THE AUTONOMOUS RESEARCH SCIENTIST

> **"From Research Questions to Evidence-Driven Discoveries"**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg?logo=supabase&logoColor=white)](https://supabase.com)
[![OpenAlex](https://img.shields.io/badge/Primary%20API-OpenAlex-2B4C7E.svg)](https://openalex.org)
[![Semantic Scholar](https://img.shields.io/badge/Secondary%20API-Semantic%20Scholar-185F96.svg)](https://www.semanticscholar.org)

---

## 🎯 Executive Overview & Problem Statement

Modern scientific research is highly fragmented and bottlenecked by information overload. Researchers spend countless hours:
1. Sifting through hundreds of scientific papers across disparate repositories.
2. Manually extracting problem formulations, datasets, baselines, and architectural nuances.
3. Trying to synthesize consensus findings and isolate unaddressed research gaps.
4. Detecting contradictory claims and empirical variance across different experimental setups.
5. Formulating testable, high-impact hypotheses and constructing reproducible experiment designs.

**The Autonomous Research Scientist** is not a simple chatbot or naive PDF summarizer. It is an **evidence-driven scientific intelligence engine** that automates the complete scientific exploration pipeline:

$$\text{Research Question} \rightarrow \text{Literature Discovery} \rightarrow \text{Paper Analysis} \rightarrow \text{Evidence Synthesis} \rightarrow \text{Gap Detection} \rightarrow \text{Conflict Triangulation} \rightarrow \text{Hypothesis Formulation} \rightarrow \text{Experiment Design} \rightarrow \text{Result Interpretation} \rightarrow \text{Research Report}$$

---

## 🚀 Key Features

### 1. 📚 Real-Time Scholarly Literature Discovery
- Deep integration with **OpenAlex API** ($>250\text{M}$ academic works) and **Semantic Scholar Graph API**.
- Automatic abstract reconstruction from inverted indices, open-access detection, citation tracking, and author/institution extraction.

### 2. 📄 Deep Structured Paper Breakdown
- Automated extraction of: **Problem Formulation**, **Primary Objective**, **Methodology & Architecture**, **Datasets Utilized**, **Reported Results**, **Identified Limitations**, and **Key Contributions**.

### 3. 📊 Multi-Paper Comparative Synthesis Matrix
- Generates side-by-side comparative matrices across multiple publications.
- Triangulates **Common Findings**, **Divergent Conclusions**, **Common Limitations**, **Emerging Methods**, and **Underexplored Areas**.

### 4. 🔍 Evidence-Traceable Research Gap Detection
- Discovers and categorizes literature gaps into 7 distinct scientific dimensions:
  - *Dataset Gap*, *Methodological Gap*, *Generalization Gap*, *Geographic Gap*, *Temporal Gap*, *Evaluation Gap*, *Application Gap*.
- Backed by **Evidence Traceability badges** linking each gap directly to supporting citations.
- Labeled honestly as *"Potential research gaps identified from analyzed literature."*

### 5. ⚔️ Conflicting Evidence & Contradiction Triangulation
- Discovers empirical discrepancies between studies (e.g. Vision Transformers vs CNNs under low sample size constraints).
- Identifies technical causes (different augmentations, dataset biases, evaluation metrics).
- Honestly reports when literature exhibits uniform consensus without fabricating artificial conflicts.

### 6. 💡 Hypothesis Lab & Multi-Factor Scoring
- Formulates 3 to 5 ranked testable hypotheses ($H_1 - H_5$) with explicit independent, dependent, and control variables.
- Scored across **Novelty (1-10)**, **Feasibility (1-10)**, **Potential Impact (1-10)**, and **Evidence Strength (1-10)**.

### 7. 🧪 Reproducible Experiment Blueprint & Visual Flowchart
- 7-Stage visual workflow:
  $$\text{Data Split} \rightarrow \text{Domain Preprocessing} \rightarrow \text{Baseline Benchmarking} \rightarrow \text{Proposed Architecture Training} \rightarrow \text{Field Validation} \rightarrow \text{Multi-Metric Profiling} \rightarrow \text{Statistical Testing}$$
- Defines sample size targets, data collection strategies, baseline models, statistical testing protocols ($p < 0.01$ Wilcoxon signed-rank), and reproducibility configs (fixed seeds, PyTorch standards).

### 8. 📊 Pandas Experiment Result Analyzer
- Drag-and-drop CSV / Excel upload for experimental benchmark files.
- Automatically calculates metrics (Accuracy, Precision, Recall, F1, AUC, MAE, RMSE, Latency, Parameter Count).
- Grounded AI result interpretation with zero numeric hallucination.

### 9. 🕸️ Interactive Research Knowledge Graph (React Flow)
- Dynamic interactive topology connecting:
  $$\text{Topic} \rightarrow \text{Papers} \rightarrow \text{Methodologies} \rightarrow \text{Gaps} \rightarrow \text{Hypotheses} \rightarrow \text{Experiments}$$
- Clickable nodes with an active entity property inspector.

### 10. 📑 Scientific Research Report Generator & Citation Manager
- Formats peer-ready academic proposals in Markdown with instant 1-click clipboard copy, `.md` file export, and Print/PDF support.
- Built-in Citation Manager generating **APA (7th)**, **IEEE**, **MLA (9th)**, and **BibTeX** entries.

### 11. 💬 Contextual Research Assistant Co-Pilot
- RAG chat assistant grounded directly in the active project's papers, gaps, and hypotheses.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend UI** | React 19, Vite, TypeScript, Tailwind CSS v4, Lucide Icons, Shadcn UI |
| **Data Visualizations** | Recharts (Trend curves, bar charts), React Flow (`@xyflow/react`) |
| **Backend & Services** | Python 3.13, FastAPI, Pandas, NumPy, Pydantic, HTTPX |
| **Database & Auth** | Supabase PostgreSQL, Row Level Security (RLS), Google OAuth |
| **Scholarly APIs** | OpenAlex API, Semantic Scholar Graph API, CrossRef |
| **AI LLM Engine** | Multi-Provider Engine (OpenAI, Gemini, Anthropic, Groq, OpenRouter) |

---

## 🗄️ Database Architecture (Supabase)

The system enforces strict **Row Level Security (RLS)** ensuring users only access their own research assets:

```sql
profiles (id, email, name, avatar_url, created_at)
research_projects (id, user_id, title, research_question, research_field, objective, status, synthesis, created_at)
papers (id, project_id, external_id, title, authors, abstract, year, doi, url, venue, citation_count, source, open_access, concepts)
paper_analysis (id, paper_id, problem, objective, methodology, dataset, experimental_setup, results, limitations, future_work, contributions)
research_gaps (id, project_id, title, category, description, evidence, why_it_matters, supporting_papers, potential_question, confidence, novelty, feasibility)
contradictions (id, project_id, topic, finding_a, finding_b, paper_a, paper_b, possible_explanation, confidence)
hypotheses (id, project_id, label, statement, rationale, evidence, independent_variable, dependent_variable, expected_outcome, novelty_score, feasibility_score, impact_score, overall_score, selected)
experiments (id, project_id, hypothesis_id, plan JSON, created_at)
experiment_results (id, experiment_id, project_id, file_name, file_url, raw_data, metrics, analysis, created_at)
reports (id, project_id, content, created_at)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18.0.0
- Python >= 3.10
- Supabase Account (or use local preview configuration)

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your configuration:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-key
VITE_OPENALEX_EMAIL=researcher@example.com
VITE_LLM_API_KEY=your-api-key # (Optional - built-in smart resilience mode handles zero-crash execution)
```

### 3. Install Dependencies & Run Frontend
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run Python Backend (Optional / Standalone)
```bash
cd backend
pip install fastapi uvicorn httpx pandas numpy pydantic
python main.py
```

---

## 🌿 Featured Demo: AI-Based Crop Disease Detection

1. Click **"AI Crop Disease Demo"** in the top navigation bar or **"LAUNCH AUTONOMOUS DEMO"**.
2. Watch the live 8-stage pipeline execute:
   - Queries OpenAlex for top plant pathology and vision transformer papers.
   - Extracts limitations (laboratory dataset shortcuts vs real-world field variance).
   - Identifies the *Environmental Generalization Gap*.
   - Formulates Hypothesis $H_1$: *Hybrid Convolution-Attention with Background-Decoupling Self-Supervision*.
   - Designs the 7-step experimental validation protocol.
   - Generates the formal scientific proposal report.
3. Explore the results across all tabs!
