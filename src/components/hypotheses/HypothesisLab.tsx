import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Lightbulb,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TestTube,
  Variable,
  Target,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { type HypothesisItem } from "@/lib/services/llm";
import { toast } from "sonner";

interface HypothesisLabProps {
  hypotheses: HypothesisItem[];
  selectedHypothesis?: HypothesisItem | null;
  onSelectHypothesis: (hypothesis: HypothesisItem) => void;
  onProceedToExperiment: () => void;
}

export function HypothesisLab({
  hypotheses,
  selectedHypothesis,
  onSelectHypothesis,
  onProceedToExperiment,
}: HypothesisLabProps) {
  const [activeId, setActiveId] = useState<string>(
    selectedHypothesis?.label || hypotheses[0]?.label || "H1",
  );

  const handleSelect = (hyp: HypothesisItem) => {
    setActiveId(hyp.label);
    onSelectHypothesis(hyp);
    toast.success(`Selected ${hyp.label} as primary experiment candidate!`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="card-scientific p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              HYPOTHESIS LAB
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {hypotheses.length} Formulated
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Convert research gaps into testable research hypotheses with multi-factor scoring.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
          <span>Scores are AI-assisted rankings evaluated against literature benchmarks.</span>
        </div>
      </div>

      {/* Hypotheses Grid */}
      <div className="space-y-4">
        {hypotheses.map((hyp, index) => {
          const isSelected = (selectedHypothesis?.label || activeId) === hyp.label;

          return (
            <div
              key={hyp.id || hyp.label || index}
              className={`card-scientific p-6 bg-white space-y-4 transition-all ${
                isSelected
                  ? "border-2 border-purple-500 ring-2 ring-purple-500/10 shadow-md"
                  : "hover:border-slate-300"
              }`}
            >
              {/* Top Label & Overall Score Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 font-extrabold flex items-center justify-center text-sm font-mono shadow-xs">
                    {hyp.label || `H${index + 1}`}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                      {hyp.gap_reference || "Literature Gap Response"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-purple-50/60 px-3 py-1 rounded-lg border border-purple-200">
                  <span className="text-xs text-purple-900 font-medium">Overall AI-Assisted Score:</span>
                  <span className="text-sm font-extrabold text-purple-700 font-mono">
                    {hyp.overall_score.toFixed(1)} / 10
                  </span>
                </div>
              </div>

              {/* Hypothesis Statement */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  HYPOTHESIS STATEMENT
                </span>
                <h2 className="text-base font-bold text-slate-900 leading-relaxed">
                  {hyp.statement}
                </h2>
              </div>

              {/* Why this hypothesis & Supporting Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    WHY THIS HYPOTHESIS?
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    {hyp.rationale}
                  </p>
                </div>

                <div className="p-3.5 bg-teal-50/30 rounded-lg border border-teal-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                    SUPPORTING EVIDENCE
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {hyp.supporting_evidence || "Derived from cross-study empirical analysis and identified generalization boundaries."}
                  </p>
                </div>
              </div>

              {/* Variables: Independent, Dependent, Expected Outcome */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase">Independent Variable</span>
                  <p className="text-slate-900 font-medium mt-0.5">{hyp.independent_variables}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-teal-700 uppercase">Dependent Variable</span>
                  <p className="text-slate-900 font-medium mt-0.5">{hyp.dependent_variables}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-700 uppercase">Expected Outcome</span>
                  <p className="text-slate-900 font-medium mt-0.5">{hyp.expected_outcome}</p>
                </div>
              </div>

              {/* Multi-Factor Score Bars */}
              <div className="grid grid-cols-3 gap-4 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Novelty</span>
                    <span className="font-bold text-purple-700">{hyp.novelty_score.toFixed(1)}/10</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${hyp.novelty_score * 10}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Feasibility</span>
                    <span className="font-bold text-teal-700">{hyp.feasibility_score.toFixed(1)}/10</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full" style={{ width: `${hyp.feasibility_score * 10}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Expected Impact</span>
                    <span className="font-bold text-blue-700">{hyp.impact_score.toFixed(1)}/10</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${hyp.impact_score * 10}%` }} />
                  </div>
                </div>
              </div>

              {/* Footer Selection Button */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">
                  {isSelected ? "Active protocol candidate" : "Click to select as active experiment target"}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleSelect(hyp)}
                    size="sm"
                    className={`text-xs font-semibold h-8.5 px-4 rounded-lg flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-purple-600 text-white shadow-xs"
                        : "border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
                    }`}
                  >
                    {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lightbulb className="w-3.5 h-3.5" />}
                    <span>{isSelected ? "SELECTED HYPOTHESIS" : "SELECT HYPOTHESIS"}</span>
                  </Button>

                  {isSelected && (
                    <Button
                      onClick={onProceedToExperiment}
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold h-8.5 px-3.5 rounded-lg shadow-xs flex items-center gap-1.5"
                    >
                      <TestTube className="w-3.5 h-3.5" />
                      <span>DESIGN PROTOCOL</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
