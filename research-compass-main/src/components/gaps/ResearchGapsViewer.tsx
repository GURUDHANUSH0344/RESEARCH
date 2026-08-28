import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Link as LinkIcon,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Database,
  Cpu,
  Globe2,
  Clock,
  CheckCircle,
  Target,
  ArrowRight,
  Lightbulb,
  FileText,
} from "lucide-react";
import { type ResearchGapItem } from "@/lib/services/llm";
import { type NormalizedPaper } from "@/lib/services/openalex";

interface ResearchGapsViewerProps {
  gaps: ResearchGapItem[];
  papers: NormalizedPaper[];
  onSelectPaper?: (paper: NormalizedPaper) => void;
  onNavigateToHypotheses?: () => void;
}

export function ResearchGapsViewer({
  gaps,
  papers,
  onSelectPaper,
  onNavigateToHypotheses,
}: ResearchGapsViewerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    "Dataset Gap",
    "Methodological Gap",
    "Generalization Gap",
    "Geographic Gap",
    "Temporal Gap",
    "Evaluation Gap",
    "Application Gap",
  ];

  const filteredGaps = selectedCategory === "All"
    ? gaps
    : gaps.filter((g) => g.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Dataset Gap": return "bg-teal-50 text-teal-700 border-teal-200";
      case "Methodological Gap": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Generalization Gap": return "bg-amber-50 text-amber-800 border-amber-200";
      case "Geographic Gap": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Temporal Gap": return "bg-purple-50 text-purple-700 border-purple-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const findMatchingPaper = (paperTitle: string): NormalizedPaper | undefined => {
    return papers.find((p) =>
      p.title.toLowerCase().includes(paperTitle.toLowerCase()) ||
      paperTitle.toLowerCase().includes(p.title.toLowerCase()),
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="card-scientific p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              RESEARCH GAP DISCOVERY
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {gaps.length} Opportunities Identified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Evidence-backed opportunities identified from analyzed literature, mapped to supporting citations.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gaps List */}
      {filteredGaps.length === 0 ? (
        <div className="card-scientific text-center py-16 bg-white p-6">
          <Search className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No Gaps Found in This Category</h3>
          <p className="text-xs text-slate-500 mt-1">Select &ldquo;All&rdquo; to view all identified opportunities.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGaps.map((gap, index) => {
            const gapNumber = String(index + 1).padStart(2, "0");
            const rawConfidence = gap.confidence ?? (gap as any)?.evidence_strength;
            let parsedConf = 85;
            if (typeof rawConfidence === "number" && !isNaN(rawConfidence)) {
              parsedConf = rawConfidence <= 1 ? Math.round(rawConfidence * 100) : Math.round(rawConfidence);
            } else if (typeof rawConfidence === "string") {
              const num = parseFloat(rawConfidence);
              if (!isNaN(num)) {
                parsedConf = num <= 1 ? Math.round(num * 100) : Math.round(num);
              }
            }
            const strengthPct = Math.min(100, Math.max(10, parsedConf));

            return (
              <div
                key={gap.id || index}
                className="card-scientific card-scientific-hover p-6 bg-white space-y-4"
              >
                {/* Top Row: Number, Title, Category Badge */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                        GAP #{gapNumber}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getCategoryColor(gap.category)}`}>
                        {gap.category}
                      </span>
                    </div>

                    <h2 className="text-base md:text-lg font-bold text-slate-900">
                      {gap.title}
                    </h2>
                  </div>

                  {/* Confidence / Strength Badge */}
                  <div className="text-left md:text-right shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Evidence Strength</span>
                    <div className="text-base font-extrabold text-teal-700">{strengthPct}%</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-lg border border-slate-100">
                  {gap.description}
                </p>

                {/* Metrics: Progress Bar, Novelty, Feasibility */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Evidence Robustness</span>
                      <span className="text-teal-700 font-bold">{strengthPct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-full rounded-full" style={{ width: `${strengthPct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-around bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Novelty</span>
                      <div className="text-xs font-bold text-purple-700">{gap.novelty ? `${gap.novelty}/10` : "High"}</div>
                    </div>
                    <div className="h-4 w-px bg-slate-200" />
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Feasibility</span>
                      <div className="text-xs font-bold text-teal-700">{gap.feasibility ? `${gap.feasibility}/10` : "High"}</div>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Potential Inquiry</span>
                    <p className="text-xs text-slate-800 font-medium truncate">
                      {gap.potential_research_question || "How to resolve this gap under real-world constraints?"}
                    </p>
                  </div>
                </div>

                {/* Supporting Papers & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Supported by:</span>
                    {gap.supporting_papers && gap.supporting_papers.length > 0 ? (
                      gap.supporting_papers.map((pTitle, pIdx) => {
                        const matched = findMatchingPaper(pTitle);
                        return (
                          <button
                            key={pIdx}
                            onClick={() => matched && onSelectPaper && onSelectPaper(matched)}
                            className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded font-medium truncate max-w-[220px]"
                            title={pTitle}
                          >
                            {matched?.authors?.[0] || "Paper"} ({matched?.year || "Study"})
                          </button>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-500 italic">Analyzed Literature Base</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={onNavigateToHypotheses}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold h-8.5 px-3 rounded-lg shadow-2xs flex items-center gap-1.5"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>GENERATE HYPOTHESIS</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
