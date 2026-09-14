import React from "react";
import { Compass, Loader2 } from "lucide-react";

export function AuthLoadingScreen() {
  return (
    <div className="h-screen w-screen bg-[#F5F7FB] flex flex-col items-center justify-center p-4 selection:bg-blue-100 selection:text-blue-900">
      <div className="flex flex-col items-center text-center space-y-5 max-w-sm animate-in fade-in duration-300">
        {/* Animated Brand Logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-[#243B64] flex items-center justify-center text-white shadow-xl shadow-[#243B64]/15">
            <Compass className="w-8 h-8 animate-[spin_8s_linear_infinite]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-[#F5F7FB] flex items-center justify-center shadow-xs">
            <Loader2 className="w-3.5 h-3.5 text-[#536DFE] animate-spin" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <h1 className="text-lg font-bold text-[#172033] tracking-tight">
            Research Compass
          </h1>
          <p className="text-xs text-[#64748B]">
            Authenticating secure researcher workspace...
          </p>
        </div>

        {/* Subtle Progress Indicator */}
        <div className="w-48 h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#243B64] to-[#536DFE] rounded-full w-2/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
