import React, { useState, useEffect } from "react";
import {
  type ResearchProject,
  type ResearchEvidenceItem,
  type EvidenceStrength,
  type EvidenceComparisonSynthesis,
} from "@/types/research";
import { workspaceService } from "@/lib/services/workspace-service";
import {
  batchExtractEvidence,
  compareSelectedEvidence,
} from "@/lib/services/evidence-gap-ai-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import {
  Grid3X3,
  Search,
  Sparkles,
  PlusCircle,
  ExternalLink,
  Edit3,
  Trash2,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Filter,
  SlidersHorizontal,
  FileText,
  ShieldCheck,
  Eye,
  CheckSquare,
  Square,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { StageCompletionButton } from "../StageCompletionButton";
import { ResearchModuleHeader } from "../ResearchModuleHeader";

interface EvidenceMatrixTabProps {
  project: ResearchProject;
  onNavigateTab: (tab: string) => void;
  onUpdateProject?: (updated: ResearchProject) => void;
  isStageCompleted?: boolean;
  onToggleStageCompletion?: () => void;
}

export function EvidenceMatrixTab({
  project,
  onNavigateTab,
  onUpdateProject,
  isStageCompleted,
  onToggleStageCompletion,
}: EvidenceMatrixTabProps) {
  const [evidenceItems, setEvidenceItems] = useState<ResearchEvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [strengthFilter, setStrengthFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"year" | "title" | "strength">("year");

  // Selection for comparison
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonSynthesis, setComparisonSynthesis] = useState<EvidenceComparisonSynthesis | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // AI Extraction Progress
  const [isExtractingAI, setIsExtractingAI] = useState(false);
  const [extractionStep, setExtractionStep] = useState<string>("");

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<ResearchEvidenceItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Mobile Details BottomSheet
  const [detailItem, setDetailItem] = useState<ResearchEvidenceItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Expanded table rows
  const [expandedRowIds, setExpandedRowIds] = useState<Record<string, boolean>>({});

  // Expandable sections on mobile cards
  const [expandedCardSections, setExpandedCardSections] = useState<Record<string, Record<string, boolean>>>({});

  const toggleCardSection = (paperId: string, section: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCardSections((prev) => ({
      ...prev,
      [paperId]: {
        ...(prev[paperId] || {}),
        [section]: !prev[paperId]?.[section],
      },
    }));
  };

  // Mobile view mode toggle
  const [mobileViewMode, setMobileViewMode] = useState<"cards" | "table">("cards");

  const loadEvidence = async () => {
    setLoading(true);
    try {
      const items = await workspaceService.getEvidenceMatrix(project.id);
      setEvidenceItems(items);
    } catch {
      toast.error("Failed to load evidence matrix");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence();
  }, [project.id]);

  // Handle Multi-Select Checkboxes
  const toggleSelectPaper = (paperId: string) => {
    setSelectedPaperIds((prev) =>
      prev.includes(paperId) ? prev.filter((id) => id !== paperId) : [...prev, paperId]
    );
  };

  const selectAllPapers = () => {
    if (selectedPaperIds.length === filteredEvidence.length) {
      setSelectedPaperIds([]);
    } else {
      setSelectedPaperIds(filteredEvidence.map((e) => e.paper_id));
    }
  };

  // AI Extraction Action
  const handleExtractWithAI = async () => {
    if (!project.papers || project.papers.length === 0) {
      toast.error("No research papers available in this workspace to extract from.");
      return;
    }

    setIsExtractingAI(true);
    setExtractionStep("Analyzing research evidence...");

    try {
      await new Promise((r) => setTimeout(r, 400));
      setExtractionStep("Extracting methodologies & architectures...");
      await new Promise((r) => setTimeout(r, 400));
      setExtractionStep("Synthesizing datasets & empirical findings...");
      await new Promise((r) => setTimeout(r, 300));
      setExtractionStep("Evaluating evidence strengths & limitations...");

      const extracted = await batchExtractEvidence(
        project.id,
        project.papers,
        project.research_field
      );

      await workspaceService.saveEvidenceMatrix(project.id, extracted);
      setEvidenceItems(extracted);
      toast.success(`Successfully extracted evidence across ${extracted.length} research papers!`);
    } catch {
      toast.error("Evidence extraction encountered an issue.");
    } finally {
      setIsExtractingAI(false);
      setExtractionStep("");
    }
  };

  // Compare Evidence Action
  const handleCompareEvidence = async () => {
    const selected = evidenceItems.filter((e) => selectedPaperIds.includes(e.paper_id));
    if (selected.length < 2) {
      toast.info("Please select at least 2 papers using the checkboxes to compare evidence.");
      return;
    }

    setIsComparing(true);
    try {
      const synthesis = await compareSelectedEvidence(selected, project.research_field);
      setComparisonSynthesis(synthesis);
      await workspaceService.saveEvidenceComparison(project.id, synthesis);
      setIsComparisonOpen(true);
    } catch {
      toast.error("Failed to compare evidence");
    } finally {
      setIsComparing(false);
    }
  };

  // Save Edit Handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await workspaceService.saveEvidenceItem(project.id, editingItem);
      setEvidenceItems((prev) =>
        prev.map((it) => (it.paper_id === editingItem.paper_id ? editingItem : it))
      );
      setIsEditOpen(false);
      setEditingItem(null);
      toast.success("Evidence item updated");
    } catch {
      toast.error("Failed to update evidence item");
    }
  };

  // Remove Evidence / Paper Handler
  const handleRemoveItem = async (paperId: string, title: string) => {
    if (!confirm(`Remove "${title.slice(0, 50)}..." from Evidence Matrix?`)) return;
    try {
      await workspaceService.deleteEvidenceItem(project.id, paperId);
      await workspaceService.removePaper(project.id, paperId);
      const updatedProject = await workspaceService.getProjectById(project.id);
      if (updatedProject && onUpdateProject) onUpdateProject(updatedProject);
      setEvidenceItems((prev) => prev.filter((it) => it.paper_id !== paperId));
      setSelectedPaperIds((prev) => prev.filter((id) => id !== paperId));
      toast.success("Paper and evidence removed from workspace");
    } catch {
      toast.error("Failed to remove evidence item");
    }
  };

  const toggleRowExpand = (id: string) => {
    setExpandedRowIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter and sort items
  const filteredEvidence = evidenceItems
    .filter((it) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        it.paper_title.toLowerCase().includes(q) ||
        it.research_problem.toLowerCase().includes(q) ||
        it.methodology.toLowerCase().includes(q) ||
        it.dataset.toLowerCase().includes(q) ||
        it.key_finding.toLowerCase().includes(q) ||
        it.limitations.toLowerCase().includes(q);

      const matchesStrength =
        strengthFilter === "All" || it.evidence_strength === strengthFilter;

      return matchesSearch && matchesStrength;
    })
    .sort((a, b) => {
      if (sortBy === "year") return (b.year || 0) - (a.year || 0);
      if (sortBy === "title") return a.paper_title.localeCompare(b.paper_title);
      if (sortBy === "strength") {
        const order: Record<EvidenceStrength, number> = {
          Strong: 4,
          Moderate: 3,
          Weak: 2,
          Insufficient: 1,
        };
        return order[b.evidence_strength] - order[a.evidence_strength];
      }
      return 0;
    });

  const getStrengthBadgeClass = (strength: EvidenceStrength) => {
    switch (strength) {
      case "Strong":
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "Moderate":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Weak":
        return "bg-amber-50 text-amber-700 border-amber-300";
      case "Insufficient":
        return "bg-rose-50 text-rose-700 border-rose-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Empty state check
  if (!loading && (!project.papers || project.papers.length === 0)) {
    return (
      <div className="card-mice text-center py-16 bg-white p-6 max-w-2xl mx-auto space-y-4 my-8">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto">
          <Grid3X3 className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold font-heading text-slate-900">
            No research papers available yet.
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Collect literature for Research ID{" "}
            <span className="font-mono font-semibold text-slate-700">{project.id}</span> to
            populate the dynamic Evidence Matrix.
          </p>
        </div>
        <Button
          onClick={() => onNavigateTab("papers")}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 h-10 rounded-xl shadow-xs"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Add Papers
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

      {/* 🧭 Unified Evidence Matrix Header */}
      <ResearchModuleHeader
        icon={<Grid3X3 className="w-6 h-6 text-blue-600" />}
        iconBgClass="bg-blue-50 text-blue-600 border-blue-200"
        title="Evidence Matrix"
        countLabel={`${evidenceItems.length} Papers Indexed`}
        countBadgeClass="bg-blue-50 text-blue-700 border-blue-200"
        description="Cross-study structured evidence extraction strictly scoped to the current research."
        researchId={project.id}
        stageName="Evidence Matrix"
        isStageCompleted={isStageCompleted}
        onToggleStageCompletion={onToggleStageCompletion}
        aiAction={{
          label: "Extract Evidence with AI",
          loadingLabel: "Extracting Evidence...",
          onClick: handleExtractWithAI,
          isLoading: isExtractingAI,
          disabled: loading || !project.papers || project.papers.length === 0,
        }}
        secondaryActions={
          <>
            <button
              type="button"
              onClick={handleCompareEvidence}
              disabled={isComparing || selectedPaperIds.length < 2}
              className="h-9 px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              title={selectedPaperIds.length < 2 ? "Select at least 2 papers via checkboxes to compare" : "Compare selected papers"}
            >
              {isComparing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : (
                <Layers className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span>Compare Evidence ({selectedPaperIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab("papers")}
              className="h-9 px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Add Paper</span>
            </button>
          </>
        }
        banner={
          isExtractingAI ? (
            <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center gap-3 animate-fade-slide">
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-blue-900 block">{extractionStep}</span>
                <span className="text-[11px] text-blue-700">
                  Extracting methodologies, datasets, and boundary conditions without fabrication.
                </span>
              </div>
            </div>
          ) : null
        }
      />

      {/* Search, Filter & Sort Controls - spaced cleanly below header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by paper, problem, methodology, dataset, findings..."
            className="w-full h-12 pl-11 pr-4 text-[14px] rounded-xl bg-white border border-slate-200 shadow-2xs placeholder:text-slate-400 focus:outline-none focus:border-[#536DFE] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Strength Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Strength:</span>
            <select
              value={strengthFilter}
              onChange={(e) => setStrengthFilter(e.target.value)}
              className="h-12 px-3.5 text-[14px] font-medium bg-white border border-slate-200 rounded-xl shadow-2xs text-slate-700 focus:outline-none focus:border-[#536DFE] cursor-pointer"
            >
              <option value="All">All Strengths</option>
              <option value="Strong">Strong</option>
              <option value="Moderate">Moderate</option>
              <option value="Weak">Weak</option>
              <option value="Insufficient">Insufficient</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-12 px-3.5 text-[14px] font-medium bg-white border border-slate-200 rounded-xl shadow-2xs text-slate-700 focus:outline-none focus:border-[#536DFE] cursor-pointer"
            >
              <option value="year">Year (Newest)</option>
              <option value="title">Paper Title (A-Z)</option>
              <option value="strength">Evidence Strength</option>
            </select>
          </div>

            {/* Mobile View Toggle */}
            <div className="md:hidden flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setMobileViewMode("cards")}
                className={`px-2 py-1 text-[10px] font-bold rounded ${
                  mobileViewMode === "cards" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                }`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setMobileViewMode("table")}
                className={`px-2 py-1 text-[10px] font-bold rounded ${
                  mobileViewMode === "table" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

      {/* 📊 Evidence Matrix Content Canvas */}
      {loading ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 space-y-4">
          <div className="h-6 w-48 bg-slate-100 animate-pulse rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      ) : filteredEvidence.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-2">
          <Search className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No matching evidence found</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search query or strength filters.
          </p>
        </div>
      ) : (
        <>
          {/* 💻 TABLE VIEW (Desktop or Mobile Table Mode) */}
          <div
            className={`${
              mobileViewMode === "cards" ? "hidden md:block" : "block"
            } bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-20 bg-[#F8FAFC] shadow-2xs border-b border-[#E2E8F0] select-none">
                  <tr className="bg-[#F8FAFC] text-[#243B64] font-bold uppercase tracking-wider text-[10px]">
                    <th className="sticky top-0 bg-[#F8FAFC] py-3 px-3 w-10 text-center">
                      <button
                        type="button"
                        onClick={selectAllPapers}
                        className="text-slate-400 hover:text-blue-600 cursor-pointer"
                        title="Select All"
                      >
                        {selectedPaperIds.length === filteredEvidence.length ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="sticky top-0 bg-[#F8FAFC] py-3 px-4 min-w-[220px]">Paper</th>
                    <th className="sticky top-0 bg-[#F8FAFC] py-3 px-4 min-w-[180px]">Research Problem</th>
                    <th className="sticky top-0 bg-[#F8FAFC] py-3 px-4 min-w-[180px]">Methodology</th>
                    <th className="sticky top-0 bg-[#F8FAFC] py-3 px-4 min-w-[150px]">Dataset</th>
                    <th className="sticky top-0 bg-[#F8FAFC] py-3 px-4 min-w-[200px]">Key Finding</th>
                    <th className="sticky top-0 bg-[#F8FAFC] py-3 px-4 min-w-[180px]">Limitations</th>
                    <th className="sticky top-0 bg-[#F8FAFC] py-3 px-4 min-w-[130px]">Evidence Strength</th>
                    <th className="sticky top-0 bg-[#F8FAFC] py-3 px-3 w-20 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredEvidence.map((item, idx) => {
                    const isSelected = selectedPaperIds.includes(item.paper_id);
                    const isExpanded = !!expandedRowIds[item.paper_id];

                    return (
                      <React.Fragment key={item.paper_id}>
                        <tr
                          className={`transition-colors ${
                            isSelected
                              ? "bg-blue-50/40"
                              : idx % 2 === 0
                              ? "bg-white hover:bg-slate-50/70"
                              : "bg-slate-50/30 hover:bg-slate-50/70"
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3 px-3 text-center align-top pt-3.5">
                            <button
                              type="button"
                              onClick={() => toggleSelectPaper(item.paper_id)}
                              className="text-slate-400 hover:text-blue-600 cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          {/* Paper Header & Details */}
                          <td className="py-3 px-4 align-top space-y-1">
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-bold text-slate-900 leading-snug hover:text-blue-600 transition-colors">
                                {item.paper_title}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleRowExpand(item.paper_id)}
                                className="text-slate-400 hover:text-slate-600 p-0.5 shrink-0"
                                title="Toggle Abstract & Full Info"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                              <span className="text-blue-700 font-bold font-mono">[{item.year}]</span>
                              <span>&bull;</span>
                              <span className="truncate max-w-[130px]">{item.venue || "Academic Publication"}</span>
                            </div>

                            <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                              {item.authors?.join(", ") || "Unknown Authors"}
                            </div>
                          </td>

                          {/* Research Problem */}
                          <td className="py-3 px-4 align-top">
                            <p className="line-clamp-3 text-xs leading-relaxed text-slate-700">
                              {item.research_problem}
                            </p>
                          </td>

                          {/* Methodology */}
                          <td className="py-3 px-4 align-top">
                            <span className="bg-slate-100/90 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium inline-block border border-slate-200/60 line-clamp-3">
                              {item.methodology}
                            </span>
                          </td>

                          {/* Dataset */}
                          <td className="py-3 px-4 align-top text-xs text-slate-700">
                            <p className="line-clamp-2">{item.dataset}</p>
                          </td>

                          {/* Key Finding */}
                          <td className="py-3 px-4 align-top text-xs text-slate-700">
                            <p className="line-clamp-3 font-medium text-slate-800">
                              {item.key_finding}
                            </p>
                          </td>

                          {/* Limitations */}
                          <td className="py-3 px-4 align-top text-xs text-slate-600">
                            <p className="line-clamp-3 italic">{item.limitations}</p>
                          </td>

                          {/* Evidence Strength */}
                          <td className="py-3 px-4 align-top">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStrengthBadgeClass(
                                item.evidence_strength
                              )}`}
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>{item.evidence_strength}</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 align-top text-right shrink-0">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                onClick={() => {
                                  setEditingItem(item);
                                  setIsEditOpen(true);
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg touch-target-44"
                                title="Edit evidence record"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                onClick={() => handleRemoveItem(item.paper_id, item.paper_title)}
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg touch-target-44"
                                title="Remove paper from matrix"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Row Content */}
                        {isExpanded && (
                          <tr className="bg-slate-50/70 border-b border-slate-100">
                            <td colSpan={9} className="p-4 space-y-3">
                              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                                  <span>Extended Paper Evidence & Research Contribution</span>
                                  {item.url && (
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                      <span>Original DOI Source</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                                <div className="text-xs text-slate-600 leading-relaxed">
                                  <strong>Research Contribution:</strong> {item.research_contribution || "Not identified in source"}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 📱 MOBILE CARDS VIEW (Mobile Card Mode) */}
          <div className={`${mobileViewMode === "cards" ? "block md:hidden" : "hidden"} space-y-3`}>
            {filteredEvidence.map((item) => {
              const isSelected = selectedPaperIds.includes(item.paper_id);

              return (
                <div
                  key={item.paper_id}
                  onClick={() => {
                    setDetailItem(item);
                    setIsDetailOpen(true);
                  }}
                  className={`bg-white p-4 rounded-2xl border transition-all space-y-3 cursor-pointer ${
                    isSelected ? "border-blue-400 bg-blue-50/20" : "border-slate-200/90 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {item.year}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold truncate max-w-[150px]">
                          {item.venue}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${getStrengthBadgeClass(
                            item.evidence_strength
                          )}`}
                        >
                          {item.evidence_strength}
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                        {item.paper_title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectPaper(item.paper_id);
                      }}
                      className="text-slate-400 p-1 shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Expandable Evidence Sections (Mobile Accordion) */}
                  <div className="space-y-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                    {/* Methodology */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={(e) => toggleCardSection(item.paper_id, "methodology", e)}
                        className="w-full flex items-center justify-between p-2.5 bg-slate-50/80 text-xs font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <span>Methodology</span>
                        {expandedCardSections[item.paper_id]?.methodology ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </button>
                      {expandedCardSections[item.paper_id]?.methodology && (
                        <div className="p-2.5 bg-white text-xs text-slate-600 border-t border-slate-200 leading-relaxed animate-fade-slide">
                          {item.methodology || "No methodology specified."}
                        </div>
                      )}
                    </div>

                    {/* Dataset */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={(e) => toggleCardSection(item.paper_id, "dataset", e)}
                        className="w-full flex items-center justify-between p-2.5 bg-slate-50/80 text-xs font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <span>Dataset</span>
                        {expandedCardSections[item.paper_id]?.dataset ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </button>
                      {expandedCardSections[item.paper_id]?.dataset && (
                        <div className="p-2.5 bg-white text-xs text-slate-600 border-t border-slate-200 leading-relaxed animate-fade-slide">
                          {item.dataset || "No dataset specified."}
                        </div>
                      )}
                    </div>

                    {/* Key Finding */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={(e) => toggleCardSection(item.paper_id, "finding", e)}
                        className="w-full flex items-center justify-between p-2.5 bg-slate-50/80 text-xs font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <span>Key Finding</span>
                        {expandedCardSections[item.paper_id]?.finding ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </button>
                      {expandedCardSections[item.paper_id]?.finding && (
                        <div className="p-2.5 bg-white text-xs text-slate-800 font-medium border-t border-slate-200 leading-relaxed animate-fade-slide">
                          {item.key_finding || "No empirical findings recorded."}
                        </div>
                      )}
                    </div>

                    {/* Limitations */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={(e) => toggleCardSection(item.paper_id, "limitations", e)}
                        className="w-full flex items-center justify-between p-2.5 bg-slate-50/80 text-xs font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <span>Limitations</span>
                        {expandedCardSections[item.paper_id]?.limitations ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </button>
                      {expandedCardSections[item.paper_id]?.limitations && (
                        <div className="p-2.5 bg-white text-xs text-slate-600 italic border-t border-slate-200 leading-relaxed animate-fade-slide">
                          {item.limitations || "No explicit limitations noted."}
                        </div>
                      )}
                    </div>

                    {/* Evidence Strength */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={(e) => toggleCardSection(item.paper_id, "strength", e)}
                        className="w-full flex items-center justify-between p-2.5 bg-slate-50/80 text-xs font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <span>Evidence Strength</span>
                        {expandedCardSections[item.paper_id]?.strength ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </button>
                      {expandedCardSections[item.paper_id]?.strength && (
                        <div className="p-2.5 bg-white text-xs border-t border-slate-200 flex items-center justify-between animate-fade-slide">
                          <span className="text-slate-500">Methodological Rigor:</span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStrengthBadgeClass(
                              item.evidence_strength
                            )}`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>{item.evidence_strength}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[11px] text-blue-600 font-semibold">Tap card for full paper source &rarr;</span>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        onClick={() => {
                          setEditingItem(item);
                          setIsEditOpen(true);
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-slate-600 text-xs rounded-lg"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleRemoveItem(item.paper_id, item.paper_title)}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-rose-600 text-xs rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 📄 MODAL 1: Edit Evidence Record */}
      {isEditOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-fade-slide max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Edit Evidence Record
                </h3>
                <p className="text-xs text-slate-500 font-normal truncate max-w-lg">
                  {editingItem.paper_title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Research Problem</label>
                <textarea
                  rows={2}
                  value={editingItem.research_problem}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, research_problem: e.target.value })
                  }
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none mt-1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Methodology</label>
                  <textarea
                    rows={2}
                    value={editingItem.methodology}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, methodology: e.target.value })
                    }
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Dataset</label>
                  <textarea
                    rows={2}
                    value={editingItem.dataset}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, dataset: e.target.value })
                    }
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Key Finding</label>
                <textarea
                  rows={3}
                  value={editingItem.key_finding}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, key_finding: e.target.value })
                  }
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Limitations</label>
                <textarea
                  rows={2}
                  value={editingItem.limitations}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, limitations: e.target.value })
                  }
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none mt-1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Research Contribution</label>
                  <input
                    type="text"
                    value={editingItem.research_contribution || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, research_contribution: e.target.value })
                    }
                    className="w-full text-xs p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Evidence Strength</label>
                  <select
                    value={editingItem.evidence_strength}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        evidence_strength: e.target.value as EvidenceStrength,
                      })
                    }
                    className="w-full text-xs p-2 border border-slate-300 rounded-xl bg-white mt-1"
                  >
                    <option value="Strong">Strong</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Weak">Weak</option>
                    <option value="Insufficient">Insufficient</option>
                  </select>
                </div>
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
                  Save Modifications
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📑 MODAL 2: Compare Evidence Synthesis Modal */}
      {isComparisonOpen && comparisonSynthesis && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-fade-slide max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Cross-Study Evidence Comparison
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsComparisonOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Common Findings */}
              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80 space-y-1.5">
                <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Common Findings & Consensus</span>
                </h4>
                <ul className="list-disc pl-5 text-emerald-800 space-y-1">
                  {comparisonSynthesis.common_findings.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              {/* Conflicting Findings */}
              {comparisonSynthesis.conflicting_findings.length > 0 && (
                <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 space-y-1.5">
                  <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Conflicting Conclusions & Discrepancies</span>
                  </h4>
                  <ul className="list-disc pl-5 text-amber-800 space-y-1">
                    {comparisonSynthesis.conflicting_findings.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Methodologies & Datasets Divergence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900">Different Methodologies</h4>
                  <ul className="list-disc pl-5 text-slate-600 space-y-1">
                    {comparisonSynthesis.different_methodologies.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900">Different Datasets</h4>
                  <ul className="list-disc pl-5 text-slate-600 space-y-1">
                    {comparisonSynthesis.different_datasets.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Common Limitations */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900">Research Limitations Across Corpus</h4>
                <ul className="list-disc pl-5 text-slate-600 space-y-1">
                  {comparisonSynthesis.research_limitations.map((lim, i) => (
                    <li key={i}>{lim}</li>
                  ))}
                </ul>
              </div>

              {/* Insufficient Evidence Areas */}
              {comparisonSynthesis.insufficient_evidence_areas.length > 0 && (
                <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200 space-y-1.5">
                  <h4 className="font-bold text-purple-900">Areas with Insufficient Evidence</h4>
                  <ul className="list-disc pl-5 text-purple-800 space-y-1">
                    {comparisonSynthesis.insufficient_evidence_areas.map((ins, i) => (
                      <li key={i}>{ins}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Button
                onClick={() => {
                  setIsComparisonOpen(false);
                  onNavigateTab("hypotheses");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
              >
                <span>Proceed to Research Gap &rarr;</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsComparisonOpen(false)}
                className="text-xs rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 📱 BottomSheet: Mobile Details */}
      <BottomSheet
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailItem(null);
        }}
        title="Evidence Details"
      >
        {detailItem && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStrengthBadgeClass(
                  detailItem.evidence_strength
                )}`}
              >
                {detailItem.evidence_strength} Evidence
              </span>
              <h3 className="font-heading font-bold text-base text-slate-900 leading-snug">
                {detailItem.paper_title}
              </h3>
              <p className="text-xs text-slate-500">
                {detailItem.authors.join(", ")} &bull; {detailItem.venue} ({detailItem.year})
              </p>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <strong className="text-slate-900 block mb-0.5">Research Problem:</strong>
                <p className="text-slate-700">{detailItem.research_problem}</p>
              </div>
              <div>
                <strong className="text-slate-900 block mb-0.5">Methodology:</strong>
                <p className="text-slate-700">{detailItem.methodology}</p>
              </div>
              <div>
                <strong className="text-slate-900 block mb-0.5">Dataset:</strong>
                <p className="text-slate-700">{detailItem.dataset}</p>
              </div>
              <div>
                <strong className="text-slate-900 block mb-0.5">Key Finding:</strong>
                <p className="text-slate-700 font-medium">{detailItem.key_finding}</p>
              </div>
              <div>
                <strong className="text-slate-900 block mb-0.5">Limitations:</strong>
                <p className="text-slate-700 italic">{detailItem.limitations}</p>
              </div>
              <div>
                <strong className="text-slate-900 block mb-0.5">Research Contribution:</strong>
                <p className="text-slate-700">{detailItem.research_contribution || "Not identified in source"}</p>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                onClick={() => {
                  setEditingItem(detailItem);
                  setIsDetailOpen(false);
                  setIsEditOpen(true);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-11 rounded-xl touch-target-44"
              >
                <Edit3 className="w-4 h-4 mr-1.5" />
                Edit Evidence Information
              </Button>

              {detailItem.url && (
                <a
                  href={detailItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 h-11 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors touch-target-44"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Original DOI Source
                </a>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
