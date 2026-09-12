import React, { useState } from "react";
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
  ChevronDown,
  Compass,
  X,
} from "lucide-react";
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
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
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
  isMobileOpen = false,
  onCloseMobile,
}: AppSidebarProps) {
  const [toolsExpanded, setToolsExpanded] = useState(false);

  // 8 Core Research Workspace Modules
  const workspaceModules = [
    {
      id: "overview" as WorkspaceTab,
      label: "Overview",
      icon: LayoutDashboard,
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

  const handleTabClick = (tab: WorkspaceTab) => {
    onSelectTab?.(tab);
    onCloseMobile?.();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#081B2E] text-slate-300 select-none overflow-hidden border-r border-[#152D47]">
      {/* Top Header */}
      <div className="p-3.5 border-b border-[#152D47] flex items-center justify-between">
        {view === "workspace" && activeProject ? (
          <div className="w-full">
            {/* Back Button */}
            <div className="flex items-center justify-between mb-2.5">
              <button
                onClick={() => {
                  onBackToLibrary?.();
                  onCloseMobile?.();
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-300 hover:text-white transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Library</span>
              </button>

              {onCloseMobile && (
                <button
                  onClick={onCloseMobile}
                  className="md:hidden p-1 text-slate-400 hover:text-white"
                  title="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Current Research Card */}
            <div className="bg-[#0D243B] p-2.5 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(activeProject.status)} animate-pulse`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                  {activeProject.status.replace("_", " ")}
                </span>
              </div>
              <h2
                className="font-heading font-bold text-xs text-white tracking-tight line-clamp-2"
                title={activeProject.title}
              >
                {activeProject.title}
              </h2>
              <div className="mt-1 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                <span className="bg-[#051422] px-1 py-0.2 rounded border border-slate-700/50">
                  {activeProject.id.slice(0, 10)}
                </span>
                <span className="truncate max-w-[85px] text-slate-400 font-sans">
                  {activeProject.research_field}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Library Header */
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600/90 border border-blue-400/40 flex items-center justify-center text-white shadow-2xs">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-heading font-extrabold text-xs text-white tracking-tight leading-tight">
                  RESEARCH COMPASS
                </h1>
                <p className="text-[9px] tracking-wider text-teal-400 font-semibold uppercase">
                  Library & Workspace
                </p>
              </div>
            </div>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1 text-slate-400 hover:text-white"
                title="Close Menu"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation Modules Section */}
      <div className="flex-1 overflow-y-auto py-2.5 px-2.5 space-y-4 no-scrollbar">
        {view === "workspace" ? (
          <>
            {/* 8 Core Research Modules */}
            <div className="space-y-0.5">
              <div className="px-2.5 py-1 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Research Modules
                </span>
                <span className="text-[9px] font-mono text-slate-500">8</span>
              </div>

              {workspaceModules.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#1E40AF] text-white font-semibold shadow-2xs border-l-2 border-blue-300"
                        : "text-slate-300 hover:text-white hover:bg-[#0E2840]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                          isActive ? "text-blue-200" : "text-slate-400"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${
                          item.badgeColor ||
                          (isActive
                            ? "bg-white/20 text-white border-white/20"
                            : "bg-[#0A2238] text-slate-300 border-slate-700/50")
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Scientific Tools (Collapsible / Subtle) */}
            <div className="space-y-0.5 pt-2 border-t border-[#152D47]">
              <button
                onClick={() => setToolsExpanded(!toolsExpanded)}
                className="w-full px-2.5 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <span>Scientific Tools</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    toolsExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {toolsExpanded && (
                <div className="space-y-0.5 pt-0.5 animate-fade-slide">
                  {scientificTools.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#123B63] text-white font-medium border border-blue-500/30"
                            : "text-slate-400 hover:text-slate-200 hover:bg-[#0E2840]"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#0A2238] text-slate-400 border border-slate-700/50 font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Library Mode Navigation */
          <>
            <div className="space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Library
              </div>

              <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1E40AF] text-white shadow-2xs">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-3.5 h-3.5 text-blue-200" />
                  <span>All Projects</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/20 text-white font-bold">
                  {projects.length}
                </span>
              </button>

              {onOpenNewResearch && (
                <button
                  onClick={() => {
                    onOpenNewResearch();
                    onCloseMobile?.();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[#0E2840] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
                    <span>New Research</span>
                  </div>
                  <span className="text-[9px] text-teal-400 font-semibold">+ New</span>
                </button>
              )}

              {onOpenCropDemo && (
                <button
                  onClick={() => {
                    onOpenCropDemo();
                    onCloseMobile?.();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[#0E2840] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                    <span>Crop Demo</span>
                  </div>
                  <span className="text-[9px] bg-amber-900/40 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded font-semibold">
                    Demo
                  </span>
                </button>
              )}
            </div>

            {/* Quick Switcher Projects */}
            <div className="space-y-1 pt-2 border-t border-[#152D47]">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Workspaces
              </div>

              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProject?.(p);
                    onCloseMobile?.();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all text-slate-300 hover:text-white hover:bg-[#0E2840] group cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold truncate text-slate-200 group-hover:text-blue-300 text-[11px]">
                      {p.title}
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-blue-400 shrink-0" />
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-500 mt-0.5">
                    <span>{p.papers?.length || 0} papers</span>
                    <span className="font-mono">{p.id.slice(0, 8)}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer System Status */}
      <div className="p-2.5 border-t border-[#152D47] bg-[#051422] text-[10px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-teal-400 font-medium">
          <ShieldCheck className="w-3 h-3" />
          <span>{view === "workspace" ? "Data Isolated" : "OpenAlex & Crossref"}</span>
        </div>
        <span className="font-mono text-slate-500">v2.0</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:flex w-60 xl:w-64 shrink-0 h-full flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={onCloseMobile}
          />
          {/* Slide-in Sidebar Panel */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
