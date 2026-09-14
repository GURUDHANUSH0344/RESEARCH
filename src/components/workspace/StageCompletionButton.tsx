import React from "react";
import { Check } from "lucide-react";

export interface StageCompletionButtonProps {
  stageName?: string;
  isCompleted?: boolean;
  onToggle?: () => void;
  className?: string;
  size?: "default" | "sm";
}

export function StageCompletionButton({
  stageName,
  isCompleted = false,
  onToggle,
  className = "",
  size = "default",
}: StageCompletionButtonProps) {
  if (!onToggle) return null;

  const isSm = size === "sm";

  if (isCompleted) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex items-center justify-center gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors duration-200 cursor-pointer shadow-xs group ${
          isSm
            ? "h-8 px-2.5 text-xs rounded-lg"
            : "h-9 px-3.5 text-xs rounded-xl"
        } ${className}`}
        title={`Stage ${stageName ? `"${stageName}" ` : ""}is completed. Click to mark as incomplete.`}
      >
        <Check className="w-3.5 h-3.5 stroke-[2.5] text-white shrink-0" />
        <span>Completed ✓</span>
        <span className="text-[11px] text-emerald-100 group-hover:text-white ml-0.5 hidden sm:inline font-normal">
          (Mark Incomplete)
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center justify-center gap-1.5 font-semibold bg-[#243B64] hover:bg-[#1D3154] text-white transition-colors duration-200 cursor-pointer shadow-xs group ${
        isSm
          ? "h-8 px-2.5 text-xs rounded-lg"
          : "h-9 px-3.5 text-xs rounded-xl"
      } ${className}`}
      title={`Mark ${stageName ? `"${stageName}" ` : ""}as completed`}
    >
      <Check className="w-3.5 h-3.5 stroke-[2.5] text-white shrink-0" />
      <span>Mark as Completed</span>
    </button>
  );
}
