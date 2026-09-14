import React, { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileBottomNav, type MobileNavDestination } from "@/components/layout/MobileBottomNav";
import { ResearchLibrary } from "@/components/library/ResearchLibrary";
import { ResearchWorkspace, type WorkspaceTab } from "@/components/workspace/ResearchWorkspace";
import { NewResearchModal } from "@/components/research/NewResearchModal";
import { CropDiseaseDemoModal } from "@/components/demo/CropDiseaseDemoModal";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { AuthLoadingScreen } from "@/components/auth/AuthLoadingScreen";
import { AccountModal } from "@/components/account/AccountModal";
import { workspaceService } from "@/lib/services/workspace-service";
import {
  runAutonomousResearch,
  type PipelineProgressUpdate,
} from "@/lib/services/orchestrator";
import { type ResearchProject } from "@/types/research";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/")({
  component: ResearchCompassApp,
});

function ResearchCompassApp() {
  const [view, setView] = useState<"library" | "workspace">("library");
  const [activeProject, setActiveProject] = useState<ResearchProject | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("overview");
  const [allProjects, setAllProjects] = useState<ResearchProject[]>([]);

  // Scroll position preservation for Research Library
  const libraryScrollRef = useRef<number>(0);
  const libraryContainerRef = useRef<HTMLDivElement>(null);

  // Sub-entity metric counts for sidebar badges
  const [notesCount, setNotesCount] = useState(0);
  const [tasksCount, setTasksCount] = useState({ total: 0, completed: 0 });
  const [findingsCount, setFindingsCount] = useState(0);

  // Telemetry for pipeline running
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState<PipelineProgressUpdate | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [isNewResearchOpen, setIsNewResearchOpen] = useState(false);
  const [isCropDemoOpen, setIsCropDemoOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Supabase Auth State
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshProjects = async () => {
    try {
      const list = await workspaceService.getProjects(user?.id);
      setAllProjects(list);
    } catch {
      // Fallback
    }
  };

  // Sync sub-entity counts whenever active project changes
  useEffect(() => {
    if (activeProject) {
      workspaceService.getNotes(activeProject.id).then((n) => setNotesCount(n.length));
      workspaceService.getTasks(activeProject.id).then((t) => {
        const completed = t.filter((item) => item.status === "completed").length;
        setTasksCount({ total: t.length, completed });
      });
      workspaceService.getFindings(activeProject.id).then((f) => setFindingsCount(f.length));
    }
  }, [activeProject?.id]);

  useEffect(() => {
    refreshProjects();
  }, [view, user?.id]);

  // Restore library scroll position when navigating back to library
  useEffect(() => {
    if (view === "library" && libraryContainerRef.current) {
      libraryContainerRef.current.scrollTop = libraryScrollRef.current;
    }
  }, [view]);

  // Initialize auth
  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }: any) => {
      if (isMounted) {
        setUser(data?.session?.user ?? null);
        setAuthLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Deep-linking and listen for browser popstate (Back/Forward buttons & swipe gestures)
  useEffect(() => {
    // Check URL parameters on initial mount
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlResearchId = params.get("researchId");
      const urlTab = params.get("tab") as WorkspaceTab | null;

      if (urlResearchId) {
        workspaceService.getProjectById(urlResearchId).then((proj) => {
          if (proj) {
            setActiveProject(proj);
            setView("workspace");
            if (urlTab) setWorkspaceTab(urlTab);
          }
        });
      }
    }

    // Global popstate handler for sequential browser Back & swipe-back gestures
    const handlePopState = async (event: PopStateEvent) => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const urlResearchId = params.get("researchId");
      const urlTab = (params.get("tab") as WorkspaceTab) || "overview";

      if (urlResearchId) {
        if (activeProject && activeProject.id === urlResearchId) {
          setView("workspace");
          setWorkspaceTab(urlTab);
        } else {
          const proj = await workspaceService.getProjectById(urlResearchId);
          if (proj) {
            setActiveProject(proj);
            setView("workspace");
            setWorkspaceTab(urlTab);
          } else {
            setView("library");
            setActiveProject(null);
          }
        }
      } else {
        setView("library");
        setActiveProject(null);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [activeProject?.id]);

  const handleOpenResearch = (project: ResearchProject, tab: WorkspaceTab = "overview") => {
    setActiveProject(project);
    setWorkspaceTab(tab);
    setView("workspace");

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("researchId", project.id);
      url.searchParams.set("tab", tab);
      window.history.pushState(
        { view: "workspace", researchId: project.id, tab },
        "",
        url.toString()
      );
    }
  };

  const handleSelectWorkspaceTab = (tab: WorkspaceTab) => {
    setWorkspaceTab(tab);

    if (typeof window !== "undefined" && activeProject) {
      const url = new URL(window.location.href);
      url.searchParams.set("researchId", activeProject.id);
      url.searchParams.set("tab", tab);
      window.history.pushState(
        { view: "workspace", researchId: activeProject.id, tab },
        "",
        url.toString()
      );
    }
  };

  const handleBackToLibrary = () => {
    setView("library");
    setActiveProject(null);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("researchId");
      url.searchParams.delete("tab");
      window.history.pushState({ view: "library" }, "", url.pathname);
    }
  };

  const handleMobileNavigate = (destination: MobileNavDestination) => {
    if (destination === "library") {
      handleBackToLibrary();
    } else if (destination === "research") {
      if (activeProject) {
        setView("workspace");
        setWorkspaceTab("overview");
      } else if (allProjects.length > 0) {
        handleOpenResearch(allProjects[0], "overview");
      } else {
        setIsNewResearchOpen(true);
      }
    } else if (destination === "chat") {
      if (activeProject) {
        setView("workspace");
        setWorkspaceTab("chat");
      } else if (allProjects.length > 0) {
        handleOpenResearch(allProjects[0], "chat");
      } else {
        setIsNewResearchOpen(true);
      }
    } else if (destination === "tasks") {
      if (activeProject) {
        setView("workspace");
        setWorkspaceTab("tasks");
      } else if (allProjects.length > 0) {
        handleOpenResearch(allProjects[0], "tasks");
      } else {
        setIsNewResearchOpen(true);
      }
    } else if (destination === "profile") {
      if (user) {
        setIsSettingsOpen(true);
      } else {
        setIsAuthOpen(true);
      }
    }
  };

  const handleStartResearch = async (
    question: string,
    options: {
      title?: string;
      objective?: string;
      description?: string;
      researchField?: string;
      paperLimit: number;
      yearFrom?: number;
      yearTo?: number;
      openAccessOnly: boolean;
      preferredSource?: "all" | "semanticscholar" | "openalex" | "crossref";
      mode?: "autonomous" | "quick";
    }
  ) => {
    if (options.mode === "quick") {
      // Create empty workspace immediately
      try {
        const targetId = crypto.randomUUID();
        const newProject = await workspaceService.createProject({
          id: targetId,
          title: options.title || question,
          research_question: question,
          objective: options.objective,
          description: options.description,
          research_field: options.researchField || "Scientific Inquiry",
          paper_limit: options.paperLimit,
          user_id: user?.id,
          status: "active",
        });

        toast.success("Dedicated research workspace created!");
        handleOpenResearch(newProject);
      } catch {
        toast.error("Failed to initialize research workspace");
      }
      return;
    }

    // Autonomous Literature Discovery
    setIsRunningPipeline(true);
    toast.info("Running autonomous literature discovery across scholarly indices...");

    try {
      const targetId = crypto.randomUUID();
      const discovered = await runAutonomousResearch(question, {
        projectId: targetId,
        userId: user?.id,
        paperLimit: options.paperLimit,
        yearFrom: options.yearFrom,
        yearTo: options.yearTo,
        openAccessOnly: options.openAccessOnly,
        preferredSource: options.preferredSource,
        onProgress: (update) => {
          setPipelineProgress(update);
        },
      });

      // Save discovered project into isolated workspace
      const newProject = await workspaceService.createProject({
        id: targetId,
        title: options.title || discovered.title,
        research_question: question,
        objective: options.objective || discovered.objective,
        description: options.description || `Autonomous research discovery into: ${question}`,
        research_field: options.researchField || discovered.research_field,
        paper_limit: options.paperLimit,
        user_id: user?.id,
        status: "active",
        papers: discovered.papers,
        comparison: discovered.comparison,
        gaps: discovered.gaps,
        contradictions: discovered.contradictions,
        hypotheses: discovered.hypotheses,
        selected_hypothesis: discovered.selected_hypothesis,
        experiment: discovered.experiment,
        report: discovered.report,
      });

      toast.success("Autonomous scientific discovery complete! Workspace ready.");
      handleOpenResearch(newProject);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Discovery execution encountered an error";
      toast.error(msg);
    } finally {
      setIsRunningPipeline(false);
    }
  };

  const handleLogout = async () => {
    try {
      const uid = user?.id;
      await supabase.auth.signOut();
      setUser(null);
      setActiveProject(null);
      setAllProjects([]);
      setIsAccountOpen(false);
      workspaceService.clearUserCache(uid);
      toast.success("Signed out successfully");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  // 1. Loading Authentication State
  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  // 2. Unauthenticated: First Screen MUST be the dedicated Login page
  if (!user) {
    return (
      <>
        <Toaster position="top-right" theme="light" richColors />
        <AuthScreen
          onAuthSuccess={() => {
            refreshProjects();
          }}
        />
      </>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F5F7FB] text-[#0F172A] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Toaster position="top-right" theme="light" richColors />

      {/* Global Top Navbar */}
      <AppNavbar
        activeProject={activeProject}
        isInWorkspace={view === "workspace" && !!activeProject}
        onBackToLibrary={handleBackToLibrary}
        onOpenNewResearch={() => setIsNewResearchOpen(true)}
        onOpenCropDemo={() => setIsCropDemoOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        user={user}
        onLogout={handleLogout}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
      />

      {/* Main View Container: Left Sidebar + Dynamic Content Canvas */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <AppSidebar
          view={view}
          currentTab={workspaceTab}
          onSelectTab={handleSelectWorkspaceTab}
          activeProject={activeProject}
          projects={allProjects}
          onSelectProject={(p) => handleOpenResearch(p)}
          onBackToLibrary={handleBackToLibrary}
          onOpenNewResearch={() => setIsNewResearchOpen(true)}
          onOpenCropDemo={() => setIsCropDemoOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
          user={user}
          notesCount={notesCount}
          tasksCount={tasksCount}
          findingsCount={findingsCount}
          isRunningPipeline={isRunningPipeline}
          isMobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col bg-[#F5F7FB]">
          {view === "library" || !activeProject ? (
            <main
              ref={libraryContainerRef}
              onScroll={(e) => {
                libraryScrollRef.current = e.currentTarget.scrollTop;
              }}
              className="h-full overflow-y-auto p-4 md:p-8 pb-28 md:pb-8"
            >
              <ResearchLibrary
                onOpenResearch={(p) => handleOpenResearch(p)}
                onOpenNewResearch={() => setIsNewResearchOpen(true)}
                onOpenCropDemo={() => setIsCropDemoOpen(true)}
                user={user}
              />
            </main>
          ) : (
            <ResearchWorkspace
              project={activeProject}
              currentTab={workspaceTab}
              onSelectTab={handleSelectWorkspaceTab}
              onBackToLibrary={handleBackToLibrary}
              onUpdateProject={(updated) => {
                setActiveProject(updated);
                refreshProjects();
              }}
              onCountsChanged={({ notes, tasks, findings }) => {
                if (notes !== undefined) setNotesCount(notes);
                if (tasks !== undefined) setTasksCount(tasks);
                if (findings !== undefined) setFindingsCount(findings);
              }}
            />
          )}
        </div>
      </div>

      {/* 📱 Mobile Application Bottom Navigation Bar */}
      <MobileBottomNav
        view={view}
        currentTab={workspaceTab}
        activeProject={activeProject}
        tasksCount={tasksCount}
        onNavigate={handleMobileNavigate}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        user={user}
      />

      {/* Global Modals */}
      <NewResearchModal
        isOpen={isNewResearchOpen}
        onClose={() => setIsNewResearchOpen(false)}
        onStartResearch={handleStartResearch}
      />

      <CropDiseaseDemoModal
        isOpen={isCropDemoOpen}
        onClose={() => setIsCropDemoOpen(false)}
        onLaunchDemo={() =>
          handleStartResearch("How can AI improve crop disease detection?", {
            title: "AI in Crop Pathology & Disease Detection",
            researchField: "Agricultural AI & Computer Vision",
            paperLimit: 12,
            openAccessOnly: false,
          })
        }
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          supabase.auth.getSession().then(({ data }: any) => {
            setUser(data?.session?.user ?? null);
          });
        }}
      />
    </div>
  );
}
