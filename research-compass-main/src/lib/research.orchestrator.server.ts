import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { callAiJson, callAiText, SCIENTIFIC_SAFETY } from "./ai.server";
import { enrichWithSemanticScholar, searchOpenAlex, type FetchedPaper } from "./openalex.server";

export type Db = SupabaseClient<Database>;

export type PaperAnalysis = {
  ref: string;
  problem: string;
  objective: string;
  methodology: string;
  dataset: string;
  experimental_setup: string;
  results: string;
  limitations: string[];
  future_work: string[];
  contributions: string[];
};

export type Synthesis = {
  common_findings: string[];
  differing_findings: string[];
  emerging_methods: string[];
  common_limitations: string[];
  underexplored_areas: string[];
  evidence_strength: number;
  method_distribution: { method: string; count: number }[];
  keywords: string[];
};

type GapOut = {
  title: string;
  category: string;
  description: string;
  evidence: string;
  why_it_matters: string;
  supporting_papers: string[];
  potential_question: string;
  confidence: string;
  novelty: number;
  feasibility: number;
};

type ContradictionOut = {
  topic: string;
  finding_a: string;
  finding_b: string;
  paper_a: string;
  paper_b: string;
  possible_explanation: string;
  confidence: string;
};

type HypothesisOut = {
  label: string;
  statement: string;
  rationale: string;
  evidence: string;
  independent_variable: string;
  dependent_variable: string;
  expected_outcome: string;
  novelty_score: number;
  feasibility_score: number;
  impact_score: number;
};

export function buildPaperContext(papers: FetchedPaper[]): string {
  return papers
    .map((p, i) => {
      const abs = (p.abstract ?? "No abstract available.").slice(0, 1400);
      return `P${i + 1} | ${p.title} (${p.year ?? "n.d."}) | Authors: ${p.authors.slice(0, 4).join(", ") || "unknown"} | Venue: ${p.venue ?? "n/a"} | Citations: ${p.citation_count}\nAbstract: ${abs}`;
    })
    .join("\n\n");
}

const num = (v: unknown, fallback: number) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(10, n)) : fallback;
};
const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);
const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);

export async function runResearchPipeline(
  db: Db,
  projectId: string,
  input: { question: string; field: string; objective: string; yearFrom: number; yearTo: number; limit: number },
) {
  let papers = await searchOpenAlex({
    query: input.question,
    limit: input.limit,
    yearFrom: input.yearFrom,
    yearTo: input.yearTo,
  });
  if (papers.length === 0) {
    papers = await searchOpenAlex({ query: input.question, limit: input.limit });
  }
  if (papers.length === 0) {
    await db.from("research_projects").update({ status: "empty" }).eq("id", projectId);
    throw new Error("No scientific papers were found for this question. Try rephrasing it or widening the year range.");
  }
  papers = await enrichWithSemanticScholar(papers);

  const { data: insertedPapers, error: paperError } = await db
    .from("papers")
    .insert(papers.map((p) => ({ ...p, project_id: projectId })))
    .select("id, title");
  if (paperError) throw new Error(paperError.message);

  const context = buildPaperContext(papers);
  const header = `Research question: "${input.question}"\nField: ${input.field}\nObjective: ${input.objective}\n\nANALYSED LITERATURE (${papers.length} papers):\n${context}`;

  const analysisPromise = callAiJson<{ analyses?: unknown[] }>(
    SCIENTIFIC_SAFETY,
    `${header}\n\nFor EVERY paper above, extract structured information strictly from its abstract. If a field is not stated, write "Not reported in the abstract".
Return JSON: {"analyses":[{"ref":"P1","problem":"","objective":"","methodology":"","dataset":"","experimental_setup":"","results":"","limitations":[""],"future_work":[""],"contributions":[""]}]}`,
  );

  const synthesisPromise = callAiJson<{
    synthesis?: Record<string, unknown>;
    research_gaps?: unknown[];
    contradictions?: unknown[];
    hypotheses?: unknown[];
  }>(
    SCIENTIFIC_SAFETY,
    `${header}

Perform evidence synthesis across the papers, then derive research gaps, contradictions and hypotheses.
Gap categories must be one of: Dataset Gap, Methodological Gap, Geographic Gap, Generalization Gap, Temporal Gap, Evaluation Gap, Application Gap.
Every gap must cite the paper refs it was derived from. Produce 4-6 gaps, 0-3 contradictions (only real conflicts visible in the abstracts), and 4 testable hypotheses.
confidence is one of "high" | "medium" | "low". Scores are 0-10 AI-assisted estimates.
evidence_strength is 0-100 and reflects how well the retrieved literature supports the conclusions.

Return JSON:
{"synthesis":{"common_findings":[""],"differing_findings":[""],"emerging_methods":[""],"common_limitations":[""],"underexplored_areas":[""],"evidence_strength":0,"method_distribution":[{"method":"","count":0}],"keywords":[""]},
"research_gaps":[{"title":"","category":"","description":"","evidence":"","why_it_matters":"","supporting_papers":["P1"],"potential_question":"","confidence":"high","novelty":0,"feasibility":0}],
"contradictions":[{"topic":"","finding_a":"","finding_b":"","paper_a":"P1","paper_b":"P2","possible_explanation":"","confidence":"medium"}],
"hypotheses":[{"label":"H1","statement":"","rationale":"","evidence":"","independent_variable":"","dependent_variable":"","expected_outcome":"","novelty_score":0,"feasibility_score":0,"impact_score":0}]}`,
  );

  const [analysisRes, synthRes] = await Promise.all([analysisPromise, synthesisPromise]);

  const refToId = new Map<string, string>();
  (insertedPapers ?? []).forEach((row, i) => {
    const original = papers.findIndex((p) => p.title === row.title);
    refToId.set(`P${(original >= 0 ? original : i) + 1}`, row.id);
  });
  const refToTitle = new Map<string, string>();
  papers.forEach((p, i) => refToTitle.set(`P${i + 1}`, p.title));
  const label = (ref: string) => `${ref}: ${refToTitle.get(ref) ?? "Unknown paper"}`;

  const analyses = (analysisRes.analyses ?? []) as Record<string, unknown>[];
  const analysisRows = analyses
    .map((a) => {
      const id = refToId.get(str(a["ref"]));
      if (!id) return null;
      return {
        paper_id: id,
        problem: str(a["problem"]),
        objective: str(a["objective"]),
        methodology: str(a["methodology"]),
        dataset: str(a["dataset"]),
        experimental_setup: str(a["experimental_setup"]),
        results: str(a["results"]),
        limitations: arr(a["limitations"]),
        future_work: arr(a["future_work"]),
        contributions: arr(a["contributions"]),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  if (analysisRows.length > 0) await db.from("paper_analysis").insert(analysisRows);

  const s = (synthRes.synthesis ?? {}) as Record<string, unknown>;
  const synthesis: Synthesis = {
    common_findings: arr(s["common_findings"]),
    differing_findings: arr(s["differing_findings"]),
    emerging_methods: arr(s["emerging_methods"]),
    common_limitations: arr(s["common_limitations"]),
    underexplored_areas: arr(s["underexplored_areas"]),
    evidence_strength: Math.max(0, Math.min(100, Number(s["evidence_strength"]) || 0)),
    method_distribution: Array.isArray(s["method_distribution"])
      ? (s["method_distribution"] as Record<string, unknown>[])
          .map((m) => ({ method: str(m["method"]), count: Number(m["count"]) || 0 }))
          .filter((m) => m.method)
      : [],
    keywords: arr(s["keywords"]),
  };

  const gaps = (synthRes.research_gaps ?? []) as unknown as GapOut[];
  if (gaps.length > 0) {
    await db.from("research_gaps").insert(
      gaps.map((g) => ({
        project_id: projectId,
        title: str(g.title, "Potential research gap"),
        category: str(g.category, "Methodological Gap"),
        description: str(g.description),
        evidence: str(g.evidence),
        why_it_matters: str(g.why_it_matters),
        supporting_papers: arr(g.supporting_papers).map(label),
        potential_question: str(g.potential_question),
        confidence: str(g.confidence, "medium").toLowerCase(),
        novelty: Math.round(num(g.novelty, 5)),
        feasibility: Math.round(num(g.feasibility, 5)),
      })),
    );
  }

  const contradictions = (synthRes.contradictions ?? []) as unknown as ContradictionOut[];
  if (contradictions.length > 0) {
    await db.from("contradictions").insert(
      contradictions.map((c) => ({
        project_id: projectId,
        topic: str(c.topic),
        finding_a: str(c.finding_a),
        finding_b: str(c.finding_b),
        paper_a: label(str(c.paper_a)),
        paper_b: label(str(c.paper_b)),
        possible_explanation: str(c.possible_explanation),
        confidence: str(c.confidence, "medium").toLowerCase(),
      })),
    );
  }

  const hypotheses = (synthRes.hypotheses ?? []) as unknown as HypothesisOut[];
  if (hypotheses.length > 0) {
    await db.from("hypotheses").insert(
      hypotheses.map((h, i) => {
        const novelty = num(h.novelty_score, 6);
        const feasibility = num(h.feasibility_score, 6);
        const impact = num(h.impact_score, 6);
        return {
          project_id: projectId,
          label: str(h.label, `H${i + 1}`),
          statement: str(h.statement, "Hypothesis"),
          rationale: str(h.rationale),
          evidence: str(h.evidence),
          independent_variable: str(h.independent_variable),
          dependent_variable: str(h.dependent_variable),
          expected_outcome: str(h.expected_outcome),
          novelty_score: novelty,
          feasibility_score: feasibility,
          impact_score: impact,
          overall_score: Math.round(((novelty + feasibility + impact) / 3) * 10) / 10,
        };
      }),
    );
  }

  await db
    .from("research_projects")
    .update({
      status: "complete",
      synthesis: synthesis as unknown as Database["public"]["Tables"]["research_projects"]["Row"]["synthesis"],
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  return { paperCount: papers.length, gapCount: gaps.length, hypothesisCount: hypotheses.length };
}

export async function buildExperimentPlan(question: string, hypothesis: Record<string, unknown>) {
  return callAiJson<Record<string, unknown>>(
    SCIENTIFIC_SAFETY,
    `Research question: "${question}"
Selected hypothesis: ${JSON.stringify(hypothesis)}

Design a rigorous, computationally feasible experiment plan to test this hypothesis. It must be a plan only — never claim results. Flag any human-expert review needed for high-impact domains.

Return JSON:
{"research_question":"","hypothesis":"","dataset":"","data_collection":"","preprocessing":"","baseline":"","proposed_method":"","control_variables":[""],"independent_variables":[""],"dependent_variables":[""],"procedure":[""],"evaluation_metrics":[""],"expected_results":"","statistical_analysis":"","reproducibility":[""],"safety_note":""}`,
  );
}

export async function buildReport(payload: string) {
  return callAiText(
    `${SCIENTIFIC_SAFETY}\nYou write structured academic research proposals in clean GitHub-flavoured Markdown. Output Markdown only.`,
    `Write a complete research proposal using ONLY the material below. Use these sections as level-2 headings: Title, Abstract, Research Problem, Background, Literature Review, Existing Approaches, Research Gap, Research Question, Hypothesis, Proposed Methodology, Experiment Design, Expected Results, Evaluation Metrics, Limitations, Future Work, References.
References must list only the papers provided, with authors, year, venue and DOI where available.
Include a short italic disclaimer at the top stating this is AI-assisted research support requiring expert validation.

MATERIAL:
${payload}`,
  );
}
