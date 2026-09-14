import React, { useState, useEffect } from "react";
import {
  type ResearchProject,
  type ResearchGapEntry,
  type ResearchGapAnalysisReport,
  type GapConfidence,
} from "@/types/research";
import { workspaceService } from "@/lib/services/workspace-service";
import { analyzeResearchGapWithAI } from "@/lib/services/evidence-gap-ai-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import {
  Search,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Edit3,
  Trash2,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Tag,
  Check,
  X,
  FileText,
  Layers,
  HelpCircle,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { StageCompletionButton } from "../StageCompletionButton";
import { ResearchModuleHeader } from "../ResearchModuleHeader";

interface ResearchGapTabProps {
  project: ResearchProject;
  onNavigateTab: (tab: string) => void;
  onUpdateProject?: (updated: ResearchProject) => void;
  isStageCompleted?: boolean;
  onToggleStageCompletion?: () => void;
}

export function ResearchGapTab({
  project,
  onNavigateTab,
  onUpdateProject,
  isStageCompleted,
  onToggleStageCompletion,
}: ResearchGapTabProps) {
  const [report, setReport] = useState<ResearchGapAnalysisReport | null>(null);
  const [gaps, setGaps] = useState<ResearchGapEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEvidenceDirty, setIsEvidenceDirty] = useState(false);

  // Accordion state for 6 Research Gap sections
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSectionCollapse = (key: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // AI Analysis Progress State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Edit / Add Modal State
  const [editingGap, setEditingGap] = useState<ResearchGapEntry | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPapers, setFormPapers] = useState("");
  const [formConfidence, setFormConfidence] = useState<GapConfidence>("High");
  const [formCategory, setFormCategory] = useState("Methodological Gap");
  const [formVerified, setFormVerified] = useState(false);

  // Mobile BottomSheet
  const [selectedGapForSheet, setSelectedGapForSheet] = useState<ResearchGapEntry | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const loadGapData = async () => {
    setLoading(true);
    try {
      const [storedGaps, storedReport] = await Promise.all([
        workspaceService.getResearchGaps(project.id),
        workspaceService.getResearchGapReport(project.id),
      ]);

      setGaps(storedGaps);
      setReport(storedReport);
      setIsEvidenceDirty(workspaceService.isEvidenceDirty(project.id));
    } catch {
      toast.error("Failed to load research gap data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGapData();
  }, [project.id]);

  // AI Gap Analysis Action
  const handleAnalyzeGapWithAI = async () => {
    if (!project.papers || project.papers.length === 0) {
      toast.error("No research papers available in this workspace to analyze gaps.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      setAnalysisStep("Analyzing research evidence...");
      const [evidence, notes, findings] = await Promise.all([
        workspaceService.getEvidenceMatrix(project.id),
        workspaceService.getNotes(project.id),
        workspaceService.getFindings(project.id),
      ]);

      await new Promise((r) => setTimeout(r, 400));
      setAnalysisStep("Extracting methodologies & architectures...");
      await new Promise((r) => setTimeout(r, 400));
      setAnalysisStep("Comparing findings across studies...");
      await new Promise((r) => setTimeout(r, 400));
      setAnalysisStep("Identifying limitations & underexplored areas...");
      await new Promise((r) => setTimeout(r, 400));
      setAnalysisStep("Generating potential research gaps...");

      // Retain already verified gaps
      const verifiedGaps = gaps.filter((g) => g.verified);

      const generatedReport = await analyzeResearchGapWithAI({
        project,
        evidence,
        notes,
        findings,
        existingVerifiedGaps: verifiedGaps,
      });

      await workspaceService.saveResearchGapReport(project.id, generatedReport);
      setReport(generatedReport);
      setGaps(generatedReport.gaps);
      setIsEvidenceDirty(false);
      toast.success(`Discovered ${generatedReport.gaps.length} evidence-backed research gaps!`);
    } catch (err) {
      setAnalysisError("Unable to analyze the research at the moment.");
      toast.error("Research gap analysis failed.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (gap: ResearchGapEntry) => {
    setEditingGap(gap);
    setFormTitle(gap.title);
    setFormDescription(gap.description);
    setFormPapers(gap.supporting_papers?.join(", ") || "");
    setFormConfidence(gap.confidence);
    setFormCategory(gap.category || "Methodological Gap");
    setFormVerified(!!gap.verified);
    setIsCreatingNew(false);
    setIsEditOpen(true);
  };

  // Open New Gap Modal
  const handleOpenCreateNew = () => {
    setEditingGap(null);
    setFormTitle("");
    setFormDescription("");
    setFormPapers(project.papers?.[0]?.title ? project.papers[0].title : "");
    setFormConfidence("High");
    setFormCategory("Methodological Gap");
    setFormVerified(false);
    setIsCreatingNew(true);
    setIsEditOpen(true);
  };

  // Save Gap (Create or Edit)
  const handleSaveGapForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) return;

    const supportingPapersList = formPapers
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    try {
      if (isCreatingNew) {
        const created = await workspaceService.createResearchGap(project.id, {
          title: formTitle.trim(),
          description: formDescription.trim(),
          supporting_papers: supportingPapersList,
          confidence: formConfidence,
          category: formCategory,
          verified: formVerified,
        });
        setGaps((prev) => [created, ...prev]);
        toast.success("New research gap created");
      } else if (editingGap) {
        const updated: ResearchGapEntry = {
          ...editingGap,
          title: formTitle.trim(),
          description: formDescription.trim(),
          supporting_papers: supportingPapersList,
          confidence: formConfidence,
          category: formCategory,
          verified: formVerified,
          updated_at: new Date().toISOString(),
        };
        await workspaceService.saveResearchGap(project.id, updated);
        setGaps((prev) => prev.map((g) => (g.gap_id === updated.gap_id ? updated : g)));
        toast.success("Research gap updated");
      }
      setIsEditOpen(false);
    } catch {
      toast.error("Failed to save research gap");
    }
  };

  // Delete Gap Handler
  const handleDeleteGap = async (gapId: string, title: string) => {
    if (!confirm(`Delete research gap "${title.slice(0, 50)}..."?`)) return;
    try {
      await workspaceService.deleteResearchGap(project.id, gapId);
      setGaps((prev) => prev.filter((g) => g.gap_id !== gapId));
      toast.success("Research gap deleted");
    } catch {
      toast.error("Failed to delete research gap");
    }
  };

  // Toggle Verified Status
  const handleToggleVerified = async (gap: ResearchGapEntry) => {
    try {
      const updated: ResearchGapEntry = {
        ...gap,
        verified: !gap.verified,
        updated_at: new Date().toISOString(),
      };
      await workspaceService.saveResearchGap(project.id, updated);
      setGaps((prev) => prev.map((g) => (g.gap_id === gap.gap_id ? updated : g)));
      toast.success(updated.verified ? "Marked as verified research gap" : "Unverified research gap");
    } catch {
      toast.error("Failed to update verification status");
    }
  };

  const getConfidenceBadge = (confidence: GapConfidence) => {
    switch (confidence) {
      case "High":
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "Medium":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Low":
        return "bg-amber-50 text-amber-700 border-amber-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Empty state check
  if (!loading && (!project.papers || project.papers.length === 0)) {
    return (
      <div className="card-mice text-center py-16 bg-white p-6 max-w-2xl mx-auto space-y-4 my-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
          <Search className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[#172033]">
            Add research papers to identify meaningful research gaps.
          </h2>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            Research gaps are strictly formulated from the literature and empirical evidence gathered for{" "}
            <span className="font-mono font-semibold text-[#172033]">{project.id}</span>.
          </p>
        </div>
        <Button
          onClick={() => onNavigateTab("papers")}
          className="bg-[#243B64] hover:bg-[#1D3154] text-white text-xs font-semibold px-4 h-9 rounded-lg shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Go to Papers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto py-2">
      {/* Back to Research Action Bar */}
      <div className="flex items-center justify-between pb-1">
        <button
          type="button"
          onClick={() => onNavigateTab("overview")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#536DFE] hover:text-[#243B64] transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-100 touch-target-44"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Research</span>
        </button>

        <span className="text-xs text-slate-500 font-medium">
          Research ID: <strong className="font-mono text-slate-700">{project.id}</strong>
        </span>
      </div>

      {/* 🧭 Unified Research Gap Analysis Header */}
      <ResearchModuleHeader
        icon={<Search className="w-6 h-6 text-amber-600" />}
        iconBgClass="bg-amber-50 text-amber-600 border-amber-200"
        title="Research Gap Analysis"
        countLabel={`${gaps.length} Gaps Identified`}
        countBadgeClass="bg-amber-50 text-amber-800 border-amber-200"
        description="Analyze existing research to identify supported research gaps."
        researchTitle={project.title}
        researchId={project.id}
        stageName="Research Gap"
        isStageCompleted={isStageCompleted}
        onToggleStageCompletion={onToggleStageCompletion}
        aiAction={{
          label: "Analyze Research Gap with AI",
          loadingLabel: "Analyzing Gaps...",
          onClick: handleAnalyzeGapWithAI,
          isLoading: isAnalyzing,
          disabled: loading,
        }}
        secondaryActions={
          <button
            type="button"
            onClick={handleOpenCreateNew}
            className="h-9 px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Custom Gap</span>
          </button>
        }
        banner={
          <>
            {/* 🔗 CONNECTION ALERT: Evidence Matrix Changed */}
            {isEvidenceDirty && (
              <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl flex items-center justify-between gap-3 animate-fade-slide">
                <div className="flex items-center gap-2 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <strong>Evidence Matrix updated:</strong> Literature or evidence records have changed since the last gap analysis.
                  </div>
                </div>

                <Button
                  onClick={handleAnalyzeGapWithAI}
                  disabled={isAnalyzing}
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl h-8 px-3 shrink-0 shadow-2xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Re-analyze Research Gap
                </Button>
              </div>
            )}

            {/* ⏳ Animated Multi-Step Progress State */}
            {isAnalyzing && (
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2 animate-fade-slide">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                  <span>{analysisStep}</span>
                </div>
                <div className="w-full bg-blue-200/60 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full animate-pulse w-3/4 transition-all" />
                </div>
                <p className="text-[11px] text-blue-700">
                  Evaluating evidence matrix, cross-referencing findings, and detecting recurring empirical bottlenecks.
                </p>
              </div>
            )}

            {/* ⚠️ Error State */}
            {analysisError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{analysisError}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={handleAnalyzeGapWithAI}
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs rounded-xl h-8 px-3"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={() => setAnalysisError(null)}
                    variant="outline"
                    size="sm"
                    className="text-xs rounded-xl h-8 px-3 border-rose-200 text-rose-700 hover:bg-rose-100"
                  >
                    Continue Manually
                  </Button>
                </div>
              </div>
            )}
          </>
        }
      />

      {/* 📚 6 MANDATORY SECTIONS */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          <div className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* 1. Existing Research Summary */}
          {report?.existing_research && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => toggleSectionCollapse("existing")}
                className="w-full flex items-center justify-between p-4 sm:p-5 bg-white hover:bg-slate-50/80 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold font-heading text-slate-900 uppercase tracking-wider">
                    1. Existing Research
                  </h3>
                </div>
                {collapsedSections["existing"] ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {!collapsedSections["existing"] && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-0 animate-fade-slide">
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 font-sans">
                    {report.existing_research}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 2. Common Approaches */}
          {report?.common_approaches && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => toggleSectionCollapse("approaches")}
                className="w-full flex items-center justify-between p-4 sm:p-5 bg-white hover:bg-slate-50/80 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold font-heading text-slate-900 uppercase tracking-wider">
                    2. Common Approaches in Literature
                  </h3>
                </div>
                {collapsedSections["approaches"] ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {!collapsedSections["approaches"] && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-0 animate-fade-slide">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* Methods & Algorithms */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                      <span className="font-bold text-slate-900 block">Methods & Algorithms</span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          ...(report.common_approaches.methods || []),
                          ...(report.common_approaches.algorithms || []),
                        ].map((m, i) => (
                          <span
                            key={i}
                            className="bg-blue-50 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-200"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Datasets & Benchmarks */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                      <span className="font-bold text-slate-900 block">Standard Datasets</span>
                      <div className="flex flex-wrap gap-1">
                        {(report.common_approaches.datasets || []).map((d, i) => (
                          <span
                            key={i}
                            className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Technologies & Approaches */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                      <span className="font-bold text-slate-900 block">Technologies & Paradigms</span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          ...(report.common_approaches.technologies || []),
                          ...(report.common_approaches.research_approaches || []),
                        ].map((t, i) => (
                          <span
                            key={i}
                            className="bg-purple-50 text-purple-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-purple-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3 & 4. Limitations & Missing Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 3. Limitations */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => toggleSectionCollapse("limitations")}
                className="w-full flex items-center justify-between p-4 sm:p-5 bg-white hover:bg-slate-50/80 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold font-heading text-slate-900 uppercase tracking-wider">
                    3. Limitations in Existing Research
                  </h3>
                </div>
                {collapsedSections["limitations"] ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {!collapsedSections["limitations"] && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-0 animate-fade-slide">
                  <ul className="text-xs text-slate-700 space-y-2 list-disc pl-5">
                    {(report?.limitations_in_existing_research || [
                      "Predominant reliance on retrospective evaluation with limited prospective real-world deployment.",
                      "Sensitivity to sensor and acquisition distribution shift.",
                    ]).map((lim, i) => (
                      <li key={i} className="leading-relaxed">
                        {lim}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 4. Missing Areas */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => toggleSectionCollapse("missing")}
                className="w-full flex items-center justify-between p-4 sm:p-5 bg-white hover:bg-slate-50/80 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold font-heading text-slate-900 uppercase tracking-wider">
                    4. Missing Areas in Literature
                  </h3>
                </div>
                {collapsedSections["missing"] ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {!collapsedSections["missing"] && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-0 animate-fade-slide">
                  <ul className="text-xs text-slate-700 space-y-2 list-disc pl-5">
                    {(report?.missing_areas || [
                      "Standardized multi-site double-blind validation protocols.",
                      "Longitudinal real-time inference latency benchmarks under low power.",
                    ]).map((miss, i) => (
                      <li key={i} className="leading-relaxed">
                        {miss}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* 5. Contradictions (if any) */}
          {report?.contradictions && report.contradictions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => toggleSectionCollapse("contradictions")}
                className="w-full flex items-center justify-between p-4 sm:p-5 bg-white hover:bg-slate-50/80 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold font-heading text-slate-900 uppercase tracking-wider">
                    5. Cross-Study Contradictions
                  </h3>
                </div>
                {collapsedSections["contradictions"] ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {!collapsedSections["contradictions"] && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-0 space-y-2.5 animate-fade-slide">
                  {report.contradictions.map((c, i) => (
                    <div
                      key={i}
                      className="p-3.5 bg-rose-50/50 border border-rose-200/80 rounded-xl space-y-1 text-xs"
                    >
                      <div className="font-bold text-rose-900">{c.topic}</div>
                      <p className="text-rose-800">{c.description}</p>
                      <div className="pt-1 text-[11px] text-rose-700">
                        <strong>Conflicting Sources:</strong> {c.conflicting_sources?.join(" vs ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. POTENTIAL RESEARCH GAPS (Interactive Cards) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleSectionCollapse("gaps")}
              className="w-full flex items-center justify-between p-4 sm:p-5 bg-white hover:bg-slate-50/80 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold font-heading text-slate-900 uppercase tracking-wider">
                  6. Potential Research Gaps ({gaps.length})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[11px] text-slate-400 italic">
                  Framed as actionable empirical opportunities
                </span>
                {collapsedSections["gaps"] ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {!collapsedSections["gaps"] && (
              <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-0 space-y-4 animate-fade-slide">
                {gaps.map((gap, index) => (
                  <div
                    key={gap.gap_id || index}
                    onClick={() => {
                      setSelectedGapForSheet(gap);
                      setIsSheetOpen(true);
                    }}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 cursor-pointer ${
                      gap.verified
                        ? "bg-emerald-50/15 border-emerald-300 ring-1 ring-emerald-200/50 shadow-2xs"
                        : "bg-white border-slate-200 hover:border-blue-300 shadow-2xs"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Gap #{index + 1}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getConfidenceBadge(
                              gap.confidence
                            )}`}
                          >
                            {gap.confidence} Confidence
                          </span>

                          {gap.category && (
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {gap.category}
                            </span>
                          )}

                          {gap.verified && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-700" />
                              Verified by Researcher
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold font-heading text-slate-900 leading-snug">
                          {gap.title}
                        </h4>
                      </div>

                      {/* Action Controls */}
                      <div
                        className="flex items-center gap-1 shrink-0 self-end sm:self-start pt-1 sm:pt-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          onClick={() => handleToggleVerified(gap)}
                          variant="outline"
                          size="sm"
                          className={`text-xs h-8 px-2.5 rounded-xl border ${
                            gap.verified
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : "text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                          title={gap.verified ? "Click to unverify" : "Click to mark as verified research gap"}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                          <span>{gap.verified ? "Verified" : "Verify"}</span>
                        </Button>

                        <Button
                          onClick={() => handleOpenEdit(gap)}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-slate-600 text-xs rounded-lg"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>

                        <Button
                          onClick={() => handleDeleteGap(gap.gap_id, gap.title)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg touch-target-44"
                          title="Delete gap"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      {gap.description}
                    </p>

                    {/* Supporting Papers Evidence */}
                    {gap.supporting_papers && gap.supporting_papers.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 pt-1">
                        <strong className="text-slate-700 text-[11px]">Supporting Evidence:</strong>
                        {gap.supporting_papers.map((p, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded border border-blue-200 text-[11px] inline-flex items-center gap-1"
                          >
                            <BookOpen className="w-2.5 h-2.5" />
                            <span>{p}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📄 MODAL: Edit or Add Research Gap */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-fade-slide max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold font-heading text-slate-900">
                {isCreatingNew ? "Add Custom Research Gap" : "Edit Research Gap"}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGapForm} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Gap Title *</label>
                <Input
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Robustness Bottleneck Under In-the-Wild Domain Shift"
                  className="text-xs mt-1 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detailed explanation of what existing studies focus on versus what is missing..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Supporting Papers (comma-separated titles or IDs)
                </label>
                <Input
                  value={formPapers}
                  onChange={(e) => setFormPapers(e.target.value)}
                  placeholder="e.g. Paper Title 1, Paper Title 2"
                  className="text-xs mt-1 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Confidence</label>
                  <select
                    value={formConfidence}
                    onChange={(e) => setFormConfidence(e.target.value as GapConfidence)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-xl bg-white mt-1"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-xl bg-white mt-1"
                  >
                    <option value="Methodological Gap">Methodological Gap</option>
                    <option value="Dataset Gap">Dataset Gap</option>
                    <option value="Generalization Gap">Generalization Gap</option>
                    <option value="Evaluation Gap">Evaluation Gap</option>
                    <option value="Application Gap">Application Gap</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formVerified}
                    onChange={(e) => setFormVerified(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Mark as verified research gap (prevents auto-overwrite)</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
                >
                  Save Research Gap
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📱 BottomSheet: Mobile Gap Details */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setSelectedGapForSheet(null);
        }}
        title="Research Gap Details"
      >
        {selectedGapForSheet && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getConfidenceBadge(
                    selectedGapForSheet.confidence
                  )}`}
                >
                  {selectedGapForSheet.confidence} Confidence
                </span>
                {selectedGapForSheet.verified && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Verified
                  </span>
                )}
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 leading-snug">
                {selectedGapForSheet.title}
              </h3>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              {selectedGapForSheet.description}
            </div>

            {selectedGapForSheet.supporting_papers && selectedGapForSheet.supporting_papers.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-800">Supporting Literature</div>
                <div className="space-y-1">
                  {selectedGapForSheet.supporting_papers.map((p, i) => (
                    <div key={i} className="text-xs text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-100">
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <Button
                onClick={() => {
                  handleOpenEdit(selectedGapForSheet);
                  setIsSheetOpen(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-11 rounded-xl touch-target-44"
              >
                <Edit3 className="w-4 h-4 mr-1.5" />
                Edit Research Gap
              </Button>

              <Button
                onClick={() => {
                  handleToggleVerified(selectedGapForSheet);
                  setIsSheetOpen(false);
                }}
                variant="outline"
                className="w-full text-xs font-semibold h-11 rounded-xl touch-target-44 border-slate-200"
              >
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                {selectedGapForSheet.verified ? "Mark as Unverified" : "Mark as Verified"}
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
