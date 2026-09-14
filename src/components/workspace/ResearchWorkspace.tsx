import React, { useState, useEffect, useRef } from "react";
import { type ResearchProject, type ResearchStatus } from "@/types/research";
import { workspaceService } from "@/lib/services/workspace-service";
import { ResearchOverviewTab } from "./tabs/ResearchOverviewTab";
import { ResearchPapersTab } from "./tabs/ResearchPapersTab";
import { ResearchNotesTab } from "./tabs/ResearchNotesTab";
import { ResearchFindingsTab } from "./tabs/ResearchFindingsTab";
import { ResearchReferencesTab } from "./tabs/ResearchReferencesTab";
import { ResearchTasksTab } from "./tabs/ResearchTasksTab";
import { ResearchTimelineTab } from "./tabs/ResearchTimelineTab";
import { ResearchFinalOutputTab } from "./tabs/ResearchFinalOutputTab";
import { ResearchAssistantChat } from "@/components/chat/ResearchAssistantChat";
import { AutonomousPipelineRunner } from "@/components/research/AutonomousPipelineRunner";
import { EvidenceMatrixTab } from "./tabs/EvidenceMatrixTab";
import { ResearchGapTab } from "./tabs/ResearchGapTab";
import { ExperimentDesigner } from "@/components/experiment/ExperimentDesigner";
import { ResearchReportViewer } from "@/components/report/ResearchReportViewer";
import { ResearchTrends } from "@/components/analytics/ResearchTrends";
import { ResearchKnowledgeGraph } from "@/components/graph/ResearchKnowledgeGraph";
import { Button } from "@/components/ui/button";
import { StageCompletionButton } from "./StageCompletionButton";
import {
  ArrowLeft,
  Compass,
  ChevronRight,
  ShieldCheck,
  Share2,
  Edit3,
  Sparkles,
  Check,
  BookOpen,
  MessageSquare,
  FileText,
  CheckSquare,
  LayoutDashboard,
  Grid3X3,
  Lightbulb,
  X,
} from "lucide-react";
import { toast } from "sonner";

export type WorkspaceTab =
  | "overview"
  | "papers"
  | "chat"
  | "notes"
  | "findings"
  | "references"
  | "tasks"
  | "timeline"
  | "final_output"
  | "pipeline"
  | "comparison"
  | "hypotheses"
  | "experiment"
  | "report"
  | "graph";

// 7 Connected Circular Research Workflow Stages (Top Level)
export const RESEARCH_WORKFLOW_STAGES: { id: WorkspaceTab; label: string }[] = [
  { id: "overview", label: "Idea" },
  { id: "papers", label: "Papers" },
  { id: "comparison", label: "Evidence Matrix" },
  { id: "hypotheses", label: "Research Gap" },
  { id: "notes", label: "Methodology" },
  { id: "findings", label: "Findings" },
  { id: "final_output", label: "Final Paper" },
];

interface ResearchWorkspaceProps {
  project: ResearchProject;
  onBackToLibrary: () => void;
  onUpdateProject: (updated: ResearchProject) => void;
  currentTab?: WorkspaceTab;
  onSelectTab?: (tab: WorkspaceTab) => void;
  initialTab?: WorkspaceTab;
  onCountsChanged?: (counts: {
    notes?: number;
    tasks?: { total: number; completed: number };
    findings?: number;
  }) => void;
}

export function ResearchWorkspace({
  project,
  onBackToLibrary,
  onUpdateProject,
  currentTab: controlledTab,
  onSelectTab,
  initialTab = "overview",
  onCountsChanged,
}: ResearchWorkspaceProps) {
  const [internalTab, setInternalTab] = useState<WorkspaceTab>(initialTab);
  const currentTab = controlledTab ?? internalTab;

  // 7 Connected Circular Research Workflow Stages
  const researchStages = RESEARCH_WORKFLOW_STAGES;

  const setCurrentTab = (tab: WorkspaceTab) => {
    setInternalTab(tab);
    onSelectTab?.(tab);
  };

  const [notesCount, setNotesCount] = useState(0);
  const [tasksCount, setTasksCount] = useState({ total: 0, completed: 0 });
  const [findingsCount, setFindingsCount] = useState(0);

  // Horizontal scroll tabs container ref
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  // Sync sub-entity counts
  useEffect(() => {
    workspaceService.getNotes(project.id).then((n) => {
      setNotesCount(n.length);
      onCountsChanged?.({ notes: n.length });
    });
    workspaceService.getTasks(project.id).then((t) => {
      const completed = t.filter((item) => item.status === "completed").length;
      const tc = { total: t.length, completed };
      setTasksCount(tc);
      onCountsChanged?.({ tasks: tc });
    });
    workspaceService.getFindings(project.id).then((f) => {
      setFindingsCount(f.length);
      onCountsChanged?.({ findings: f.length });
    });
  }, [project.id]);

  // Workflow Stage Completion State (completion-based per researchId)
  const [stageCompletions, setStageCompletions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    workspaceService.getStageCompletions(project.id).then((completions) => {
      setStageCompletions(completions);
    });
  }, [project.id]);

  const handleToggleStageCompletion = async (stageId: WorkspaceTab) => {
    const isCompleted = Boolean(stageCompletions[stageId]);
    const newStatus = !isCompleted;
    const updated = await workspaceService.setStageCompletion(project.id, stageId, newStatus);
    setStageCompletions(updated);

    const stages = ["overview", "papers", "comparison", "hypotheses", "notes", "findings", "final_output"];
    const completedCount = stages.filter((s) => updated[s]).length;
    const progress = Math.round((completedCount / stages.length) * 100);
    onUpdateProject({
      ...project,
      progress,
      stage_completions: updated,
    });

    const stageDef = researchStages.find((s) => s.id === stageId);
    const stageName = stageDef?.label || stageId;

    if (newStatus) {
      toast.success(`Stage "${stageName}" marked as completed!`, {
        description: `Research progress updated to ${progress}%.`,
        action: {
          label: "Undo",
          onClick: () => handleToggleStageCompletion(stageId),
        },
      });
    } else {
      toast.info(`Stage "${stageName}" marked as in-progress.`);
    }
  };

  const completedStagesCount = researchStages.filter((s) => stageCompletions[s.id]).length;
  const currentStageIndex = researchStages.findIndex((s) => s.id === currentTab);
  const currentStageDef = currentStageIndex >= 0 ? researchStages[currentStageIndex] : null;
  const isCurrentStageCompleted = Boolean(stageCompletions[currentTab]);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      toast.success("Research link copied to clipboard!");
    }
  };

  const getStatusBadge = (s: ResearchStatus) => {
    switch (s) {
      case "active":
      case "in_progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "on_hold":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Edit Research State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(project.title);
  const [editField, setEditField] = useState(project.research_field || "");
  const [editQuestion, setEditQuestion] = useState(project.research_question || project.description || "");
  const [editStatus, setEditStatus] = useState<ResearchStatus>(project.status);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    setEditTitle(project.title);
    setEditField(project.research_field || "");
    setEditQuestion(project.research_question || project.description || "");
    setEditStatus(project.status);
  }, [project]);

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      toast.error("Research title is required");
      return;
    }
    setIsSavingEdit(true);
    try {
      const updates = {
        title: editTitle.trim(),
        research_field: editField.trim(),
        research_question: editQuestion.trim(),
        status: editStatus,
      };
      await workspaceService.updateProject(project.id, updates);
      onUpdateProject({
        ...project,
        ...updates,
      });
      toast.success("Research project updated");
      setEditModalOpen(false);
    } catch {
      toast.error("Failed to update research project");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const getRelativeTime = (dateStr: string) => {
    const diffMinutes = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60));
    if (diffMinutes >= 1440) {
      const days = Math.floor(diffMinutes / 1440);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
    if (diffMinutes >= 60) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }
    if (diffMinutes > 1) {
      return `${diffMinutes} minutes ago`;
    }
    return "just now";
  };

  // Section 13: Secondary Navigation Inside Workspace
  const secondaryNavTabs: { id: WorkspaceTab; label: string; count?: number | string }[] = [
    { id: "overview", label: "Overview" },
    { id: "papers", label: "Papers", count: project.papers?.length },
    { id: "comparison", label: "Evidence Matrix" },
    { id: "hypotheses", label: "Research Gap" },
    { id: "chat", label: "AI Assistant" },
    { id: "notes", label: "Notes", count: notesCount },
    { id: "findings", label: "Findings", count: findingsCount },
    { id: "tasks", label: "Tasks", count: tasksCount.total > 0 ? `${tasksCount.completed}/${tasksCount.total}` : undefined },
    { id: "timeline", label: "Timeline" },
    { id: "final_output", label: "Final Paper" },
  ];

  const currentTabDef =
    secondaryNavTabs.find((t) => t.id === currentTab) ||
    researchStages.find((s) => s.id === currentTab);
  const currentTabLabel = currentTabDef?.label || "Overview";

  // Root workspace vertical scroll container ref
  const workspaceScrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={workspaceScrollRef}
      className="flex flex-col h-full overflow-y-auto bg-[#F7F8FA]"
    >
      {/* 💻 Section 10: Breadcrumbs & Data Isolation Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-3 sm:px-4 lg:px-8 py-2.5 shadow-2xs flex items-center justify-between gap-2 sm:gap-3">
        {/* Desktop Multi-Level Breadcrumbs */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[#64748B]">
          <button
            onClick={onBackToLibrary}
            className="font-medium text-[#64748B] hover:text-[#243B64] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#536DFE]" />
            <span>Research Compass</span>
          </button>
          <span className="text-[#CBD5E1]">/</span>
          <button
            onClick={onBackToLibrary}
            className="font-medium text-[#64748B] hover:text-[#243B64] transition-colors cursor-pointer"
          >
            Research Library
          </button>
          <span className="text-[#CBD5E1]">/</span>
          <button
            onClick={() => setCurrentTab("overview")}
            className="font-medium text-[#64748B] hover:text-[#243B64] max-w-[180px] lg:max-w-xs truncate transition-colors cursor-pointer"
            title="Return to Research Overview"
          >
            {project.title}
          </button>
          {currentTab !== "overview" && (
            <>
              <span className="text-[#CBD5E1]">/</span>
              <span className="font-semibold text-[#172033] bg-[#F1F5F9] px-2 py-0.5 rounded text-[11px]">
                {currentTabLabel}
              </span>
            </>
          )}
        </div>

        {/* Mobile Concise Back Navigation & Title */}
        <div className="flex md:hidden items-center gap-1.5 text-xs flex-1 min-w-0">
          {currentTab !== "overview" ? (
            <button
              onClick={() => setCurrentTab("overview")}
              className="font-semibold text-[#536DFE] hover:text-[#243B64] flex items-center gap-1 shrink-0 p-1 -ml-1 rounded-md transition-colors cursor-pointer touch-target-44"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onBackToLibrary}
              className="font-semibold text-[#536DFE] hover:text-[#243B64] flex items-center gap-1 shrink-0 p-1 -ml-1 rounded-md transition-colors cursor-pointer touch-target-44"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Library</span>
            </button>
          )}
          <span className="text-[#CBD5E1]">/</span>
          <span className="font-semibold text-[#172033] truncate">
            {currentTab !== "overview" ? currentTabLabel : project.title}
          </span>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {currentTab !== "overview" && (
            <Button
              onClick={() => setCurrentTab("overview")}
              variant="outline"
              size="sm"
              className="hidden sm:flex border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#243B64] font-semibold text-xs h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg shadow-2xs items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#536DFE]" />
              <span>Back to Research</span>
            </Button>
          )}

          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#172033] text-xs font-medium h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="hidden sm:inline">Share</span>
          </Button>

          <Button
            onClick={onBackToLibrary}
            variant="outline"
            size="sm"
            className="border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#172033] text-xs font-medium h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="hidden sm:inline">Library</span>
          </Button>
        </div>
      </div>

      {/* 💻 Section 10: Research Identification & Metadata Banner */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 lg:px-8 py-4 sm:py-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Research Title & Subtitle */}
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#172033] tracking-tight truncate max-w-xl">
                {project.title}
              </h1>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                  project.status
                )}`}
              >
                {project.status.replace("_", " ")}
              </span>
            </div>

            {project.research_question && (
              <p className="text-xs sm:text-sm text-[#64748B] font-normal line-clamp-1 max-w-2xl">
                {project.research_question}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#64748B]">
              <span className="font-mono bg-[#F8FAFC] text-[#64748B] px-2 py-0.5 rounded border border-[#E2E8F0] text-[11px]">
                Research ID: {project.id.startsWith("RC-") ? project.id : `RC-${project.id.slice(0, 4).toUpperCase()}`}
              </span>
              <span>&bull;</span>
              <span>Status: <strong className="font-medium text-[#172033] capitalize">{project.status.replace("_", " ")}</strong></span>
              <span>&bull;</span>
              <span>Last updated: {getRelativeTime(project.updated_at)}</span>
            </div>
          </div>

          {/* Top Actions: Edit Research, Share */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={() => setEditModalOpen(true)}
              variant="outline"
              size="sm"
              className="border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#172033] text-xs font-medium h-8 px-3 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Edit Research</span>
            </Button>

            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#172033] text-xs font-medium h-8 px-3 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Share</span>
            </Button>
          </div>
        </div>

        {/* Section 11: Connected Circular Research Workflow Lifecycle */}
        <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
          {/* Header Row: Stage Progress & Action */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                Research Workflow
              </span>
              <span className="text-[11px] font-medium text-[#64748B]">
                ({completedStagesCount} of 7 Completed)
              </span>
            </div>

            {currentStageDef && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#64748B] hidden sm:inline">
                  Stage {currentStageIndex + 1}: <strong className="text-[#172033]">{currentStageDef.label}</strong>
                </span>
                <StageCompletionButton
                  stageName={currentStageDef.label}
                  isCompleted={isCurrentStageCompleted}
                  onToggle={() => handleToggleStageCompletion(currentTab)}
                  size="sm"
                />
              </div>
            )}
          </div>

          <div className="overflow-x-auto no-scrollbar pb-1">
            <div className="relative flex items-center justify-between min-w-[620px] px-3 py-2">
              {/* Connecting line behind circles */}
              <div className="absolute left-8 right-8 top-5 h-0.5 bg-[#E2E8F0] -z-0" />

              {researchStages.map((stage, idx) => {
                const isCurrent = currentTab === stage.id;
                const isCompleted = Boolean(stageCompletions[stage.id]);

                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setCurrentTab(stage.id)}
                    className="relative z-10 flex flex-col items-center group cursor-pointer"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-250 ease-out ${
                        isCompleted
                          ? `bg-emerald-600 text-white shadow-xs ${isCurrent ? "ring-4 ring-emerald-100" : ""}`
                          : isCurrent
                          ? "bg-[#536DFE] text-white ring-4 ring-[#EEF2FF] shadow-xs"
                          : "bg-white border-2 border-[#CBD5E1] text-[#94A3B8] group-hover:border-[#94A3B8]"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5] animate-scale-in" />
                      ) : (
                        <span className={`text-[11px] font-semibold ${isCurrent ? "text-white" : "text-[#94A3B8]"}`}>
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <span
                      className={`mt-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                        isCompleted
                          ? "text-emerald-700 font-semibold"
                          : isCurrent
                          ? "text-[#243B64] font-bold"
                          : "text-[#64748B] group-hover:text-[#172033]"
                      }`}
                    >
                      {stage.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 12: Compact Dashboard Statistics (4 lightweight cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#536DFE] shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-semibold text-[#172033] block leading-tight">
                {project.papers?.length || 0}
              </span>
              <span className="text-[11px] text-[#64748B] font-medium">Papers</span>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#64748B] shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-semibold text-[#172033] block leading-tight">
                {notesCount}
              </span>
              <span className="text-[11px] text-[#64748B] font-medium">Notes</span>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-semibold text-[#172033] block leading-tight">
                {findingsCount}
              </span>
              <span className="text-[11px] text-[#64748B] font-medium">Findings</span>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#536DFE] shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-semibold text-[#243B64] block leading-tight">
                {Math.round((completedStagesCount / 7) * 100)}%
              </span>
              <span className="text-[11px] text-[#64748B] font-medium">
                {completedStagesCount}/7 Stages Done
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 13: Secondary Navigation Inside Workspace - Sticky */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 lg:px-8 py-0 shadow-xs flex items-center gap-1 overflow-x-auto no-scrollbar">
        {secondaryNavTabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-[#536DFE] text-[#243B64] font-semibold"
                  : "border-transparent text-[#64748B] hover:text-[#172033] hover:border-[#CBD5E1]"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                    isActive ? "bg-[#EEF2FF] text-[#536DFE]" : "bg-[#F1F5F9] text-[#64748B]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Edit Research Dialog Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#536DFE]" />
                <h3 className="text-sm font-semibold text-[#172033]">Edit Research Scope</h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-[#64748B] hover:text-[#172033] p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#172033] block mb-1">
                  Research Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#E2E8F0] focus:border-[#536DFE] focus:outline-none bg-[#F8FAFC]"
                  placeholder="Title of your research"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#172033] block mb-1">
                  Research Field
                </label>
                <input
                  type="text"
                  value={editField}
                  onChange={(e) => setEditField(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#E2E8F0] focus:border-[#536DFE] focus:outline-none bg-[#F8FAFC]"
                  placeholder="e.g. Biomedical AI, Astrophysics"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#172033] block mb-1">
                  Primary Research Question
                </label>
                <textarea
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2 rounded-lg border border-[#E2E8F0] focus:border-[#536DFE] focus:outline-none bg-[#F8FAFC]"
                  placeholder="What question is this research trying to answer?"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#172033] block mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ResearchStatus)}
                  className="w-full text-xs p-2 rounded-lg border border-[#E2E8F0] focus:border-[#536DFE] focus:outline-none bg-white"
                >
                  <option value="active">Active</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditModalOpen(false)}
                className="text-xs text-[#64748B] border-[#E2E8F0] rounded-lg h-8 px-3"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isSavingEdit}
                onClick={handleSaveEdit}
                className="bg-[#243B64] hover:bg-[#1D3154] text-white text-xs font-semibold rounded-lg h-8 px-4"
              >
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab Content Canvas with smooth transition - single continuous scroll */}
      <div key={currentTab} className="p-3 sm:p-5 md:p-8 pb-28 sm:pb-32 md:pb-8 animate-fade-slide min-h-[500px]">
        {currentTab === "overview" && (
          <ResearchOverviewTab
            project={project}
            onUpdateProject={onUpdateProject}
            onNavigateTab={(tab) => setCurrentTab(tab as WorkspaceTab)}
            notesCount={notesCount}
            tasksCount={tasksCount}
            findingsCount={findingsCount}
            isStageCompleted={Boolean(stageCompletions["overview"])}
            onToggleStageCompletion={() => handleToggleStageCompletion("overview")}
          />
        )}

        {currentTab === "papers" && (
          <ResearchPapersTab
            project={project}
            onUpdateProject={onUpdateProject}
            isStageCompleted={Boolean(stageCompletions["papers"])}
            onToggleStageCompletion={() => handleToggleStageCompletion("papers")}
          />
        )}

        {currentTab === "chat" && (
          <ResearchAssistantChat project={project} />
        )}

        {currentTab === "notes" && (
          <ResearchNotesTab
            project={project}
            onNotesChanged={(count) => setNotesCount(count)}
            isStageCompleted={Boolean(stageCompletions["notes"])}
            onToggleStageCompletion={() => handleToggleStageCompletion("notes")}
          />
        )}

        {currentTab === "findings" && (
          <ResearchFindingsTab
            project={project}
            onFindingsChanged={(count) => setFindingsCount(count)}
            isStageCompleted={Boolean(stageCompletions["findings"])}
            onToggleStageCompletion={() => handleToggleStageCompletion("findings")}
          />
        )}

        {currentTab === "references" && (
          <ResearchReferencesTab project={project} />
        )}

        {currentTab === "tasks" && (
          <ResearchTasksTab
            project={project}
            onTasksChanged={(counts) => setTasksCount(counts)}
          />
        )}

        {currentTab === "timeline" && (
          <ResearchTimelineTab project={project} />
        )}

        {currentTab === "final_output" && (
          <ResearchFinalOutputTab
            project={project}
            onNavigateTab={(tab) => setCurrentTab(tab as WorkspaceTab)}
            isStageCompleted={Boolean(stageCompletions["final_output"])}
            onToggleStageCompletion={() => handleToggleStageCompletion("final_output")}
          />
        )}

        {/* Deep Scientific Analysis Tools */}
        {currentTab === "pipeline" && (
          <AutonomousPipelineRunner
            progress={null}
            isRunning={false}
            projectData={project as any}
            onViewArtifacts={() => setCurrentTab("papers")}
            logs={[]}
          />
        )}

        {currentTab === "comparison" && (
          <EvidenceMatrixTab
            project={project}
            onNavigateTab={(tab) => setCurrentTab(tab as WorkspaceTab)}
            onUpdateProject={onUpdateProject}
            isStageCompleted={Boolean(stageCompletions["comparison"])}
            onToggleStageCompletion={() => handleToggleStageCompletion("comparison")}
          />
        )}

        {currentTab === "hypotheses" && (
          <ResearchGapTab
            project={project}
            onNavigateTab={(tab) => setCurrentTab(tab as WorkspaceTab)}
            onUpdateProject={onUpdateProject}
            isStageCompleted={Boolean(stageCompletions["hypotheses"])}
            onToggleStageCompletion={() => handleToggleStageCompletion("hypotheses")}
          />
        )}

        {currentTab === "experiment" && (
          <ExperimentDesigner
            project={project}
            experiment={project.experiment || project.experiment_plan}
            onUpdateProject={onUpdateProject}
            onNavigateTab={(tab) => setCurrentTab(tab as WorkspaceTab)}
            isStageCompleted={Boolean(stageCompletions["experiment"])}
            onToggleStageCompletion={() => handleToggleStageCompletion("experiment")}
          />
        )}

        {currentTab === "report" && (
          <ResearchReportViewer
            reportContent={project.final_report}
            projectTitle={project.title}
          />
        )}

        {currentTab === "graph" && (
          <ResearchKnowledgeGraph project={project as any} />
        )}
      </div>
    </div>
  );
}
