import React from "react";
import {
  LayoutDashboard,
  Cpu,
  BookOpen,
  Search,
  GitCompareArrows,
  Lightbulb,
  TestTube,
  TrendingUp,
  Network,
  ChartNoAxesCombined,
  FileText,
  MessageSquare,
  FlaskConical,
  Grid3X3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type ResearchProjectData } from "@/lib/services/orchestrator";

export type NavTab =
  | "dashboard"
  | "autonomous"
  | "literature"
  | "gaps"
  | "conflicts"
  | "comparison"
  | "trends"
  | "graph"
  | "hypotheses"
  | "experiment"
  | "results"
  | "report"
  | "chat";

interface AppSidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeProject: ResearchProjectData | null;
  isRunningPipeline?: boolean;
}

export function AppSidebar({
  currentTab,
  onSelectTab,
  activeProject,
  isRunningPipeline = false,
}: AppSidebarProps) {
  const sections = [
    {
      title: "OVERVIEW",
      items: [
        {
          id: "dashboard" as NavTab,
          label: "Dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "DISCOVERY",
      items: [
        {
          id: "autonomous" as NavTab,
          label: "Autonomous Pipeline",
          icon: Cpu,
          badge: isRunningPipeline ? "Active" : undefined,
          badgeColor: "bg-blue-600/30 text-blue-300 border-blue-500/40",
        },
        {
          id: "literature" as NavTab,
          label: "Literature Explorer",
          icon: BookOpen,
          badge: activeProject?.papers?.length ? `${activeProject.papers.length}` : undefined,
          badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/30",
        },
        {
          id: "gaps" as NavTab,
          label: "Research Gaps",
          icon: Search,
          badge: activeProject?.gaps?.length ? `${activeProject.gaps.length}` : undefined,
          badgeColor: "bg-teal-500/20 text-teal-300 border-teal-400/30",
        },
        {
          id: "conflicts" as NavTab,
          label: "Conflicting Evidence",
          icon: GitCompareArrows,
          badge: activeProject?.contradictions?.length ? `${activeProject.contradictions.length}` : undefined,
          badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/30",
        },
      ],
    },
    {
      title: "ANALYSIS",
      items: [
        {
          id: "comparison" as NavTab,
          label: "Evidence Matrix",
          icon: Grid3X3,
        },
        {
          id: "trends" as NavTab,
          label: "Research Trends",
          icon: TrendingUp,
        },
        {
          id: "graph" as NavTab,
          label: "Knowledge Graph",
          icon: Network,
        },
      ],
    },
    {
      title: "IDEATION",
      items: [
        {
          id: "hypotheses" as NavTab,
          label: "Hypothesis Lab",
          icon: Lightbulb,
          badge: activeProject?.hypotheses?.length ? `${activeProject.hypotheses.length}` : undefined,
          badgeColor: "bg-purple-500/20 text-purple-300 border-purple-400/30",
        },
        {
          id: "experiment" as NavTab,
          label: "Experiment Designer",
          icon: TestTube,
          badge: activeProject?.experiment ? "Ready" : undefined,
          badgeColor: "bg-teal-500/20 text-teal-300 border-teal-400/30",
        },
      ],
    },
    {
      title: "OUTPUT",
      items: [
        {
          id: "results" as NavTab,
          label: "Experiment Results",
          icon: ChartNoAxesCombined,
        },
        {
          id: "report" as NavTab,
          label: "Research Reports",
          icon: FileText,
          badge: activeProject?.report ? "1" : undefined,
          badgeColor: "bg-slate-700/50 text-slate-300 border-slate-600/40",
        },
        {
          id: "chat" as NavTab,
          label: "Research Assistant",
          icon: MessageSquare,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#071A2B] text-slate-300 flex flex-col shrink-0 border-r border-[#1E293B] select-none h-full overflow-hidden">
      {/* Sidebar Brand Header */}
      <div className="p-5 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#123B63] border border-[#2563EB]/40 flex items-center justify-center text-teal-400 shadow-sm">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-tight leading-tight">
              THE AUTONOMOUS
              <br />
              <span className="text-blue-400">RESEARCH SCIENTIST</span>
            </h1>
            <p className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase mt-0.5">
              AI Research Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
              {section.title}
            </h2>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#123B63] text-white font-semibold shadow-xs border border-[#2563EB]/30"
                        : "text-slate-300 hover:text-white hover:bg-[#0E2840]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-blue-400" : "text-slate-400"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${
                          item.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"
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
        ))}
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-[#1E293B] bg-[#051422]">
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 py-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="font-medium text-slate-300">OpenAlex &bull; Live</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400">v1.0 Lab</span>
        </div>
      </div>
    </aside>
  );
}
