import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ResearchLibrary } from "@/components/library/ResearchLibrary";
import { ResearchWorkspace, type WorkspaceTab } from "@/components/workspace/ResearchWorkspace";
import { NewResearchModal } from "@/components/research/NewResearchModal";
import { CropDiseaseDemoModal } from "@/components/demo/CropDiseaseDemoModal";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { AuthModal } from "@/components/auth/AuthModal";
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

  // Supabase Auth State
  const [user, setUser] = useState<any>(null);

  const refreshProjects = async () => {
    try {
      const list = await workspaceService.getAllProjects();
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
  }, [view]);

  // Initialize auth and check URL deep-linking
  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      setUser(data?.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    // Check URL parameters for deep-linking (e.g. ?researchId=res_ai_healthcare&tab=papers)
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

    return () => subscription.unsubscribe();
  }, []);

  const handleOpenResearch = (project: ResearchProject, tab: WorkspaceTab = "overview") => {
    setActiveProject(project);
    setWorkspaceTab(tab);
    setView("workspace");

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("researchId", project.id);
      url.searchParams.set("tab", tab);
      window.history.pushState({}, "", url.toString());
    }
  };

  const handleBackToLibrary = () => {
    setView("library");
    setActiveProject(null);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("researchId");
      url.searchParams.delete("tab");
      window.history.pushState({}, "", url.pathname);
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
        const newProject = await workspaceService.createProject({
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
      const discovered = await runAutonomousResearch(question, {
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
    await supabase.auth.signOut();
    setUser(null);
    toast.success("Signed out successfully");
  };

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
        user={user}
        onLogout={handleLogout}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
      />

      {/* Main View Container: Left Sidebar + Dynamic Content Canvas */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <AppSidebar
          view={view}
          currentTab={workspaceTab}
          onSelectTab={(tab) => setWorkspaceTab(tab)}
          activeProject={activeProject}
          projects={allProjects}
          onSelectProject={(p) => handleOpenResearch(p)}
          onBackToLibrary={handleBackToLibrary}
          onOpenNewResearch={() => setIsNewResearchOpen(true)}
          onOpenCropDemo={() => setIsCropDemoOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          notesCount={notesCount}
          tasksCount={tasksCount}
          findingsCount={findingsCount}
          isRunningPipeline={isRunningPipeline}
          isMobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col bg-[#F5F7FB]">
          {view === "library" || !activeProject ? (
            <main className="h-full overflow-y-auto p-4 md:p-8">
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
              onSelectTab={(tab) => setWorkspaceTab(tab)}
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
