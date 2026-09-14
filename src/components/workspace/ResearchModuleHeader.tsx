import React from "react";
import { StageCompletionButton } from "./StageCompletionButton";
import { Sparkles, RefreshCw } from "lucide-react";

export interface ResearchModuleHeaderProps {
  icon: React.ReactNode;
  iconBgClass?: string;
  title: string;
  countLabel: string;
  countBadgeClass?: string;
  description: string;
  researchTitle?: string;
  researchId: string;
  stageName: string;
  isStageCompleted?: boolean;
  onToggleStageCompletion?: () => void;
  aiAction?: {
    label: string;
    loadingLabel?: string;
    onClick: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
  };
  secondaryActions?: React.ReactNode;
  banner?: React.ReactNode;
}

export function ResearchModuleHeader({
  icon,
  iconBgClass = "bg-blue-50 text-blue-600 border-blue-200",
  title,
  countLabel,
  countBadgeClass = "bg-blue-50 text-blue-700 border-blue-200",
  description,
  researchTitle,
  researchId,
  stageName,
  isStageCompleted,
  onToggleStageCompletion,
  aiAction,
  secondaryActions,
  banner,
}: ResearchModuleHeaderProps) {
  return (
    <div className="bg-white rounded-[14px] border border-slate-200/80 shadow-2xs p-5 sm:p-7 md:p-8 space-y-4">
      {/* Main Top Row: Left Context & Right Action Grid */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Module Icon + Title + Meta */}
        <div className="flex items-start gap-4 min-w-0">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${iconBgClass}`}
          >
            {icon}
          </div>

          <div className="space-y-1.5 min-w-0">
            {/* Title & Count Badge */}
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold font-heading text-slate-900 tracking-tight leading-tight">
                {title}
              </h1>
              <span
                className={`text-xs sm:text-sm font-semibold px-3 py-1 rounded-full border whitespace-nowrap ${countBadgeClass}`}
              >
                {countLabel}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-[15px] text-slate-500 font-normal leading-relaxed">
              {description}
            </p>

            {/* Research Context & ID */}
            <div className="text-xs sm:text-[13px] text-slate-500 font-medium pt-0.5 flex items-center gap-1.5 flex-wrap">
              {researchTitle && (
                <>
                  <span>
                    Research: <strong className="text-slate-800 font-semibold">{researchTitle}</strong>
                  </span>
                  <span className="text-slate-300 hidden sm:inline">&bull;</span>
                </>
              )}
              <span>
                Scoped strictly to Research ID:{" "}
                <span className="font-mono font-semibold text-slate-700">{researchId}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions Container */}
        {/* Desktop Layout: 2 aligned horizontal rows with 12px gap */}
        <div className="hidden md:flex flex-col items-end gap-2.5 shrink-0">
          {/* Row 1: Primary Completion Action + Primary AI Action */}
          <div className="flex items-center gap-2.5">
            {onToggleStageCompletion && (
              <StageCompletionButton
                stageName={stageName}
                isCompleted={isStageCompleted}
                onToggle={onToggleStageCompletion}
                size="default"
              />
            )}

            {aiAction && (
              <button
                type="button"
                onClick={aiAction.onClick}
                disabled={aiAction.disabled || aiAction.isLoading}
                className="h-9 px-3.5 rounded-xl bg-[#243B64] hover:bg-[#1D3154] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {aiAction.isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{aiAction.loadingLabel || "Processing..."}</span>
                  </>
                ) : (
                  <>
                    {aiAction.icon || <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                    <span>{aiAction.label}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Row 2: Secondary Actions */}
          {secondaryActions && (
            <div className="flex items-center gap-2.5">
              {secondaryActions}
            </div>
          )}
        </div>

        {/* Mobile Layout: Stacked vertically with 10px spacing */}
        <div className="flex md:hidden flex-col gap-2.5 w-full pt-1">
          {onToggleStageCompletion && (
            <StageCompletionButton
              stageName={stageName}
              isCompleted={isStageCompleted}
              onToggle={onToggleStageCompletion}
              size="default"
              className="w-full justify-center"
            />
          )}

          {aiAction && (
            <button
              type="button"
              onClick={aiAction.onClick}
              disabled={aiAction.disabled || aiAction.isLoading}
              className="h-9 px-3.5 rounded-xl bg-[#243B64] hover:bg-[#1D3154] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {aiAction.isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{aiAction.loadingLabel || "Processing..."}</span>
                </>
              ) : (
                <>
                  {aiAction.icon || <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                  <span>{aiAction.label}</span>
                </>
              )}
            </button>
          )}

          {secondaryActions && (
            <div className="flex flex-col gap-2.5 w-full [&>button]:w-full [&>button]:justify-center">
              {secondaryActions}
            </div>
          )}
        </div>
      </div>

      {/* Optional In-Header Banners / Alerts */}
      {banner && <div className="pt-2">{banner}</div>}
    </div>
  );
}
