import React from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  PlusCircle,
  Settings as SettingsIcon,
  LogIn,
  LogOut,
  Compass,
  ArrowLeft,
  Menu,
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
  user: { id?: string; email?: string; user_metadata?: { full_name?: string; avatar_url?: string } } | null;
  onLogout: () => void;
  onOpenAccount?: () => void;
  onToggleMobileMenu?: () => void;
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
  onOpenAccount,
  onToggleMobileMenu,
}: AppNavbarProps) {
  return (
    <header className="h-14 sm:h-15 border-b border-[#E2E8F0] bg-white px-3 sm:px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40 shadow-2xs select-none transition-all">
      {/* 📱 MOBILE IN-WORKSPACE TOP BAR */}
      {isInWorkspace && activeProject ? (
        <div className="flex md:hidden items-center justify-between w-full gap-2">
          {/* Back button */}
          <button
            type="button"
            onClick={onBackToLibrary}
            className="flex items-center gap-1 text-xs font-medium text-[#64748B] hover:text-[#243B64] touch-target-44 py-2 pr-2 -ml-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {/* Project Title & Status / Progress */}
          <div className="flex-1 min-w-0 text-center px-1">
            <h1 className="font-semibold text-xs text-[#172033] truncate leading-tight">
              {activeProject.title}
            </h1>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span className="text-[10px] text-[#536DFE] font-medium">
                {activeProject.progress || 0}% Complete
              </span>
            </div>
          </div>

          {/* User Profile Avatar / Settings */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={user ? onOpenSettings : onOpenAuth}
              className="touch-target-44 flex items-center justify-center p-1 cursor-pointer focus:outline-none"
              title={user ? "Settings & Profile" : "Sign In"}
            >
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="w-7 h-7 rounded-full border border-[#E2E8F0] object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#EEF2FF] border border-indigo-100 text-[#536DFE] text-xs font-bold flex items-center justify-center">
                  {(user?.user_metadata?.full_name || user?.email || "R").charAt(0).toUpperCase()}
                </div>
              )}
            </button>
          </div>
        </div>
      ) : null}

      {/* 💻 DESKTOP & TABLET HEADER (or Mobile Library Header) */}
      <div className={`${isInWorkspace && activeProject ? "hidden md:flex" : "flex"} items-center justify-between w-full`}>
        {/* Left Side: Branding & Tablet Menu */}
        <div className="flex items-center gap-2.5">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="hidden sm:flex md:hidden p-1.5 -ml-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors focus:outline-none cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onBackToLibrary}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#243B64] flex items-center justify-center text-white shadow-2xs group-hover:bg-[#1D3154] transition-colors shrink-0">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs tracking-tight text-[#172033] leading-tight">
                  Research Compass
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#64748B] text-[9px] font-semibold border border-[#E2E8F0]">
                  Workspace
                </span>
              </div>
              <p className="text-[10px] text-[#64748B] font-normal tracking-tight">
                From Research Idea to Final Paper
              </p>
            </div>
          </button>

          {/* In-Workspace Context indicator (Desktop) */}
          {isInWorkspace && activeProject && (
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-[#E2E8F0]">
              <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-xs font-semibold text-[#172033] max-w-[200px] xl:max-w-[280px] truncate">
                  {activeProject.title}
                </span>
                <span className="text-[10px] font-mono text-[#94A3B8] bg-white px-1.5 py-0.2 rounded border border-[#E2E8F0]">
                  {activeProject.id}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Actions, Settings, and Auth Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* If in workspace, show 'Library' button on desktop */}
          {isInWorkspace && (
            <Button
              onClick={onBackToLibrary}
              size="sm"
              variant="ghost"
              className="hidden md:flex text-xs font-medium h-8 px-3 text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Library</span>
            </Button>
          )}

          {/* Featured Demo Button (Desktop) */}
          <Button
            onClick={onOpenCropDemo}
            size="sm"
            variant="outline"
            className="hidden lg:flex items-center gap-1.5 border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#172033] text-xs font-medium h-8 px-3 rounded-lg shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#536DFE]" />
            <span>Demo Case</span>
          </Button>

          {/* New Research Button */}
          <Button
            onClick={onOpenNewResearch}
            size="sm"
            className="bg-[#243B64] hover:bg-[#1D3154] text-white text-xs font-semibold px-3 sm:px-3.5 h-8 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ New Research</span>
            <span className="sm:hidden">+ New</span>
          </Button>

          {/* Settings Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={onOpenSettings}
            className="h-8 w-8 border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC] rounded-lg cursor-pointer"
            title="Settings & API Keys"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
          </Button>

          {/* User Profile */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-2 border-l border-[#E2E8F0]">
              <button
                type="button"
                onClick={onOpenAccount}
                className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity cursor-pointer group"
                title="View Researcher Account & Statistics"
              >
                <div className="hidden xl:flex flex-col items-end text-right">
                  <span className="text-xs font-semibold text-[#172033] group-hover:text-[#243B64] leading-tight transition-colors">
                    {user.user_metadata?.full_name || user.email?.split("@")[0] || "Researcher"}
                  </span>
                  <span className="text-[10px] text-[#64748B] leading-tight max-w-[120px] truncate">
                    {user.email}
                  </span>
                </div>

                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border border-[#E2E8F0] object-cover shadow-2xs group-hover:border-[#536DFE] transition-colors"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#172033] text-xs font-semibold shadow-2xs group-hover:border-[#536DFE] transition-colors">
                    {(user.user_metadata?.full_name || user.email || "R").charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="hidden sm:flex h-8 w-8 text-[#94A3B8] hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAuth}
              className="border-[#E2E8F0] bg-white text-[#172033] hover:bg-[#F8FAFC] text-xs font-medium h-8 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#536DFE]" />
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
