import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  FileText,
  Sparkles,
  BookMarked,
  CheckSquare,
  Clock,
  Cpu,
  Grid3X3,
  Lightbulb,
  TestTube,
  FileCheck,
  Network,
  FolderKanban,
  PlusCircle,
  FlaskConical,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  Settings,
  Layers,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ResearchProject, type ResearchStatus } from "@/types/research";
import { type WorkspaceTab } from "@/components/workspace/ResearchWorkspace";

interface AppSidebarProps {
  view: "library" | "workspace";
  currentTab?: WorkspaceTab;
  onSelectTab?: (tab: WorkspaceTab) => void;
  activeProject: ResearchProject | null;
  projects?: ResearchProject[];
  onSelectProject?: (p: ResearchProject) => void;
  onBackToLibrary?: () => void;
  onOpenNewResearch?: () => void;
  onOpenCropDemo?: () => void;
  onOpenSettings?: () => void;
  notesCount?: number;
  tasksCount?: { total: number; completed: number };
  findingsCount?: number;
  isRunningPipeline?: boolean;
}

export function AppSidebar({
  view,
  currentTab = "overview",
  onSelectTab,
  activeProject,
  projects = [],
  onSelectProject,
  onBackToLibrary,
  onOpenNewResearch,
  onOpenCropDemo,
  onOpenSettings,
  notesCount = 0,
  tasksCount = { total: 0, completed: 0 },
  findingsCount = 0,
  isRunningPipeline = false,
}: AppSidebarProps) {
  // 8 Core Research Workspace Modules
  const workspaceModules = [
    {
      id: "overview" as WorkspaceTab,
      label: "Overview",
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: "papers" as WorkspaceTab,
      label: "Literature / Papers",
      icon: BookOpen,
      badge: activeProject?.papers?.length ? `${activeProject.papers.length}` : "0",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    },
    {
      id: "chat" as WorkspaceTab,
      label: "AI Research Assistant",
      icon: MessageSquare,
      badge: "Grounded",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-400/30",
    },
    {
      id: "notes" as WorkspaceTab,
      label: "Research Notes",
      icon: FileText,
      badge: notesCount > 0 ? `${notesCount}` : undefined,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    },
    {
      id: "findings" as WorkspaceTab,
      label: "Key Findings",
      icon: Sparkles,
      badge: findingsCount > 0 ? `${findingsCount}` : undefined,
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-400/30",
    },
    {
      id: "references" as WorkspaceTab,
      label: "References",
      icon: BookMarked,
      badge: activeProject?.papers?.length ? `${activeProject.papers.length}` : undefined,
    },
    {
      id: "tasks" as WorkspaceTab,
      label: "Tasks & Progress",
      icon: CheckSquare,
      badge:
        tasksCount.total > 0 ? `${tasksCount.completed}/${tasksCount.total}` : undefined,
      badgeColor:
        tasksCount.completed === tasksCount.total && tasksCount.total > 0
          ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
          : "bg-blue-500/20 text-blue-300 border-blue-400/30",
    },
    {
      id: "timeline" as WorkspaceTab,
      label: "Research Timeline",
      icon: Clock,
    },
  ];

  // Advanced Deep Scientific Tools
  const scientificTools = [
    {
      id: "pipeline" as WorkspaceTab,
      label: "Autonomous Pipeline",
      icon: Cpu,
      badge: isRunningPipeline ? "Running" : undefined,
      badgeColor: "bg-emerald-600/30 text-emerald-300 border-emerald-500/40",
    },
    {
      id: "comparison" as WorkspaceTab,
      label: "Evidence Matrix",
      icon: Grid3X3,
    },
    {
      id: "hypotheses" as WorkspaceTab,
      label: "Hypothesis Lab",
      icon: Lightbulb,
      badge: activeProject?.hypotheses?.length ? `${activeProject.hypotheses.length}` : undefined,
    },
    {
      id: "experiment" as WorkspaceTab,
      label: "Experiment Protocol",
      icon: TestTube,
      badge: activeProject?.experiment ? "Ready" : undefined,
    },
    {
      id: "report" as WorkspaceTab,
      label: "Research Reports",
      icon: FileCheck,
      badge: activeProject?.report ? "1" : undefined,
    },
    {
      id: "graph" as WorkspaceTab,
      label: "Knowledge Graph",
      icon: Network,
    },
  ];

  const getStatusDot = (status: ResearchStatus) => {
    switch (status) {
      case "active":
      case "in_progress":
        return "bg-emerald-400";
      case "completed":
        return "bg-purple-400";
      case "on_hold":
        return "bg-amber-400";
      default:
        return "bg-slate-400";
    }
  };

  return (
    <aside className="w-64 lg:w-72 bg-[#071A2B] text-slate-300 flex flex-col shrink-0 border-r border-[#1E293B] select-none h-full overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#1E293B]">
        {view === "workspace" && activeProject ? (
          <div>
            {/* Back to Library Action Button */}
            <button
              onClick={onBackToLibrary}
              className="w-full mb-3 flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0D2847] hover:bg-[#123B63] text-blue-300 hover:text-white text-xs font-semibold transition-all border border-blue-500/20"
            >
              <span className="flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Research Library</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-900/50 px-1.5 py-0.5 rounded">
                Exit
              </span>
            </button>

            {/* Active Project Identification */}
            <div className="bg-[#0B2238] p-3 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${getStatusDot(activeProject.status)} animate-pulse`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                  {activeProject.status.replace("_", " ")}
                </span>
              </div>
              <h2
                className="font-extrabold text-sm text-white tracking-tight leading-snug line-clamp-2"
                title={activeProject.title}
              >
                {activeProject.title}
              </h2>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-mono bg-[#051422] px-1.5 py-0.5 rounded border border-slate-700/50">
                  ID: {activeProject.id.slice(0, 12)}...
                </span>
                <span className="truncate max-w-[100px] text-right font-medium text-slate-300">
                  {activeProject.research_field}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Library View Header */
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#123B63] border border-[#2563EB]/40 flex items-center justify-center text-teal-400 shadow-sm">
              <Compass className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-white tracking-tight leading-tight">
                RESEARCH COMPASS
              </h1>
              <p className="text-[10px] tracking-wider text-teal-400 font-semibold uppercase mt-0.5">
                Scholarly Intelligence
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5 no-scrollbar">
        {view === "workspace" ? (
          <>
            {/* SECTION 1: 8 Core Research Modules */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 mb-2">
                <h3 className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">
                  Research Dashboard
                </h3>
                <span className="text-[9px] font-mono text-slate-500 uppercase">8 Modules</span>
              </div>

              <div className="space-y-0.5">
                {workspaceModules.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab?.(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[#1E40AF] text-white font-semibold shadow-xs border border-blue-400/40"
                          : "text-slate-300 hover:text-white hover:bg-[#0E2840]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? "text-blue-200" : "text-slate-400"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${
                            item.badgeColor ||
                            (isActive
                              ? "bg-white/20 text-white border-white/20"
                              : "bg-[#0B2238] text-slate-300 border-slate-700/60")
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: Advanced Scientific Tools */}
            <div className="space-y-1 pt-2 border-t border-[#1E293B]">
              <div className="flex items-center justify-between px-3 mb-2">
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Scientific Tools
                </h3>
                <span className="text-[9px] font-mono text-slate-500 uppercase">Advanced</span>
              </div>

              <div className="space-y-0.5">
                {scientificTools.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab?.(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[#123B63] text-white font-semibold shadow-xs border border-[#2563EB]/40"
                          : "text-slate-400 hover:text-slate-200 hover:bg-[#0E2840]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? "text-blue-400" : "text-slate-500"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${
                            item.badgeColor || "bg-[#0B2238] text-slate-400 border-slate-700/60"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* LIBRARY VIEW NAVIGATION */
          <>
            {/* Primary Library Navigation */}
            <div className="space-y-1">
              <h3 className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider px-3 mb-2">
                Navigation
              </h3>

              <div className="space-y-0.5">
                <button
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold bg-[#1E40AF] text-white shadow-xs border border-blue-400/40"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderKanban className="w-4 h-4 text-blue-200" />
                    <span>Research Library</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/20 text-white font-bold">
                    {projects.length}
                  </span>
                </button>

                {onOpenNewResearch && (
                  <button
                    onClick={onOpenNewResearch}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[#0E2840] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <PlusCircle className="w-4 h-4 text-teal-400" />
                      <span>New Research</span>
                    </div>
                    <span className="text-[10px] text-teal-400 font-semibold">+ Add</span>
                  </button>
                )}

                {onOpenCropDemo && (
                  <button
                    onClick={onOpenCropDemo}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[#0E2840] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FlaskConical className="w-4 h-4 text-amber-400" />
                      <span>Demo Investigation</span>
                    </div>
                    <span className="text-[9px] bg-amber-900/40 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-semibold">
                      Live
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Switcher / Projects List */}
            <div className="space-y-1 pt-2 border-t border-[#1E293B]">
              <div className="flex items-center justify-between px-3 mb-2">
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Active Projects
                </h3>
                <span className="text-[9px] font-mono text-slate-500">Quick Jump</span>
              </div>

              <div className="space-y-1">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelectProject?.(p)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all text-slate-300 hover:text-white hover:bg-[#0E2840] group border border-transparent hover:border-slate-700/50"
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-0.5">
                      <span className="font-semibold truncate text-slate-200 group-hover:text-blue-300">
                        {p.title}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{p.papers?.length || 0} papers</span>
                      <span className="font-mono">{p.id.slice(0, 10)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer System Status & Isolation Badge */}
      <div className="p-3 border-t border-[#1E293B] bg-[#051422] space-y-2">
        {view === "workspace" ? (
          <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
            <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Isolated Workspace</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">100% Isolated</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>OpenAlex &bull; Live</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500">Research v2.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}
