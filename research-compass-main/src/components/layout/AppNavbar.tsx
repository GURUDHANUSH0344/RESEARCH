import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  PlusCircle,
  Settings as SettingsIcon,
  LogIn,
  LogOut,
  User,
  FlaskConical,
  Search,
  CheckCircle2,
  ChevronDown,
  FileSearch,
} from "lucide-react";
import { type ResearchProjectData } from "@/lib/services/orchestrator";

interface AppNavbarProps {
  activeProject: ResearchProjectData | null;
  projects: ResearchProjectData[];
  onSelectProject: (project: ResearchProjectData) => void;
  onOpenNewResearch: () => void;
  onOpenCropDemo: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  user: { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } } | null;
  onLogout: () => void;
}

export function AppNavbar({
  activeProject,
  projects,
  onSelectProject,
  onOpenNewResearch,
  onOpenCropDemo,
  onOpenSettings,
  onOpenAuth,
  user,
  onLogout,
}: AppNavbarProps) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      {/* Left: Active Project Indicator & Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 line-clamp-1 max-w-[220px] sm:max-w-xs md:max-w-md">
                {activeProject?.title || "AI Research Project"}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                Active Lab
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {activeProject?.research_field || "Computer Science & Biology"} &bull; OpenAlex Verified
            </p>
          </div>
        </div>
      </div>

      {/* Center / Right: Actions, Settings, and Auth Profile */}
      <div className="flex items-center gap-2.5">
        {/* Featured Demo Button */}
        <Button
          onClick={onOpenCropDemo}
          size="sm"
          variant="outline"
          className="hidden md:flex items-center gap-1.5 border-teal-200 bg-teal-50/50 hover:bg-teal-50 text-teal-700 text-xs font-semibold h-9 px-3 rounded-lg shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>AI Crop Disease Demo</span>
        </Button>

        {/* New Research Button */}
        <Button
          onClick={onOpenNewResearch}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 h-9 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Research</span>
        </Button>

        {/* Settings */}
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenSettings}
          className="h-9 w-9 border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
          title="AI & API Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </Button>

        {/* User Auth Profile */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="text-xs font-semibold text-slate-900 leading-tight">
                {user.user_metadata?.full_name || user.email?.split("@")[0] || "Researcher"}
              </span>
              <span className="text-[10px] text-slate-500 leading-tight max-w-[140px] truncate">
                {user.email}
              </span>
            </div>

            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="User Avatar"
                className="w-8 h-8 rounded-full border border-slate-200 object-cover shadow-2xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold shadow-2xs">
                {(user.user_metadata?.full_name || user.email || "R").charAt(0).toUpperCase()}
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAuth}
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 rounded-lg flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5 text-blue-600" />
            <span>Sign In</span>
          </Button>
        )}
      </div>
    </header>
  );
}
