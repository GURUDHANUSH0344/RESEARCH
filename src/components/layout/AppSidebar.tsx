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
  Settings as SettingsIcon,
  Star,
  History,
  X,
  User as UserIcon,
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
  user?: any;
  onOpenAccount?: () => void;
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
  user,
  onOpenAccount,
}: AppSidebarProps) {
  const [advancedToolsExpanded, setAdvancedToolsExpanded] = useState(false);

  // Core Workspace Modules
  const workspaceModules = [
    {
      id: "overview" as WorkspaceTab,
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "papers" as WorkspaceTab,
      label: "Papers",
      icon: BookOpen,
      badge: activeProject?.papers?.length ? `${activeProject.papers.length}` : undefined,
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    },
    {
      id: "chat" as WorkspaceTab,
      label: "AI Assistant",
      icon: MessageSquare,
      badge: "Grounded",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-400/30",
    },
    {
      id: "notes" as WorkspaceTab,
      label: "Notes",
      icon: FileText,
      badge: notesCount > 0 ? `${notesCount}` : undefined,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    },
    {
      id: "findings" as WorkspaceTab,
      label: "Findings",
      icon: Sparkles,
      badge: findingsCount > 0 ? `${findingsCount}` : undefined,
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-400/30",
    },
    {
      id: "tasks" as WorkspaceTab,
      label: "Tasks",
      icon: CheckSquare,
      badge:
        tasksCount.total > 0 ? `${tasksCount.completed}/${tasksCount.total}` : undefined,
      badgeColor:
        tasksCount.completed === tasksCount.total && tasksCount.total > 0
          ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
          : "bg-blue-500/20 text-blue-300 border-blue-400/30",
    },
  ];

  // Output items
  const outputItems = [
    {
      id: "final_output" as WorkspaceTab,
      label: "Final Paper",
      icon: FileText,
      badge: "Paper",
      badgeColor: "bg-blue-500/25 text-blue-300 border-blue-400/40",
    },
    {
      id: "final_output" as WorkspaceTab,
      label: "Patent Draft",
      icon: FileCheck,
      badge: "Patent",
      badgeColor: "bg-purple-500/25 text-purple-300 border-purple-400/40",
    },
  ];

  // Advanced deep scientific tools
  const advancedTools = [
    {
      id: "timeline" as WorkspaceTab,
      label: "Timeline",
      icon: Clock,
    },
    {
      id: "references" as WorkspaceTab,
      label: "References",
      icon: BookMarked,
    },
    {
      id: "experiment" as WorkspaceTab,
      label: "Experiment Protocol",
      icon: TestTube,
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
    <div className="flex flex-col h-full bg-white text-[#172033] select-none overflow-hidden border-r border-[#E2E8F0] font-sans antialiased">
      {/* 1. Header & Branding */}
      <div className="p-3.5 border-b border-[#E2E8F0] shrink-0 bg-white">
        <div className="flex items-center justify-between w-full">
          <button
            onClick={() => {
              onBackToLibrary?.();
              onCloseMobile?.();
            }}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#243B64] flex items-center justify-center text-white shadow-2xs group-hover:bg-[#1D3154] transition-colors">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading font-bold text-xs text-[#172033] tracking-tight leading-tight block">
                Research Compass
              </span>
              <p className="text-[9px] tracking-wider text-[#64748B] font-medium">
                {view === "workspace" && activeProject ? "Research Workspace" : "Academic Workspace"}
              </p>
            </div>
          </button>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 text-slate-400 hover:text-slate-700"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Primary Action: New Research */}
        {onOpenNewResearch && (
          <div className="mt-3">
            <button
              onClick={() => {
                onOpenNewResearch();
                onCloseMobile?.();
              }}
              className="w-full bg-[#243B64] hover:bg-[#1D3154] text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Research</span>
            </button>
          </div>
        )}
      </div>

      {/* Active Project Card (if inside Workspace) */}
      {view === "workspace" && activeProject && (
        <div className="px-3 pt-3 shrink-0">
          <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(activeProject.status)}`} />
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#536DFE]">
                  {activeProject.status.replace("_", " ")}
                </span>
              </div>
              <button
                onClick={() => {
                  onBackToLibrary?.();
                  onCloseMobile?.();
                }}
                className="text-[10px] font-semibold text-[#64748B] hover:text-[#243B64] flex items-center gap-1 transition-colors cursor-pointer"
                title="Back to All Research"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Library</span>
              </button>
            </div>

            <h2
              className="font-heading font-semibold text-xs text-[#172033] tracking-tight line-clamp-2 leading-snug"
              title={activeProject.title}
            >
              {activeProject.title}
            </h2>

            <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-500 font-mono">
              <span className="bg-white px-1 py-0.2 rounded border border-[#E2E8F0]">
                {activeProject.id.slice(0, 10)}
              </span>
              <span className="truncate max-w-[90px] text-slate-500 font-sans font-medium">
                {activeProject.research_field}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Scrollable Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4 no-scrollbar">
        {/* GROUP A: MY RESEARCH */}
        <div className="space-y-0.5">
          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
            My Research
          </div>

          <button
            onClick={() => {
              onBackToLibrary?.();
              onCloseMobile?.();
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              view === "library"
                ? "bg-[#EEF2FF] text-[#243B64] font-semibold border-r-2 border-[#536DFE]"
                : "text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] font-medium"
            }`}
          >
            <div className="flex items-center gap-2">
              <FolderKanban className={`w-3.5 h-3.5 ${view === "library" ? "text-[#536DFE]" : "text-slate-400"}`} />
              <span>All Research</span>
            </div>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-sans font-bold ${
                view === "library" ? "bg-white text-[#243B64] shadow-2xs" : "bg-[#F1F5F9] text-slate-500 border border-slate-200"
              }`}
            >
              {projects.length}
            </span>
          </button>

          <button
            onClick={() => {
              onBackToLibrary?.();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Recent</span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono">
              {Math.min(projects.length, 3)}
            </span>
          </button>

          <button
            onClick={() => {
              onBackToLibrary?.();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>Favorites</span>
            </div>
          </button>

          {onOpenCropDemo && (
            <button
              onClick={() => {
                onOpenCropDemo();
                onCloseMobile?.();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FlaskConical className="w-3.5 h-3.5 text-[#536DFE]" />
                <span>Crop Demo</span>
              </div>
              <span className="text-[9px] bg-indigo-50 text-[#536DFE] border border-indigo-100 px-1.5 py-0.2 rounded font-semibold">
                Demo
              </span>
            </button>
          )}
        </div>

        {/* GROUP B: WORKSPACE (When Project Active) */}
        {view === "workspace" && activeProject ? (
          <div className="space-y-0.5 pt-2 border-t border-[#E2E8F0]">
            <div className="px-2.5 py-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Workspace
              </span>
              <span className="text-[9px] font-mono text-slate-400 font-medium">6</span>
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
                      ? "bg-[#EEF2FF] text-[#243B64] font-semibold border-r-2 border-[#536DFE]"
                      : "text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        isActive ? "text-[#536DFE]" : "text-slate-400"
                      }`}
                    />
                    <span
                      className={`truncate ${
                        isActive ? "font-semibold text-[#243B64]" : "font-medium text-[#64748B]"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${
                        isActive
                          ? "bg-white text-[#243B64] border-indigo-200"
                          : "bg-[#F1F5F9] text-slate-500 border-slate-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Advanced Tools Sub-group */}
            <div className="pt-1.5">
              <button
                onClick={() => setAdvancedToolsExpanded(!advancedToolsExpanded)}
                className="w-full px-2.5 py-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8] hover:text-slate-700 cursor-pointer"
              >
                <span>Advanced Tools</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    advancedToolsExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {advancedToolsExpanded && (
                <div className="space-y-0.5 pt-0.5 animate-fade-slide">
                  {advancedTools.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#EEF2FF] text-[#243B64] font-semibold border-r-2 border-[#536DFE]"
                            : "text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9]"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#536DFE]" : "text-slate-400"}`} />
                          <span
                            className={`truncate ${
                              isActive ? "font-semibold text-[#243B64]" : "font-medium text-[#64748B]"
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* WORKSPACE (In Library View: Show Quick Switcher Projects) */
          <div className="space-y-1 pt-2 border-t border-[#E2E8F0]">
            <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Workspaces
            </div>

            {projects.slice(0, 5).map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelectProject?.(p);
                  onCloseMobile?.();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] group cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold truncate text-[#172033] group-hover:text-[#536DFE] text-[11px] tracking-tight">
                    {p.title}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[#536DFE] shrink-0" />
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-400 mt-0.5 font-sans">
                  <span>{p.papers?.length || 0} papers</span>
                  <span className="font-mono">{p.id.slice(0, 8)}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* GROUP C: OUTPUT */}
        <div className="space-y-0.5 pt-2 border-t border-[#E2E8F0]">
          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
            Output
          </div>

          {outputItems.map((item) => {
            const Icon = item.icon;
            const isActive = view === "workspace" && currentTab === item.id;

            return (
              <button
                key={item.label}
                onClick={() => {
                  if (activeProject) {
                    handleTabClick(item.id);
                  } else if (projects.length > 0) {
                    onSelectProject?.(projects[0]);
                    setTimeout(() => onSelectTab?.(item.id), 50);
                    onCloseMobile?.();
                  }
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#EEF2FF] text-[#243B64] font-semibold border-r-2 border-[#536DFE]"
                    : "text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] font-medium"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#536DFE]" : "text-slate-400"}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-sans font-semibold border ${
                    isActive
                      ? "bg-white text-[#243B64] border-indigo-200"
                      : "bg-[#F1F5F9] text-slate-500 border-slate-200"
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Footer: User Profile, Settings & Version */}
      <div className="p-2.5 border-t border-[#E2E8F0] bg-[#FAFAFB] text-slate-500 shrink-0 space-y-1">
        {user && onOpenAccount && (
          <button
            onClick={() => {
              onOpenAccount();
              onCloseMobile?.();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-[#172033] hover:bg-white border border-transparent hover:border-[#E2E8F0] transition-all cursor-pointer shadow-2xs group"
          >
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                className="w-5 h-5 rounded-full object-cover border border-[#E2E8F0] shrink-0"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#243B64] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                {(user.user_metadata?.full_name || user.email || "R").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 text-left truncate">
              <div className="text-xs font-semibold text-[#172033] truncate">
                {user.user_metadata?.full_name || user.email?.split("@")[0] || "Account"}
              </div>
              <div className="text-[10px] text-[#64748B] truncate">
                View Account & Stats
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#243B64] transition-colors shrink-0" />
          </button>
        )}

        {onOpenSettings && (
          <button
            onClick={() => {
              onOpenSettings();
              onCloseMobile?.();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#172033] hover:bg-white transition-colors cursor-pointer"
          >
            <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Settings</span>
          </button>
        )}

        <div className="px-2.5 py-1 text-[10px] flex items-center justify-between font-sans border-t border-[#E2E8F0]">
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <ShieldCheck className="w-3 h-3" />
            <span>Data Isolated</span>
          </div>
          <span className="font-mono text-slate-400">v2.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar: Fixed 240–260px */}
      <aside className="hidden md:flex w-60 xl:w-64 shrink-0 h-full flex-col">
        {sidebarContent}
      </aside>

      {/* Tablet Slide-in Drawer (Overlay) */}
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
