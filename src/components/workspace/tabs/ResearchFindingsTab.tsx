import React, { useState, useEffect } from "react";
import { type ResearchProject, type ResearchFinding } from "@/types/research";
import { workspaceService } from "@/lib/services/workspace-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Search,
  PlusCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  BookOpen,
  ArrowUpRight,
  BarChart2,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";

interface ResearchFindingsTabProps {
  project: ResearchProject;
  onFindingsChanged?: (count: number) => void;
}

export function ResearchFindingsTab({ project, onFindingsChanged }: ResearchFindingsTabProps) {
  const [findings, setFindings] = useState<ResearchFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ResearchFinding["type"]>("finding");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState("");
  const [confidence, setConfidence] = useState("90%");
  const [novelty, setNovelty] = useState(8);
  const [feasibility, setFeasibility] = useState(8);

  const loadFindings = async () => {
    setLoading(true);
    try {
      const data = await workspaceService.getFindings(project.id);
      setFindings(data);
      onFindingsChanged?.(data.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFindings();
  }, [project.id]);

  const handleCreateFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      await workspaceService.createFinding(project.id, {
        title: title.trim(),
        type,
        description: description.trim(),
        evidence: evidence.trim() || undefined,
        confidence,
        novelty,
        feasibility,
      });

      toast.success("Key finding recorded in workspace");
      setIsAddOpen(false);
      setTitle("");
      setDescription("");
      setEvidence("");
      loadFindings();
    } catch {
      toast.error("Failed to add finding");
    }
  };

  const handleDeleteFinding = async (findingId: string, findingTitle: string) => {
    if (!confirm(`Remove finding "${findingTitle}"?`)) return;
    try {
      await workspaceService.deleteFinding(project.id, findingId);
      toast.success("Finding removed");
      loadFindings();
    } catch {
      toast.error("Failed to delete finding");
    }
  };

  const filteredFindings = findings.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || f.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeStyle = (t: ResearchFinding["type"]) => {
    switch (t) {
      case "gap":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200/80",
          icon: AlertTriangle,
          label: "Research Gap",
        };
      case "trend":
        return {
          bg: "bg-sky-50 text-sky-700 border-sky-200/80",
          icon: TrendingUp,
          label: "Trend",
        };
      case "statistic":
        return {
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
          icon: BarChart2,
          label: "Statistic",
        };
      case "insight":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          icon: Lightbulb,
          label: "AI Insight",
        };
      default:
        return {
          bg: "bg-teal-50 text-teal-700 border-teal-200/80",
          icon: CheckCircle2,
          label: "Empirical Finding",
        };
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header & Controls */}
      <div className="card-mice p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold font-heading text-slate-900 tracking-tight">
              Key Findings & Discoveries
            </h2>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-semibold px-2.5 py-0.5">
              {findings.length} Findings
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Empirical insights, literature gaps, and quantitative trends isolated to Research ID:{" "}
            <span className="font-mono font-semibold text-slate-700">{project.id}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddOpen(true)}
            size="sm"
            className="btn-interactive bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-9 px-3.5 rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Finding</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search findings, gaps, and statistics..."
            className="pl-10 h-10 bg-white border-slate-200/80 text-xs rounded-xl shadow-2xs focus-visible:ring-slate-400/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
          {["all", "finding", "gap", "trend", "statistic", "insight"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all duration-150 ${
                filterType === t
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t === "all" ? "All Findings" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Findings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-mice p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="skeleton-shimmer h-4 w-28" />
                <div className="skeleton-shimmer h-4 w-6" />
              </div>
              <div className="skeleton-shimmer h-5 w-4/5" />
              <div className="space-y-2">
                <div className="skeleton-shimmer h-3 w-full" />
                <div className="skeleton-shimmer h-3 w-5/6" />
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between">
                <div className="skeleton-shimmer h-3 w-20" />
                <div className="skeleton-shimmer h-3 w-16" />
                <div className="skeleton-shimmer h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredFindings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFindings.map((finding) => {
            const style = getTypeStyle(finding.type);
            const Icon = style.icon;

            return (
              <div
                key={finding.id}
                className="card-mice card-mice-hover p-6 transition-all duration-200 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${style.bg}`}
                    >
                      <Icon className="w-3 h-3" />
                      {style.label}
                    </span>

                    <button
                      onClick={() => handleDeleteFinding(finding.id, finding.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete finding"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold font-heading text-slate-900 leading-snug">
                    {finding.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {finding.description}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                  {finding.evidence && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span className="text-[11px] text-slate-600 font-medium">
                        <strong className="text-slate-800">Evidence:</strong> {finding.evidence}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-medium">
                    {finding.confidence && (
                      <span>Confidence: <strong className="text-teal-700 font-semibold">{finding.confidence}</strong></span>
                    )}
                    {finding.novelty && (
                      <span>Novelty: <strong className="text-indigo-700 font-semibold">{finding.novelty}/10</strong></span>
                    )}
                    {finding.feasibility && (
                      <span>Feasibility: <strong className="text-blue-700 font-semibold">{finding.feasibility}/10</strong></span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-mice p-12 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold font-heading text-slate-800">No Key Findings Recorded</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Document literature gaps, experimental insights, and quantitative statistics derived from this research corpus.
          </p>
          <Button
            onClick={() => setIsAddOpen(true)}
            size="sm"
            className="btn-interactive bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-9 rounded-xl shadow-xs"
          >
            Record Finding
          </Button>
        </div>
      )}

      {/* Add Finding Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200/80 animate-fade-slide">
            <h3 className="text-base font-bold font-heading text-slate-900">
              Record Key Finding / Insight
            </h3>

            <form onSubmit={handleCreateFinding} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Finding Title *</label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cross-Attention Yields 14.2% Boost in Readmission AUROC"
                  className="text-xs mt-1 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Finding Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ResearchFinding["type"])}
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white mt-1"
                  >
                    <option value="finding">Empirical Finding</option>
                    <option value="gap">Research Gap</option>
                    <option value="trend">Literature Trend</option>
                    <option value="statistic">Quantitative Statistic</option>
                    <option value="insight">AI-Generated Insight</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Confidence Metric</label>
                  <Input
                    value={confidence}
                    onChange={(e) => setConfidence(e.target.value)}
                    placeholder="e.g. 92% or High"
                    className="text-xs mt-1 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Description & Significance *</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Elaborate on the finding, its theoretical underpinnings, and significance..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-400/20 focus:outline-none mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Supporting Evidence / Citations</label>
                <Input
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder="e.g. Nature Digital Medicine, Jenkins et al. (2024)"
                  className="text-xs mt-1 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Novelty Score (1-10)</label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={novelty}
                    onChange={(e) => setNovelty(Number(e.target.value))}
                    className="text-xs mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Feasibility Score (1-10)</label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={feasibility}
                    onChange={(e) => setFeasibility(Number(e.target.value))}
                    className="text-xs mt-1 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                  className="btn-interactive text-xs rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="btn-interactive bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
                >
                  Record Finding
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
