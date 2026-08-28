import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar, type NavTab } from "@/components/layout/AppSidebar";
import { ResearchDashboard } from "@/components/dashboard/ResearchDashboard";
import { AutonomousPipelineRunner } from "@/components/research/AutonomousPipelineRunner";
import { LiteratureExplorer } from "@/components/literature/LiteratureExplorer";
import { PaperComparisonMatrix } from "@/components/analysis/PaperComparisonMatrix";
import { ResearchGapsViewer } from "@/components/gaps/ResearchGapsViewer";
import { ContradictionDetector } from "@/components/conflicts/ContradictionDetector";
import { HypothesisLab } from "@/components/hypotheses/HypothesisLab";
import { ExperimentDesigner } from "@/components/experiment/ExperimentDesigner";
import { ResearchTrends } from "@/components/analytics/ResearchTrends";
import { ResearchKnowledgeGraph } from "@/components/graph/ResearchKnowledgeGraph";
import { ExperimentResultAnalyzer } from "@/components/results/ExperimentResultAnalyzer";
import { ResearchReportViewer } from "@/components/report/ResearchReportViewer";
import { ResearchAssistantChat } from "@/components/chat/ResearchAssistantChat";
import { NewResearchModal } from "@/components/research/NewResearchModal";
import { CropDiseaseDemoModal } from "@/components/demo/CropDiseaseDemoModal";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { AuthModal } from "@/components/auth/AuthModal";
import {
  runAutonomousResearch,
  type ResearchProjectData,
  type PipelineProgressUpdate,
} from "@/lib/services/orchestrator";
import { type NormalizedPaper } from "@/lib/services/openalex";
import { type HypothesisItem } from "@/lib/services/llm";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/")({
  component: AutonomousResearchScientistApp,
});

function AutonomousResearchScientistApp() {
  const [currentTab, setCurrentTab] = useState<NavTab>("dashboard");
  const [projects, setProjects] = useState<ResearchProjectData[]>([]);
  const [activeProject, setActiveProject] = useState<ResearchProjectData | null>(null);

  // Pipeline telemetry state
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState<PipelineProgressUpdate | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Modals state
  const [isNewResearchOpen, setIsNewResearchOpen] = useState(false);
  const [isCropDemoOpen, setIsCropDemoOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Supabase Auth State
  const [user, setUser] = useState<any>(null);

  // Initial Load: Initialize auth and pre-seed featured Crop Disease project if empty
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data }: any) => {
      setUser(data?.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    // Check localStorage or pre-seed
    const stored = localStorage.getItem("autonomous_scientist_projects");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ResearchProjectData[];
        if (parsed.length > 0) {
          setProjects(parsed);
          setActiveProject(parsed[0]);
          return () => subscription.unsubscribe();
        }
      } catch {
        // Fall through to pre-seed
      }
    }

    // Pre-seed the primary demo project: "How can AI improve crop disease detection?"
    initializePreSeededCropProject();

    return () => subscription.unsubscribe();
  }, []);

  const initializePreSeededCropProject = async () => {
    try {
      const demoData = await runAutonomousResearch("How can AI improve crop disease detection?", {
        paperLimit: 12,
        onProgress: () => {},
      });
      setProjects([demoData]);
      setActiveProject(demoData);
      localStorage.setItem("autonomous_scientist_projects", JSON.stringify([demoData]));
    } catch (e) {
      console.warn("Pre-seed initialization error:", e);
    }
  };

  const handleStartResearch = async (
    question: string,
    options: {
      paperLimit: number;
      yearFrom?: number;
      yearTo?: number;
      openAccessOnly: boolean;
      preferredSource?: "all" | "semanticscholar" | "openalex" | "crossref";
    },
  ) => {
    setIsRunningPipeline(true);
    setCurrentTab("autonomous");
    setLogs([`[${new Date().toLocaleTimeString()}] Initialized inquiry: "${question}"`]);

    try {
      const newProject = await runAutonomousResearch(question, {
        userId: user?.id,
        paperLimit: options.paperLimit,
        yearFrom: options.yearFrom,
        yearTo: options.yearTo,
        openAccessOnly: options.openAccessOnly,
        preferredSource: options.preferredSource,
        onProgress: (update) => {
          setPipelineProgress(update);
          setLogs((prev) => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] [Stage ${update.step}/9] ${update.message}${update.detail ? ` - ${update.detail}` : ""}`,
          ]);
        },
      });

      setProjects((prev) => [newProject, ...prev]);
      setActiveProject(newProject);
      localStorage.setItem("autonomous_scientist_projects", JSON.stringify([newProject, ...projects]));
      toast.success("Autonomous scientific research discovery complete!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Workflow execution failed";
      toast.error(msg);
    } finally {
      setIsRunningPipeline(false);
    }
  };

  const handleSelectHypothesis = (hypothesis: HypothesisItem) => {
    if (!activeProject) return;
    const updated: ResearchProjectData = {
      ...activeProject,
      selected_hypothesis: hypothesis,
    };
    setActiveProject(updated);
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    localStorage.setItem(
      "autonomous_scientist_projects",
      JSON.stringify(projects.map((p) => (p.id === updated.id ? updated : p))),
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success("Signed out successfully");
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F5F7FB] text-[#0F172A] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Toaster position="top-right" theme="light" richColors />

      {/* Top White Navigation Bar (Fixed Header) */}
      <AppNavbar
        activeProject={activeProject}
        projects={projects}
        onSelectProject={(p) => setActiveProject(p)}
        onOpenNewResearch={() => setIsNewResearchOpen(true)}
        onOpenCropDemo={() => setIsCropDemoOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Workspace Layout (Fixed Sidebar + Scrollable Content Canvas) */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <AppSidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          activeProject={activeProject}
          isRunningPipeline={isRunningPipeline}
        />

        <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8 bg-[#F5F7FB]">
          {currentTab === "dashboard" && (
            <ResearchDashboard
              activeProject={activeProject}
              projects={projects}
              onSelectProject={(p) => setActiveProject(p)}
              onOpenNewResearch={() => setIsNewResearchOpen(true)}
              onOpenCropDemo={() => setIsCropDemoOpen(true)}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === "autonomous" && (
            <AutonomousPipelineRunner
              progress={pipelineProgress}
              isRunning={isRunningPipeline}
              projectData={activeProject}
              onViewArtifacts={() => setCurrentTab("literature")}
              logs={logs}
            />
          )}

          {currentTab === "literature" && (
            <LiteratureExplorer
              papers={activeProject?.papers || []}
            />
          )}

          {currentTab === "comparison" && (
            <PaperComparisonMatrix
              comparison={activeProject?.comparison}
            />
          )}

          {currentTab === "gaps" && (
            <ResearchGapsViewer
              gaps={activeProject?.gaps || []}
              papers={activeProject?.papers || []}
              onSelectPaper={() => setCurrentTab("literature")}
              onNavigateToHypotheses={() => setCurrentTab("hypotheses")}
            />
          )}

          {currentTab === "conflicts" && (
            <ContradictionDetector
              contradictions={activeProject?.contradictions || []}
            />
          )}

          {currentTab === "hypotheses" && (
            <HypothesisLab
              hypotheses={activeProject?.hypotheses || []}
              selectedHypothesis={activeProject?.selected_hypothesis}
              onSelectHypothesis={handleSelectHypothesis}
              onProceedToExperiment={() => setCurrentTab("experiment")}
            />
          )}

          {currentTab === "experiment" && (
            <ExperimentDesigner
              experiment={activeProject?.experiment}
              selectedHypothesis={activeProject?.selected_hypothesis}
              onProceedToResults={() => setCurrentTab("results")}
            />
          )}

          {currentTab === "trends" && (
            <ResearchTrends
              papers={activeProject?.papers || []}
            />
          )}

          {currentTab === "graph" && (
            <ResearchKnowledgeGraph
              project={activeProject}
            />
          )}

          {currentTab === "results" && (
            <ExperimentResultAnalyzer
              hypothesisText={activeProject?.selected_hypothesis?.statement}
            />
          )}

          {currentTab === "report" && (
            <ResearchReportViewer
              reportContent={activeProject?.report}
              projectTitle={activeProject?.title}
            />
          )}

          {currentTab === "chat" && (
            <ResearchAssistantChat
              project={activeProject}
            />
          )}
        </main>
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
