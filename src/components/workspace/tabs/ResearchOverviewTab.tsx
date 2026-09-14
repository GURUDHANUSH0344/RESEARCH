import React, { useState, useEffect } from "react";
import { type ResearchProject, type ResearchStatus, type ResearchFinding } from "@/types/research";
import { workspaceService } from "@/lib/services/workspace-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  FileText,
  CheckSquare,
  Sparkles,
  Calendar,
  Clock,
  Edit3,
  Check,
  PlusCircle,
  ArrowRight,
  HelpCircle,
  Target,
  ShieldCheck,
  FileCheck2,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Search,
  Grid3X3,
} from "lucide-react";
import { StageCompletionButton } from "../StageCompletionButton";
import { toast } from "sonner";

interface ResearchOverviewTabProps {
  project: ResearchProject;
  onUpdateProject: (updated: ResearchProject) => void;
  onNavigateTab: (tab: string) => void;
  notesCount: number;
  tasksCount: { total: number; completed: number };
  findingsCount: number;
  isStageCompleted?: boolean;
  onToggleStageCompletion?: () => void;
}

export function ResearchOverviewTab({
  project,
  onUpdateProject,
  onNavigateTab,
  notesCount,
  tasksCount,
  findingsCount,
  isStageCompleted,
  onToggleStageCompletion,
}: ResearchOverviewTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [objective, setObjective] = useState(project.objective || "");
  const [description, setDescription] = useState(project.description || "");
  const [status, setStatus] = useState<ResearchStatus>(project.status || "active");
  const [isSaving, setIsSaving] = useState(false);
  const [findings, setFindings] = useState<ResearchFinding[]>([]);

  const paperCount = project.papers?.length || 0;
  const progress =
    tasksCount.total > 0
      ? Math.round((tasksCount.completed / tasksCount.total) * 100)
      : project.progress || 0;

  useEffect(() => {
    async function loadFindings() {
      try {
        const items = await workspaceService.getFindings(project.id);
        setFindings(items);
      } catch (err) {
        console.error("Failed to load findings for overview:", err);
      }
    }
    loadFindings();
  }, [project.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await workspaceService.updateProject(project.id, {
        objective: objective.trim(),
        description: description.trim(),
        status,
      });

      const updated = await workspaceService.getProjectById(project.id);
      if (updated) {
        onUpdateProject(updated);
      }
      setIsEditing(false);
      toast.success("Research details updated successfully");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

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
      case "analyzing":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* ==================================================
          1. PRIMARY RESEARCH QUESTION
          ================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-[#536DFE]" />
            <span>Primary Research Question</span>
          </div>
          <div className="flex items-center gap-2">
            <StageCompletionButton
              stageName="Idea"
              isCompleted={isStageCompleted}
              onToggle={onToggleStageCompletion}
            />
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-semibold text-[#536DFE] hover:text-[#243B64] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? "Close Editor" : "Edit Question / Scope"}</span>
            </button>
          </div>
        </div>

        <p className="text-lg sm:text-xl font-bold font-heading text-slate-900 leading-snug">
          {project.research_question || "No research question documented."}
        </p>

        {project.description && !isEditing && (
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
            {project.description}
          </p>
        )}
      </div>

      {/* ==================================================
          2. OBJECTIVES & METHODOLOGY SCOPE
          ================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Target className="w-4 h-4 text-teal-600" />
            <span>Research Objectives & Scope</span>
          </div>
          {isEditing && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="bg-[#243B64] hover:bg-[#1D3154] text-white text-xs font-semibold h-8 px-3 rounded-lg shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              {isSaving ? "Saving..." : "Save Scope"}
            </Button>
          )}
        </div>

        {!isEditing ? (
          <div className="space-y-3">
            <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              <span className="font-semibold text-slate-900 block mb-1">Key Objective:</span>
              {project.objective || "No formal objectives documented yet. Click 'Edit Scope' to define."}
            </div>
            {project.description && (
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                <span className="font-semibold text-slate-800 block mb-0.5">Methodology Context:</span>
                {project.description}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Objective
              </label>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={3}
                className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#536DFE]/20 focus:outline-none bg-white"
                placeholder="Specify key research objectives..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Methodological Scope & Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#536DFE]/20 focus:outline-none bg-white"
                placeholder="Describe your methodological scope, targets, and hypotheses..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ResearchStatus)}
                className="text-xs border border-slate-300 rounded-lg p-2 bg-white w-full sm:w-60"
              >
                <option value="active">Active</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================
          3. RESEARCH GAP SUMMARY & SYNTHESIS
          ================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#536DFE]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900">
                Research Gap Analysis
              </h3>
              <p className="text-xs text-slate-500">
                Identified knowledge voids and unaddressed problems in the corpus
              </p>
            </div>
          </div>

          <Button
            onClick={() => onNavigateTab("hypotheses")}
            variant="outline"
            size="sm"
            className="text-xs font-semibold text-[#536DFE] hover:text-[#243B64] hover:bg-indigo-50/60 border-indigo-200 rounded-lg h-8 self-start sm:self-auto cursor-pointer"
          >
            <span>Open Gap Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {project.gap_report?.potential_gaps && project.gap_report.potential_gaps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {project.gap_report.potential_gaps.slice(0, 2).map((gap, idx) => (
              <div
                key={idx}
                onClick={() => onNavigateTab("hypotheses")}
                className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80 hover:border-indigo-300 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Gap #{idx + 1}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {gap.confidence} Confidence
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {gap.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {gap.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore the 6 structured research gap dimensions (Existing Research, Common Approaches, Limitations, Missing Areas, Contradictions, Potential Gaps) powered by grounded AI.
            </p>
            <Button
              onClick={() => onNavigateTab("hypotheses")}
              size="sm"
              className="bg-[#243B64] hover:bg-[#1D3154] text-white text-xs font-semibold h-8 px-3 rounded-lg shrink-0 cursor-pointer"
            >
              Analyze Gaps
            </Button>
          </div>
        )}
      </div>

      {/* ==================================================
          4. LATEST FINDINGS & INSIGHTS
          ================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900">
                Latest Findings ({findings.length})
              </h3>
              <p className="text-xs text-slate-500">
                Empirical insights and synthesized results from collected literature
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("findings")}
            className="text-xs font-semibold text-[#536DFE] hover:text-[#243B64] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {findings.length > 0 ? (
          <div className="space-y-2.5 pt-1">
            {findings.slice(0, 3).map((finding) => (
              <div
                key={finding.id}
                onClick={() => onNavigateTab("findings")}
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-[#F8FAFC] transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {finding.title}
                  </h4>
                  {finding.confidence && (
                    <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                      {finding.confidence}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {finding.description}
                </p>
                {finding.evidence && (
                  <p className="text-[11px] text-slate-400 font-medium truncate">
                    Source: {finding.evidence}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span>No findings recorded yet. Extract findings from Evidence Matrix or add manually.</span>
            <Button
              onClick={() => onNavigateTab("findings")}
              size="sm"
              variant="outline"
              className="text-xs h-7 rounded-lg"
            >
              + Add Finding
            </Button>
          </div>
        )}
      </div>

      {/* ==================================================
          5. RECENT PAPERS
          ================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900">
                Recent Literature ({paperCount} Papers)
              </h3>
              <p className="text-xs text-slate-500">
                Papers and primary references indexed under this research ID
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("papers")}
            className="text-xs font-semibold text-[#536DFE] hover:text-[#243B64] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View Literature</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {paperCount > 0 ? (
          <div className="space-y-2.5 pt-1">
            {project.papers?.slice(0, 3).map((paper, idx) => (
              <div
                key={paper.id || idx}
                onClick={() => onNavigateTab("papers")}
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-[#F8FAFC] transition-colors cursor-pointer flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
                      {paper.year || 2024}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate">
                      {paper.venue || "Academic Publication"}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug truncate">
                    {paper.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    By: {paper.authors?.join(", ") || "Unknown Authors"}
                  </p>
                </div>

                {paper.relevance_score && (
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200 shrink-0">
                    {paper.relevance_score}%
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span>No papers collected yet. Search scholarly databases or add manually.</span>
            <Button
              onClick={() => onNavigateTab("papers")}
              size="sm"
              className="bg-[#243B64] hover:bg-[#1D3154] text-white text-xs h-8 px-3 rounded-lg"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1" />
              Add Papers
            </Button>
          </div>
        )}
      </div>

      {/* ==================================================
          6. RESEARCH STATUS, METADATA & PROGRESS
          ================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status & Metadata Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Research Status & Isolation
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Lifecycle Status</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[11px] border ${getStatusBadge(
                  project.status
                )}`}
              >
                {project.status.replace("_", " ")}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Created
              </span>
              <span className="font-semibold text-slate-800">
                {new Date(project.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Last Updated
              </span>
              <span className="font-semibold text-slate-800">
                {new Date(project.updated_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                Data Isolation
              </span>
              <span className="font-bold text-teal-600">Strictly Scoped</span>
            </div>
          </div>
        </div>

        {/* Milestone Completion & Progress Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Research Milestone Progress
            </h3>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl sm:text-3xl font-bold font-heading text-[#243B64]">
                {progress}%
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {tasksCount.completed} of {tasksCount.total} Tasks Complete
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60">
              <div
                className="bg-[#536DFE] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Need to update tasks?</span>
            <Button
              onClick={() => onNavigateTab("tasks")}
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2.5 border-slate-200 rounded-lg cursor-pointer"
            >
              Open Tasks
            </Button>
          </div>
        </div>
      </div>

      {/* ==================================================
          7. RECENT ACTIVITY & WORKFLOW QUICK TRIGGERS
          ================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Quick Workflow Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <Button
            onClick={() => onNavigateTab("papers")}
            variant="outline"
            className="flex flex-col items-center justify-center p-3 h-20 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-xl transition-all cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-blue-600 mb-1" />
            <span className="text-xs font-semibold text-slate-800">Add Papers</span>
          </Button>

          <Button
            onClick={() => onNavigateTab("comparison")}
            variant="outline"
            className="flex flex-col items-center justify-center p-3 h-20 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-xl transition-all cursor-pointer"
          >
            <Grid3X3 className="w-5 h-5 text-[#536DFE] mb-1" />
            <span className="text-xs font-semibold text-slate-800">Evidence Matrix</span>
          </Button>

          <Button
            onClick={() => onNavigateTab("hypotheses")}
            variant="outline"
            className="flex flex-col items-center justify-center p-3 h-20 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 rounded-xl transition-all cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-purple-600 mb-1" />
            <span className="text-xs font-semibold text-slate-800">Research Gap</span>
          </Button>

          <Button
            onClick={() => onNavigateTab("chat")}
            variant="outline"
            className="flex flex-col items-center justify-center p-3 h-20 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 rounded-xl transition-all cursor-pointer"
          >
            <FileText className="w-5 h-5 text-teal-600 mb-1" />
            <span className="text-xs font-semibold text-slate-800">AI Assistant</span>
          </Button>

          <Button
            onClick={() => onNavigateTab("final_output")}
            variant="outline"
            className="flex flex-col items-center justify-center p-3 h-20 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/60 rounded-xl transition-all cursor-pointer col-span-2 sm:col-span-1"
          >
            <FileCheck2 className="w-5 h-5 text-emerald-600 mb-1" />
            <span className="text-xs font-semibold text-emerald-800">Final Paper</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
