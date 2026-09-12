import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const StartInput = z.object({
  question: z.string().min(8).max(500),
  field: z.string().max(80).default("General"),
  objective: z.string().max(120).default("Find research gaps"),
  yearFrom: z.number().int().min(1900).max(2100).default(2020),
  yearTo: z.number().int().min(1900).max(2100).default(2026),
  limit: z.number().int().min(5).max(20).default(10),
});

export const startResearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => StartInput.parse(input))
  .handler(async ({ data, context }) => {
    const { runResearchPipeline } = await import("./research.orchestrator.server");
    const { supabase, userId } = context;

    const { data: project, error } = await supabase
      .from("research_projects")
      .insert({
        user_id: userId,
        title: data.question.slice(0, 120),
        research_question: data.question,
        research_field: data.field,
        objective: data.objective,
        year_from: data.yearFrom,
        year_to: data.yearTo,
        paper_limit: data.limit,
        status: "running",
      })
      .select("id")
      .single();
    if (error || !project) throw new Error(error?.message ?? "Could not create the research project.");

    try {
      const summary = await runResearchPipeline(supabase, project.id, data);
      return { projectId: project.id, ...summary };
    } catch (e) {
      await supabase.from("research_projects").update({ status: "failed" }).eq("id", project.id);
      throw e instanceof Error ? e : new Error("The research run failed.");
    }
  });

export const selectHypothesis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid(), hypothesisId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { buildExperimentPlan } = await import("./research.orchestrator.server");
    const { supabase } = context;

    const { data: project } = await supabase
      .from("research_projects")
      .select("id, research_question")
      .eq("id", data.projectId)
      .single();
    if (!project) throw new Error("Project not found.");

    const { data: hypothesis } = await supabase
      .from("hypotheses")
      .select("*")
      .eq("id", data.hypothesisId)
      .single();
    if (!hypothesis) throw new Error("Hypothesis not found.");

    await supabase.from("hypotheses").update({ selected: false }).eq("project_id", data.projectId);
    await supabase.from("hypotheses").update({ selected: true }).eq("id", data.hypothesisId);

    const plan = await buildExperimentPlan(project.research_question, hypothesis as Record<string, unknown>);
    await supabase.from("experiments").delete().eq("project_id", data.projectId);
    const { data: experiment, error } = await supabase
      .from("experiments")
      .insert({ project_id: data.projectId, hypothesis_id: data.hypothesisId, plan: plan as any })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { experimentId: experiment.id };
  });

export const generateReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { buildReport } = await import("./research.orchestrator.server");
    const { supabase } = context;

    const [project, papers, gaps, contradictions, hypotheses, experiments] = await Promise.all([
      supabase.from("research_projects").select("*").eq("id", data.projectId).single(),
      supabase.from("papers").select("title, authors, year, venue, doi, citation_count").eq("project_id", data.projectId),
      supabase.from("research_gaps").select("*").eq("project_id", data.projectId),
      supabase.from("contradictions").select("*").eq("project_id", data.projectId),
      supabase.from("hypotheses").select("*").eq("project_id", data.projectId),
      supabase.from("experiments").select("plan").eq("project_id", data.projectId),
    ]);
    if (!project.data) throw new Error("Project not found.");

    const payload = JSON.stringify({
      question: project.data.research_question,
      field: project.data.research_field,
      synthesis: project.data.synthesis,
      papers: papers.data ?? [],
      gaps: gaps.data ?? [],
      contradictions: contradictions.data ?? [],
      hypotheses: hypotheses.data ?? [],
      experiment: experiments.data?.[0]?.plan ?? null,
    }).slice(0, 60000);

    const content = await buildReport(payload);
    await supabase.from("reports").delete().eq("project_id", data.projectId);
    const { error } = await supabase.from("reports").insert({ project_id: data.projectId, content });
    if (error) throw new Error(error.message);
    return { content };
  });

export const askResearchAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ projectId: z.string().uuid(), question: z.string().min(2).max(600) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { callAiText, SCIENTIFIC_SAFETY } = await import("./ai.server");
    const { supabase } = context;

    const [project, papers, gaps, hypotheses] = await Promise.all([
      supabase.from("research_projects").select("research_question, synthesis").eq("id", data.projectId).single(),
      supabase.from("papers").select("title, year, abstract").eq("project_id", data.projectId).limit(20),
      supabase.from("research_gaps").select("title, description, evidence, confidence").eq("project_id", data.projectId),
      supabase.from("hypotheses").select("label, statement, overall_score").eq("project_id", data.projectId),
    ]);
    if (!project.data) throw new Error("Project not found.");

    const evidence = JSON.stringify({
      question: project.data.research_question,
      synthesis: project.data.synthesis,
      papers: (papers.data ?? []).map((p, i) => ({ ref: `P${i + 1}`, title: p.title, year: p.year, abstract: (p.abstract ?? "").slice(0, 700) })),
      gaps: gaps.data ?? [],
      hypotheses: hypotheses.data ?? [],
    }).slice(0, 50000);

    const answer = await callAiText(
      `${SCIENTIFIC_SAFETY}\nAnswer in concise Markdown (max ~200 words). Cite paper refs like (P3). If the evidence does not cover the question, say so plainly.`,
      `PROJECT EVIDENCE:\n${evidence}\n\nRESEARCHER'S QUESTION: ${data.question}`,
    );
    return { answer };
  });
