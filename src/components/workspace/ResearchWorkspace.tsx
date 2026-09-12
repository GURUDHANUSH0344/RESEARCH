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
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  FileText,
  Sparkles,
  BookMarked,
  CheckSquare,
  Clock,
  Compass,
  Cpu,
  ChevronRight,
  ShieldCheck,
  Grid3X3,
  Lightbulb,
  TestTube,
  FileCheck,
  TrendingUp,
  Network,
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
  initialTab?: WorkspaceTab;
}

export function ResearchWorkspace({
  project,
  onBackToLibrary,
  onUpdateProject,
  initialTab = "overview",
}: ResearchWorkspaceProps) {
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>(initialTab);
  const [notesCount, setNotesCount] = useState(0);
  const [tasksCount, setTasksCount] = useState({ total: 0, completed: 0 });
  const [findingsCount, setFindingsCount] = useState(0);

  // Sync sub-entity counts
  useEffect(() => {
    workspaceService.getNotes(project.id).then((n) => setNotesCount(n.length));
    workspaceService.getTasks(project.id).then((t) => {
      const completed = t.filter((item) => item.status === "completed").length;
      setTasksCount({ total: t.length, completed });
    });
    workspaceService.getFindings(project.id).then((f) => setFindingsCount(f.length));
  }, [project.id]);

  const primaryTabs: { id: WorkspaceTab; label: string; icon: any; count?: number | string }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "papers", label: "Papers", icon: BookOpen, count: project.papers?.length || 0 },
    { id: "chat", label: "AI Assistant", icon: MessageSquare },
    { id: "notes", label: "Notes", icon: FileText, count: notesCount },
    { id: "findings", label: "Findings", icon: Sparkles, count: findingsCount },
    { id: "references", label: "References", icon: BookMarked },
    {
      id: "tasks",
      label: "Tasks",
      icon: CheckSquare,
      count: tasksCount.total > 0 ? `${tasksCount.completed}/${tasksCount.total}` : undefined,
    },
    { id: "timeline", label: "Timeline", icon: Clock },
  ];

  const advancedTabs: { id: WorkspaceTab; label: string; icon: any }[] = [
    { id: "pipeline", label: "Autonomous Discovery", icon: Cpu },
    { id: "comparison", label: "Evidence Matrix", icon: Grid3X3 },
    { id: "hypotheses", label: "Hypotheses", icon: Lightbulb },
    { id: "experiment", label: "Experiment Protocol", icon: TestTube },
    { id: "report", label: "Research Report", icon: FileCheck },
    { id: "graph", label: "Knowledge Graph", icon: Network },
  ];

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
      <div className="bg-white border-b border-slate-200/60 px-4 lg:px-8 py-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight truncate">
                  {project.title}
                </h1>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(
                    project.status
                  )}`}
                >
                  {project.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Research ID: <span className="font-bold text-slate-700">{project.id}</span> &bull; {project.research_field}
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Navigation Tabs (Horizontal Scrollable) */}
        <div className="flex items-center gap-1 overflow-x-auto pt-3 border-t border-slate-100 mt-3 no-scrollbar select-none">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}

          <span className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

          {/* Deep Discovery Tools Group */}
          {advancedTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
                title={`Advanced Tool: ${tab.label}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content Canvas */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8">
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
