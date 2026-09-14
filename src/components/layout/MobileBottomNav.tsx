import React from "react";
import {
  Compass,
  FolderKanban,
  MessageSquare,
  CheckSquare,
  User,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { type WorkspaceTab } from "@/components/workspace/ResearchWorkspace";
import { type ResearchProject } from "@/types/research";

export type MobileNavDestination = "library" | "research" | "chat" | "tasks" | "profile";

interface MobileBottomNavProps {
  view: "library" | "workspace";
  currentTab?: WorkspaceTab;
  activeProject: ResearchProject | null;
  tasksCount?: { total: number; completed: number };
  onNavigate: (destination: MobileNavDestination) => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenAccount?: () => void;
  user: any;
}

export function MobileBottomNav({
  view,
  currentTab,
  activeProject,
  tasksCount = { total: 0, completed: 0 },
  onNavigate,
  onOpenSettings,
  onOpenAuth,
  onOpenAccount,
  user,
}: MobileBottomNavProps) {
  // Determine active item
  const isHomeActive = view === "library";
  const isResearchActive = view === "workspace" && (currentTab === "overview" || currentTab === "papers" || currentTab === "findings" || currentTab === "references" || currentTab === "timeline" || currentTab === "final_output");
  const isAiActive = view === "workspace" && currentTab === "chat";
  const isTasksActive = view === "workspace" && currentTab === "tasks";

  const handleProfileClick = () => {
    if (user) {
      if (onOpenAccount) {
        onOpenAccount();
      } else {
        onOpenSettings();
      }
    } else {
      onOpenAuth();
    }
  };

  const navItems = [
    {
      id: "library" as MobileNavDestination,
      label: "Home",
      icon: Compass,
      isActive: isHomeActive,
      onClick: () => onNavigate("library"),
    },
    {
      id: "research" as MobileNavDestination,
      label: activeProject ? "Research" : "Projects",
      icon: activeProject ? BookOpen : FolderKanban,
      isActive: isResearchActive,
      onClick: () => onNavigate("research"),
      badge: activeProject?.papers?.length ? `${activeProject.papers.length}` : undefined,
    },
    {
      id: "chat" as MobileNavDestination,
      label: "AI",
      icon: MessageSquare,
      isActive: isAiActive,
      onClick: () => onNavigate("chat"),
      highlight: true,
    },
    {
      id: "tasks" as MobileNavDestination,
      label: "Tasks",
      icon: CheckSquare,
      isActive: isTasksActive,
      onClick: () => onNavigate("tasks"),
      badge:
        tasksCount.total > 0
          ? `${tasksCount.completed}/${tasksCount.total}`
          : undefined,
    },
    {
      id: "profile" as MobileNavDestination,
      label: user ? "Profile" : "Sign In",
      icon: User,
      isActive: false,
      onClick: handleProfileClick,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-lg md:hidden select-none pb-safe transition-all"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto px-1 items-center font-sans">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={`relative flex flex-col items-center justify-center h-full w-full py-1 transition-all touch-target-44 cursor-pointer focus:outline-none ${
                active ? "text-[#243B64]" : "text-[#64748B] hover:text-[#172033]"
              }`}
            >
              {/* Active top pill indicator (Accent: #536DFE) */}
              {active && (
                <span className="absolute top-0 w-8 h-1 bg-[#536DFE] rounded-b-full shadow-xs" />
              )}

              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    active ? "scale-110 stroke-[2.4] text-[#536DFE]" : "stroke-[1.8] text-[#64748B]"
                  }`}
                />

                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 px-1.5 py-0.2 text-[9px] font-bold font-mono rounded-full bg-[#EEF2FF] text-[#536DFE] border border-indigo-100">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 leading-tight truncate max-w-[58px] ${
                  active ? "font-semibold text-[#243B64]" : "font-normal text-[#64748B]"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
