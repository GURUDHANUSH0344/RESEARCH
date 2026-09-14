import React, { useState, useEffect } from "react";
import { type ResearchProject, type ResearchStatus } from "@/types/research";
import { workspaceService } from "@/lib/services/workspace-service";
import { DeleteResearchDialog } from "./DeleteResearchDialog";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Compass,
  PlusCircle,
  Search,
  BookOpen,
  FileText,
  Clock,
  ArrowRight,
  Copy,
  Trash2,
  Sparkles,
  Filter,
  SlidersHorizontal,
  FlaskConical,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface ResearchLibraryProps {
  onOpenResearch: (project: ResearchProject) => void;
  onOpenNewResearch: () => void;
  onOpenCropDemo: () => void;
  user: any;
}

export function ResearchLibrary({
  onOpenResearch,
  onOpenNewResearch,
  onOpenCropDemo,
  user,
}: ResearchLibraryProps) {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [notesCounts, setNotesCounts] = useState<Record<string, number>>({});
  const [findingsCounts, setFindingsCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"updated" | "created" | "progress" | "papers">("updated");

  // Mobile Filter BottomSheet State
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Deletion Dialog State
  const [projectToDelete, setProjectToDelete] = useState<ResearchProject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const list = await workspaceService.getProjects(user?.id);
      setProjects(list);

      // Fetch notes & findings count for each project
      const nCounts: Record<string, number> = {};
      const fCounts: Record<string, number> = {};
      for (const p of list) {
        const notes = await workspaceService.getNotes(p.id);
        nCounts[p.id] = notes.length;
        const findings = await workspaceService.getFindings(p.id);
        fCounts[p.id] = findings.length;
      }
      setNotesCounts(nCounts);
      setFindingsCounts(fCounts);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [user?.id]);

  const handleDuplicate = async (project: ResearchProject, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const duplicated = await workspaceService.duplicateProject(project.id);
      toast.success(`Duplicated "${project.title}" under new Research ID`);
      await loadProjects();
      onOpenResearch(duplicated);
    } catch {
      toast.error("Failed to duplicate research project");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await workspaceService.deleteProject(projectToDelete.id);
      toast.success(`Deleted research "${projectToDelete.title}" and all associated data`);
      setProjectToDelete(null);
      await loadProjects();
    } catch {
      toast.error("Failed to delete research project");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Sort Projects
  const filteredProjects = projects
    .filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.title.toLowerCase().includes(q) ||
        p.research_question.toLowerCase().includes(q) ||
        p.research_field.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);

      let matchesStatus = true;
      if (statusFilter === "all") {
        matchesStatus = true;
      } else if (statusFilter === "in_progress") {
        matchesStatus = p.status === "in_progress" || p.status === "active";
      } else if (statusFilter === "completed") {
        matchesStatus = p.status === "completed";
      } else if (statusFilter === "archived") {
        matchesStatus = p.status === "on_hold";
      }

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "created") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "progress") {
        return (b.progress || 0) - (a.progress || 0);
      }
      if (sortBy === "papers") {
        return (b.papers?.length || 0) - (a.papers?.length || 0);
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  // Calculate Global Stats
  const totalPapers = projects.reduce((acc, p) => acc + (p.papers?.length || 0), 0);
  const totalNotes = Object.values(notesCounts).reduce((acc, count) => acc + count, 0);
  const activeCount = projects.filter((p) => p.status === "active" || p.status === "in_progress").length;

  const getStatusBadge = (s: ResearchStatus) => {
    switch (s) {
      case "active":
      case "in_progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "on_hold":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const filterTabs = [
    { id: "all", label: "All" },
    { id: "in_progress", label: "In Progress" },
    { id: "completed", label: "Completed" },
    { id: "archived", label: "Archived" },
  ];

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto py-2 sm:py-4 px-1 sm:px-2">
      {/* 1. Header Card: Minimal Academic SaaS Style */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 md:p-7 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#EEF2FF] border border-indigo-100 flex items-center justify-center text-[#536DFE]">
                <Compass className="w-3.5 h-3.5" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#536DFE]">
                Research Compass &bull; Workspace
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#172033] leading-tight">
              Your Research
            </h1>

            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed font-normal">
              Continue your research or start something new.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            <Button
              onClick={onOpenCropDemo}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-slate-50 text-[#172033] border-[#E2E8F0] text-xs font-medium h-9 px-3.5 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#536DFE]" />
              <span>Demo Case</span>
            </Button>

            <Button
              onClick={onOpenNewResearch}
              size="sm"
              className="bg-[#243B64] hover:bg-[#1D3154] text-white text-xs font-semibold h-9 px-4 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Research</span>
            </Button>
          </div>
        </div>

        {/* Global Overview Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 pt-5 mt-5 border-t border-[#E2E8F0]">
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] font-medium block">Total Projects</span>
            <span className="text-xl font-semibold text-[#172033]">{projects.length}</span>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] font-medium block">In Progress</span>
            <span className="text-xl font-semibold text-[#536DFE]">{activeCount}</span>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] font-medium block">Papers Indexed</span>
            <span className="text-xl font-semibold text-[#172033]">{totalPapers}</span>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] font-medium block">Research Notes</span>
            <span className="text-xl font-semibold text-[#172033]">{totalNotes}</span>
          </div>
        </div>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your research..."
            className="pl-10 h-10 bg-white border-[#E2E8F0] text-xs text-[#172033] placeholder:text-[#94A3B8] rounded-lg shadow-2xs font-sans touch-target-44 focus-visible:ring-1 focus-visible:ring-[#536DFE]"
          />
        </div>

        {/* Mobile Filter Button (Visible on mobile, opens BottomSheet) */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 h-10 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#172033] shadow-2xs touch-target-44"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#536DFE]" />
            <span>Filter: {statusFilter.replace("_", " ")}</span>
          </button>
        </div>

        {/* Desktop / Tablet Filters & Sort Controls */}
        <div className="hidden sm:flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#E2E8F0] shadow-2xs">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-[#243B64] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-medium text-[#172033] bg-white border border-[#E2E8F0] rounded-lg px-3 h-10 shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#536DFE] cursor-pointer"
          >
            <option value="updated">Recently Updated</option>
            <option value="created">Recently Created</option>
            <option value="progress">Progress</option>
            <option value="papers">Paper Count</option>
          </select>
        </div>
      </div>

      {/* 3. Responsive Research Card Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-xl space-y-4 border border-[#E2E8F0] bg-white shadow-2xs"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-20 skeleton-shimmer rounded-md" />
                <div className="h-5 w-16 skeleton-shimmer rounded-full" />
              </div>
              <div className="space-y-2 pt-1">
                <div className="h-5 w-3/4 skeleton-shimmer rounded-md" />
                <div className="h-3.5 w-full skeleton-shimmer rounded-md" />
              </div>
              <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
                <div className="h-3 w-20 skeleton-shimmer rounded" />
                <div className="h-1.5 w-full skeleton-shimmer rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredProjects.map((proj, idx) => {
            const paperCount = proj.papers?.length || 0;
            const noteCount = notesCounts[proj.id] || 0;
            const findingCount = findingsCounts[proj.id] || 0;
            const progress = proj.progress || 0;

            // Formatted relative time
            const diffMinutes = Math.floor((Date.now() - new Date(proj.updated_at).getTime()) / (1000 * 60));
            let timeAgo = "Just now";
            if (diffMinutes >= 1440) {
              const days = Math.floor(diffMinutes / 1440);
              timeAgo = `${days}d ago`;
            } else if (diffMinutes >= 60) {
              const hours = Math.floor(diffMinutes / 60);
              timeAgo = `${hours}h ago`;
            } else if (diffMinutes > 0) {
              timeAgo = `${diffMinutes}m ago`;
            }

            return (
              <div
                key={proj.id}
                onClick={() => onOpenResearch(proj)}
                style={{ animationDelay: `${idx * 30}ms` }}
                className="bg-white p-5 sm:p-6 rounded-xl cursor-pointer flex flex-col justify-between space-y-4 border border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-sm transition-all duration-200 group relative"
              >
                <div className="space-y-2.5">
                  {/* Field Tag & Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-[#64748B] bg-[#F1F5F9] px-2.5 py-0.5 rounded-md border border-[#E2E8F0] truncate max-w-[170px]">
                      {proj.research_field || "Research"}
                    </span>

                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(
                        proj.status
                      )}`}
                    >
                      {proj.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Research Title */}
                  <h3 className="font-semibold text-base text-[#172033] leading-snug group-hover:text-[#243B64] transition-colors line-clamp-2">
                    {proj.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2 font-normal">
                    {proj.research_question || proj.description}
                  </p>

                  {/* Research ID */}
                  <div className="pt-0.5">
                    <span className="text-[10px] font-mono text-[#94A3B8] bg-[#F8FAFC] px-1.5 py-0.5 rounded border border-[#E2E8F0]">
                      {proj.id}
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Percentage */}
                <div className="space-y-1.5 pt-2 border-t border-[#F1F5F9]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B] font-medium">Progress</span>
                    <span className="text-[#243B64] font-semibold">{progress}%</span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#536DFE] h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Metrics & Last Updated */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center gap-1 font-medium text-[#172033]">
                        <BookOpen className="w-3.5 h-3.5 text-[#536DFE]" />
                        <span>{paperCount} Papers</span>
                      </span>
                      <span className="text-[#CBD5E1]">&bull;</span>
                      <span className="flex items-center gap-1 font-medium text-[#172033]">
                        <FileText className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{noteCount} Notes</span>
                      </span>
                      {findingCount > 0 && (
                        <>
                          <span className="text-[#CBD5E1] hidden sm:inline">&bull;</span>
                          <span className="hidden sm:flex items-center gap-1 font-medium text-[#172033]">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>{findingCount} Findings</span>
                          </span>
                        </>
                      )}
                    </div>

                    <span className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
                      <Clock className="w-3 h-3" />
                      <span>{timeAgo}</span>
                    </span>
                  </div>

                  {/* Primary Action Button: Open Research → */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9]">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenResearch(proj);
                      }}
                      size="sm"
                      className="bg-[#243B64] hover:bg-[#1D3154] text-white text-xs font-semibold h-8 px-3.5 rounded-lg shadow-2xs flex items-center gap-1.5 group/btn cursor-pointer"
                    >
                      <span>Open Research</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        onClick={(e) => handleDuplicate(proj, e)}
                        variant="ghost"
                        size="sm"
                        title="Duplicate research project"
                        className="text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] text-xs h-8 px-2 rounded-md cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        <span className="hidden sm:inline">Clone</span>
                      </Button>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(proj);
                        }}
                        variant="ghost"
                        size="sm"
                        title="Delete research project"
                        className="text-[#94A3B8] hover:text-red-600 hover:bg-red-50 text-xs h-8 w-8 p-0 rounded-md cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : projects.length === 0 ? (
        /* Section 25 Empty State: No research yet */
        <div className="bg-white rounded-xl p-10 sm:p-14 text-center border border-[#E2E8F0] shadow-2xs space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] border border-indigo-100 flex items-center justify-center text-[#536DFE] mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#172033]">No research yet</h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Create your first research project and begin your research journey.
            </p>
          </div>
          <Button
            onClick={onOpenNewResearch}
            className="bg-[#243B64] hover:bg-[#1D3154] text-white text-xs font-semibold h-9 px-4 rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ New Research</span>
          </Button>
        </div>
      ) : (
        /* Filter Empty State */
        <div className="bg-white rounded-xl p-10 sm:p-12 text-center border border-[#E2E8F0] shadow-2xs space-y-3 max-w-md mx-auto">
          <FlaskConical className="w-10 h-10 text-[#94A3B8] mx-auto" />
          <h2 className="text-base font-semibold text-[#172033]">No matching research found</h2>
          <p className="text-xs text-[#64748B] leading-relaxed">
            No research projects match your current search or filter. Try clearing filters or create a new project.
          </p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            variant="outline"
            size="sm"
            className="text-xs text-[#172033] border-[#E2E8F0] rounded-lg h-8 px-3"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* 4. Mobile Filters BottomSheet */}
      <BottomSheet
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        title="Filter & Sort Research"
        description="Filter your research projects by status or order"
      >
        <div className="space-y-5 py-2">
          {/* Status Options */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Project Status
            </span>
            <div className="grid grid-cols-2 gap-2">
              {filterTabs.map((tab) => {
                const isSelected = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setStatusFilter(tab.id);
                      setMobileFilterOpen(false);
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium border touch-target-44 transition-all ${
                      isSelected
                        ? "bg-[#243B64] text-white border-[#243B64] shadow-xs"
                        : "bg-[#F8FAFC] text-[#172033] border-[#E2E8F0]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Sort By
            </span>
            <div className="space-y-1.5">
              {[
                { id: "updated", label: "Recently Updated" },
                { id: "created", label: "Recently Created" },
                { id: "progress", label: "Highest Progress" },
                { id: "papers", label: "Most Literature Papers" },
              ].map((opt) => {
                const isSelected = sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.id as any);
                      setMobileFilterOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium border touch-target-44 transition-all ${
                      isSelected
                        ? "bg-[#EEF2FF] text-[#243B64] border-[#CBD5E1] font-semibold"
                        : "bg-white text-[#172033] border-[#E2E8F0]"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#536DFE]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* Confirmation Dialog for Deletion */}
      <DeleteResearchDialog
        project={projectToDelete}
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
