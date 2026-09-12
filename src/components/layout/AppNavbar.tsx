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
  Compass,
  ArrowLeft,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { type ResearchProject } from "@/types/research";

interface AppNavbarProps {
  activeProject: ResearchProject | null;
  isInWorkspace: boolean;
  onBackToLibrary: () => void;
  onOpenNewResearch: () => void;
  onOpenCropDemo: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  user: { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } } | null;
  onLogout: () => void;
}

export function AppNavbar({
  activeProject,
  isInWorkspace,
  onBackToLibrary,
  onOpenNewResearch,
  onOpenCropDemo,
  onOpenSettings,
  onOpenAuth,
  user,
  onLogout,
}: AppNavbarProps) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs select-none">
      {/* Left: Branding & Research Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToLibrary}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 border border-blue-700 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight leading-tight">
                RESEARCH COMPASS
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 text-[10px] font-extrabold border border-blue-200">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              Autonomous Intelligence
            </p>
          </div>
        </button>

        {/* In-Workspace Context indicator */}
        {isInWorkspace && activeProject && (
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800 max-w-[220px] truncate">
                {activeProject.title}
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                {activeProject.id}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions, Settings, and Auth Profile */}
      <div className="flex items-center gap-2.5">
        {/* If in workspace, show 'Library' button */}
        {isInWorkspace && (
          <Button
            onClick={onBackToLibrary}
            size="sm"
            variant="ghost"
            className="text-xs font-semibold h-9 px-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Library</span>
          </Button>
        )}

        {/* Featured Demo Button */}
        <Button
          onClick={onOpenCropDemo}
          size="sm"
          variant="outline"
          className="hidden md:flex items-center gap-1.5 border-teal-200 bg-teal-50/50 hover:bg-teal-50 text-teal-700 text-xs font-semibold h-9 px-3 rounded-xl shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Demo Case</span>
        </Button>

        {/* New Research Button */}
        <Button
          onClick={onOpenNewResearch}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 h-9 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Research</span>
        </Button>

        {/* Settings */}
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenSettings}
          className="h-9 w-9 border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl"
          title="Global Settings & API Keys"
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
              className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
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
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 rounded-xl flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5 text-blue-600" />
            <span>Sign In</span>
          </Button>
        )}
      </div>
    </header>
  );
}
