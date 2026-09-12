import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  HelpCircle,
  Search,
  FileSearch,
  GitMerge,
  SearchCode,
  GitCompareArrows,
  Lightbulb,
  TestTube,
  FileCheck2,
  Terminal,
  ArrowRight,
  Sparkles,
  Layers,
  ChartNoAxesCombined,
} from "lucide-react";
import { type PipelineProgressUpdate, type ResearchProjectData } from "@/lib/services/orchestrator";

interface AutonomousPipelineRunnerProps {
  progress: PipelineProgressUpdate | null;
  isRunning: boolean;
  projectData: ResearchProjectData | null;
  onViewArtifacts: () => void;
  logs: string[];
}

export function AutonomousPipelineRunner({
  progress,
  isRunning,
  projectData,
  onViewArtifacts,
  logs,
}: AutonomousPipelineRunnerProps) {
  const stages = [
    { num: "01", id: "question", label: "Research Question", icon: HelpCircle, desc: "Deconstruct inquiry & scope terms" },
    { num: "02", id: "search", label: "Literature Search", icon: Search, desc: "Query OpenAlex & Semantic Scholar" },
    { num: "03", id: "analyze", label: "Paper Analysis", icon: FileSearch, desc: "Extract problem, methods & metrics" },
    { num: "04", id: "synthesize", label: "Evidence Synthesis", icon: GitMerge, desc: "Multi-paper consensus triangulation" },
    { num: "05", id: "gaps", label: "Research Gap", icon: SearchCode, desc: "Isolate 7 unaddressed dimensions" },
    { num: "06", id: "conflicts", label: "Conflicting Evidence", icon: GitCompareArrows, desc: "Triangulate study discrepancies" },
    { num: "07", id: "hypotheses", label: "Hypothesis", icon: Lightbulb, desc: "Formulate testable H1-H5 statements" },
    { num: "08", id: "experiment", label: "Experiment", icon: TestTube, desc: "7-Stage validation protocol" },
    { num: "09", id: "results", label: "Results & Report", icon: ChartNoAxesCombined, desc: "Formal proposal & benchmark metrics" },
  ];

  const currentStepNumber = progress?.step || (projectData ? 9 : 1);
  const progressPercent = Math.min(100, Math.round((currentStepNumber / 9) * 100));

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header Banner */}
      <div className="card-scientific p-6 md:p-8 bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md uppercase">
                {isRunning ? "Autonomous Engine Active" : projectData ? "Investigation Complete" : "Standby"}
              </span>
              {isRunning && (
                <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Stage {currentStepNumber} of 9</span>
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              AUTONOMOUS RESEARCH PIPELINE
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              {progress?.detail || "From research questions to literature discovery, evidence synthesis, gap detection, and experiment design."}
            </p>
          </div>

          {projectData && !isRunning && (
            <Button
              onClick={onViewArtifacts}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 px-5 rounded-lg shadow-xs shrink-0 flex items-center gap-2"
            >
              <span>EXPLORE RESEARCH RESULTS</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Workflow Completion</span>
            <span className="text-blue-700 font-bold">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-slate-100" />
        </div>
      </div>

      {/* Connected 9-Stage Node Flow */}
      <div className="card-scientific p-6 bg-white space-y-4">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Pipeline Execution Stages
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {stages.map((stg, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStepNumber || (projectData && !isRunning);
            const isCurrent = stepNum === currentStepNumber && isRunning;
            const isPending = stepNum > currentStepNumber && !projectData;

            const Icon = stg.icon;

            return (
              <div
                key={stg.id}
                className={`p-4 rounded-xl border transition-all flex items-start gap-3 relative ${
                  isCompleted
                    ? "bg-teal-50/40 border-teal-200 text-slate-900"
                    : isCurrent
                    ? "bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 text-slate-900 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                {/* Stage Number & Icon */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-mono text-xs font-bold ${
                    isCompleted
                      ? "bg-teal-500 text-white shadow-xs"
                      : isCurrent
                      ? "bg-blue-600 text-white animate-pulse"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : stg.num}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-900 truncate">{stg.label}</div>
                    <span
                      className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                        isCompleted
                          ? "text-teal-700 bg-teal-100/60"
                          : isCurrent
                          ? "text-blue-700 bg-blue-100"
                          : "text-slate-500 bg-slate-200/60"
                      }`}
                    >
                      {isCompleted ? "Done" : isCurrent ? "Running" : "Pending"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">
                    {stg.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Scientific Telemetry Event Stream */}
      <div className="card-scientific p-5 bg-white space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase">
            <Terminal className="w-4 h-4 text-blue-600" />
            <span>Execution Telemetry & Live Event Log</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">{logs.length} events logged</span>
        </div>

        <div className="bg-slate-950 text-slate-200 font-mono text-[11px] p-4 rounded-xl max-h-56 overflow-y-auto space-y-1.5 border border-slate-800">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="flex items-start gap-2 leading-relaxed">
                <span className="text-teal-400 select-none">&gt;</span>
                <span className="text-slate-300">{log}</span>
              </div>
            ))
          ) : (
            <div className="text-slate-500 italic">Waiting for autonomous pipeline execution...</div>
          )}
        </div>
      </div>
    </div>
  );
}
