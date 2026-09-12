import React, { useState } from "react";
import { type ResearchProject, type ResearchStatus } from "@/types/research";
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
  Save,
  PlusCircle,
  ArrowRight,
  HelpCircle,
  Target,
  Layers,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

interface ResearchOverviewTabProps {
  project: ResearchProject;
  onUpdateProject: (updated: ResearchProject) => void;
  onNavigateTab: (tab: string) => void;
  notesCount: number;
  tasksCount: { total: number; completed: number };
  findingsCount: number;
}

export function ResearchOverviewTab({
  project,
  onUpdateProject,
  onNavigateTab,
  notesCount,
  tasksCount,
  findingsCount,
}: ResearchOverviewTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [objective, setObjective] = useState(project.objective || "");
  const [description, setDescription] = useState(project.description || "");
  const [status, setStatus] = useState<ResearchStatus>(project.status || "active");
  const [isSaving, setIsSaving] = useState(false);

  const paperCount = project.papers?.length || 0;
  const progress = tasksCount.total > 0
    ? Math.round((tasksCount.completed / tasksCount.total) * 100)
    : project.progress || 0;

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
      {/* Workspace Isolation Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-[#0B2545] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
              Isolated Workspace
            </span>
            <span className="text-xs text-blue-200 font-mono">
              ID: <span className="text-white font-bold">{project.id}</span>
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            {project.title}
          </h1>
          <p className="text-xs text-blue-200/90 font-medium">
            {project.research_field} &bull; All data, notes, and AI reasoning are strictly scoped to this research.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-semibold h-9 px-3.5 rounded-xl shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5" />
              Edit Scope
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-9 px-3.5 rounded-xl shadow-xs"
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              {isSaving ? "Saving..." : "Save Scope"}
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Papers */}
        <div
          onClick={() => onNavigateTab("papers")}
          className="card-scientific card-scientific-hover p-5 cursor-pointer bg-white flex items-center justify-between transition-all"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Collected Papers</span>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900">{paperCount}</div>
            <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
              <span>View Literature</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Notes */}
        <div
          onClick={() => onNavigateTab("notes")}
          className="card-scientific card-scientific-hover p-5 cursor-pointer bg-white flex items-center justify-between transition-all"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Research Notes</span>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900">{notesCount}</div>
            <span className="text-[11px] font-semibold text-teal-600 flex items-center gap-1">
              <span>Open Notebook</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Tasks & Progress */}
        <div
          onClick={() => onNavigateTab("tasks")}
          className="card-scientific card-scientific-hover p-5 cursor-pointer bg-white flex items-center justify-between transition-all"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Progress</span>
            <div className="text-2xl md:text-3xl font-extrabold text-purple-700">{progress}%</div>
            <span className="text-[11px] font-semibold text-purple-600">
              {tasksCount.completed} / {tasksCount.total} Tasks Completed
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Key Findings */}
        <div
          onClick={() => onNavigateTab("findings")}
          className="card-scientific card-scientific-hover p-5 cursor-pointer bg-white flex items-center justify-between transition-all"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Key Findings</span>
            <div className="text-2xl md:text-3xl font-extrabold text-amber-600">{findingsCount}</div>
            <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
              <span>Explore Insights</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Scope Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Research Question, Objectives & Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Research Question Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Primary Research Question</span>
            </div>
            <p className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
              {project.research_question}
            </p>
          </div>

          {/* Objectives & Scope */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Target className="w-4 h-4 text-teal-600" />
                <span>Research Objectives</span>
              </div>
            </div>

            {!isEditing ? (
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {project.objective || "No formal objectives documented yet. Click 'Edit Scope' to define."}
              </p>
            ) : (
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={3}
                className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder="Specify key research objectives..."
              />
            )}

            <div className="pt-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Project Description & Methodology Scope
              </div>
              {!isEditing ? (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {project.description || "No expanded description added."}
                </p>
              ) : (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  placeholder="Describe your methodological scope, targets, and hypotheses..."
                />
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Metadata, Status, and Quick Triggers */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Research Status & Metadata
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Status</span>
                {!isEditing ? (
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[11px] border ${getStatusBadge(
                      project.status
                    )}`}
                  >
                    {project.status.replace("_", " ")}
                  </span>
                ) : (
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ResearchStatus)}
                    className="text-xs border border-slate-300 rounded-lg p-1 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                )}
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
                  Context Isolation
                </span>
                <span className="font-bold text-teal-600">Strictly Enforced</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                onClick={() => onNavigateTab("papers")}
                variant="outline"
                className="w-full justify-start text-xs font-semibold h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-2 text-blue-600" />
                Add Literature Papers
              </Button>
              <Button
                onClick={() => onNavigateTab("notes")}
                variant="outline"
                className="w-full justify-start text-xs font-semibold h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <FileText className="w-3.5 h-3.5 mr-2 text-teal-600" />
                Create Research Note
              </Button>
              <Button
                onClick={() => onNavigateTab("chat")}
                variant="outline"
                className="w-full justify-start text-xs font-semibold h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <Sparkles className="w-3.5 h-3.5 mr-2 text-purple-600" />
                Consult AI Research Assistant
              </Button>
              <Button
                onClick={() => onNavigateTab("tasks")}
                variant="outline"
                className="w-full justify-start text-xs font-semibold h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <CheckSquare className="w-3.5 h-3.5 mr-2 text-amber-600" />
                Add Research Task
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
