import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  ShieldCheck,
  LogOut,
  Calendar,
  KeyRound,
  Copy,
  Check,
  BookOpen,
  FolderKanban,
  Sparkles,
  FlaskConical,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLogout: () => void;
}

export function AccountModal({
  isOpen,
  onClose,
  user,
  onLogout,
}: AccountModalProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [stats, setStats] = useState({
    projectsCount: 0,
    papersCount: 0,
    gapsCount: 0,
    experimentsCount: 0,
    loading: true,
  });

  useEffect(() => {
    if (!isOpen || !user?.id) return;

    let isMounted = true;
    async function loadUserStats() {
      try {
        setStats((prev) => ({ ...prev, loading: true }));

        // 1. Projects count for this user
        const { count: projectsCount } = await supabase
          .from("research_projects")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // 2. Papers count across this user's projects
        const { data: userProjects } = await supabase
          .from("research_projects")
          .select("id")
          .eq("user_id", user.id);

        let papersCount = 0;
        let gapsCount = 0;
        let experimentsCount = 0;

        if (userProjects && userProjects.length > 0) {
          const projectIds = userProjects.map((p) => p.id);

          const { count: pCount } = await supabase
            .from("papers")
            .select("*", { count: "exact", head: true })
            .in("project_id", projectIds);
          papersCount = pCount || 0;

          const { count: gCount } = await supabase
            .from("research_gaps")
            .select("*", { count: "exact", head: true })
            .in("project_id", projectIds);
          gapsCount = gCount || 0;

          const { count: eCount } = await supabase
            .from("experiments")
            .select("*", { count: "exact", head: true })
            .in("project_id", projectIds);
          experimentsCount = eCount || 0;
        }

        if (isMounted) {
          setStats({
            projectsCount: projectsCount || 0,
            papersCount,
            gapsCount,
            experimentsCount,
            loading: false,
          });
        }
      } catch (err) {
        console.warn("Failed to load user account stats:", err);
        if (isMounted) {
          setStats((prev) => ({ ...prev, loading: false }));
        }
      }
    }

    loadUserStats();
    return () => {
      isMounted = false;
    };
  }, [isOpen, user?.id]);

  const copyUserId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    toast.success("User ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Researcher";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Active Member";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border-[#E2E8F0] text-[#0F172A] rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Modal Header with Gradient Banner */}
        <div className="bg-gradient-to-r from-[#243B64] via-[#1E3A8A] to-[#3B82F6] p-6 text-white relative">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-16 h-16 rounded-full border-2 border-white/80 object-cover shadow-md shrink-0 bg-white"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/80 flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-1 min-w-0">
              <h2 className="text-lg font-bold text-white tracking-tight truncate">
                {displayName}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-blue-100 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-medium">
                <ShieldCheck className="w-3 h-3 shrink-0" />
                <span>Verified Google Identity</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Identity & Security Card */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-[#64748B]">
              <div className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#243B64]" />
                <span className="font-medium">Supabase Auth UID:</span>
              </div>
              <button
                onClick={copyUserId}
                className="inline-flex items-center gap-1 font-mono text-[10px] text-[#536DFE] hover:text-[#243B64] transition-colors cursor-pointer"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-[11px] text-[#172033] bg-white px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] truncate select-all">
              {user?.id || "N/A"}
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-[#64748B] border-t border-[#E2E8F0]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#94A3B8]" />
                <span>Member since</span>
              </span>
              <span className="font-medium text-[#172033]">{createdAt}</span>
            </div>
          </div>

          {/* User's Isolated Research Statistics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                Your Research Data
              </span>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Isolated to this account</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <FolderKanban className="w-3.5 h-3.5 text-[#536DFE]" />
                  <span>Projects</span>
                </div>
                <div className="text-xl font-bold text-[#172033]">
                  {stats.loading ? "..." : stats.projectsCount}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                  <span>Papers</span>
                </div>
                <div className="text-xl font-bold text-[#172033]">
                  {stats.loading ? "..." : stats.papersCount}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Research Gaps</span>
                </div>
                <div className="text-xl font-bold text-[#172033]">
                  {stats.loading ? "..." : stats.gapsCount}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Experiments</span>
                </div>
                <div className="text-xl font-bold text-[#172033]">
                  {stats.loading ? "..." : stats.experimentsCount}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#E2E8F0]">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-[#CBD5E1] text-[#64748B] hover:text-[#172033] text-xs h-9 px-4 rounded-lg cursor-pointer"
            >
              Close
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-9 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
