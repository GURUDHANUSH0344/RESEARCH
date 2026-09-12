import React, { useState, useEffect } from "react";
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
import { PaperComparisonMatrix } from "@/components/analysis/PaperComparisonMatrix";
import { ResearchGapsViewer } from "@/components/gaps/ResearchGapsViewer";
import { HypothesisLab } from "@/components/hypotheses/HypothesisLab";
import { ExperimentDesigner } from "@/components/experiment/ExperimentDesigner";
import { ResearchReportViewer } from "@/components/report/ResearchReportViewer";
import { ResearchTrends } from "@/components/analytics/ResearchTrends";
import { ResearchKnowledgeGraph } from "@/components/graph/ResearchKnowledgeGraph";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Compass,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

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

  const setCurrentTab = (tab: WorkspaceTab) => {
    setInternalTab(tab);
    onSelectTab?.(tab);
  };

  const [notesCount, setNotesCount] = useState(0);
  const [tasksCount, setTasksCount] = useState({ total: 0, completed: 0 });
  const [findingsCount, setFindingsCount] = useState(0);

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
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F7FB]">
      {/* Top Breadcrumb & Isolation Banner Header */}
      <div className="bg-white border-b border-slate-200/80 px-4 lg:px-8 py-3 shadow-2xs shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Breadcrumb path */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={onBackToLibrary}
            className="font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Research Compass</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

          <button
            onClick={onBackToLibrary}
            className="font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            Research Library
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

          <span className="font-bold text-slate-900 max-w-[200px] sm:max-w-xs md:max-w-md truncate">
            {project.title}
          </span>
        </div>

        {/* Back Button & Workspace Reminder */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-[11px] font-bold text-teal-700">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Working strictly on this research</span>
          </div>

          <Button
            onClick={onBackToLibrary}
            variant="outline"
            size="sm"
            className="border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold h-8 px-3 rounded-lg shadow-2xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Research Library</span>
          </Button>
        </div>
      </div>

      {/* Prominent Research Identification Bar */}
      <div className="bg-white border-b border-slate-200/80 px-4 lg:px-8 py-4 shrink-0 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Research Title & Subtitle */}
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl lg:text-2xl font-heading font-bold text-slate-900 tracking-tight truncate">
                {project.title}
              </h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                  project.status
                )}`}
              >
                {project.status.replace("_", " ")}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 font-medium">
              <span className="font-mono bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                ID: {project.id}
              </span>
              <span>&bull;</span>
              <span>{project.research_field}</span>
            </div>
          </div>

          {/* Quick Metrics Bar: Status, Last Updated, Progress, Number of Papers */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-slate-50/90 border border-slate-200/80 px-4 py-2.5 rounded-2xl shrink-0">
            {/* Last Updated */}
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Last Updated
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {new Date(project.updated_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            {/* Progress */}
            <div className="flex flex-col min-w-[90px]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Progress
                </span>
                <span className="text-xs font-bold text-blue-700">{project.progress || 0}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-400 ease-out"
                  style={{ width: `${project.progress || 0}%` }}
                />
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            {/* Number of Papers */}
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Literature
              </span>
              <span className="text-xs font-bold text-slate-800">
                {project.papers?.length || 0} Papers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Content Canvas with smooth transition */}
      <div key={currentTab} className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8 animate-fade-slide">
        {currentTab === "overview" && (
          <ResearchOverviewTab
            project={project}
            onUpdateProject={onUpdateProject}
            onNavigateTab={(tab) => setCurrentTab(tab as WorkspaceTab)}
            notesCount={notesCount}
            tasksCount={tasksCount}
            findingsCount={findingsCount}
          />
        )}

        {currentTab === "papers" && (
          <ResearchPapersTab
            project={project}
            onUpdateProject={onUpdateProject}
          />
        )}

        {currentTab === "chat" && (
          <ResearchAssistantChat project={project} />
        )}

        {currentTab === "notes" && (
          <ResearchNotesTab
            project={project}
            onNotesChanged={(count) => setNotesCount(count)}
          />
        )}

        {currentTab === "findings" && (
          <ResearchFindingsTab
            project={project}
            onFindingsChanged={(count) => setFindingsCount(count)}
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
          <ResearchFinalOutputTab project={project} />
        )}

        {/* Deep Scientific Analysis Tools (Preserved and Scoped to Active Project) */}
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
          <PaperComparisonMatrix comparison={project.comparison} />
        )}

        {currentTab === "hypotheses" && (
          <HypothesisLab
            hypotheses={project.hypotheses || []}
            selectedHypothesis={project.selected_hypothesis}
            onSelectHypothesis={(h) => {
              const updated = { ...project, selected_hypothesis: h };
              workspaceService.saveProject(updated);
              onUpdateProject(updated);
            }}
            onProceedToExperiment={() => setCurrentTab("experiment")}
          />
        )}

        {currentTab === "experiment" && (
          <ExperimentDesigner
            experiment={project.experiment}
            selectedHypothesis={project.selected_hypothesis}
            onProceedToResults={() => {}}
          />
        )}

        {currentTab === "report" && (
          <ResearchReportViewer
            reportContent={project.report}
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
