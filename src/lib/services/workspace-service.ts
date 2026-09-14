/**
 * 🧭 Research Compass - Workspace & Multi-Project Isolation Service
 * Guarantees strict research-level logical isolation across:
 * - Projects & Metadata
 * - Literature & Papers
 * - Research Notes
 * - Key Findings & Insights
 * - Tasks & Progress
 * - References & Citations
 * - AI Chat History
 * - Activity Timeline
 */

import {
  type ResearchProject,
  type ResearchNote,
  type ResearchFinding,
  type ResearchTask,
  type ResearchTimelineEvent,
  type ResearchChatMessage,
  type ResearchReference,
  type FinalResearchDocument,
  type FinalOutputType,
  type PaperDocumentType,
  type ResearchCompletenessCheck,
  type CompletenessCheckItem,
  type ResearchEvidenceItem,
  type EvidenceComparisonSynthesis,
  type ResearchGapEntry,
  type ResearchGapAnalysisReport,
} from "@/types/research";
import { type NormalizedPaper } from "./openalex";
import { generateCitations } from "./citation-formatter";
import { supabase } from "@/integrations/supabase/client";

export function isUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Storage Key Prefixes
const STORAGE_PREFIX = "rc_";
const KEY_PROJECTS_INDEX = `${STORAGE_PREFIX}projects_index`;

function projectDataKey(id: string) {
  return `${STORAGE_PREFIX}project_${id}_data`;
}
function notesKey(id: string) {
  return `${STORAGE_PREFIX}notes_${id}`;
}
function tasksKey(id: string) {
  return `${STORAGE_PREFIX}tasks_${id}`;
}
function findingsKey(id: string) {
  return `${STORAGE_PREFIX}findings_${id}`;
}
function timelineKey(id: string) {
  return `${STORAGE_PREFIX}timeline_${id}`;
}
function chatsKey(id: string) {
  return `${STORAGE_PREFIX}chats_${id}`;
}
function finalDocsKey(id: string) {
  return `${STORAGE_PREFIX}final_docs_${id}`;
}
function finalVersionsKey(id: string) {
  return `${STORAGE_PREFIX}final_versions_${id}`;
}
function evidenceKey(id: string) {
  return `${STORAGE_PREFIX}evidence_${id}`;
}
function evidenceComparisonKey(id: string) {
  return `${STORAGE_PREFIX}evidence_comp_${id}`;
}
function gapsKey(id: string) {
  return `${STORAGE_PREFIX}gaps_${id}`;
}
function gapReportKey(id: string) {
  return `${STORAGE_PREFIX}gap_report_${id}`;
}
function evidenceDirtyKey(id: string) {
  return `${STORAGE_PREFIX}evidence_dirty_${id}`;
}
function stageCompletionsKey(id: string) {
  return `${STORAGE_PREFIX}stage_completions_${id}`;
}

// ------------------------------------------------------------------
// 3 BENCHMARK SEED PROJECTS (Guaranteed Out-of-the-Box Isolation)
// ------------------------------------------------------------------

const SEED_HEALTHCARE: ResearchProject = {
  id: "res_ai_healthcare",
  title: "AI in Healthcare: Cardiovascular Early Detection",
  research_question: "How can multimodal deep learning improve early detection of cardiovascular disease?",
  objective: "Integrate 12-lead ECG signals, cardiac MRI features, and EHR clinical history to stratify 5-year patient risk.",
  description: "Investigates deep neural architectures for non-invasive early cardiac risk modeling across heterogeneous clinical cohorts.",
  research_field: "Cardiology & Healthcare AI",
  status: "active",
  progress: 65,
  paper_limit: 12,
  created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  papers: [
    {
      id: "paper_hc_1",
      external_id: "https://openalex.org/W4291823901",
      title: "Multimodal Deep Learning for Cardiovascular Risk Stratification using Electronic Health Records",
      authors: ["Sarah Jenkins", "Hassan Al-Sayed", "Elena Rostova"],
      abstract: "We propose a dual-stream attention model integrating unstructured clinical notes and longitudinal laboratory metrics for early coronary syndrome prediction, achieving 0.89 AUROC on multi-center ICU cohorts.",
      year: 2024,
      doi: "10.1038/s41746-024-01092-3",
      url: "https://doi.org/10.1038/s41746-024-01092-3",
      venue: "Nature Digital Medicine",
      citation_count: 94,
      source: "OpenAlex",
      open_access: true,
      concepts: ["Cardiovascular Disease", "Multimodal Deep Learning", "Electronic Health Records"],
      relevance_score: 96,
    },
    {
      id: "paper_hc_2",
      external_id: "https://openalex.org/W3192084920",
      title: "Vision Transformers for Automated Echocardiographic Left Ventricle Segmentation",
      authors: ["Marcus Vance", "Kavita Sharma", "Li Wei"],
      abstract: "Automated ejection fraction estimation requires precise myocardial boundary delineation. Our hierarchical Swin transformer demonstrates resilience to acoustic shadow artifacts in transthoracic ultrasound.",
      year: 2023,
      doi: "10.1109/TMI.2023.3298412",
      url: "https://doi.org/10.1109/TMI.2023.3298412",
      venue: "IEEE Transactions on Medical Imaging",
      citation_count: 128,
      source: "OpenAlex",
      open_access: true,
      concepts: ["Echocardiography", "Vision Transformers", "Myocardial Segmentation"],
      relevance_score: 91,
    },
    {
      id: "paper_hc_3",
      external_id: "https://openalex.org/W4019283711",
      title: "Explainable AI in Clinical Cardiology: Counterfactual Interpretability in Critical Care",
      authors: ["David Chen", "Amara Okoye"],
      abstract: "Adoption of black-box neural networks in intensive care requires actionable counterfactual explanations. We evaluate gradient-weighted attribution maps for physician diagnostic trust calibration.",
      year: 2024,
      doi: "10.1016/j.jbi.2024.104612",
      url: "https://doi.org/10.1016/j.jbi.2024.104612",
      venue: "Journal of Biomedical Informatics",
      citation_count: 47,
      source: "Semantic Scholar",
      open_access: false,
      concepts: ["Explainable AI", "Cardiology", "Counterfactual Reasoning"],
      relevance_score: 88,
    },
  ],
};

const SEED_CLIMATE: ResearchProject = {
  id: "res_climate_change",
  title: "Climate Change: Localized Impact Forecasting",
  research_question: "How can spatial-temporal graph neural networks enhance localized climate change impact forecasting?",
  objective: "Develop sub-kilometer microclimate precipitation and drought risk models combining satellite remote sensing and meteorological sensor arrays.",
  description: "Modeling localized extreme weather phenomena and drought stress utilizing graph representation learning over multi-spectral satellite imagery.",
  research_field: "Climate Science & Geospatial AI",
  status: "in_progress",
  progress: 40,
  paper_limit: 15,
  created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  papers: [
    {
      id: "paper_cc_1",
      external_id: "https://openalex.org/W3918237190",
      title: "Spatiotemporal Graph Convolutional Networks for Extreme Precipitation Nowcasting",
      authors: ["Tariq Mansoor", "Freja Lindholm", "Mateo Bianchi"],
      abstract: "High-resolution convective storm modeling over complex topography using graph convolutions over Doppler radar networks, achieving 30-minute lead time warnings with reduced false alarm rates.",
      year: 2024,
      doi: "10.1029/2023GL106891",
      url: "https://doi.org/10.1029/2023GL106891",
      venue: "Geophysical Research Letters",
      citation_count: 73,
      source: "OpenAlex",
      open_access: true,
      concepts: ["Precipitation Nowcasting", "Graph Neural Networks", "Atmospheric Physics"],
      relevance_score: 95,
    },
    {
      id: "paper_cc_2",
      external_id: "https://openalex.org/W3819283742",
      title: "Satellite Multi-Spectral Drought Stress Estimation in Agricultural Basins",
      authors: ["Zhiying Zhao", "Lucas Gomez", "Ananya Deshmukh"],
      abstract: "Sentinel-2 NDRE and NDWI radiometric indices integrated into physics-informed neural networks to forecast agricultural soil moisture deficits up to 60 days in advance.",
      year: 2023,
      doi: "10.1016/j.rse.2023.113702",
      url: "https://doi.org/10.1016/j.rse.2023.113702",
      venue: "Remote Sensing of Environment",
      citation_count: 112,
      source: "OpenAlex",
      open_access: true,
      concepts: ["Remote Sensing", "Drought Prediction", "Soil Moisture Index"],
      relevance_score: 90,
    },
  ],
};

const SEED_BLOCKCHAIN: ResearchProject = {
  id: "res_blockchain_security",
  title: "Blockchain Security: Smart Contract Formal Verification",
  research_question: "How can formal verification and zero-knowledge proofs prevent smart contract reentrancy vulnerabilities?",
  objective: "Automate mathematical correctness proofs and compile zk-SNARK verification circuits for decentralized liquidity protocols.",
  description: "Investigating automated symbolic execution, SMT solvers, and zero-knowledge circuits to eradicate reentrancy and arithmetic overflow exploits.",
  research_field: "Cryptography & Cybersecurity",
  status: "completed",
  progress: 85,
  paper_limit: 10,
  created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  papers: [
    {
      id: "paper_bc_1",
      external_id: "https://openalex.org/W3718294021",
      title: "Formal Verification of Ethereum Smart Contracts: A Survey on SMT-Based Solvers",
      authors: ["Felix Thorne", "Valeria Rossi", "Kenji Takahashi"],
      abstract: "We benchmark Z3 and CVC5 theorem provers against EVM bytecode disassembly to formally verify reentrancy locks and state mutation invariants across top DeFi protocols.",
      year: 2024,
      doi: "10.1109/SP.2024.1039841",
      url: "https://doi.org/10.1109/SP.2024.1039841",
      venue: "IEEE Symposium on Security and Privacy",
      citation_count: 81,
      source: "OpenAlex",
      open_access: true,
      concepts: ["Smart Contract Security", "Formal Verification", "SMT Solvers"],
      relevance_score: 97,
    },
    {
      id: "paper_bc_2",
      external_id: "https://openalex.org/W3619284719",
      title: "Zero-Knowledge Circuit Verification for Private Decentralized Transactions",
      authors: ["Nadia Petrov", "Arthur Pendelton"],
      abstract: "Compiling constraint systems into succinct non-interactive arguments (zk-SNARKs) eliminates double-spend attacks while maintaining sub-second verification times on rollups.",
      year: 2023,
      doi: "10.1007/978-3-031-38554-4_12",
      url: "https://doi.org/10.1007/978-3-031-38554-4_12",
      venue: "CRYPTO 2023",
      citation_count: 145,
      source: "OpenAlex",
      open_access: false,
      concepts: ["Zero-Knowledge Proofs", "zk-SNARKs", "Cryptographic Protocols"],
      relevance_score: 92,
    },
  ],
};

// ------------------------------------------------------------------
// WORKSPACE SERVICE IMPLEMENTATION
// ------------------------------------------------------------------

class WorkspaceService {
  private initialized = false;

  public async getCurrentUserId(): Promise<string | null> {
    try {
      const { data } = await supabase.auth.getUser();
      return data?.user?.id || null;
    } catch {
      return null;
    }
  }

  private initSeedsIfEmpty() {
    // Benchmark seed projects remain available in-memory for explicit demo calls,
    // but are NOT written into the user's local storage index or database.
    this.initialized = true;
  }

  private summarizeProject(p: ResearchProject): Partial<ResearchProject> {
    return {
      id: p.id,
      title: p.title,
      research_question: p.research_question,
      objective: p.objective,
      description: p.description,
      research_field: p.research_field,
      status: p.status,
      progress: p.progress || 0,
      created_at: p.created_at,
      updated_at: p.updated_at,
    };
  }

  private saveProjectSync(p: ResearchProject) {
    localStorage.setItem(projectDataKey(p.id), JSON.stringify(p));
  }

  private seedHealthcareSubEntities() {
    const id = SEED_HEALTHCARE.id;
    // Notes
    const notes: ResearchNote[] = [
      {
        id: "note_hc_1",
        research_id: id,
        title: "Echocardiogram Artifact Mitigations",
        content: "Need to verify if acoustic shadowing in apical 4-chamber views causes spurious predictions in apex wall motion tracking. Compare Swin vs ConvNeXt feature maps.",
        category: "methodology",
        tags: ["Ultrasound", "Vision Transformer", "Artifacts"],
        pinned: true,
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: "note_hc_2",
        research_id: id,
        title: "Clinical Trust Calibration Observations",
        content: "Cardiologists surveyed strongly preferred counterfactual explanations ('If troponin had been < 0.04...') over saliency maps which often highlighted uninformative catheter wires.",
        category: "observation",
        tags: ["Clinical Ethics", "Explainable AI"],
        pinned: false,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ];
    localStorage.setItem(notesKey(id), JSON.stringify(notes));

    // Tasks
    const tasks: ResearchTask[] = [
      {
        id: "task_hc_1",
        research_id: id,
        title: "Download and preprocess MIMIC-IV-ED ECG dataset",
        description: "Standardize 500Hz sampling rate and apply 0.5-40Hz bandpass filtering",
        status: "completed",
        priority: "high",
        due_date: "2026-09-10",
        completed_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
      },
      {
        id: "task_hc_2",
        research_id: id,
        title: "Benchmark Cross-Attention Multimodal Fusion Module",
        description: "Test early vs late fusion between tabular lab variables and ECG waveform embeddings",
        status: "completed",
        priority: "high",
        due_date: "2026-09-14",
        completed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: "task_hc_3",
        research_id: id,
        title: "Validate external cohort calibration on UK Biobank",
        description: "Ensure no demographic bias across age and biological sex sub-groups",
        status: "pending",
        priority: "medium",
        due_date: "2026-09-22",
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ];
    localStorage.setItem(tasksKey(id), JSON.stringify(tasks));

    // Findings
    const findings: ResearchFinding[] = [
      {
        id: "find_hc_1",
        research_id: id,
        title: "Cross-Attention Yields 14.2% Boost in 30-Day Readmission AUROC",
        type: "insight",
        description: "Coupling continuous ECG latent embeddings with discrete lab biomarkers via cross-modal attention significantly outperforms unimodal baselines.",
        evidence: "Nature Digital Medicine, Jenkins et al. (2024)",
        novelty: 8,
        feasibility: 9,
        confidence: "94%",
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: "find_hc_2",
        research_id: id,
        title: "Acoustic Noise Degradation in Low-Resource Portable Scanners",
        type: "gap",
        description: "Benchmarked models trained on high-end tertiary ultrasound machines experience an 18% accuracy cliff when tested on handheld point-of-care probes.",
        evidence: "IEEE TMI, Vance et al. (2023)",
        novelty: 9,
        feasibility: 8,
        confidence: "89%",
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ];
    localStorage.setItem(findingsKey(id), JSON.stringify(findings));

    // Timeline
    const timeline: ResearchTimelineEvent[] = [
      {
        id: "tl_hc_1",
        research_id: id,
        event_type: "research_created",
        title: "Research Project Initialized",
        description: "Created research project: 'AI in Healthcare: Cardiovascular Early Detection'",
        timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: "tl_hc_2",
        research_id: id,
        event_type: "paper_added",
        title: "Added 3 Foundational Papers",
        description: "Imported Nature Digital Medicine and IEEE TMI studies.",
        timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
      },
      {
        id: "tl_hc_3",
        research_id: id,
        event_type: "note_created",
        title: "Note Documented",
        description: "Added note: 'Echocardiogram Artifact Mitigations'",
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: "tl_hc_4",
        research_id: id,
        event_type: "task_completed",
        title: "Completed Task",
        description: "Benchmark Cross-Attention Multimodal Fusion Module marked completed.",
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ];
    localStorage.setItem(timelineKey(id), JSON.stringify(timeline));

    // Chat History
    const chats: ResearchChatMessage[] = [
      {
        id: "chat_hc_1",
        research_id: id,
        role: "assistant",
        content: "Hello! I am your AI assistant for the Cardiovascular Early Detection research. I have loaded full context over your cardiology papers, EHR notes, and multimodal fusion benchmarks. How can I assist your investigation today?",
        timestamp: new Date(Date.now() - 1 * 86400000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    localStorage.setItem(chatsKey(id), JSON.stringify(chats));
  }

  private seedClimateSubEntities() {
    const id = SEED_CLIMATE.id;
    const notes: ResearchNote[] = [
      {
        id: "note_cc_1",
        research_id: id,
        title: "Topographic Adjacency Graph Construction",
        content: "Using Delaunay triangulation on weather stations produces irregular edge distances. We should weight graph edges by elevation delta rather than purely 2D spatial distance.",
        category: "methodology",
        tags: ["Graph Convolution", "Spatial Downscaling"],
        pinned: true,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ];
    localStorage.setItem(notesKey(id), JSON.stringify(notes));

    const tasks: ResearchTask[] = [
      {
        id: "task_cc_1",
        research_id: id,
        title: "Extract Sentinel-2 surface reflectance tiles for river basin",
        description: "Cloud mask at < 10% threshold across 2021-2025 dry seasons",
        status: "completed",
        priority: "high",
        due_date: "2026-09-08",
        completed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: "task_cc_2",
        research_id: id,
        title: "Train spatiotemporal GNN on convective storm radar",
        description: "Evaluate CRPS (Continuous Ranked Probability Score) on 1hr nowcasts",
        status: "pending",
        priority: "high",
        due_date: "2026-09-18",
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ];
    localStorage.setItem(tasksKey(id), JSON.stringify(tasks));

    const findings: ResearchFinding[] = [
      {
        id: "find_cc_1",
        research_id: id,
        title: "Elevation-Aware Graph Attention Reduces Precipitation Error by 22%",
        type: "finding",
        description: "Explicitly encoding vertical topographic lapse rate in graph attention weights reduces mountain valley precipitation overestimation.",
        evidence: "Geophysical Research Letters, Mansoor et al. (2024)",
        novelty: 8,
        feasibility: 9,
        confidence: "91%",
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ];
    localStorage.setItem(findingsKey(id), JSON.stringify(findings));

    const timeline: ResearchTimelineEvent[] = [
      {
        id: "tl_cc_1",
        research_id: id,
        event_type: "research_created",
        title: "Research Project Initialized",
        description: "Created research project: 'Climate Change: Localized Impact Forecasting'",
        timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
    ];
    localStorage.setItem(timelineKey(id), JSON.stringify(timeline));

    const chats: ResearchChatMessage[] = [
      {
        id: "chat_cc_1",
        research_id: id,
        role: "assistant",
        content: "Welcome to your Climate Change Forecasting research space. I have context on your spatiotemporal GNN models and Sentinel-2 drought indicators. Ask me to compare nowcasting models or summarize regional precipitation anomalies.",
        timestamp: new Date(Date.now() - 2 * 86400000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    localStorage.setItem(chatsKey(id), JSON.stringify(chats));
  }

  private seedBlockchainSubEntities() {
    const id = SEED_BLOCKCHAIN.id;
    const notes: ResearchNote[] = [
      {
        id: "note_bc_1",
        research_id: id,
        title: "Reentrancy Lock Invariant Synthesis",
        content: "Verified that nonReentrant modifier guarantees mutex state transitions. Need to audit cross-contract read-only reentrancy which bypasses simple storage flags.",
        category: "idea",
        tags: ["EVM", "Reentrancy", "DeFi"],
        pinned: true,
        created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
    ];
    localStorage.setItem(notesKey(id), JSON.stringify(notes));

    const tasks: ResearchTask[] = [
      {
        id: "task_bc_1",
        research_id: id,
        title: "Model Uniswap-V2 pool invariants in Z3 solver",
        description: "Specify x * y = k conservation with fractional fees",
        status: "completed",
        priority: "medium",
        due_date: "2026-09-04",
        completed_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
      },
      {
        id: "task_bc_2",
        research_id: id,
        title: "Benchmark Groth16 proof generation on mobile client",
        description: "Measure proving time and memory usage under 256MB mobile constraints",
        status: "completed",
        priority: "high",
        due_date: "2026-09-07",
        completed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
    ];
    localStorage.setItem(tasksKey(id), JSON.stringify(tasks));

    const findings: ResearchFinding[] = [
      {
        id: "find_bc_1",
        research_id: id,
        title: "Formal SMT Model Detects 99.4% of State Variable Manipulation",
        type: "statistic",
        description: "Automated theorem proving on decompiled EVM bytecode eliminated all known reentrancy and integer overflow false-negatives across 120 historical exploit contracts.",
        evidence: "IEEE S&P, Thorne et al. (2024)",
        novelty: 9,
        feasibility: 9,
        confidence: "99%",
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
    ];
    localStorage.setItem(findingsKey(id), JSON.stringify(findings));

    const timeline: ResearchTimelineEvent[] = [
      {
        id: "tl_bc_1",
        research_id: id,
        event_type: "research_created",
        title: "Research Project Initialized",
        description: "Created research project: 'Blockchain Security: Smart Contract Formal Verification'",
        timestamp: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
    ];
    localStorage.setItem(timelineKey(id), JSON.stringify(timeline));

    const chats: ResearchChatMessage[] = [
      {
        id: "chat_bc_1",
        research_id: id,
        role: "assistant",
        content: "Welcome to your Blockchain Security research workspace. I have analyzed your formal verification papers and SMT theorem proving invariants. How can I assist with your smart contract security verification today?",
        timestamp: new Date(Date.now() - 5 * 86400000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    localStorage.setItem(chatsKey(id), JSON.stringify(chats));
  }

  // ----------------------------------------------------------------
  // PROJECT LEVEL APIS
  // ----------------------------------------------------------------

  public async getProjects(userId?: string): Promise<ResearchProject[]> {
    const effectiveUserId = userId || (await this.getCurrentUserId()) || undefined;

    // Unauthenticated visitors have no projects
    if (!effectiveUserId) {
      return [];
    }

    // 1. If authenticated, fetch user's projects directly from Supabase PostgreSQL with strict RLS
    try {
      const { data, error } = await supabase
        .from("research_projects")
        .select("*")
        .eq("user_id", effectiveUserId)
        .order("updated_at", { ascending: false });

      if (!error && data) {
        const cloudProjects: ResearchProject[] = [];

        for (const row of data) {
          const synthesis = (row.synthesis as any) || {};
          let localCached: ResearchProject | null = null;
          try {
            const raw = localStorage.getItem(projectDataKey(row.id));
            if (raw) localCached = JSON.parse(raw);
          } catch {}

          const project: ResearchProject = {
            id: row.id,
            user_id: row.user_id,
            title: row.title,
            research_question: row.research_question,
            research_field: row.research_field || "Scientific Inquiry",
            objective: row.objective || "",
            year_from: row.year_from || undefined,
            year_to: row.year_to || undefined,
            paper_limit: row.paper_limit || 10,
            status: (row.status as any) || "active",
            progress: synthesis.progress ?? localCached?.progress ?? 0,
            stage_completions: synthesis.stage_completions ?? localCached?.stage_completions ?? {},
            description: synthesis.description || localCached?.description || "",
            comparison: synthesis.comparison || localCached?.comparison || null,
            experiment: synthesis.experiment || localCached?.experiment || null,
            report: synthesis.report || localCached?.report || null,
            selected_hypothesis: synthesis.selected_hypothesis || localCached?.selected_hypothesis || null,
            papers: localCached?.papers || [],
            gaps: localCached?.gaps || [],
            hypotheses: localCached?.hypotheses || [],
            created_at: row.created_at,
            updated_at: row.updated_at,
          };

          cloudProjects.push(project);
          this.saveProjectSync(project);
        }

        // Cache summaries for this user only
        try {
          const summaries = cloudProjects.map((p) => this.summarizeProject(p));
          localStorage.setItem(`${STORAGE_PREFIX}${effectiveUserId}_projects_index`, JSON.stringify(summaries));
        } catch {}

        // Return strictly this user's cloud projects. Do NOT append benchmark seeds!
        return cloudProjects;
      }
    } catch (err) {
      console.warn("Supabase getProjects error, checking user cache:", err);
    }

    // 2. Local storage fallback (strictly for this user when offline)
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const indexStr = localStorage.getItem(`${STORAGE_PREFIX}${effectiveUserId}_projects_index`);
      if (!indexStr) return [];
      const summaries: Partial<ResearchProject>[] = JSON.parse(indexStr);

      const projects: ResearchProject[] = [];
      for (const s of summaries) {
        if (!s.id) continue;
        const p = await this.getProjectById(s.id);
        if (p && p.user_id === effectiveUserId) {
          projects.push(p);
        }
      }

      return projects.sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    } catch (e) {
      console.error("Error retrieving user projects from local storage:", e);
      return [];
    }
  }

  /**
   * Clears any cached user research data from localStorage upon sign out
   */
  public clearUserCache(userId?: string): void {
    if (typeof window === "undefined") return;
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          if (!userId || key.includes(userId)) {
            toRemove.push(key);
          }
        }
      }
      for (const k of toRemove) {
        localStorage.removeItem(k);
      }
    } catch (e) {
      console.warn("Error clearing user cache:", e);
    }
  }

  public async getProject(researchId: string): Promise<ResearchProject | null> {
    return this.getProjectById(researchId);
  }

  public async getProjectById(researchId: string): Promise<ResearchProject | null> {
    this.initSeedsIfEmpty();
    if (typeof window === "undefined") {
      if (researchId === SEED_HEALTHCARE.id) return SEED_HEALTHCARE;
      if (researchId === SEED_CLIMATE.id) return SEED_CLIMATE;
      if (researchId === SEED_BLOCKCHAIN.id) return SEED_BLOCKCHAIN;
      return null;
    }

    // Benchmark seed fast path
    if (researchId === SEED_HEALTHCARE.id) return SEED_HEALTHCARE;
    if (researchId === SEED_CLIMATE.id) return SEED_CLIMATE;
    if (researchId === SEED_BLOCKCHAIN.id) return SEED_BLOCKCHAIN;

    // Cloud fetch if valid UUID
    if (isUUID(researchId)) {
      try {
        const { data, error } = await supabase
          .from("research_projects")
          .select("*")
          .eq("id", researchId)
          .single();

        if (!error && data) {
          const synthesis = (data.synthesis as any) || {};
          let localCached: ResearchProject | null = null;
          try {
            const raw = localStorage.getItem(projectDataKey(researchId));
            if (raw) localCached = JSON.parse(raw);
          } catch {}

          // Fetch papers from Supabase if available
          let papers = localCached?.papers || [];
          try {
            const { data: papersData } = await supabase
              .from("papers")
              .select("*")
              .eq("project_id", researchId);
            if (papersData && papersData.length > 0) {
              papers = papersData.map((p) => ({
                id: p.id,
                external_id: p.external_id || "",
                title: p.title,
                authors: p.authors || [],
                abstract: p.abstract || "",
                year: p.year ?? new Date().getFullYear(),
                doi: p.doi || undefined,
                url: p.url || undefined,
                venue: p.venue || "Academic Publication",
                citation_count: p.citation_count || 0,
                source: p.source || "openalex",
                open_access: p.open_access || false,
                concepts: p.concepts || [],
              }));
            }
          } catch {}

          const project: ResearchProject = {
            id: data.id,
            user_id: data.user_id,
            title: data.title,
            research_question: data.research_question,
            research_field: data.research_field || "Scientific Inquiry",
            objective: data.objective || "",
            year_from: data.year_from || undefined,
            year_to: data.year_to || undefined,
            paper_limit: data.paper_limit || 10,
            status: (data.status as any) || "active",
            progress: synthesis.progress ?? localCached?.progress ?? 0,
            stage_completions: synthesis.stage_completions ?? localCached?.stage_completions ?? {},
            description: synthesis.description || localCached?.description || "",
            comparison: synthesis.comparison || localCached?.comparison || null,
            experiment: synthesis.experiment || localCached?.experiment || null,
            report: synthesis.report || localCached?.report || null,
            papers,
            gaps: localCached?.gaps || [],
            hypotheses: localCached?.hypotheses || [],
            created_at: data.created_at,
            updated_at: data.updated_at,
          };

          this.saveProjectSync(project);
          return project;
        }
      } catch (err) {
        console.warn("Cloud getProjectById fallback to local:", err);
      }
    }

    try {
      const raw = localStorage.getItem(projectDataKey(researchId));
      if (!raw) return null;
      const project: ResearchProject = JSON.parse(raw);

      // Dynamically compute progress based on tasks if available
      const tasks = await this.getTasks(researchId);
      if (tasks.length > 0) {
        const completed = tasks.filter((t) => t.status === "completed").length;
        project.progress = Math.round((completed / tasks.length) * 100);
      }

      return project;
    } catch {
      return null;
    }
  }

  public async saveProject(project: ResearchProject): Promise<void> {
    if (typeof window === "undefined") return;

    project.updated_at = new Date().toISOString();
    localStorage.setItem(projectDataKey(project.id), JSON.stringify(project));

    // Update index
    const indexStr = localStorage.getItem(KEY_PROJECTS_INDEX);
    let index: Partial<ResearchProject>[] = indexStr ? JSON.parse(indexStr) : [];
    const existingIdx = index.findIndex((p) => p.id === project.id);

    const summary = this.summarizeProject(project);
    if (existingIdx >= 0) {
      index[existingIdx] = summary;
    } else {
      index.unshift(summary);
    }
    localStorage.setItem(KEY_PROJECTS_INDEX, JSON.stringify(index));

    // Cloud sync to Supabase if UUID
    const uid = project.user_id || (await this.getCurrentUserId());
    if (uid && isUUID(project.id)) {
      try {
        await supabase.from("research_projects").upsert({
          id: project.id,
          user_id: uid,
          title: project.title,
          research_question: project.research_question,
          research_field: project.research_field,
          objective: project.objective,
          year_from: project.year_from,
          year_to: project.year_to,
          paper_limit: project.paper_limit || 10,
          status: project.status,
          synthesis: {
            stage_completions: project.stage_completions || {},
            progress: project.progress || 0,
            description: project.description || "",
            comparison: project.comparison || null,
            experiment: project.experiment || null,
            report: project.report || null,
            selected_hypothesis: project.selected_hypothesis || null,
          } as any,
          updated_at: project.updated_at,
        });

        // Sync papers if any
        if (project.papers && project.papers.length > 0) {
          for (const p of project.papers) {
            const paperUUID = isUUID(p.id) ? p.id : generateUUID();
            await supabase.from("papers").upsert({
              id: paperUUID,
              project_id: project.id,
              external_id: p.external_id || "",
              title: p.title,
              authors: p.authors || [],
              abstract: p.abstract || "",
              year: p.year || null,
              doi: p.doi || null,
              url: p.url || null,
              venue: p.venue || null,
              citation_count: p.citation_count || 0,
              source: p.source || null,
              open_access: p.open_access || false,
              concepts: p.concepts || [],
            });
          }
        }
      } catch (err) {
        console.warn("Supabase project sync warning:", err);
      }
    }
  }

  public async createProject(data: Partial<ResearchProject>): Promise<ResearchProject> {
    const currentUserId = data.user_id || (await this.getCurrentUserId());
    if (!currentUserId) {
      throw new Error("Authentication required: Please sign in with Google to create a research project.");
    }
    const researchId = data.id && isUUID(data.id) ? data.id : generateUUID();
    const now = new Date().toISOString();

    const newProject: ResearchProject = {
      id: researchId,
      title: data.title?.trim() || "Untitled Research Investigation",
      research_question: data.research_question?.trim() || "Unspecified inquiry",
      objective: data.objective?.trim() || "Investigate the primary research question.",
      description: data.description?.trim() || "Autonomous scientific research inquiry.",
      research_field: data.research_field?.trim() || "Scientific Inquiry",
      status: data.status || "active",
      progress: data.progress || 0,
      paper_limit: data.paper_limit || 12,
      user_id: currentUserId,
      year_from: data.year_from,
      year_to: data.year_to,
      created_at: now,
      updated_at: now,
      papers: data.papers || [],
      gaps: data.gaps || [],
      hypotheses: data.hypotheses || [],
      selected_hypothesis: data.selected_hypothesis || null,
      comparison: data.comparison || null,
      experiment: data.experiment || null,
      report: data.report || null,
      stage_completions: data.stage_completions || {},
    };

    await this.saveProject(newProject);

    // Initial timeline event
    await this.addTimelineEvent(researchId, {
      event_type: "research_created",
      title: "Research Project Initialized",
      description: `Created dedicated workspace for "${newProject.title}" (ID: ${researchId})`,
    });

    // Initial welcome AI message
    await this.addChatMessage(
      researchId,
      "assistant",
      `Welcome to your dedicated research workspace for: "${newProject.title}".\n\nI am your research co-pilot, strictly grounded in this project's literature, notes, and findings. You can ask me to analyze papers, synthesize methodology, or formulate hypotheses.`
    );

    return newProject;
  }

  public async updateProject(researchId: string, updates: Partial<ResearchProject>): Promise<void> {
    const existing = await this.getProjectById(researchId);
    if (!existing) return;

    const updated: ResearchProject = {
      ...existing,
      ...updates,
      id: existing.id,
      updated_at: new Date().toISOString(),
    };

    if (updates.status && updates.status !== existing.status) {
      await this.addTimelineEvent(researchId, {
        event_type: "status_changed",
        title: "Research Status Updated",
        description: `Status changed from ${existing.status} to ${updates.status}.`,
      });
    }

    await this.saveProject(updated);
  }

  /**
   * CASCADING DELETION: Safely archives/deletes all associated data for this researchId
   */
  public async deleteProject(researchId: string): Promise<void> {
    if (typeof window === "undefined") return;

    // Remove all isolated sub-entity storages
    localStorage.removeItem(projectDataKey(researchId));
    localStorage.removeItem(notesKey(researchId));
    localStorage.removeItem(tasksKey(researchId));
    localStorage.removeItem(findingsKey(researchId));
    localStorage.removeItem(timelineKey(researchId));
    localStorage.removeItem(chatsKey(researchId));
    localStorage.removeItem(stageCompletionsKey(researchId));
    localStorage.removeItem(evidenceKey(researchId));
    localStorage.removeItem(evidenceComparisonKey(researchId));
    localStorage.removeItem(gapsKey(researchId));
    localStorage.removeItem(gapReportKey(researchId));

    // Update index
    const indexStr = localStorage.getItem(KEY_PROJECTS_INDEX);
    if (indexStr) {
      const index: Partial<ResearchProject>[] = JSON.parse(indexStr);
      const filtered = index.filter((p) => p.id !== researchId);
      localStorage.setItem(KEY_PROJECTS_INDEX, JSON.stringify(filtered));
    }

    // Cascading delete in Supabase PostgreSQL
    if (isUUID(researchId)) {
      try {
        await supabase.from("research_projects").delete().eq("id", researchId);
      } catch (e) {
        console.warn("Supabase project deletion warning:", e);
      }
    }
  }

  /**
   * DUPLICATION: Creates a new Research ID and clones all associated data
   */
  public async duplicateProject(originalId: string): Promise<ResearchProject> {
    const original = await this.getProjectById(originalId);
    if (!original) throw new Error("Original project not found");

    const newResearchId = generateUUID();
    const now = new Date().toISOString();
    const currentUserId = (await this.getCurrentUserId()) || original.user_id;

    const duplicatedProject: ResearchProject = {
      ...original,
      id: newResearchId,
      user_id: currentUserId,
      title: `Copy of ${original.title}`,
      created_at: now,
      updated_at: now,
      status: "active",
      progress: 0,
      stage_completions: {},
    };

    await this.saveProject(duplicatedProject);

    // Duplicate Notes
    const originalNotes = await this.getNotes(originalId);
    for (const n of originalNotes) {
      await this.createNote(newResearchId, {
        title: n.title,
        content: n.content,
        category: n.category,
        tags: n.tags,
        pinned: n.pinned,
      });
    }

    // Duplicate Tasks
    const originalTasks = await this.getTasks(originalId);
    for (const t of originalTasks) {
      await this.createTask(newResearchId, {
        title: t.title,
        description: t.description,
        priority: t.priority,
        due_date: t.due_date,
        status: "pending",
      });
    }

    // Duplicate Findings
    const originalFindings = await this.getFindings(originalId);
    for (const f of originalFindings) {
      await this.createFinding(newResearchId, {
        title: f.title,
        type: f.type,
        description: f.description,
        evidence: f.evidence,
        supporting_papers: f.supporting_papers,
        novelty: f.novelty,
        feasibility: f.feasibility,
        confidence: f.confidence,
        metrics: f.metrics,
      });
    }

    // Create Initial Timeline Event
    await this.addTimelineEvent(newResearchId, {
      event_type: "research_created",
      title: "Duplicated from Existing Research",
      description: `Cloned from "${original.title}" (Original ID: ${originalId}) with all literature and notes.`,
    });

    // Initial Chat Message
    await this.addChatMessage(
      newResearchId,
      "assistant",
      `This research was duplicated from "${original.title}". All literature, notes, and findings have been cloned into this isolated workspace.`
    );

    return duplicatedProject;
  }

  // ----------------------------------------------------------------
  // PAPERS APIS
  // ----------------------------------------------------------------

  public async getPapers(researchId: string): Promise<NormalizedPaper[]> {
    if (isUUID(researchId)) {
      try {
        const { data, error } = await supabase
          .from("papers")
          .select("*")
          .eq("project_id", researchId);

        if (!error && data && data.length > 0) {
          return data.map((p) => ({
            id: p.id,
            external_id: p.external_id || "",
            title: p.title,
            authors: p.authors || [],
            abstract: p.abstract || "",
            year: p.year ?? new Date().getFullYear(),
            doi: p.doi || undefined,
            url: p.url || undefined,
            venue: p.venue || "Academic Publication",
            citation_count: p.citation_count || 0,
            source: p.source || "openalex",
            open_access: p.open_access || false,
            concepts: p.concepts || [],
          }));
        }
      } catch {}
    }

    const project = await this.getProjectById(researchId);
    return project?.papers || [];
  }

  public async addPaper(researchId: string, paper: NormalizedPaper): Promise<void> {
    const project = await this.getProjectById(researchId);
    if (!project) return;

    const exists = project.papers.some((p) => p.id === paper.id || (p.doi && p.doi === paper.doi));
    if (exists) return;

    const paperWithId: NormalizedPaper = {
      ...paper,
      id: isUUID(paper.id) ? paper.id : generateUUID(),
    };

    project.papers.unshift(paperWithId);
    await this.saveProject(project);

    if (isUUID(researchId)) {
      try {
        await supabase.from("papers").insert({
          id: paperWithId.id,
          project_id: researchId,
          external_id: paperWithId.external_id || "",
          title: paperWithId.title,
          authors: paperWithId.authors || [],
          abstract: paperWithId.abstract || "",
          year: paperWithId.year || null,
          doi: paperWithId.doi || null,
          url: paperWithId.url || null,
          venue: paperWithId.venue || null,
          citation_count: paperWithId.citation_count || 0,
          source: paperWithId.source || null,
          open_access: paperWithId.open_access || false,
          concepts: paperWithId.concepts || [],
        });
      } catch (err) {
        console.warn("Supabase paper insert warning:", err);
      }
    }

    // Auto-create initial evidence record for the added paper and notify dirty state
    await this.ensureEvidenceItemForPaper(researchId, paperWithId);
    this.markEvidenceDirty(researchId);

    await this.addTimelineEvent(researchId, {
      event_type: "paper_added",
      title: "Paper Added to Literature",
      description: `Added "${paper.title.slice(0, 60)}..." by ${paper.authors?.[0] || "Unknown"} et al.`,
    });
  }

  public async removePaper(researchId: string, paperId: string): Promise<void> {
    const project = await this.getProjectById(researchId);
    if (!project) return;

    const removed = project.papers.find((p) => p.id === paperId);
    project.papers = project.papers.filter((p) => p.id !== paperId);
    await this.saveProject(project);

    if (isUUID(paperId)) {
      try {
        await supabase.from("papers").delete().eq("id", paperId);
      } catch (err) {
        console.warn("Supabase paper delete warning:", err);
      }
    }

    // Remove evidence item and mark evidence as dirty to trigger re-analysis opportunity
    await this.deleteEvidenceItem(researchId, paperId);
    this.markEvidenceDirty(researchId);

    if (removed) {
      await this.addTimelineEvent(researchId, {
        event_type: "paper_removed",
        title: "Paper Removed from Literature",
        description: `Removed "${removed.title.slice(0, 60)}..."`,
      });
    }
  }

  // ----------------------------------------------------------------
  // EVIDENCE MATRIX APIS (Strictly Isolated by researchId)
  // ----------------------------------------------------------------

  public async getEvidenceMatrix(researchId: string): Promise<ResearchEvidenceItem[]> {
    this.initSeedsIfEmpty();
    if (typeof window === "undefined") return [];

    const key = evidenceKey(researchId);
    const existing = localStorage.getItem(key);
    if (existing) {
      try {
        const parsed: ResearchEvidenceItem[] = JSON.parse(existing);
        return parsed.filter((e) => e.research_id === researchId);
      } catch {}
    }

    // Lazy seed or auto-initialize from project papers
    const project = await this.getProjectById(researchId);
    if (!project || !project.papers || project.papers.length === 0) {
      return [];
    }

    const seeded = this.generateInitialEvidenceForProject(project);
    localStorage.setItem(key, JSON.stringify(seeded));
    return seeded;
  }

  public async saveEvidenceItem(researchId: string, item: ResearchEvidenceItem): Promise<void> {
    const list = await this.getEvidenceMatrix(researchId);
    const idx = list.findIndex((e) => e.paper_id === item.paper_id || e.id === item.id);
    const updatedItem = {
      ...item,
      research_id: researchId,
      updated_at: new Date().toISOString(),
    };

    if (idx >= 0) {
      list[idx] = updatedItem;
    } else {
      list.unshift(updatedItem);
    }

    localStorage.setItem(evidenceKey(researchId), JSON.stringify(list));
    this.markEvidenceDirty(researchId);

    await this.addTimelineEvent(researchId, {
      event_type: "analysis_performed",
      title: "Evidence Matrix Record Updated",
      description: `Updated analysis for "${item.paper_title.slice(0, 50)}..." (${item.evidence_strength} strength)`,
    });
  }

  public async saveEvidenceMatrix(researchId: string, items: ResearchEvidenceItem[]): Promise<void> {
    const scoped = items.map((it) => ({
      ...it,
      research_id: researchId,
      updated_at: new Date().toISOString(),
    }));
    localStorage.setItem(evidenceKey(researchId), JSON.stringify(scoped));
    this.markEvidenceDirty(researchId);
  }

  public async deleteEvidenceItem(researchId: string, paperId: string): Promise<void> {
    const list = await this.getEvidenceMatrix(researchId);
    const updated = list.filter((e) => e.paper_id !== paperId && e.id !== paperId);
    localStorage.setItem(evidenceKey(researchId), JSON.stringify(updated));
    this.markEvidenceDirty(researchId);
  }

  public async ensureEvidenceItemForPaper(researchId: string, paper: NormalizedPaper): Promise<void> {
    const list = await this.getEvidenceMatrix(researchId);
    const exists = list.some((e) => e.paper_id === paper.id);
    if (exists) return;

    let problem = "Not identified in source";
    if (paper.abstract && (paper.abstract.toLowerCase().includes("problem") || paper.abstract.toLowerCase().includes("challenge"))) {
      problem = `Addressing ${paper.abstract.slice(0, 140)}...`;
    } else if (paper.title) {
      problem = `Empirical inquiry into ${paper.title.slice(0, 100)}`;
    }

    let method = "Not identified in source";
    if (paper.abstract && (paper.abstract.toLowerCase().includes("propose") || paper.abstract.toLowerCase().includes("model"))) {
      method = paper.abstract.slice(0, 160);
    }

    const newItem: ResearchEvidenceItem = {
      id: `ev_${paper.id}`,
      research_id: researchId,
      paper_id: paper.id,
      paper_title: paper.title,
      authors: paper.authors || ["Unknown Authors"],
      year: paper.year || new Date().getFullYear(),
      venue: paper.venue || "Academic Publication",
      doi: paper.doi,
      url: paper.url,
      research_problem: problem,
      methodology: method,
      dataset: "Not identified in source",
      key_finding: paper.abstract ? paper.abstract.slice(0, 180) : "Not identified in source",
      limitations: "Not identified in source",
      research_contribution: `Analyzes ${paper.concepts?.[0] || "core domain concepts"}.`,
      evidence_strength: "Moderate",
      extracted_by_ai: false,
      updated_at: new Date().toISOString(),
    };

    list.unshift(newItem);
    localStorage.setItem(evidenceKey(researchId), JSON.stringify(list));
  }

  public async getEvidenceComparison(researchId: string): Promise<EvidenceComparisonSynthesis | null> {
    if (typeof window === "undefined") return null;
    const existing = localStorage.getItem(evidenceComparisonKey(researchId));
    if (!existing) return null;
    try {
      return JSON.parse(existing);
    } catch {
      return null;
    }
  }

  public async saveEvidenceComparison(researchId: string, synthesis: EvidenceComparisonSynthesis): Promise<void> {
    localStorage.setItem(evidenceComparisonKey(researchId), JSON.stringify(synthesis));
  }

  // ----------------------------------------------------------------
  // RESEARCH GAPS APIS (Strictly Isolated by researchId)
  // ----------------------------------------------------------------

  public async getResearchGaps(researchId: string): Promise<ResearchGapEntry[]> {
    this.initSeedsIfEmpty();
    if (typeof window === "undefined") return [];

    if (isUUID(researchId)) {
      try {
        const { data, error } = await supabase
          .from("research_gaps")
          .select("*")
          .eq("project_id", researchId)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const cloudGaps: ResearchGapEntry[] = data.map((g) => ({
            gap_id: g.id,
            research_id: g.project_id,
            title: g.title,
            description: g.description || "",
            supporting_papers: g.supporting_papers || [],
            confidence: (g.confidence as any) || "High",
            verified: true,
            category: g.category || "Methodological Gap",
            created_at: g.created_at,
            updated_at: g.created_at,
          }));
          localStorage.setItem(gapsKey(researchId), JSON.stringify(cloudGaps));
          return cloudGaps;
        }
      } catch (err) {
        console.warn("Supabase getResearchGaps fallback to local:", err);
      }
    }

    const key = gapsKey(researchId);
    const existing = localStorage.getItem(key);
    if (existing) {
      try {
        const parsed: ResearchGapEntry[] = JSON.parse(existing);
        return parsed.filter((g) => g.research_id === researchId);
      } catch {}
    }

    const project = await this.getProjectById(researchId);
    if (!project) return [];

    const seededGaps = this.generateInitialGapsForProject(project);
    localStorage.setItem(key, JSON.stringify(seededGaps));
    return seededGaps;
  }

  public async saveResearchGap(researchId: string, gap: ResearchGapEntry): Promise<void> {
    const list = await this.getResearchGaps(researchId);
    const idx = list.findIndex((g) => g.gap_id === gap.gap_id);
    const updated = {
      ...gap,
      research_id: researchId,
      updated_at: new Date().toISOString(),
    };

    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.unshift(updated);
    }
    localStorage.setItem(gapsKey(researchId), JSON.stringify(list));

    if (isUUID(researchId) && isUUID(gap.gap_id)) {
      try {
        await supabase.from("research_gaps").upsert({
          id: gap.gap_id,
          project_id: researchId,
          title: gap.title,
          category: gap.category,
          description: gap.description,
          supporting_papers: gap.supporting_papers || [],
          confidence: gap.confidence,
        });
      } catch (err) {
        console.warn("Supabase gap upsert warning:", err);
      }
    }
  }

  public async createResearchGap(researchId: string, data: Partial<ResearchGapEntry>): Promise<ResearchGapEntry> {
    const list = await this.getResearchGaps(researchId);
    const now = new Date().toISOString();
    const newGapId = generateUUID();
    const newGap: ResearchGapEntry = {
      gap_id: newGapId,
      research_id: researchId,
      title: data.title?.trim() || `Research Gap #${list.length + 1}`,
      description: data.description?.trim() || "Identified open research gap in current literature.",
      supporting_papers: data.supporting_papers || [],
      confidence: data.confidence || "High",
      verified: !!data.verified,
      category: data.category || "Methodological Gap",
      created_at: now,
      updated_at: now,
    };

    list.unshift(newGap);
    localStorage.setItem(gapsKey(researchId), JSON.stringify(list));

    if (isUUID(researchId)) {
      try {
        await supabase.from("research_gaps").insert({
          id: newGapId,
          project_id: researchId,
          title: newGap.title,
          category: newGap.category,
          description: newGap.description,
          supporting_papers: newGap.supporting_papers,
          confidence: newGap.confidence,
          created_at: now,
        });
      } catch (err) {
        console.warn("Supabase gap insert warning:", err);
      }
    }

    await this.addTimelineEvent(researchId, {
      event_type: "finding_added",
      title: "Research Gap Formulated",
      description: `Added: "${newGap.title.slice(0, 50)}..." (${newGap.confidence} confidence)`,
    });

    return newGap;
  }

  public async deleteResearchGap(researchId: string, gapId: string): Promise<void> {
    const list = await this.getResearchGaps(researchId);
    const updated = list.filter((g) => g.gap_id !== gapId);
    localStorage.setItem(gapsKey(researchId), JSON.stringify(updated));

    if (isUUID(gapId)) {
      try {
        await supabase.from("research_gaps").delete().eq("id", gapId);
      } catch (err) {
        console.warn("Supabase gap delete warning:", err);
      }
    }
  }

  public async getResearchGapReport(researchId: string): Promise<ResearchGapAnalysisReport | null> {
    if (typeof window === "undefined") return null;
    const existing = localStorage.getItem(gapReportKey(researchId));
    if (!existing) return null;
    try {
      const parsed: ResearchGapAnalysisReport = JSON.parse(existing);
      if (parsed.research_id === researchId) return parsed;
      return null;
    } catch {
      return null;
    }
  }

  public async saveResearchGapReport(researchId: string, report: ResearchGapAnalysisReport): Promise<void> {
    const scopedReport: ResearchGapAnalysisReport = {
      ...report,
      research_id: researchId,
      analyzed_at: new Date().toISOString(),
    };
    localStorage.setItem(gapReportKey(researchId), JSON.stringify(scopedReport));
    if (scopedReport.gaps && scopedReport.gaps.length > 0) {
      localStorage.setItem(gapsKey(researchId), JSON.stringify(scopedReport.gaps));
    }
    this.markEvidenceClean(researchId);

    await this.addTimelineEvent(researchId, {
      event_type: "analysis_performed",
      title: "Comprehensive Research Gap Analysis Completed",
      description: `Synthesized ${scopedReport.gaps.length} research gaps and identified ${scopedReport.contradictions?.length || 0} cross-study contradictions.`,
    });
  }

  // ----------------------------------------------------------------
  // DIRTY STATE TRACKING (Connects Evidence Matrix & Research Gap)
  // ----------------------------------------------------------------

  public isEvidenceDirty(researchId: string): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(evidenceDirtyKey(researchId)) === "true";
  }

  public markEvidenceDirty(researchId: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(evidenceDirtyKey(researchId), "true");
  }

  public markEvidenceClean(researchId: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(evidenceDirtyKey(researchId), "false");
  }

  // ----------------------------------------------------------------
  // SEED GENERATORS FOR OUT-OF-THE-BOX BENCHMARK ISOLATION
  // ----------------------------------------------------------------

  private generateInitialEvidenceForProject(project: ResearchProject): ResearchEvidenceItem[] {
    const now = new Date().toISOString();

    if (project.id === "res_ai_healthcare") {
      return [
        {
          id: "ev_paper_hc_1",
          research_id: project.id,
          paper_id: "paper_hc_1",
          paper_title: "Multimodal Deep Learning for Cardiovascular Risk Stratification using Electronic Health Records",
          authors: ["Sarah Jenkins", "Hassan Al-Sayed", "Elena Rostova"],
          year: 2024,
          venue: "Nature Digital Medicine",
          doi: "10.1038/s41746-024-01092-3",
          url: "https://doi.org/10.1038/s41746-024-01092-3",
          research_problem: "Multimodal integration of unstructured clinical notes and longitudinal laboratory metrics for early coronary syndrome prediction.",
          methodology: "Dual-stream cross-attention neural network aligning temporal notes with discrete lab time series.",
          dataset: "MIMIC-IV-ED multi-center ICU cohorts (12,000 patient admissions).",
          key_finding: "Achieved 0.89 AUROC, outperforming single-modal EHR baselines by 14.2% in 5-year cardiac risk stratification.",
          limitations: "Lack of prospective validation on outpatient cohorts with missing observation variables.",
          research_contribution: "Demonstrates that attention-weighted clinical note embeddings bridge observational EHR gaps.",
          evidence_strength: "Strong",
          extracted_by_ai: true,
          updated_at: now,
        },
        {
          id: "ev_paper_hc_2",
          research_id: project.id,
          paper_id: "paper_hc_2",
          paper_title: "Vision Transformers for Automated Echocardiographic Left Ventricle Segmentation",
          authors: ["Marcus Vance", "Kavita Sharma", "Li Wei"],
          year: 2023,
          venue: "IEEE TMI",
          doi: "10.1109/TMI.2023.3289104",
          url: "https://doi.org/10.1109/TMI.2023.3289104",
          research_problem: "Precise myocardial boundary delineation under low signal-to-noise acoustic shadowing in ultrasound.",
          methodology: "Hierarchical Swin Transformer with shifted-window self-attention and spatio-temporal continuity loss.",
          dataset: "CAMUS & EchoNet-Dynamic (10,030 transthoracic echocardiogram videos).",
          key_finding: "0.92 Dice coefficient on end-diastolic and end-systolic frames with 3.2% error in ejection fraction estimation.",
          limitations: "Inference latency is 140ms on standard clinical edge ultrasound workstations, limiting real-time 30fps guidance.",
          research_contribution: "Establishes state-of-the-art wall motion tracking resilient to lateral beam attenuation.",
          evidence_strength: "Strong",
          extracted_by_ai: true,
          updated_at: now,
        },
      ];
    }

    if (project.id === "res_climate_forecast") {
      return [
        {
          id: "ev_paper_cc_1",
          research_id: project.id,
          paper_id: "paper_cc_1",
          paper_title: "Spatiotemporal Graph Neural Networks for Regional Drought Severity Nowcasting",
          authors: ["Dr. Claire Dubois", "Amara Okafor", "Kenji Sato"],
          year: 2024,
          venue: "Remote Sensing of Environment",
          doi: "10.1016/j.rse.2024.114088",
          url: "https://doi.org/10.1016/j.rse.2024.114088",
          research_problem: "Predicting agricultural drought onset 14-30 days in advance across irregular meteorological catchment grids.",
          methodology: "Spatiotemporal Adaptive Graph Neural Network (ST-AGNN) with diffusion convolution.",
          dataset: "Sentinel-2 Multispectral & ERA5 Reanalysis (1990-2023, Mediterranean Basin).",
          key_finding: "Reduces Mean Absolute Error by 28% over ARIMA and static Random Forest baselines.",
          limitations: "High sensitivity to cloud occlusion during critical phenological phases.",
          research_contribution: "Captures topographical connectivity and cross-basin moisture transport.",
          evidence_strength: "Strong",
          extracted_by_ai: true,
          updated_at: now,
        },
        {
          id: "ev_paper_cc_2",
          research_id: project.id,
          paper_id: "paper_cc_2",
          paper_title: "Deep Physics-Informed Neural Operators for Kilometer-Scale Extreme Weather Modeling",
          authors: ["Valerie Schmidt", "Thorsten Weber", "Chen Liu"],
          year: 2023,
          venue: "Journal of Advances in Modeling Earth Systems",
          doi: "10.1029/2023MS003819",
          url: "https://doi.org/10.1029/2023MS003819",
          research_problem: "Resolving localized convective precipitation cells without coarse numerical grid discretization artifacts.",
          methodology: "Fourier Neural Operator (FNO) constrained by Navier-Stokes mass conservation residuals.",
          dataset: "ECMWF IFS High-Resolution Operational Analysis (0.1 degree global grid).",
          key_finding: "45x computational speedup over numerical weather prediction with equivalent 72-hour forecast skill.",
          limitations: "Boundary condition drift accumulates rapidly beyond forecast day 5.",
          research_contribution: "Demonstrates zero-shot super-resolution on extreme convective rainfall events.",
          evidence_strength: "Moderate",
          extracted_by_ai: true,
          updated_at: now,
        },
      ];
    }

    if (project.id === "res_blockchain_security") {
      return [
        {
          id: "ev_paper_bc_1",
          research_id: project.id,
          paper_id: "paper_bc_1",
          paper_title: "Automated Formal Verification of Reentrancy Invariants in Decentralized Finance Protocols",
          authors: ["Alexander Thorne", "Mei-Ling Zhou"],
          year: 2024,
          venue: "IEEE S&P (Oakland)",
          doi: "10.1109/SP54263.2024.00042",
          url: "https://doi.org/10.1109/SP54263.2024.00042",
          research_problem: "Preventing reentrancy and state variable corruption in complex DeFi composable call graphs.",
          methodology: "SMT-based symbolic execution and deductive invariant synthesis using Z3.",
          dataset: "120 verified historical EVM exploits and 2,400 mainnet smart contracts.",
          key_finding: "Zero false-negatives on known reentrancy attack vectors with 99.4% precision.",
          limitations: "State space explosion on deeply nested external delegatecalls.",
          research_contribution: "Eliminates need for manual annotations via automated inductive invariant inference.",
          evidence_strength: "Strong",
          extracted_by_ai: true,
          updated_at: now,
        },
        {
          id: "ev_paper_bc_2",
          research_id: project.id,
          paper_id: "paper_bc_2",
          paper_title: "Zero-Knowledge Circuit Verification for Private Decentralized Transactions",
          authors: ["Nadia Petrov", "Arthur Pendelton"],
          year: 2023,
          venue: "CRYPTO 2023",
          doi: "10.1007/978-3-031-38554-4_12",
          url: "https://doi.org/10.1007/978-3-031-38554-4_12",
          research_problem: "Compiling constraint systems into succinct arguments without trusted setups or soundness bugs.",
          methodology: "Plonk-based zk-SNARK with customized lookup gates.",
          dataset: "Synthetic benchmark circuits up to 2^20 constraints on Layer-2 rollups.",
          key_finding: "Prover memory reduced by 40% with sub-second verification times.",
          limitations: "Proving overhead remains prohibitive for low-power mobile wallet devices.",
          research_contribution: "Formally proves constraint completeness across variable bit-length operations.",
          evidence_strength: "Moderate",
          extracted_by_ai: true,
          updated_at: now,
        },
      ];
    }

    // Default for newly added / custom projects:
    return (project.papers || []).map((p) => ({
      id: `ev_${p.id}`,
      research_id: project.id,
      paper_id: p.id,
      paper_title: p.title,
      authors: p.authors || ["Unknown Authors"],
      year: p.year || new Date().getFullYear(),
      venue: p.venue || "Academic Publication",
      doi: p.doi,
      url: p.url,
      research_problem: p.abstract ? `Addressing ${p.abstract.slice(0, 140)}...` : "Not identified in source",
      methodology: p.abstract ? p.abstract.slice(0, 160) : "Not identified in source",
      dataset: "Not identified in source",
      key_finding: p.abstract ? p.abstract.slice(0, 180) : "Not identified in source",
      limitations: "Not identified in source",
      research_contribution: `Advances understanding of ${project.research_field}.`,
      evidence_strength: "Moderate",
      extracted_by_ai: false,
      updated_at: now,
    }));
  }

  private generateInitialGapsForProject(project: ResearchProject): ResearchGapEntry[] {
    const now = new Date().toISOString();

    if (project.id === "res_ai_healthcare") {
      return [
        {
          gap_id: "gap_hc_1",
          research_id: project.id,
          title: "Real-Time Ultrasound Inference Latency Bottleneck",
          description: "Existing vision transformer architectures achieve high segmentation accuracy (Dice > 0.90) but require substantial GPU compute (~140ms/frame), making them unsuitable for live 30fps bedside ultrasound devices.",
          supporting_papers: [
            "Vision Transformers for Automated Echocardiographic Left Ventricle Segmentation",
          ],
          confidence: "High",
          verified: true,
          category: "Methodological Gap",
          created_at: now,
          updated_at: now,
        },
        {
          gap_id: "gap_hc_2",
          research_id: project.id,
          title: "Missing Modality Resilience Under Asynchronous Clinical Records",
          description: "Current multimodal cardiovascular risk models assume full concurrent availability of ECG and clinical lab metrics, collapsing in accuracy when longitudinal records contain irregular gaps.",
          supporting_papers: [
            "Multimodal Deep Learning for Cardiovascular Risk Stratification using Electronic Health Records",
          ],
          confidence: "High",
          verified: false,
          category: "Dataset Gap",
          created_at: now,
          updated_at: now,
        },
        {
          gap_id: "gap_hc_3",
          research_id: project.id,
          title: "Cross-Center Demographic Generalization and Calibration Error",
          description: "Evaluations are restricted to retrospective single-system ICU databases, with uncharacterized calibration drift across outpatient ambulatory clinics.",
          supporting_papers: [
            "Multimodal Deep Learning for Cardiovascular Risk Stratification using Electronic Health Records",
            "Vision Transformers for Automated Echocardiographic Left Ventricle Segmentation",
          ],
          confidence: "Medium",
          verified: false,
          category: "Generalization Gap",
          created_at: now,
          updated_at: now,
        },
      ];
    }

    if (project.id === "res_climate_forecast") {
      return [
        {
          gap_id: "gap_cc_1",
          research_id: project.id,
          title: "Boundary Condition Error Accumulation Beyond 72-Hour Horizons",
          description: "Fourier Neural Operators provide massive speedups over numerical simulation, but cumulative error across high-frequency boundary conditions causes divergence past 5 days.",
          supporting_papers: [
            "Deep Physics-Informed Neural Operators for Kilometer-Scale Extreme Weather Modeling",
          ],
          confidence: "High",
          verified: true,
          category: "Methodological Gap",
          created_at: now,
          updated_at: now,
        },
        {
          gap_id: "gap_cc_2",
          research_id: project.id,
          title: "Cloud Occlusion Robustness in Multispectral Drought Surveillance",
          description: "Optical Sentinel-2 drought vegetation indices fail during prolonged overcast periods, necessitating synthetic aperture radar (SAR) feature imputation.",
          supporting_papers: [
            "Spatiotemporal Graph Neural Networks for Regional Drought Severity Nowcasting",
          ],
          confidence: "High",
          verified: false,
          category: "Dataset Gap",
          created_at: now,
          updated_at: now,
        },
      ];
    }

    if (project.id === "res_blockchain_security") {
      return [
        {
          gap_id: "gap_bc_1",
          research_id: project.id,
          title: "State Explosion in Nested Cross-Contract Delegatecalls",
          description: "Automated theorem provers successfully verify isolated smart contracts, but composability across dynamically deployed flash-loan proxies triggers unbounded SMT state space explosion.",
          supporting_papers: [
            "Automated Formal Verification of Reentrancy Invariants in Decentralized Finance Protocols",
          ],
          confidence: "High",
          verified: true,
          category: "Methodological Gap",
          created_at: now,
          updated_at: now,
        },
        {
          gap_id: "gap_bc_2",
          research_id: project.id,
          title: "Prover Memory Bottleneck on Mobile Client Wallets",
          description: "Generating zk-SNARK soundness proofs requires over 1.2GB of client-side RAM, rendering private decentralized verification infeasible on low-power mobile devices.",
          supporting_papers: [
            "Zero-Knowledge Circuit Verification for Private Decentralized Transactions",
          ],
          confidence: "High",
          verified: false,
          category: "Application Gap",
          created_at: now,
          updated_at: now,
        },
      ];
    }

    return (project.papers || []).slice(0, 2).map((p, idx) => ({
      gap_id: `gap_${Date.now()}_${idx + 1}`,
      research_id: project.id,
      title: `Generalization Bottleneck in ${p.title.slice(0, 45)}...`,
      description: `Existing studies establish preliminary feasibility under controlled datasets, leaving a critical gap in validation across unseen wild-environment conditions.`,
      supporting_papers: [p.title],
      confidence: "High",
      verified: false,
      category: "Generalization Gap",
      created_at: now,
      updated_at: now,
    }));
  }

  // ----------------------------------------------------------------
  // NOTES APIS (Strictly Isolate by researchId)
  // ----------------------------------------------------------------

  public async getNotes(researchId: string): Promise<ResearchNote[]> {
    this.initSeedsIfEmpty();
    if (typeof window === "undefined") return [];

    if (isUUID(researchId)) {
      try {
        const { data, error } = await supabase
          .from("research_notes")
          .select("*")
          .eq("project_id", researchId)
          .order("updated_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const cloudNotes: ResearchNote[] = data.map((r) => ({
            id: r.id,
            research_id: r.project_id,
            title: r.title,
            content: r.content,
            category: r.category as any,
            tags: r.tags || [],
            pinned: r.pinned,
            created_at: r.created_at,
            updated_at: r.updated_at,
          }));
          localStorage.setItem(notesKey(researchId), JSON.stringify(cloudNotes));
          return cloudNotes;
        }
      } catch (err) {
        console.warn("Supabase getNotes fallback to local:", err);
      }
    }

    try {
      const raw = localStorage.getItem(notesKey(researchId));
      if (!raw) return [];
      const notes: ResearchNote[] = JSON.parse(raw);
      return notes
        .filter((n) => n.research_id === researchId)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    } catch {
      return [];
    }
  }

  public async createNote(
    researchId: string,
    data: Omit<ResearchNote, "id" | "research_id" | "created_at" | "updated_at">
  ): Promise<ResearchNote> {
    const notes = await this.getNotes(researchId);
    const now = new Date().toISOString();
    const newNoteId = generateUUID();
    const newNote: ResearchNote = {
      ...data,
      id: newNoteId,
      research_id: researchId,
      created_at: now,
      updated_at: now,
    };

    notes.unshift(newNote);
    localStorage.setItem(notesKey(researchId), JSON.stringify(notes));

    if (isUUID(researchId)) {
      try {
        await supabase.from("research_notes").insert({
          id: newNoteId,
          project_id: researchId,
          title: newNote.title,
          content: newNote.content,
          category: newNote.category,
          tags: newNote.tags || [],
          pinned: newNote.pinned || false,
          created_at: now,
          updated_at: now,
        });
      } catch (err) {
        console.warn("Supabase note insert warning:", err);
      }
    }

    await this.addTimelineEvent(researchId, {
      event_type: "note_created",
      title: "Note Created",
      description: `Created note: "${newNote.title}"`,
    });

    return newNote;
  }

  public async updateNote(
    researchId: string,
    noteId: string,
    updates: Partial<ResearchNote>
  ): Promise<void> {
    const notes = await this.getNotes(researchId);
    const idx = notes.findIndex((n) => n.id === noteId && n.research_id === researchId);
    if (idx === -1) return;

    notes[idx] = {
      ...notes[idx],
      ...updates,
      id: noteId,
      research_id: researchId,
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(notesKey(researchId), JSON.stringify(notes));

    if (isUUID(noteId) && isUUID(researchId)) {
      try {
        await supabase.from("research_notes").update({
          title: notes[idx].title,
          content: notes[idx].content,
          category: notes[idx].category,
          tags: notes[idx].tags,
          pinned: notes[idx].pinned,
          updated_at: notes[idx].updated_at,
        }).eq("id", noteId);
      } catch (err) {
        console.warn("Supabase note update warning:", err);
      }
    }

    await this.addTimelineEvent(researchId, {
      event_type: "note_updated",
      title: "Note Updated",
      description: `Updated note: "${notes[idx].title}"`,
    });
  }

  public async deleteNote(researchId: string, noteId: string): Promise<void> {
    const notes = await this.getNotes(researchId);
    const filtered = notes.filter((n) => n.id !== noteId || n.research_id !== researchId);
    localStorage.setItem(notesKey(researchId), JSON.stringify(filtered));

    if (isUUID(noteId)) {
      try {
        await supabase.from("research_notes").delete().eq("id", noteId);
      } catch (err) {
        console.warn("Supabase note delete warning:", err);
      }
    }
  }

  // ----------------------------------------------------------------
  // FINDINGS APIS
  // ----------------------------------------------------------------

  public async getFindings(researchId: string): Promise<ResearchFinding[]> {
    this.initSeedsIfEmpty();
    if (typeof window === "undefined") return [];

    if (isUUID(researchId)) {
      try {
        const { data, error } = await supabase
          .from("research_findings")
          .select("*")
          .eq("project_id", researchId)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const cloudFindings: ResearchFinding[] = data.map((f) => ({
            id: f.id,
            research_id: f.project_id,
            title: f.title,
            type: f.type as any,
            description: f.description,
            evidence: f.evidence || undefined,
            supporting_papers: f.supporting_papers || [],
            novelty: f.novelty || undefined,
            feasibility: f.feasibility || undefined,
            confidence: f.confidence || undefined,
            metrics: (f.metrics as any) || undefined,
            created_at: f.created_at,
          }));
          localStorage.setItem(findingsKey(researchId), JSON.stringify(cloudFindings));
          return cloudFindings;
        }
      } catch (err) {
        console.warn("Supabase getFindings fallback to local:", err);
      }
    }

    try {
      const raw = localStorage.getItem(findingsKey(researchId));
      if (!raw) return [];
      const findings: ResearchFinding[] = JSON.parse(raw);
      return findings
        .filter((f) => f.research_id === researchId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch {
      return [];
    }
  }

  public async createFinding(
    researchId: string,
    data: Omit<ResearchFinding, "id" | "research_id" | "created_at">
  ): Promise<ResearchFinding> {
    const findings = await this.getFindings(researchId);
    const newFindingId = generateUUID();
    const newFinding: ResearchFinding = {
      ...data,
      id: newFindingId,
      research_id: researchId,
      created_at: new Date().toISOString(),
    };

    findings.unshift(newFinding);
    localStorage.setItem(findingsKey(researchId), JSON.stringify(findings));

    if (isUUID(researchId)) {
      try {
        await supabase.from("research_findings").insert({
          id: newFindingId,
          project_id: researchId,
          title: newFinding.title,
          type: newFinding.type,
          description: newFinding.description,
          evidence: newFinding.evidence || null,
          supporting_papers: newFinding.supporting_papers || [],
          novelty: newFinding.novelty || null,
          feasibility: newFinding.feasibility || null,
          confidence: newFinding.confidence || null,
          metrics: (newFinding.metrics as any) || {},
          created_at: newFinding.created_at,
        });
      } catch (err) {
        console.warn("Supabase finding insert warning:", err);
      }
    }

    await this.addTimelineEvent(researchId, {
      event_type: "finding_added",
      title: "Key Finding Recorded",
      description: `Documented ${newFinding.type}: "${newFinding.title}"`,
    });

    return newFinding;
  }

  public async deleteFinding(researchId: string, findingId: string): Promise<void> {
    const findings = await this.getFindings(researchId);
    const filtered = findings.filter((f) => f.id !== findingId || f.research_id !== researchId);
    localStorage.setItem(findingsKey(researchId), JSON.stringify(filtered));

    if (isUUID(findingId)) {
      try {
        await supabase.from("research_findings").delete().eq("id", findingId);
      } catch (err) {
        console.warn("Supabase finding delete warning:", err);
      }
    }
  }

  // ----------------------------------------------------------------
  // TASKS APIS
  // ----------------------------------------------------------------

  public async getTasks(researchId: string): Promise<ResearchTask[]> {
    this.initSeedsIfEmpty();
    if (typeof window === "undefined") return [];

    if (isUUID(researchId)) {
      try {
        const { data, error } = await supabase
          .from("research_tasks")
          .select("*")
          .eq("project_id", researchId)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const cloudTasks: ResearchTask[] = data.map((t) => ({
            id: t.id,
            research_id: t.project_id,
            title: t.title,
            description: t.description || undefined,
            status: t.status as any,
            priority: t.priority as any,
            due_date: t.due_date || undefined,
            completed_at: t.completed_at || undefined,
            created_at: t.created_at,
          }));
          localStorage.setItem(tasksKey(researchId), JSON.stringify(cloudTasks));
          return cloudTasks;
        }
      } catch (err) {
        console.warn("Supabase getTasks fallback to local:", err);
      }
    }

    try {
      const raw = localStorage.getItem(tasksKey(researchId));
      if (!raw) return [];
      const tasks: ResearchTask[] = JSON.parse(raw);
      return tasks
        .filter((t) => t.research_id === researchId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch {
      return [];
    }
  }

  public async createTask(
    researchId: string,
    data: Omit<ResearchTask, "id" | "research_id" | "created_at">
  ): Promise<ResearchTask> {
    const tasks = await this.getTasks(researchId);
    const newTaskId = generateUUID();
    const newTask: ResearchTask = {
      ...data,
      id: newTaskId,
      research_id: researchId,
      created_at: new Date().toISOString(),
    };

    tasks.unshift(newTask);
    localStorage.setItem(tasksKey(researchId), JSON.stringify(tasks));

    if (isUUID(researchId)) {
      try {
        await supabase.from("research_tasks").insert({
          id: newTaskId,
          project_id: researchId,
          title: newTask.title,
          description: newTask.description || null,
          status: newTask.status,
          priority: newTask.priority,
          due_date: newTask.due_date || null,
          completed_at: newTask.completed_at || null,
          created_at: newTask.created_at,
        });
      } catch (err) {
        console.warn("Supabase task insert warning:", err);
      }
    }

    await this.addTimelineEvent(researchId, {
      event_type: "task_created",
      title: "Research Task Created",
      description: `Added task: "${newTask.title}"`,
    });

    // Update project progress
    const project = await this.getProjectById(researchId);
    if (project) {
      const completed = tasks.filter((t) => t.status === "completed").length;
      project.progress = Math.round((completed / tasks.length) * 100);
      await this.saveProject(project);
    }

    return newTask;
  }

  public async updateTask(
    researchId: string,
    taskId: string,
    updates: Partial<ResearchTask>
  ): Promise<void> {
    const tasks = await this.getTasks(researchId);
    const idx = tasks.findIndex((t) => t.id === taskId && t.research_id === researchId);
    if (idx === -1) return;

    const wasCompleted = tasks[idx].status === "completed";
    const isNowCompleted = updates.status === "completed";

    tasks[idx] = {
      ...tasks[idx],
      ...updates,
      id: taskId,
      research_id: researchId,
      completed_at: isNowCompleted ? new Date().toISOString() : undefined,
    };

    localStorage.setItem(tasksKey(researchId), JSON.stringify(tasks));

    if (isUUID(taskId) && isUUID(researchId)) {
      try {
        await supabase.from("research_tasks").update({
          title: tasks[idx].title,
          description: tasks[idx].description || null,
          status: tasks[idx].status,
          priority: tasks[idx].priority,
          due_date: tasks[idx].due_date || null,
          completed_at: tasks[idx].completed_at || null,
        }).eq("id", taskId);
      } catch (err) {
        console.warn("Supabase task update warning:", err);
      }
    }

    if (!wasCompleted && isNowCompleted) {
      await this.addTimelineEvent(researchId, {
        event_type: "task_completed",
        title: "Task Completed",
        description: `Completed task: "${tasks[idx].title}"`,
      });
    }

    // Recalculate progress on project
    const project = await this.getProjectById(researchId);
    if (project) {
      const completed = tasks.filter((t) => t.status === "completed").length;
      project.progress = Math.round((completed / tasks.length) * 100);
      await this.saveProject(project);
    }
  }

  public async deleteTask(researchId: string, taskId: string): Promise<void> {
    const tasks = await this.getTasks(researchId);
    const filtered = tasks.filter((t) => t.id !== taskId || t.research_id !== researchId);
    localStorage.setItem(tasksKey(researchId), JSON.stringify(filtered));

    if (isUUID(taskId)) {
      try {
        await supabase.from("research_tasks").delete().eq("id", taskId);
      } catch (err) {
        console.warn("Supabase task delete warning:", err);
      }
    }

    // Recalculate progress
    const project = await this.getProjectById(researchId);
    if (project && filtered.length > 0) {
      const completed = filtered.filter((t) => t.status === "completed").length;
      project.progress = Math.round((completed / filtered.length) * 100);
      await this.saveProject(project);
    }
  }

  // ----------------------------------------------------------------
  // TIMELINE APIS
  // ----------------------------------------------------------------

  public async getTimeline(researchId: string): Promise<ResearchTimelineEvent[]> {
    this.initSeedsIfEmpty();
    if (typeof window === "undefined") return [];

    if (isUUID(researchId)) {
      try {
        const { data, error } = await supabase
          .from("research_timeline")
          .select("*")
          .eq("project_id", researchId)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const cloudTimeline: ResearchTimelineEvent[] = data.map((t) => ({
            id: t.id,
            research_id: t.project_id,
            event_type: t.event_type as any,
            title: t.title,
            description: t.description,
            timestamp: t.created_at,
          }));
          localStorage.setItem(timelineKey(researchId), JSON.stringify(cloudTimeline));
          return cloudTimeline;
        }
      } catch (err) {
        console.warn("Supabase getTimeline fallback to local:", err);
      }
    }

    try {
      const raw = localStorage.getItem(timelineKey(researchId));
      if (!raw) return [];
      const events: ResearchTimelineEvent[] = JSON.parse(raw);
      return events
        .filter((e) => e.research_id === researchId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch {
      return [];
    }
  }

  public async addTimelineEvent(
    researchId: string,
    event: Omit<ResearchTimelineEvent, "id" | "research_id" | "timestamp">
  ): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      const events = await this.getTimeline(researchId);
      const newEventId = generateUUID();
      const newEvent: ResearchTimelineEvent = {
        ...event,
        id: newEventId,
        research_id: researchId,
        timestamp: new Date().toISOString(),
      };
      events.unshift(newEvent);
      // Keep last 100 events
      localStorage.setItem(timelineKey(researchId), JSON.stringify(events.slice(0, 100)));

      if (isUUID(researchId)) {
        await supabase.from("research_timeline").insert({
          id: newEventId,
          project_id: researchId,
          event_type: newEvent.event_type,
          title: newEvent.title,
          description: newEvent.description,
          created_at: newEvent.timestamp,
        });
      }
    } catch (e) {
      console.warn("Timeline record warning:", e);
    }
  }

  // ----------------------------------------------------------------
  // CHAT HISTORY APIS (Strictly Isolate by researchId)
  // ----------------------------------------------------------------

  public async getChatHistory(researchId: string): Promise<ResearchChatMessage[]> {
    this.initSeedsIfEmpty();
    if (typeof window === "undefined") return [];

    if (isUUID(researchId)) {
      try {
        const { data, error } = await supabase
          .from("research_chats")
          .select("*")
          .eq("project_id", researchId)
          .order("created_at", { ascending: true });

        if (!error && data && data.length > 0) {
          const cloudChats: ResearchChatMessage[] = data.map((c) => ({
            id: c.id,
            research_id: c.project_id,
            role: c.role as any,
            content: c.content,
            timestamp: new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }));
          localStorage.setItem(chatsKey(researchId), JSON.stringify(cloudChats));
          return cloudChats;
        }
      } catch (err) {
        console.warn("Supabase getChatHistory fallback to local:", err);
      }
    }

    try {
      const raw = localStorage.getItem(chatsKey(researchId));
      if (!raw) return [];
      const messages: ResearchChatMessage[] = JSON.parse(raw);
      return messages.filter((m) => m.research_id === researchId);
    } catch {
      return [];
    }
  }

  public async addChatMessage(
    researchId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<ResearchChatMessage> {
    const messages = await this.getChatHistory(researchId);
    const newChatId = generateUUID();
    const newMsg: ResearchChatMessage = {
      id: newChatId,
      research_id: researchId,
      role,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    messages.push(newMsg);
    localStorage.setItem(chatsKey(researchId), JSON.stringify(messages));

    if (isUUID(researchId)) {
      try {
        await supabase.from("research_chats").insert({
          id: newChatId,
          project_id: researchId,
          role: newMsg.role,
          content: newMsg.content,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Supabase chat insert warning:", err);
      }
    }

    if (role === "user") {
      await this.addTimelineEvent(researchId, {
        event_type: "ai_chat",
        title: "AI Inquiry Submitted",
        description: `Consulted research co-pilot: "${content.slice(0, 50)}..."`,
      });
    }

    return newMsg;
  }

  public async clearChatHistory(researchId: string): Promise<void> {
    localStorage.removeItem(chatsKey(researchId));
    if (isUUID(researchId)) {
      try {
        await supabase.from("research_chats").delete().eq("project_id", researchId);
      } catch (err) {
        console.warn("Supabase clear chats warning:", err);
      }
    }
  }

  // ----------------------------------------------------------------
  // REFERENCES & CITATIONS APIS
  // ----------------------------------------------------------------

  public async getReferences(researchId: string): Promise<ResearchReference[]> {
    const papers = await this.getPapers(researchId);
    return papers.map((p) => {
      const citations = generateCitations(p);
      return {
        id: `ref_${p.id}`,
        research_id: researchId,
        paper_id: p.id,
        title: p.title,
        authors: p.authors,
        year: p.year || new Date().getFullYear(),
        venue: p.venue,
        doi: p.doi,
        url: p.url,
        citations,
      };
    });
  }

  // ----------------------------------------------------------------
  // FINAL RESEARCH OUTPUT & VERSION HISTORY APIS (Strictly Isolate by researchId)
  // ----------------------------------------------------------------

  public async getFinalDocuments(researchId: string): Promise<FinalResearchDocument[]> {
    this.initSeedsIfEmpty();
    if (typeof window === "undefined") return [];

    try {
      const raw = localStorage.getItem(finalDocsKey(researchId));
      if (!raw) return [];
      const docs: FinalResearchDocument[] = JSON.parse(raw);
      return docs.filter((d) => d.research_id === researchId);
    } catch {
      return [];
    }
  }

  public async getLatestFinalDocument(
    researchId: string,
    mode: FinalOutputType = "paper"
  ): Promise<FinalResearchDocument | null> {
    const docs = await this.getFinalDocuments(researchId);
    const matching = docs
      .filter((d) => d.mode === mode)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return matching[0] || null;
  }

  public async saveFinalDocument(
    researchId: string,
    doc: FinalResearchDocument
  ): Promise<FinalResearchDocument> {
    const docs = await this.getFinalDocuments(researchId);
    const existingIdx = docs.findIndex((d) => d.id === doc.id);

    const updatedDoc: FinalResearchDocument = {
      ...doc,
      research_id: researchId,
      updated_at: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      docs[existingIdx] = updatedDoc;
    } else {
      docs.unshift(updatedDoc);
    }

    localStorage.setItem(finalDocsKey(researchId), JSON.stringify(docs));

    await this.addTimelineEvent(researchId, {
      event_type: "analysis_performed",
      title: `Final Output Updated: ${doc.mode === "patent" ? "Patent Draft" : "Manuscript"}`,
      description: `Saved version ${doc.version} of "${doc.title.slice(0, 50)}..."`,
    });

    return updatedDoc;
  }

  public async createDocumentVersion(
    researchId: string,
    doc: FinalResearchDocument,
    changelog: string = "Snapshot milestone"
  ): Promise<FinalResearchDocument> {
    const versions = await this.getDocumentVersions(researchId, doc.id);
    const nextVersionNum = (versions[0]?.version || doc.version || 1) + 1;

    const versionSnapshot: FinalResearchDocument = {
      ...doc,
      id: `fdoc_v${nextVersionNum}_${Date.now()}`,
      research_id: researchId,
      version: nextVersionNum,
      changelog,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to version log
    versions.unshift(versionSnapshot);
    localStorage.setItem(finalVersionsKey(researchId), JSON.stringify(versions));

    // Also update main active document
    const updatedActive: FinalResearchDocument = {
      ...doc,
      version: nextVersionNum,
      changelog,
      updated_at: new Date().toISOString(),
    };
    await this.saveFinalDocument(researchId, updatedActive);

    await this.addTimelineEvent(researchId, {
      event_type: "status_changed",
      title: `Document Version ${nextVersionNum} Finalized`,
      description: `Archived milestone version ${nextVersionNum} with changelog: "${changelog}"`,
    });

    return updatedActive;
  }

  public async getDocumentVersions(
    researchId: string,
    docId?: string
  ): Promise<FinalResearchDocument[]> {
    this.initSeedsIfEmpty();
    if (typeof window === "undefined") return [];

    try {
      const raw = localStorage.getItem(finalVersionsKey(researchId));
      if (!raw) return [];
      const versions: FinalResearchDocument[] = JSON.parse(raw);
      return versions
        .filter((v) => v.research_id === researchId && (!docId || v.id.startsWith("fdoc_") || v.mode === docId))
        .sort((a, b) => b.version - a.version);
    } catch {
      return [];
    }
  }

  public async restoreDocumentVersion(
    researchId: string,
    versionId: string
  ): Promise<FinalResearchDocument> {
    const versions = await this.getDocumentVersions(researchId);
    const target = versions.find((v) => v.id === versionId);
    if (!target) {
      throw new Error(`Version ${versionId} not found`);
    }

    const restoredDoc: FinalResearchDocument = {
      ...target,
      id: `fdoc_${target.mode}_${researchId}`,
      changelog: `Restored from Version ${target.version}`,
      updated_at: new Date().toISOString(),
    };

    await this.saveFinalDocument(researchId, restoredDoc);

    await this.addTimelineEvent(researchId, {
      event_type: "status_changed",
      title: `Document Restored to Version ${target.version}`,
      description: `Active draft restored from archived snapshot Version ${target.version}`,
    });

    return restoredDoc;
  }

  // ----------------------------------------------------------------
  // RESEARCH COMPLETENESS AUDIT ENGINE (Strict Scoped Calculation)
  // ----------------------------------------------------------------

  public async calculateCompleteness(
    researchId: string,
    doc?: FinalResearchDocument | null
  ): Promise<ResearchCompletenessCheck> {
    const project = await this.getProjectById(researchId);
    const notes = await this.getNotes(researchId);
    const findings = await this.getFindings(researchId);
    const tasks = await this.getTasks(researchId);
    const papers = await this.getPapers(researchId);

    const items: CompletenessCheckItem[] = [];
    const missingEvidence: string[] = [];
    const unresolvedContradictions: string[] = [];

    // 1. Abstract & Scope
    const hasDocAbstract = !!doc?.sections?.abstract && doc.sections.abstract.length > 50;
    const hasProjectObjective = !!project?.objective && project.objective.length > 20;
    if (hasDocAbstract || hasProjectObjective) {
      items.push({
        id: "chk_abstract",
        label: "Abstract & Problem Statement",
        status: hasDocAbstract ? "complete" : "in_progress",
        description: hasDocAbstract
          ? "Formulated clear problem, methodology, and outcome abstract."
          : "Initial objectives documented; manuscript abstract draft recommended.",
      });
    } else {
      items.push({
        id: "chk_abstract",
        label: "Abstract & Problem Statement",
        status: "missing",
        description: "No formal abstract or objective drafted.",
        recommendation: "Use the AI Writing Assistant to generate an evidence-linked abstract.",
      });
      missingEvidence.push("Abstract and core problem formulation");
    }

    // 2. Research Gap Identified
    const gapFindings = findings.filter((f) => f.type === "gap");
    const hasDocGap = !!doc?.sections?.research_gap && doc.sections.research_gap.length > 30;
    const hasProjectGaps = (project?.gaps?.length || 0) > 0 || gapFindings.length > 0;
    if (hasDocGap || hasProjectGaps) {
      items.push({
        id: "chk_gap",
        label: "Research Gap Identified",
        status: "complete",
        description: `Identified ${gapFindings.length} research gap(s) differentiating this work from baseline literature.`,
      });
    } else {
      items.push({
        id: "chk_gap",
        label: "Research Gap Identified",
        status: "missing",
        description: "No explicit scientific literature gap recorded.",
        recommendation: "Record literature gaps under the Findings tab or generate via AI Assistant.",
      });
      missingEvidence.push("Specific research gap justification");
    }

    // 3. Objectives Defined
    const hasObjectives = !!project?.objective || !!doc?.sections?.objectives;
    items.push({
      id: "chk_objectives",
      label: "Research Objectives Defined",
      status: hasObjectives ? "complete" : "missing",
      description: hasObjectives
        ? "Explicit research aim and hypothesis target formalised."
        : "Project objectives are missing.",
      recommendation: hasObjectives ? undefined : "Define specific objectives under the Overview tab.",
    });
    if (!hasObjectives) missingEvidence.push("Formal research objectives");

    // 4. Methodology Documented
    const methodologyNotes = notes.filter((n) => n.category === "methodology");
    const hasDocMethodology = !!doc?.sections?.methodology && doc.sections.methodology.length > 50;
    const hasExperiment = !!project?.experiment || methodologyNotes.length > 0;
    if (hasDocMethodology || hasExperiment) {
      items.push({
        id: "chk_methodology",
        label: "Methodology & Architecture Documented",
        status: "complete",
        description: "Technical pipeline, architecture, and evaluation metrics specified.",
      });
    } else {
      items.push({
        id: "chk_methodology",
        label: "Methodology & Architecture Documented",
        status: "missing",
        description: "No methodology notes or architectural specifications found.",
        recommendation: "Document your pipeline or experimental protocol.",
      });
      missingEvidence.push("Detailed methodology workflow");
    }

    // 5. Results & Empirical Findings Available
    const empiricalFindings = findings.filter((f) => f.type === "finding" || f.type === "statistic");
    const hasDocResults = !!doc?.sections?.results && doc.sections.results.length > 50;
    if (hasDocResults || empiricalFindings.length > 0) {
      items.push({
        id: "chk_results",
        label: "Results & Quantitative Findings",
        status: empiricalFindings.length >= 2 || hasDocResults ? "complete" : "in_progress",
        description: `Recorded ${empiricalFindings.length} empirical metric(s) or benchmark findings.`,
      });
    } else {
      items.push({
        id: "chk_results",
        label: "Results & Quantitative Findings",
        status: "missing",
        description: "No quantitative results or benchmark metrics found.",
        recommendation: "Record experimental results under the Findings tab.",
      });
      missingEvidence.push("Empirical results or benchmark numbers");
    }

    // 6. Literature References Included
    if (papers.length >= 3) {
      items.push({
        id: "chk_references",
        label: "Literature References Compiled",
        status: "complete",
        description: `${papers.length} scholarly papers indexed in research corpus.`,
      });
    } else if (papers.length > 0) {
      items.push({
        id: "chk_references",
        label: "Literature References Compiled",
        status: "in_progress",
        description: `${papers.length} paper(s) indexed. Consider indexing at least 3-5 papers.`,
        recommendation: "Search and save additional peer-reviewed papers in the Papers tab.",
      });
    } else {
      items.push({
        id: "chk_references",
        label: "Literature References Compiled",
        status: "missing",
        description: "Zero literature papers collected.",
        recommendation: "Add literature papers to ground citations.",
      });
      missingEvidence.push("Peer-reviewed literature references");
    }

    // 7. Citations & DOIs Verified
    const papersWithDoi = papers.filter((p) => !!p.doi);
    const citationRatio = papers.length > 0 ? papersWithDoi.length / papers.length : 0;
    if (citationRatio >= 0.7 && papers.length > 0) {
      items.push({
        id: "chk_citations",
        label: "Citations & DOIs Verified",
        status: "complete",
        description: `${papersWithDoi.length} of ${papers.length} citations verified with persistent identifiers (DOIs).`,
      });
    } else {
      items.push({
        id: "chk_citations",
        label: "Citations & DOIs Verified",
        status: papers.length > 0 ? "in_progress" : "missing",
        description: "Some references lack registered DOIs or publication venues.",
        recommendation: "Verify references in the References tab.",
      });
    }

    // 8. Missing Evidence Checks in Active Document
    if (doc) {
      Object.entries(doc.sections).forEach(([secKey, secContent]) => {
        if (secContent.includes("[Additional empirical evidence required")) {
          missingEvidence.push(`Unresolved evidence in section: ${secKey.replace("_", " ")}`);
        }
      });
    }

    // 9. Potential Contradictions Check
    if (project?.contradictions && project.contradictions.length > 0) {
      unresolvedContradictions.push(...project.contradictions.map((c) => c.topic));
      items.push({
        id: "chk_contradictions",
        label: "Literature Contradictions",
        status: "in_progress",
        description: `${project.contradictions.length} potential literature contradiction(s) flagged for discussion.`,
        recommendation: "Discuss these conflicting findings in the Discussion / Analysis section.",
      });
    } else {
      items.push({
        id: "chk_contradictions",
        label: "Literature Contradictions Checked",
        status: "complete",
        description: "No unresolved conflicting literature evidence detected.",
      });
    }

    // 10. Research Milestones & Tasks Progress
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 60;
    items.push({
      id: "chk_tasks",
      label: "Research Milestones Executed",
      status: taskProgress >= 75 ? "complete" : taskProgress >= 30 ? "in_progress" : "missing",
      description: tasks.length > 0
        ? `${completedTasks}/${tasks.length} tasks completed (${taskProgress}%).`
        : "No formal research tasks logged.",
    });

    // Score Calculation
    let score = 0;
    items.forEach((item) => {
      if (item.status === "complete") score += 10;
      else if (item.status === "in_progress") score += 5;
    });

    // Penalize for missing evidence markers in text
    if (missingEvidence.length > 0) {
      score = Math.max(20, score - missingEvidence.length * 3);
    }

    const overallPercentage = Math.min(100, Math.max(15, Math.round(score)));

    return {
      overall_percentage: overallPercentage,
      items,
      missing_evidence: missingEvidence,
      contradictions_unresolved: unresolvedContradictions,
      is_ready_for_finalization: overallPercentage >= 70,
    };
  }

  // ----------------------------------------------------------------
  // ISOLATED AI QUERY DISPATCHER
  // ----------------------------------------------------------------
  public async queryIsolatedAI(
    researchId: string,
    query: string,
    contextPrompt?: string
  ): Promise<string> {
    const project = await this.getProject(researchId);
    if (!project) return "Research project context not found.";

    try {
      const apiKey =
        (typeof window !== "undefined"
          ? localStorage.getItem("GEMINI_API_KEY") ||
            localStorage.getItem("gemini_api_key")
          : "") || "";

      if (apiKey) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are an expert scientific researcher. Answer the query grounded STRICTLY on the research project context provided. Do not hallucinate external details outside of this research context.\n\nContext:\n${
                        contextPrompt || `Project: ${project.title}`
                      }\n\nQuery: ${query}`,
                    },
                  ],
                },
              ],
            }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate) return candidate;
        }
      }
    } catch {
      // Fallback below
    }

    return `Based strictly on the indexed evidence and findings for "${project.title}":\n\n- The literature in this research corpus establishes benchmark methodologies and domain-specific baselines.\n- In relation to your query ("${query}"), our current evidence matrix and findings emphasize addressing key methodological and dataset constraints without extrapolating unverified claims.\n- Further experimentation and empirical validation in this research scope will clarify these parameters.`;
  }

  // ----------------------------------------------------------------
  // WORKFLOW STAGE COMPLETIONS (Completion-based status per Research ID)
  // ----------------------------------------------------------------

  public async getStageCompletions(researchId: string): Promise<Record<string, boolean>> {
    this.initSeedsIfEmpty();
    if (typeof window === "undefined") return {};

    try {
      const raw = localStorage.getItem(stageCompletionsKey(researchId));
      if (raw) {
        return JSON.parse(raw);
      }
      const project = await this.getProject(researchId);
      if (project?.stage_completions) {
        return project.stage_completions;
      }
      return {};
    } catch {
      return {};
    }
  }

  public async setStageCompletion(
    researchId: string,
    stageId: string,
    completed: boolean
  ): Promise<Record<string, boolean>> {
    const completions = await this.getStageCompletions(researchId);
    if (completed) {
      completions[stageId] = true;
    } else {
      delete completions[stageId];
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(stageCompletionsKey(researchId), JSON.stringify(completions));
    }

    // Recalculate progress: 7 stages total
    const stages = ["overview", "papers", "comparison", "hypotheses", "notes", "findings", "final_output"];
    const completedCount = stages.filter((s) => completions[s]).length;
    const progress = Math.round((completedCount / stages.length) * 100);

    await this.updateProject(researchId, {
      progress,
      stage_completions: completions,
    });

    await this.addTimelineEvent(researchId, {
      event_type: completed ? "task_completed" : "stage_updated" as any,
      title: completed ? `Stage Completed: ${stageId}` : `Stage Reopened: ${stageId}`,
      description: completed
        ? `Marked research workflow stage "${stageId}" as completed.`
        : `Marked research workflow stage "${stageId}" as in-progress.`,
    });

    return completions;
  }
}

export const workspaceService = new WorkspaceService();
