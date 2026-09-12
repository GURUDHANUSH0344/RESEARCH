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
} from "@/types/research";
import { type NormalizedPaper } from "./openalex";
import { generateCitations } from "./citation-formatter";
import { supabase } from "@/integrations/supabase/client";

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

  private initSeedsIfEmpty() {
    if (this.initialized) return;
    if (typeof window === "undefined") return;

    try {
      const existing = localStorage.getItem(KEY_PROJECTS_INDEX);
      if (!existing || JSON.parse(existing).length === 0) {
        // Seed the 3 projects
        this.saveProjectSync(SEED_HEALTHCARE);
        this.seedHealthcareSubEntities();

        this.saveProjectSync(SEED_CLIMATE);
        this.seedClimateSubEntities();

        this.saveProjectSync(SEED_BLOCKCHAIN);
        this.seedBlockchainSubEntities();

        const index = [
          this.summarizeProject(SEED_HEALTHCARE),
          this.summarizeProject(SEED_CLIMATE),
          this.summarizeProject(SEED_BLOCKCHAIN),
        ];
        localStorage.setItem(KEY_PROJECTS_INDEX, JSON.stringify(index));
      }
    } catch (e) {
      console.warn("Failed to initialize seed research projects:", e);
    }
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
    this.initSeedsIfEmpty();
    if (typeof window === "undefined") {
      return [SEED_HEALTHCARE, SEED_CLIMATE, SEED_BLOCKCHAIN];
    }

    try {
      const indexStr = localStorage.getItem(KEY_PROJECTS_INDEX);
      if (!indexStr) return [SEED_HEALTHCARE, SEED_CLIMATE, SEED_BLOCKCHAIN];
      const summaries: Partial<ResearchProject>[] = JSON.parse(indexStr);

      // Load full project data for each
      const projects: ResearchProject[] = [];
      for (const s of summaries) {
        if (!s.id) continue;
        const p = await this.getProjectById(s.id);
        if (p) {
          // If userId filter is provided, enforce user isolation
          if (userId && p.user_id && p.user_id !== userId) continue;
          projects.push(p);
        }
      }

      // Sort by updated_at desc
      return projects.sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    } catch (e) {
      console.error("Error retrieving research projects:", e);
      return [SEED_HEALTHCARE, SEED_CLIMATE, SEED_BLOCKCHAIN];
    }
  }

  public async getProjectById(researchId: string): Promise<ResearchProject | null> {
    this.initSeedsIfEmpty();
    if (typeof window === "undefined") {
      if (researchId === SEED_HEALTHCARE.id) return SEED_HEALTHCARE;
      if (researchId === SEED_CLIMATE.id) return SEED_CLIMATE;
      if (researchId === SEED_BLOCKCHAIN.id) return SEED_BLOCKCHAIN;
      return null;
    }

    try {
      const raw = localStorage.getItem(projectDataKey(researchId));
      if (!raw) return null;
      const project: ResearchProject = JSON.parse(raw);

      // Dynamically compute progress based on tasks
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

    // Background sync to Supabase if authenticated
    if (project.user_id) {
      try {
        await supabase.from("research_projects").upsert({
          id: project.id.startsWith("res_") ? undefined : project.id,
          user_id: project.user_id,
          title: project.title,
          research_question: project.research_question,
          research_field: project.research_field,
          objective: project.objective,
          status: project.status,
          updated_at: project.updated_at,
        });
      } catch (err) {
        console.warn("Supabase project sync warning:", err);
      }
    }
  }

  public async createProject(data: Partial<ResearchProject>): Promise<ResearchProject> {
    const researchId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newProject: ResearchProject = {
      id: researchId,
      title: data.title?.trim() || "Untitled Research Investigation",
      research_question: data.research_question?.trim() || "Unspecified inquiry",
      objective: data.objective?.trim() || "Investigate the primary research question.",
      description: data.description?.trim() || "Autonomous scientific research inquiry.",
      research_field: data.research_field?.trim() || "Scientific Inquiry",
      status: data.status || "active",
      progress: 0,
      paper_limit: data.paper_limit || 12,
      user_id: data.user_id,
      created_at: now,
      updated_at: now,
      papers: data.papers || [],
      gaps: data.gaps || [],
      hypotheses: data.hypotheses || [],
      comparison: data.comparison || null,
      experiment: data.experiment || null,
      report: data.report || null,
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
      id: existing.id, // Immutable ID
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

    // Update index
    const indexStr = localStorage.getItem(KEY_PROJECTS_INDEX);
    if (indexStr) {
      const index: Partial<ResearchProject>[] = JSON.parse(indexStr);
      const filtered = index.filter((p) => p.id !== researchId);
      localStorage.setItem(KEY_PROJECTS_INDEX, JSON.stringify(filtered));
    }

    // Also delete from Supabase if online
    try {
      await supabase.from("research_projects").delete().eq("id", researchId);
    } catch (e) {
      console.warn("Supabase project deletion warning:", e);
    }
  }

  /**
   * DUPLICATION: Creates a new Research ID and clones all associated data
   */
  public async duplicateProject(originalId: string): Promise<ResearchProject> {
    const original = await this.getProjectById(originalId);
    if (!original) throw new Error("Original project not found");

    const newResearchId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const duplicatedProject: ResearchProject = {
      ...original,
      id: newResearchId,
      title: `Copy of ${original.title}`,
      created_at: now,
      updated_at: now,
      status: "active",
      progress: 0,
    };

    await this.saveProject(duplicatedProject);

    // Duplicate Notes
    const originalNotes = await this.getNotes(originalId);
    const duplicatedNotes: ResearchNote[] = originalNotes.map((n, idx) => ({
      ...n,
      id: `note_copy_${Date.now()}_${idx}`,
      research_id: newResearchId,
      created_at: now,
      updated_at: now,
    }));
    localStorage.setItem(notesKey(newResearchId), JSON.stringify(duplicatedNotes));

    // Duplicate Tasks
    const originalTasks = await this.getTasks(originalId);
    const duplicatedTasks: ResearchTask[] = originalTasks.map((t, idx) => ({
      ...t,
      id: `task_copy_${Date.now()}_${idx}`,
      research_id: newResearchId,
      status: "pending",
      completed_at: undefined,
      created_at: now,
    }));
    localStorage.setItem(tasksKey(newResearchId), JSON.stringify(duplicatedTasks));

    // Duplicate Findings
    const originalFindings = await this.getFindings(originalId);
    const duplicatedFindings: ResearchFinding[] = originalFindings.map((f, idx) => ({
      ...f,
      id: `find_copy_${Date.now()}_${idx}`,
      research_id: newResearchId,
      created_at: now,
    }));
    localStorage.setItem(findingsKey(newResearchId), JSON.stringify(duplicatedFindings));

    // Create Initial Timeline Event
    const initialTimeline: ResearchTimelineEvent[] = [
      {
        id: `tl_dup_${Date.now()}`,
        research_id: newResearchId,
        event_type: "research_created",
        title: "Duplicated from Existing Research",
        description: `Cloned from "${original.title}" (Original ID: ${originalId}) with all papers, notes, and findings.`,
        timestamp: now,
      },
    ];
    localStorage.setItem(timelineKey(newResearchId), JSON.stringify(initialTimeline));

    // Initial Chat Message
    const initialChat: ResearchChatMessage[] = [
      {
        id: `chat_init_${Date.now()}`,
        research_id: newResearchId,
        role: "assistant",
        content: `This research was duplicated from "${original.title}". All papers and notes have been cloned under this new isolated Research ID (${newResearchId}).`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    localStorage.setItem(chatsKey(newResearchId), JSON.stringify(initialChat));

    return duplicatedProject;
  }

  // ----------------------------------------------------------------
  // PAPERS APIS
  // ----------------------------------------------------------------

  public async getPapers(researchId: string): Promise<NormalizedPaper[]> {
    const project = await this.getProjectById(researchId);
    return project?.papers || [];
  }

  public async addPaper(researchId: string, paper: NormalizedPaper): Promise<void> {
    const project = await this.getProjectById(researchId);
    if (!project) return;

    const exists = project.papers.some((p) => p.id === paper.id || (p.doi && p.doi === paper.doi));
    if (exists) return;

    project.papers.unshift(paper);
    await this.saveProject(project);

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

    if (removed) {
      await this.addTimelineEvent(researchId, {
        event_type: "paper_removed",
        title: "Paper Removed from Literature",
        description: `Removed "${removed.title.slice(0, 60)}..."`,
      });
    }
  }

  // ----------------------------------------------------------------
  // NOTES APIS (Strictly Isolate by researchId)
  // ----------------------------------------------------------------

  public async getNotes(researchId: string): Promise<ResearchNote[]> {
    this.initSeedsIfEmpty();
    if (typeof window === "undefined") return [];

    try {
      const raw = localStorage.getItem(notesKey(researchId));
      if (!raw) return [];
      const notes: ResearchNote[] = JSON.parse(raw);
      // Guarantee only notes matching current researchId are returned
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
    const newNote: ResearchNote = {
      ...data,
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      research_id: researchId,
      created_at: now,
      updated_at: now,
    };

    notes.unshift(newNote);
    localStorage.setItem(notesKey(researchId), JSON.stringify(notes));

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
  }

  // ----------------------------------------------------------------
  // FINDINGS APIS
  // ----------------------------------------------------------------

  public async getFindings(researchId: string): Promise<ResearchFinding[]> {
    this.initSeedsIfEmpty();
    if (typeof window === "undefined") return [];

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
    const newFinding: ResearchFinding = {
      ...data,
      id: `find_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      research_id: researchId,
      created_at: new Date().toISOString(),
    };

    findings.unshift(newFinding);
    localStorage.setItem(findingsKey(researchId), JSON.stringify(findings));

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
  }

  // ----------------------------------------------------------------
  // TASKS APIS
  // ----------------------------------------------------------------

  public async getTasks(researchId: string): Promise<ResearchTask[]> {
    this.initSeedsIfEmpty();
    if (typeof window === "undefined") return [];

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
    const newTask: ResearchTask = {
      ...data,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      research_id: researchId,
      created_at: new Date().toISOString(),
    };

    tasks.unshift(newTask);
    localStorage.setItem(tasksKey(researchId), JSON.stringify(tasks));

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
      const newEvent: ResearchTimelineEvent = {
        ...event,
        id: `tl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        research_id: researchId,
        timestamp: new Date().toISOString(),
      };
      events.unshift(newEvent);
      // Keep last 100 events
      localStorage.setItem(timelineKey(researchId), JSON.stringify(events.slice(0, 100)));
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
    const newMsg: ResearchChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      research_id: researchId,
      role,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    messages.push(newMsg);
    localStorage.setItem(chatsKey(researchId), JSON.stringify(messages));

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
}

export const workspaceService = new WorkspaceService();
