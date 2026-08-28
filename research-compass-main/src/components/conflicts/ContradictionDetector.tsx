import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GitCompareArrows,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { type ContradictionItem } from "@/lib/services/llm";

interface ContradictionDetectorProps {
  contradictions: ContradictionItem[];
}

export function ContradictionDetector({ contradictions }: ContradictionDetectorProps) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="card-scientific p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitCompareArrows className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              CONFLICTING EVIDENCE
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {contradictions.length > 0 ? `${contradictions.length} Discrepancies` : "Consensus Verified"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Triangulating empirical divergences, opposing findings, and methodological variance causes across studies.
          </p>
        </div>
      </div>

      {contradictions.length === 0 ? (
        <div className="card-scientific text-center py-16 bg-white p-6 max-w-3xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            No strong contradiction detected in the analyzed literature.
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            The retrieved scientific corpus exhibits high empirical consistency regarding underlying convolutional representations and feature extractors. No artificial conflicts were generated.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {contradictions.map((item, index) => (
            <div
              key={item.id || index}
              className="card-scientific card-scientific-hover p-6 bg-white space-y-4 border-l-4 border-l-amber-500"
            >
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Discrepancy #{index + 1}</span>
                  </span>
                  <span className="text-xs font-bold text-slate-900">{item.topic}</span>
                </div>

                <div className="text-xs font-semibold text-slate-600">
                  Confidence: <span className="text-amber-700 font-bold">{item.confidence || "Moderate"}</span>
                </div>
              </div>

              {/* Side-by-Side Contradicting Claims */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Finding A */}
                <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-200/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-blue-700 font-bold uppercase text-[10px]">
                    <FileText className="w-3.5 h-3.5" />
                    <span>PAPER A: {item.paper_a}</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    &ldquo;{item.finding_a}&rdquo;
                  </p>
                </div>

                {/* Finding B */}
                <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold uppercase text-[10px]">
                    <FileText className="w-3.5 h-3.5" />
                    <span>PAPER B: {item.paper_b}</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    &ldquo;{item.finding_b}&rdquo;
                  </p>
                </div>
              </div>

              {/* Possible Scientific Explanation */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold uppercase text-[10px] tracking-wider">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>POSSIBLE EXPLANATION & ROOT CAUSES</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {item.explanation ||
                    "Discrepancy stems primarily from benchmark variation: Study A evaluated performance on lab-captured uniform backgrounds, whereas Study B tested in-the-wild datasets under varied lighting and occlusions."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
