import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TestTube,
  Database,
  Sliders,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  GitBranch,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Terminal,
  Scale,
  Sparkles,
} from "lucide-react";
import { type ExperimentPlanResult, type HypothesisItem } from "@/lib/services/llm";

interface ExperimentDesignerProps {
  experiment?: ExperimentPlanResult | null;
  selectedHypothesis?: HypothesisItem | null;
  onProceedToResults?: () => void;
}

export function ExperimentDesigner({
  experiment,
  selectedHypothesis,
  onProceedToResults,
}: ExperimentDesignerProps) {
  if (!experiment) {
    return (
      <div className="card-scientific text-center py-16 bg-white p-6 max-w-4xl mx-auto">
        <TestTube className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-900">No Experiment Blueprint Available</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Select a hypothesis in the Hypothesis Lab to synthesize a complete scientific validation protocol.
        </p>
      </div>
    );
  }

  const protocolStages = [
    { step: 1, name: "DATASET", desc: experiment.dataset_plan || "PlantVillage + Field Crops Benchmark", icon: Database },
    { step: 2, name: "PREPROCESSING", desc: "Illumination normalization & foliage segmentation", icon: Sliders },
    { step: 3, name: "BASELINE", desc: experiment.baselines?.join(", ") || "ResNet-50, MobileNet-v3", icon: Cpu },
    { step: 4, name: "PROPOSED METHOD", desc: experiment.methodology || "Lightweight hybrid attention model", icon: Layers },
    { step: 5, name: "TRAINING", desc: "AdamW optimizer, cosine warmup, 100 epochs", icon: Activity },
    { step: 6, name: "VALIDATION", desc: "5-fold cross-validation with out-of-domain test split", icon: ShieldCheck },
    { step: 7, name: "EVALUATION", desc: experiment.metrics?.join(", ") || "Top-1 Acc, Macro F1, Latency", icon: TrendingUp },
    { step: 8, name: "STATISTICAL COMPARISON", desc: experiment.statistical_analysis || "Paired t-tests (p < 0.01)", icon: Scale },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="card-scientific p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              EXPERIMENT DESIGNER
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              8-Stage Scientific Protocol
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reproducible experimental design: baseline benchmarks, variable controls, and statistical testing framework.
          </p>
        </div>

        {onProceedToResults && (
          <Button
            onClick={onProceedToResults}
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs h-9 px-4 rounded-lg shadow-xs flex items-center gap-1.5"
          >
            <span>ANALYZE RESULTS</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Target Hypothesis Context */}
      <div className="card-scientific p-5 bg-white border-l-4 border-l-purple-500 space-y-1.5">
        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
          TARGET HYPOTHESIS UNDER VALIDATION
        </span>
        <p className="text-sm md:text-base font-bold text-slate-900 italic">
          &ldquo;{experiment.hypothesis || selectedHypothesis?.statement}&rdquo;
        </p>
      </div>

      {/* 8-Step Visual Protocol Flow */}
      <div className="card-scientific p-6 bg-white space-y-4">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Protocol Execution Workflow
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {protocolStages.map((stage) => {
            const Icon = stage.icon;

            return (
              <div
                key={stage.step}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-300 transition-all space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                    STAGE {stage.step}
                  </span>
                  <Icon className="w-4 h-4 text-teal-600" />
                </div>

                <div className="font-bold text-xs text-slate-900">
                  {stage.name}
                </div>

                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                  {stage.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Technical Protocol Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* Datasets & Splits */}
        <div className="card-scientific p-5 bg-white space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold uppercase text-[11px]">
            <Database className="w-4 h-4 text-teal-600" />
            <span>Dataset & Data Partitioning</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {experiment.dataset_plan}
          </p>
        </div>

        {/* Baselines */}
        <div className="card-scientific p-5 bg-white space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold uppercase text-[11px]">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span>Standard Baseline Benchmarks</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {experiment.baselines?.map((b, i) => (
              <span key={i} className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded font-semibold">
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Evaluation Metrics */}
        <div className="card-scientific p-5 bg-white space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold uppercase text-[11px]">
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Evaluation Metrics & Benchmarks</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {experiment.metrics?.map((m, i) => (
              <span key={i} className="bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded font-semibold">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Statistical Rigor */}
        <div className="card-scientific p-5 bg-white space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold uppercase text-[11px]">
            <Scale className="w-4 h-4 text-purple-600" />
            <span>Statistical Significance Testing</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {experiment.statistical_analysis ||
              "Paired Student's t-test and Wilcoxon signed-rank tests across 5-fold cross-validation runs to verify p < 0.01 confidence thresholds."}
          </p>
        </div>
      </div>
    </div>
  );
}
