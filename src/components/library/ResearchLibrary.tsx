import React, { useState, useEffect } from "react";
import { type ResearchProject, type ResearchStatus } from "@/types/research";
import { workspaceService } from "@/lib/services/workspace-service";
import { DeleteResearchDialog } from "./DeleteResearchDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Layers,
  Filter,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  FlaskConical,
  Activity,
  CheckSquare,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"updated" | "created" | "progress" | "papers">("updated");

  // Deletion Dialog State
  const [projectToDelete, setProjectToDelete] = useState<ResearchProject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProjects = async () => {
    const list = await workspaceService.getProjects(user?.id);
    setProjects(list);

    // Fetch notes count for each project
    const counts: Record<string, number> = {};
    for (const p of list) {
      const notes = await workspaceService.getNotes(p.id);
      counts[p.id] = notes.length;
    }
    setNotesCounts(counts);
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

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
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
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "in_progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "completed":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "on_hold":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4 px-2">
      {/* Research Compass Hero Banner */}
      <div className="bg-gradient-to-r from-[#071A2B] via-[#0E2C4D] to-[#123B63] rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        {/* Subtle background glow circle */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Compass className="w-4 h-4" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-300">
                RESEARCH COMPASS &bull; RESEARCH LIBRARY
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Isolated Scientific Research Hub
            </h1>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Every research project operates in its own completely isolated workspace. Papers, notes, findings, and AI chat histories are partitioned strictly by Research ID.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={onOpenCropDemo}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-semibold h-10 px-4 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Launch Demo Case</span>
            </Button>

            <Button
              onClick={onOpenNewResearch}
              size="sm"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold h-10 px-5 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start New Research</span>
            </Button>
          </div>
        </div>

        {/* Global Overview Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-slate-300 font-medium block">Total Projects</span>
            <span className="text-2xl font-bold text-white">{projects.length}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-slate-300 font-medium block">Active Investigations</span>
            <span className="text-2xl font-bold text-emerald-400">{activeCount}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-slate-300 font-medium block">Literature Papers</span>
            <span className="text-2xl font-bold text-blue-400">{totalPapers}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-slate-300 font-medium block">Research Notes</span>
            <span className="text-2xl font-bold text-purple-400">{totalNotes}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search research projects by title, question, field, or Research ID..."
            className="pl-10 h-10 bg-white border-slate-200 text-xs rounded-xl shadow-2xs"
          />
        </div>

        {/* Status Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            {["all", "active", "in_progress", "completed"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  statusFilter === st
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st === "all" ? "All Projects" : st.replace("_", " ")}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 h-10 shadow-2xs focus:outline-none"
          >
            <option value="updated">Recently Updated</option>
            <option value="created">Recently Created</option>
            <option value="progress">Highest Progress</option>
            <option value="papers">Most Papers</option>
          </select>
        </div>
      </div>

      {/* Research Project Cards Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const paperCount = proj.papers?.length || 0;
            const noteCount = notesCounts[proj.id] || 0;
            const progress = proj.progress || 0;

            return (
              <div
                key={proj.id}
                onClick={() => onOpenResearch(proj)}
                className="card-scientific card-scientific-hover bg-white p-6 rounded-2xl cursor-pointer flex flex-col justify-between space-y-4 border border-slate-200/80 hover:border-blue-300 transition-all group"
              >
                <div className="space-y-3">
                  {/* Top Meta: Field & ID */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                      {proj.research_field || "Scientific Inquiry"}
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(
                        proj.status
                      )}`}
                    >
                      {proj.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Research Title */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                    {proj.title}
                  </h3>

                  {/* Question / Short description */}
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-medium">
                    {proj.research_question}
                  </p>

                  {/* Research ID Tag */}
                  <div className="pt-1">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      ID: {proj.id}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Progress</span>
                    <span className="text-blue-700 font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Counts & Last Updated Footer */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-slate-600">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <strong>{paperCount}</strong> papers
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <FileText className="w-3.5 h-3.5 text-teal-600" />
                        <strong>{noteCount}</strong> notes
                      </span>
                    </div>

                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(proj.updated_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Action Buttons: Open, Duplicate, Delete */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenResearch(proj);
                      }}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-8 px-3.5 rounded-xl shadow-2xs flex items-center gap-1"
                    >
                      <span>Open Research</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        onClick={(e) => handleDuplicate(proj, e)}
                        variant="ghost"
                        size="sm"
                        title="Duplicate research project"
                        className="text-slate-500 hover:text-slate-800 text-xs h-8 px-2 rounded-lg"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        Clone
                      </Button>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(proj);
                        }}
                        variant="ghost"
                        size="sm"
                        title="Delete research project"
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs h-8 w-8 p-0 rounded-lg"
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
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-xs space-y-4 max-w-xl mx-auto">
          <FlaskConical className="w-16 h-16 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">No Research Projects Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            There are no research projects matching your search criteria. Create a new inquiry to launch an isolated workspace with papers, notes, tasks, and an isolated AI co-pilot.
          </p>
          <Button
            onClick={onOpenNewResearch}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-10 px-5 rounded-xl shadow-xs"
          >
            Create Research Project
          </Button>
        </div>
      )}

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
