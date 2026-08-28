# Research Compass

Absolutely. Below is a complete master prompt for building the actual project, not the PPT. It is optimized for your 5-hour hackathon, while including the full feature roadmap, APIs, AI workflow, authentication, database, UI, and technical requirements.

You can paste this into Replit Agent, Cursor, Antigravity, Lovable, Bolt, Emergent, or another AI coding agent.

MASTER BUILD PROMPT

THE AUTONOMOUS RESEARCH SCIENTIST

Build a production-quality AI-powered Autonomous Research Scientist web application for a hackathon.

The application should act as an intelligent research partner that helps researchers move from:

Research Question → Literature Search → Paper Analysis → Evidence Synthesis → Research Gap → Contradiction Detection → Hypothesis → Experiment Design → Result Analysis → Next Research Direction

The application must NOT look like a generic chatbot or simple PDF summarizer.

The main innovation is:

Transform fragmented scientific literature into evidence-driven research opportunities and actionable experiment plans.

1. CORE PRODUCT OBJECTIVE

Researchers currently spend large amounts of time:

Searching research papers

Reading hundreds of papers

Comparing methodologies

Understanding datasets

Identifying limitations

Finding research gaps

Detecting contradictory findings

Developing hypotheses

Designing experiments

Interpreting experimental results

Deciding what to research next

Build an AI system that automates and assists this workflow.

The user should be able to enter:

"How can AI improve crop disease detection?"

and receive:

Relevant scientific papers

AI-generated paper summaries

Research trends

Comparison of methodologies

Research gaps

Conflicting findings

Evidence supporting each gap

New research hypotheses

Experiment plans

Evaluation metrics

Result analysis

Recommended future research directions

Optional research proposal/report

2. HACKATHON MVP PRIORITY

The project must be fully functional within a short hackathon development period.

Prioritize these features first:

MUST WORK

Google authentication

Research topic input

Scientific paper search

Paper results

AI paper analysis

Multi-paper comparison

Research gap detection

Contradiction detection

Hypothesis generation

Experiment plan generation

Research report generation

SECONDARY FEATURES

Research trend charts

Citation information

Knowledge graph

CSV experiment-result analysis

Researcher discovery

Institution discovery

Citation export

FUTURE FEATURES

Research alerts

Autonomous experiment loop

Advanced research memory

Collaborative research workspace

Do NOT sacrifice the core workflow to build secondary features.

3. APPLICATION PAGES

Create these pages/screens.

PAGE 1 — LANDING PAGE

Modern hero section:

The Autonomous Research Scientist

Subtitle:

From Research Questions to Evidence-Driven Discoveries

Description:

An AI-powered research partner that searches scientific literature, identifies knowledge gaps and conflicting evidence, generates testable hypotheses, designs experiments, and recommends the next promising research direction.

CTA:

Start Research

Secondary CTA:

Explore Demo

Include visual representation:

Research Question
       ↓
Literature
       ↓
Evidence
       ↓
Research Gap
       ↓
Hypothesis
       ↓
Experiment
       ↓
Discovery

PAGE 2 — AUTHENTICATION

Use:

Supabase Auth

Support:

Google OAuth

Button:

Continue with Google

Also optionally support:

Email/password signup

Email/password login

After authentication redirect to:

/dashboard

Store user session securely.

Never expose:

Supabase service-role key

LLM secret keys

API secrets

in frontend code.

Use environment variables.

4. DASHBOARD

Create a premium research dashboard.

Sidebar:

🔬 Research Scientist

Dashboard
New Research
My Projects
Literature
Research Gaps
Hypotheses
Experiments
Reports
Settings

Top bar:

Search

Notifications

User profile

Theme toggle

Dashboard cards:

Research Projects
12

Papers Analyzed
347

Research Gaps
28

Hypotheses
46

Recent research projects:

AI Crop Disease Detection
Last analyzed: Today

AI Healthcare Diagnostics
Last analyzed: Yesterday

Quantum Algorithm Optimization
Last analyzed: 3 days ago

5. NEW RESEARCH WORKSPACE

Main input:

What do you want to research?

Large textarea:

"How can AI improve crop disease detection?"

Additional optional fields:

Research field

Computer Science

Healthcare

Agriculture

Engineering

Biology

Physics

Chemistry

Social Science

Other

Research objective

Dropdown:

Find research gaps

Generate hypotheses

Compare existing methods

Design an experiment

Perform literature review

Explore a new research direction

Publication range

Example:

2020 – 2026

Number of papers

Default:

10

Button:

🔬 Start Autonomous Research

6. LITERATURE SEARCH ENGINE

Integrate scientific research APIs.

PRIMARY API — OPENALEX

Use OpenAlex for:

Scientific works

Titles

Abstracts

Authors

Publication dates

Topics

Citations

Open-access information

Related works

Use the OpenAlex API to search relevant papers based on the user's research question.

Implement:

Search

Pagination

Publication-year filtering

Citation sorting

Relevance sorting

Open-access filtering

7. SECONDARY API — SEMANTIC SCHOLAR

Integrate Semantic Scholar where useful.

Use it for:

Paper discovery

Abstracts

Authors

Citations

References

Related papers

Citation relationships

Use it to enrich OpenAlex results where possible.

If one API fails, the system should gracefully continue with the other.

8. OPTIONAL CROSSREF API

Integrate Crossref for scholarly metadata.

Use for:

DOI

Journal

Publisher

Publication information

Citation metadata

Crossref should be optional and should not block the MVP.

9. PAPER EXPLORER

Create a beautiful literature page.

Each paper card should show:

Paper Title

Authors
Publication Year
Journal / Conference

Citations

Abstract

Research Method
Dataset

[AI Analyze]
[Open Paper]
[View DOI]

Allow:

Sort by relevance

Sort by citations

Sort by year

Filter by open access

Filter by publication year

10. PAPER ANALYSIS AI

For each paper, AI should extract structured information.

Output:

Research Problem

What problem does the paper solve?

Research Objective

What does the study attempt to achieve?

Methodology

What method/model/algorithm is used?

Dataset

What dataset or experimental data is used?

Experimental Setup

How was the experiment conducted?

Results

What were the main findings?

Limitations

What limitations exist?

Future Work

What future research did the authors suggest?

Key Contributions

What is new in the paper?

Return structured JSON internally.

Example:

{
  "problem": "...",
  "objective": "...",
  "methodology": "...",
  "dataset": "...",
  "results": "...",
  "limitations": ["...", "..."],
  "future_work": ["...", "..."],
  "contributions": ["...", "..."]
}

11. MULTI-PAPER EVIDENCE SYNTHESIS

After analyzing multiple papers, compare them.

Generate:

PaperMethodDatasetResultLimitation

Then identify:

Common Findings

What do multiple papers agree on?

Different Findings

Where do results differ?

Emerging Methods

Which approaches are becoming popular?

Common Limitations

What limitations appear repeatedly?

Underexplored Areas

What areas receive little attention?

12. RESEARCH GAP DETECTOR ⭐⭐⭐⭐⭐

This is the most important feature.

The AI must analyze multiple papers and identify potential research gaps.

Categorize gaps:

Dataset Gap

A dataset is missing or insufficient.

Methodological Gap

An existing method has not been sufficiently evaluated.

Geographic Gap

Research has not been tested in different locations/populations.

Generalization Gap

Models work in controlled environments but may not generalize.

Temporal Gap

Research is outdated or lacks recent validation.

Evaluation Gap

Important evaluation metrics or comparisons are missing.

Application Gap

A technique has not been applied to a particular real-world scenario.

For every gap provide:

Research Gap

Evidence

Supporting Papers

Why It Matters

Novelty Level

Feasibility

Potential Research Question

Example:

Most crop disease detection research uses controlled laboratory datasets.

Potential gap:

Real-world smartphone images under varying lighting and environmental conditions are insufficiently studied.

13. EVIDENCE-BACKED GAP DETECTION

Do NOT generate unsupported research gaps.

Every important gap should reference the papers used to derive it.

Show:

Research Gap #1

Confidence: High

Supported by:
Paper A
Paper B
Paper C

Evidence:
...

Why this matters:
...

The system should clearly distinguish:

Evidence-backed observation

from

AI-generated research suggestion

Do not pretend AI-generated claims are established scientific facts.

14. CONTRADICTION DETECTOR ⭐⭐⭐⭐⭐

Compare papers for conflicting findings.

Example:

Paper A:

Model A performs better.

Paper B:

Model B performs better.

The AI should identify the conflict.

Then analyze possible causes:

Dataset differences

Sample size

Data preprocessing

Evaluation metrics

Model implementation

Experimental environment

Research population

Display:

⚠️ Conflicting Evidence

Finding A
Paper 1

Finding B
Paper 2

Possible Explanation

Different datasets may explain
the difference.

15. RESEARCH TREND ANALYZER

Generate visualizations:

Publications by year

Line chart.

Popular methodologies

Bar chart.

Popular keywords

Tag cloud or ranked list.

Citation distribution

Chart.

Emerging topics

AI-generated list.

Example:

2020  ███
2021  █████
2022  ███████
2023  █████████
2024  ███████████
2025  █████████████
2026  ███████████████

16. RESEARCH KNOWLEDGE GRAPH

Create an interactive graph using React Flow.

Nodes:

Research Topic

Papers

Authors

Methods

Datasets

Findings

Research Gaps

Hypotheses

Experiments

Example:

                Research Topic
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
       Paper A     Paper B      Paper C
          │           │           │
        CNN         ViT        Hybrid
          │           │           │
          └───────────┼───────────┘
                      ↓
                 Common Gap
                      ↓
                  Hypothesis
                      ↓
                  Experiment

17. HYPOTHESIS GENERATOR ⭐⭐⭐⭐⭐

Convert research gaps into testable hypotheses.

Generate 3–5 hypotheses.

For each:

Hypothesis H1

Statement:
...

Why this hypothesis?
...

Supporting evidence:
...

Variables:
Independent:
Dependent:

Expected outcome:
...

Feasibility:
High / Medium / Low

Novelty:
High / Medium / Low

Allow researcher to:

Select Hypothesis

18. HYPOTHESIS RANKING

Rank hypotheses using:

Evidence strength

Novelty

Feasibility

Research impact

Data availability

Experimental complexity

Example:

H1
Novelty: 8.5/10
Feasibility: 9/10
Impact: 8/10

Overall: 8.5/10

Make it clear that these are AI-assisted estimates, not objective scientific scores.

19. EXPERIMENT DESIGNER ⭐⭐⭐⭐⭐

Once a hypothesis is selected, generate an experiment plan.

Include:

Research Question

Hypothesis

Dataset

Data Collection

Preprocessing

Baseline

Proposed Method

Control Variables

Independent Variables

Dependent Variables

Experimental Procedure

Evaluation Metrics

Expected Results

Statistical Analysis

Reproducibility Requirements

Example:

Dataset
 ↓
Preprocessing
 ↓
Baseline CNN
 ↓
Proposed Transformer
 ↓
Training
 ↓
Validation
 ↓
Statistical Comparison
 ↓
Conclusion

20. EXPERIMENT RESULT ANALYZER

Allow researcher to upload:

CSV

XLSX

The system should analyze experiment results.

Use Python/pandas in backend if required.

Automatically detect common metrics:

Accuracy

Precision

Recall

F1

AUC

MAE

RMSE

R²

Generate charts.

Then AI explains:

Model B achieved a higher F1-score than Model A. However, additional validation is recommended before concluding that the improvement generalizes.

Never make unsupported scientific claims.

21. RESEARCH REPORT GENERATOR

Generate a structured research report.

Sections:

Title

Abstract

Research Problem

Background

Literature Review

Existing Approaches

Research Gap

Research Question

Hypothesis

Proposed Methodology

Experiment Design

Expected Results

Evaluation Metrics

Limitations

Future Work

References

Allow:

Export Report

Future support:

PDF

DOCX

Markdown

22. CITATION MANAGEMENT

Every research paper should store:

Title

Authors

Year

DOI

URL

Journal

Citation count

Generate:

IEEE

APA

MLA

BibTeX

Provide:

Copy Citation

button.

23. RESEARCHER DISCOVERY

Display important researchers related to the topic.

Show:

Name

Institution

Number of papers

Citation count

Research topics

24. INSTITUTION DISCOVERY

Show institutions associated with relevant research.

Example:

Top Research Institutions

Institution A
Institution B
Institution C

25. RESEARCH CHAT

Add an optional research assistant chat.

The researcher can ask:

"Why is this gap important?"

"Compare Paper A and Paper B."

"Which hypothesis is most feasible?"

"What limitations exist in this methodology?"

The chatbot must use the current research project's collected evidence as context.

It should avoid presenting unsupported claims as facts.

26. RESEARCH PROJECT MEMORY

Each research project should maintain:

Research Question
Papers
Paper Analyses
Evidence
Research Gaps
Contradictions
Hypotheses
Selected Hypothesis
Experiment Plans
Results
Reports

A user can reopen the project later.

27. DATABASE — SUPABASE

Use:

Supabase PostgreSQL

Tables:

profiles

id
email
name
avatar_url
created_at

research_projects

id
user_id
title
research_question
research_field
objective
status
created_at
updated_at

papers

id
project_id
external_id
title
authors
abstract
year
doi
url
citation_count
source
open_access
created_at

paper_analysis

id
paper_id
problem
objective
methodology
dataset
results
limitations
future_work
contributions
created_at

research_gaps

id
project_id
title
description
evidence
confidence
novelty
feasibility
created_at

contradictions

id
project_id
paper_a_id
paper_b_id
finding_a
finding_b
possible_explanation
confidence
created_at

hypotheses

id
project_id
gap_id
statement
evidence
novelty_score
feasibility_score
impact_score
overall_score
created_at

experiments

id
project_id
hypothesis_id
dataset
methodology
baseline
variables
metrics
expected_results
created_at

experiment_results

id
experiment_id
file_url
analysis
created_at

reports

id
project_id
content
created_at

28. SUPABASE SECURITY

Enable Row Level Security.

Users must only access their own:

Research projects

Papers

Gaps

Hypotheses

Experiments

Reports

Use authenticated user ID relationships.

Never expose service-role credentials to the frontend.

29. VECTOR SEARCH — OPTIONAL

If time permits, enable:

pgvector in Supabase

Store embeddings for:

Paper abstracts

Research gaps

Hypotheses

Use semantic similarity for:

Similar papers

Related research

Duplicate detection

Evidence retrieval

This is an advanced feature and should not block the MVP.

30. AI ORCHESTRATION

Create a central:

Research Orchestrator

It coordinates:

Research Question
       ↓
Literature Agent
       ↓
Paper Analysis Agent
       ↓
Evidence Synthesis
       ↓
Gap Detection Agent
       ↓
Contradiction Agent
       ↓
Hypothesis Agent
       ↓
Experiment Agent
       ↓
Report Agent

For the hackathon MVP, these can be implemented as modular prompt functions within one backend service instead of separate autonomous infrastructure.

31. AI AGENT RESPONSIBILITIES

Literature Agent

Find and rank relevant papers.

Paper Analysis Agent

Extract structured information.

Evidence Synthesis Agent

Compare papers and identify consensus.

Gap Detection Agent

Identify research gaps based on evidence.

Contradiction Agent

Identify conflicting findings.

Hypothesis Agent

Generate testable hypotheses.

Experiment Agent

Design experiments.

Result Analysis Agent

Interpret uploaded results.

Report Agent

Create structured research reports.

32. AI OUTPUT FORMAT

All AI modules should return structured JSON whenever possible.

Example:

{
  "research_gaps": [
    {
      "title": "...",
      "description": "...",
      "evidence": ["paper_id_1", "paper_id_2"],
      "confidence": "high",
      "novelty": 8,
      "feasibility": 9
    }
  ]
}

Validate AI responses before displaying them.

Handle malformed JSON gracefully.

33. HALLUCINATION CONTROL

This is extremely important for a research application.

The AI must:

Prefer evidence from retrieved papers

Associate claims with source papers

Clearly distinguish facts from hypotheses

Never invent papers

Never invent authors

Never invent citations

Never fabricate experimental results

Never claim a research gap is scientifically proven

Mark uncertain conclusions

Show source references

Use wording such as:

"Potential research gap identified from the analyzed literature."

rather than:

"This is definitely an unexplored research area."

34. ERROR HANDLING

Handle:

API rate limits

Missing abstracts

API timeout

Invalid API keys

LLM failures

Empty search results

Duplicate papers

Malformed AI responses

Show friendly UI:

Unable to retrieve additional papers.
Showing results from available sources.

Do not crash the application.

35. API ENVIRONMENT VARIABLES

Create .env.example.

Example:

VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

OPENALEX_EMAIL=
SEMANTIC_SCHOLAR_API_KEY=

LLM_API_KEY=

Use the correct environment-variable naming convention for the selected deployment platform.

Never commit .env files.

36. FRONTEND TECHNOLOGY

Use:

React

Vite

Tailwind CSS

Lucide React

Recharts

React Flow

Optional:

Framer Motion

Avoid unnecessary libraries.

37. BACKEND TECHNOLOGY

Preferred:

Python

FastAPI

Use:

requests/httpx

Pydantic

pandas

numpy

Optional:

scikit-learn

scipy

Only add libraries when necessary.

38. DESIGN SYSTEM

Create a premium AI/scientific interface.

Theme

Primary:

Deep Navy / Dark Blue

Secondary:

White

Accents:

Electric Blue / Violet

Use subtle gradients.

Fonts

Use:

Inter

or

Poppins

UI Style

Glassmorphism cards

Soft borders

Rounded corners

Subtle shadows

Clean icons

Professional charts

Smooth transitions

Spacious layouts

Do NOT make it look like a generic dashboard template.

39. RESEARCH DASHBOARD VISUALIZATION

Include:

KPI cards

Papers Analyzed
Research Gaps
Hypotheses
Experiments

Research confidence

Display:

Evidence Strength
████████░░ 82%

Research trend

Line chart.

Method distribution

Bar chart.

Research gap cards

Color-coded by confidence.

Hypothesis ranking

Ranked cards.

40. DEMO RESEARCH TOPIC

Create a demo project:

AI-Based Crop Disease Detection

Use it to demonstrate the full workflow.

Example flow:

User:

"How can AI improve crop disease detection?"

System searches papers.

Then:

Literature Finding

Multiple existing approaches identified.

Common Limitation

Many studies use controlled datasets.

Research Gap

Real-world smartphone-based crop disease detection under varying lighting and environmental conditions is relatively underexplored in the analyzed literature.

Hypothesis

A lightweight vision model trained using diverse field images may improve robustness under real-world conditions.

Experiment

Field Image Dataset
       ↓
Preprocessing
       ↓
Baseline CNN
       ↓
Lightweight Transformer
       ↓
Train
       ↓
Evaluate
       ↓
Compare F1 / Accuracy

This should be the primary hackathon demo.

41. PERFORMANCE

Optimize for fast demo experience.

Use:

Loading skeletons

Streaming where supported

Parallel API calls

Caching

Pagination

Debouncing

Background processing where appropriate

Do not make users wait unnecessarily.

For the hackathon, limit the default paper search to around:

10–20 papers

rather than hundreds.

42. SECURITY

Implement:

Authentication

RLS

Environment variables

Input validation

API rate-limit protection

Secure file upload validation

No secrets in frontend

No service-role key exposure

43. RESPONSIVE DESIGN

The dashboard must work on:

Desktop

Laptop

Tablet

Prioritize desktop because this is a hackathon research application.

44. MAIN USER JOURNEY

Implement this complete journey:

Login
 ↓
Dashboard
 ↓
New Research
 ↓
Enter Research Question
 ↓
Search Literature
 ↓
Analyze Papers
 ↓
View Literature Summary
 ↓
View Research Gaps
 ↓
View Contradictions
 ↓
Generate Hypotheses
 ↓
Select Hypothesis
 ↓
Generate Experiment Plan
 ↓
Upload Results
 ↓
Analyze Results
 ↓
Generate Research Report

The entire flow should feel like one connected research workspace.

45. HACKATHON "WOW" MOMENT

When the researcher clicks:

Start Autonomous Research

Show a live research process:

✓ Understanding research question

✓ Searching scientific literature

✓ Analyzing 12 papers

✓ Comparing methodologies

✓ Synthesizing evidence

✓ Detecting research gaps

✓ Checking conflicting findings

✓ Generating hypotheses

✓ Designing experiments

✓ Preparing research roadmap

Then reveal:

🔍 Research Gap Discovered

followed by:

💡 New Hypothesis

followed by:

🧪 Recommended Experiment

This should be the centerpiece of the demo.

46. FUTURE ROADMAP

Include architecture that can later support:

Phase 1

Literature intelligence

Phase 2

Research gap discovery

Phase 3

Hypothesis generation

Phase 4

Experiment planning

Phase 5

Automated experiment execution in safe computational environments

Phase 6

Continuous research loop

Question
 ↓
Research
 ↓
Gap
 ↓
Hypothesis
 ↓
Experiment
 ↓
Results
 ↓
New Hypothesis
 ↓
Next Experiment

The final vision is an AI research system that continuously assists researchers while keeping humans responsible for scientific decisions and real-world experimentation.

47. IMPORTANT SCIENTIFIC SAFETY PRINCIPLE

The application is an AI research assistant, not an autonomous authority.

For high-impact domains such as:

Medicine

Biology

Chemistry

Public health

the system must present AI output as research assistance and require human expert review.

It must not independently execute dangerous real-world experiments.

The system can generate computational experiment plans and recommendations, but researchers remain responsible for validation and real-world execution.

48. CODE QUALITY

Use:

Modular architecture

Reusable components

Clear naming

Type safety where possible

API service layer

AI service layer

Database service layer

Error handling

Environment configuration

Suggested structure:

frontend/
  src/
    components/
    pages/
    services/
    hooks/
    lib/
    types/

backend/
  app/
    main.py
    routes/
    services/
      openalex.py
      semantic_scholar.py
      llm.py
      research.py
      analysis.py
    models/
    schemas/
    utils/

49. FINAL IMPLEMENTATION PRIORITY

If development time becomes limited, implement in this exact order:

PRIORITY 1

Google login + Supabase

PRIORITY 2

Research topic input

PRIORITY 3

OpenAlex paper search

PRIORITY 4

AI paper summarization

PRIORITY 5

Multi-paper comparison

PRIORITY 6

Research gap detection

PRIORITY 7

Hypothesis generation

PRIORITY 8

Experiment plan

PRIORITY 9

Beautiful dashboard

PRIORITY 10

Contradiction detection

PRIORITY 11

Research report

Everything else is optional.

50. FINAL ACCEPTANCE CRITERIA

The project is considered successful when a judge can:

Open the application.

Sign in with Google.

Enter a research question.

Click "Start Autonomous Research."

See real scientific papers retrieved through an API.

See AI-generated structured analysis.

See evidence-backed potential research gaps.

See conflicting findings if present.

Generate multiple hypotheses.

Select a hypothesis.

Generate an experiment plan.

View the complete research workflow.

Generate a research report.

The application should feel like:

“An AI scientist's research workspace.”

NOT:

“A chatbot that summarizes papers.”

FINAL PRODUCT POSITIONING

Use this statement throughout the application and presentation:

The Autonomous Research Scientist is an AI-powered research partner that transforms fragmented scientific literature into evidence-driven research gaps, testable hypotheses, experiment plans, and new research directions.

Core innovation:

Search → Understand → Connect → Discover → Hypothesize → Experiment → Learn

Build the application with a strong focus on reliability, evidence traceability, clean UX, and a compelling end-to-end hackathon demonstration.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cd2e38f3-4152-48ba-a60f-e151398b8717).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
