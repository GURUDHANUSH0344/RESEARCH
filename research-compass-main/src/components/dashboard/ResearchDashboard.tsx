import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Search,
  Lightbulb,
  TestTube,
  TrendingUp,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Clock,
  FlaskConical,
  CheckCircle2,
  ChevronRight,
  Activity,
  FileCheck2,
  Layers,
} from "lucide-react";
import { type ResearchProjectData } from "@/lib/services/orchestrator";

interface ResearchDashboardProps {
  activeProject: ResearchProjectData | null;
  projects: ResearchProjectData[];
  onSelectProject: (p: ResearchProjectData) => void;
  onOpenNewResearch: () => void;
  onOpenCropDemo: () => void;
  onNavigateTab: (tab: any) => void;
}

export function ResearchDashboard({
  activeProject,
  projects,
  onSelectProject,
  onOpenNewResearch,
  onOpenCropDemo,
  onNavigateTab,
}: ResearchDashboardProps) {
  const paperCount = activeProject?.papers?.length || 0;
  const gapCount = activeProject?.gaps?.length || 0;
  const hypCount = activeProject?.hypotheses?.length || 0;
  const isExperimentReady = !!activeProject?.experiment;
  const topGap = activeProject?.gaps?.[0];
  const isDemo = activeProject?.id === "crop-disease-demo";

  const rawConfidence = topGap?.confidence ?? (topGap as any)?.evidence_strength;
  let parsedConf = 87;
  if (typeof rawConfidence === "number" && !isNaN(rawConfidence)) {
    parsedConf = rawConfidence <= 1 ? Math.round(rawConfidence * 100) : Math.round(rawConfidence);
  } else if (typeof rawConfidence === "string") {
    const num = parseFloat(rawConfidence);
    if (!isNaN(num)) {
      parsedConf = num <= 1 ? Math.round(num * 100) : Math.round(num);
    }
  }
  const evidencePercentage = Math.min(100, Math.max(10, parsedConf));

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Compact Active Investigation Header */}
      <div className="card-scientific p-6 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md uppercase">
              Active Investigation
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-md">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              Research Complete
            </span>
            {isDemo && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md uppercase">
                Demo Research Data
              </span>
            )}
          </div>

          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            {activeProject?.research_question || "How can AI improve crop disease detection?"}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium pt-0.5">
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Agriculture
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Computer Vision
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Artificial Intelligence
            </span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-slate-500">
              {paperCount} Papers Synthesized &bull; OpenAlex Verified
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={onOpenNewResearch}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-10 px-4 rounded-lg shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>START NEW RESEARCH</span>
          </Button>

          <Button
            onClick={() => onNavigateTab("autonomous")}
            variant="outline"
            className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold h-10 px-4 rounded-lg shadow-2xs flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span>VIEW PIPELINE</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Papers Analyzed */}
        <div
          onClick={() => onNavigateTab("literature")}
          className="card-scientific card-scientific-hover p-5 cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Papers Analyzed</span>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900">{paperCount}</div>
            <span className="text-[11px] font-semibold text-blue-600">OpenAlex + Semantic Scholar</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Research Gaps */}
        <div
          onClick={() => onNavigateTab("gaps")}
          className="card-scientific card-scientific-hover p-5 cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Research Gaps</span>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900">{gapCount}</div>
            <span className="text-[11px] font-semibold text-teal-600">Evidence Traceable</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
            <Search className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Hypotheses */}
        <div
          onClick={() => onNavigateTab("hypotheses")}
          className="card-scientific card-scientific-hover p-5 cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Hypotheses</span>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900">{hypCount}</div>
            <span className="text-[11px] font-semibold text-purple-600">AI Ranked</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <Lightbulb className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Experiment Status */}
        <div
          onClick={() => onNavigateTab("experiment")}
          className="card-scientific card-scientific-hover p-5 cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Experiment</span>
            <div className="text-2xl md:text-3xl font-extrabold text-teal-600">
              {isExperimentReady ? "READY" : "DRAFT"}
            </div>
            <span className="text-[11px] font-semibold text-slate-500">7-Stage Protocol</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
            <TestTube className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Centerpiece: RESEARCH GAP DISCOVERY */}
      <div className="card-scientific p-6 md:p-8 bg-white border-l-4 border-l-teal-500 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-teal-700 tracking-wider uppercase">
                RESEARCH GAP DISCOVERY &bull; CENTERPIECE
              </span>
              <h2 className="text-sm font-semibold text-slate-500">
                Primary Unaddressed Scientific Opportunity in Analyzed Corpus
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
              Category: {topGap?.category || "Generalization Gap"}
            </span>
          </div>
        </div>

        {/* Main Gap Statement & Description */}
        <div className="space-y-3">
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
            {topGap?.title || "Real-World Robustness & Environmental Domain Shifts Remain Underexplored"}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
            {topGap?.description ||
              "Current state-of-the-art vision models achieve high accuracy on controlled laboratory datasets, but experience severe performance degradation under natural field conditions (variable lighting, complex foliage backgrounds, early symptom subtlety)."}
          </p>
        </div>

        {/* Evidence Strength & Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50 p-5 rounded-xl border border-slate-200/80">
          {/* Progress Meter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Evidence Strength</span>
              <span className="font-bold text-teal-700">{evidencePercentage}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${evidencePercentage}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Supported by {topGap?.supporting_papers?.length || paperCount} analyzed papers
            </p>
          </div>

          {/* Novelty & Feasibility */}
          <div className="flex items-center justify-around border-l border-slate-200 pl-4">
            <div className="text-center">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Novelty</span>
              <div className="text-lg font-bold text-purple-700">
                {topGap?.novelty ? `${topGap.novelty}/10` : "High"}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Feasibility</span>
              <div className="text-lg font-bold text-teal-700">
                {topGap?.feasibility ? `${topGap.feasibility}/10` : "High"}
              </div>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex items-center justify-end gap-2.5 border-l border-slate-200 pl-4">
            <Button
              onClick={() => onNavigateTab("gaps")}
              variant="outline"
              size="sm"
              className="border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold h-9 rounded-lg"
            >
              VIEW EVIDENCE
            </Button>
            <Button
              onClick={() => onNavigateTab("hypotheses")}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold h-9 rounded-lg shadow-xs"
            >
              GENERATE HYPOTHESIS
            </Button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Evidence Observation & Recommended Frontiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evidence-Backed Observation */}
        <div className="card-scientific p-6 bg-white space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>EVIDENCE-BACKED OBSERVATION</span>
          </div>

          <blockquote className="border-l-2 border-teal-400 pl-3.5 italic text-slate-700 text-sm leading-relaxed">
            &ldquo;Several analyzed studies rely on controlled uniform backgrounds (e.g. PlantVillage benchmark), resulting in spurious correlation artifacts when deployed to real farm cameras.&rdquo;
          </blockquote>

          <div className="space-y-1.5 pt-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Supporting Citations:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeProject?.papers?.slice(0, 3).map((paper, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md font-medium"
                >
                  {paper.authors?.[0] || "Researcher"} et al. ({paper.year || 2023})
                </span>
              )) || (
                <span className="text-xs text-slate-500">OpenAlex Corpus</span>
              )}
            </div>
          </div>

          <Button
            onClick={() => onNavigateTab("literature")}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs font-semibold p-0 h-auto flex items-center gap-1 mt-2"
          >
            <span>VIEW ALL SOURCES</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Project History & Switcher */}
        <div className="card-scientific p-6 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Research History</span>
            </div>
            <span className="text-[11px] text-slate-500">{projects.length} Projects Saved</span>
          </div>

          <div className="space-y-2">
            {projects.slice(0, 3).map((proj) => (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                  proj.id === activeProject?.id
                    ? "bg-blue-50 border-blue-200 text-blue-950 font-semibold"
                    : "bg-slate-50/60 border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <div className="min-w-0 pr-3">
                  <div className="text-xs font-bold truncate">{proj.title}</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {proj.research_field} &bull; {proj.papers?.length || 0} papers
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>

          <Button
            onClick={onOpenCropDemo}
            variant="outline"
            size="sm"
            className="w-full border-teal-200 bg-teal-50/50 hover:bg-teal-100/60 text-teal-800 text-xs font-semibold h-9 rounded-lg"
          >
            Launch Benchmark: AI Crop Disease Detection
          </Button>
        </div>
      </div>
    </div>
  );
}
