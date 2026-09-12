import { type NormalizedPaper } from "@/lib/services/openalex";
import {
  type PaperAnalysisResult,
  type MultiPaperComparisonResult,
  type ResearchGapItem,
  type ContradictionItem,
  type HypothesisItem,
  type ExperimentPlanResult,
} from "@/lib/services/llm";

export type ResearchStatus = "active" | "in_progress" | "completed" | "on_hold" | "analyzing";

export interface ResearchProject {
  id: string; // Unique Research ID e.g. "res_ai_healthcare" or "RES-8912A"
  title: string;
  research_question: string;
  objective?: string;
  description?: string;
  research_field: string;
  status: ResearchStatus;
  progress?: number; // 0 to 100 calculated from completed tasks or pipeline
  year_from?: number;
  year_to?: number;
  paper_limit?: number;
  user_id?: string;
  created_at: string;
  updated_at: string;

  // Deep scientific analysis artifacts (optional / attached)
  papers: (NormalizedPaper & { analysis?: PaperAnalysisResult | null; relevance_score?: number })[];
  comparison?: MultiPaperComparisonResult | null;
  gaps?: ResearchGapItem[];
  contradictions?: ContradictionItem[];
  hypotheses?: HypothesisItem[];
  selected_hypothesis?: HypothesisItem | null;
  experiment?: ExperimentPlanResult | null;
  report?: string | null;
}

export interface ResearchNote {
  id: string;
  research_id: string;
  title: string;
  content: string;
  category: "methodology" | "literature" | "observation" | "idea" | "general";
  tags: string[];
  pinned?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResearchFinding {
  id: string;
  research_id: string;
  title: string;
  type: "finding" | "gap" | "trend" | "statistic" | "insight";
  description: string;
  evidence?: string;
  supporting_papers?: string[];
  novelty?: number; // 1 to 10
  feasibility?: number; // 1 to 10
  confidence?: string; // e.g. "88%" or "High"
  metrics?: Record<string, string | number>;
  created_at: string;
}

export interface ResearchTask {
  id: string;
  research_id: string;
  title: string;
  description?: string;
  status: "pending" | "completed";
  priority: "high" | "medium" | "low";
  due_date?: string;
  completed_at?: string;
  created_at: string;
}

export interface ResearchTimelineEvent {
  id: string;
  research_id: string;
  event_type:
    | "research_created"
    | "paper_added"
    | "paper_removed"
    | "note_created"
    | "note_updated"
    | "finding_added"
    | "task_created"
    | "task_completed"
    | "ai_chat"
    | "analysis_performed"
    | "status_changed";
  title: string;
  description: string;
  timestamp: string;
}

export interface ResearchChatMessage {
  id: string;
  research_id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ResearchReference {
  id: string;
  research_id: string;
  paper_id?: string;
  title: string;
  authors: string[];
  year: number;
  venue?: string;
  doi?: string;
  url?: string;
  citations: {
    apa: string;
    ieee: string;
    mla: string;
    chicago: string;
    harvard: string;
    bibtex: string;
  };
}
