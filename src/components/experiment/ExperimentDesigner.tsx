import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TestTube,
  Database,
  Sliders,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  Circle,
  GitBranch,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Terminal,
  Scale,
  Sparkles,
  RefreshCw,
  Edit3,
  Copy,
  Download,
  Check,
  Plus,
  Trash2,
  BookOpen,
  HelpCircle,
  FolderKanban,
  CheckSquare,
} from "lucide-react";
import { type ExperimentPlanResult, type HypothesisItem } from "@/lib/services/llm";
import { type ResearchProject } from "@/types/research";
import { workspaceService } from "@/lib/services/workspace-service";
import {
  generateExperimentProtocol,
  formatExperimentProtocolAsMarkdown,
  getDomainSpecificExperimentPlan,
} from "@/lib/services/experiment-ai-service";
import { StageCompletionButton } from "@/components/workspace/StageCompletionButton";
import { toast } from "sonner";

interface ExperimentDesignerProps {
  project?: ResearchProject;
  experiment?: ExperimentPlanResult | null;
  selectedHypothesis?: HypothesisItem | null;
  onUpdateProject?: (updated: ResearchProject) => void;
  onProceedToResults?: () => void;
  onNavigateTab?: (tab: string) => void;
  isStageCompleted?: boolean;
  onToggleStageCompletion?: () => void;
}

export function ExperimentDesigner({
  project,
  experiment: initialExperiment,
  selectedHypothesis,
  onUpdateProject,
  onProceedToResults,
  onNavigateTab,
  isStageCompleted = false,
  onToggleStageCompletion,
}: ExperimentDesignerProps) {
  // Active Experiment Plan
  const [currentExperiment, setCurrentExperiment] = useState<ExperimentPlanResult | null>(
    initialExperiment || project?.experiment || project?.experiment_plan || null
  );

  // Sync state if initialExperiment or project changes
  useEffect(() => {
    if (initialExperiment) {
      setCurrentExperiment(initialExperiment);
    } else if (project?.experiment) {
      setCurrentExperiment(project.experiment);
    } else if (project?.experiment_plan) {
      setCurrentExperiment(project.experiment_plan);
    }
  }, [initialExperiment, project?.experiment, project?.experiment_plan]);

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [customHypothesisInput, setCustomHypothesisInput] = useState("");

  // Procedural checklist tracking
  const [completedProcedureSteps, setCompletedProcedureSteps] = useState<number[]>([]);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ExperimentPlanResult>>({});

  // Active view tab
  const [activeSection, setActiveSection] = useState<"all" | "workflow" | "procedure" | "dataset" | "metrics">("all");

  const toggleProcedureStep = (stepIndex: number) => {
    setCompletedProcedureSteps((prev) =>
      prev.includes(stepIndex) ? prev.filter((i) => i !== stepIndex) : [...prev, stepIndex]
    );
  };

  // AI Protocol Generation Action
  const handleGenerateProtocol = async (hypothesisText?: string) => {
    if (!project) {
      toast.error("No active research project found.");
      return;
    }

    setIsGenerating(true);
    setGenerationStep("Analyzing research question & scope...");

    try {
      await new Promise((r) => setTimeout(r, 400));
      setGenerationStep("Formulating testable hypothesis & scope variables...");
      await new Promise((r) => setTimeout(r, 450));
      setGenerationStep("Synthesizing baseline models & benchmark datasets...");
      await new Promise((r) => setTimeout(r, 450));
      setGenerationStep("Constructing 8-stage visual execution workflow...");
      await new Promise((r) => setTimeout(r, 400));
      setGenerationStep("Configuring evaluation metrics & statistical tests...");

      const plan = await generateExperimentProtocol(
        project,
        hypothesisText || customHypothesisInput || selectedHypothesis?.statement
      );

      // Save to project
      await workspaceService.updateProject(project.id, {
        experiment: plan,
        experiment_plan: plan,
      });

      setCurrentExperiment(plan);
      setCompletedProcedureSteps([]);

      if (onUpdateProject) {
        onUpdateProject({
          ...project,
          experiment: plan,
          experiment_plan: plan,
        });
      }

      toast.success("Experimental Protocol successfully synthesized!");
    } catch {
      // High-fidelity fallback
      const fallback = getDomainSpecificExperimentPlan(
        project,
        hypothesisText || customHypothesisInput || selectedHypothesis?.statement
      );

      await workspaceService.updateProject(project.id, {
        experiment: fallback,
        experiment_plan: fallback,
      });

      setCurrentExperiment(fallback);
      toast.success("Experimental Protocol generated from domain research benchmarks.");
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  // Copy Protocol to Clipboard
  const handleCopyMarkdown = () => {
    if (!currentExperiment || !project) return;
    const md = formatExperimentProtocolAsMarkdown(currentExperiment, project);
    navigator.clipboard.writeText(md);
    toast.success("Full experimental protocol copied to clipboard (Markdown)!");
  };

  // Download Protocol as JSON
  const handleDownloadJSON = () => {
    if (!currentExperiment || !project) return;
    const blob = new Blob([JSON.stringify(currentExperiment, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `experimental-protocol-${project.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Protocol downloaded as JSON!");
  };

  // Open Edit Modal
  const handleOpenEdit = () => {
    if (!currentExperiment) return;
    setEditForm({
      hypothesis: currentExperiment.hypothesis,
      dataset_strategy: { ...currentExperiment.dataset_strategy },
      baseline_models: [...(currentExperiment.baseline_models || [])],
      proposed_architecture: currentExperiment.proposed_architecture,
      evaluation_metrics: [...(currentExperiment.evaluation_metrics || [])],
      expected_results: currentExperiment.expected_results,
      statistical_analysis: currentExperiment.statistical_analysis,
    });
    setIsEditModalOpen(true);
  };

  // Save Edit Modal
  const handleSaveEdit = async () => {
    if (!currentExperiment || !project) return;

    const updated: ExperimentPlanResult = {
      ...currentExperiment,
      hypothesis: editForm.hypothesis || currentExperiment.hypothesis,
      dataset_strategy: {
        ...currentExperiment.dataset_strategy,
        ...(editForm.dataset_strategy || {}),
      },
      baseline_models: editForm.baseline_models || currentExperiment.baseline_models,
      proposed_architecture: editForm.proposed_architecture || currentExperiment.proposed_architecture,
      evaluation_metrics: editForm.evaluation_metrics || currentExperiment.evaluation_metrics,
      expected_results: editForm.expected_results || currentExperiment.expected_results,
      statistical_analysis: editForm.statistical_analysis || currentExperiment.statistical_analysis,
    };

    await workspaceService.updateProject(project.id, {
      experiment: updated,
      experiment_plan: updated,
    });

    setCurrentExperiment(updated);
    if (onUpdateProject) {
      onUpdateProject({
        ...project,
        experiment: updated,
        experiment_plan: updated,
      });
    }

    setIsEditModalOpen(false);
    toast.success("Experimental protocol updated!");
  };

  // Fallback Workflow Stages if visual_workflow is empty
  const protocolStages = currentExperiment?.visual_workflow?.steps?.length
    ? currentExperiment.visual_workflow.steps.map((s) => {
        const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
          dataset: Database,
          preprocess: Sliders,
          baseline: Cpu,
          proposed: Layers,
          training: Activity,
          validation: ShieldCheck,
          evaluation: TrendingUp,
          statistical: Scale,
        };
        return {
          step: s.step,
          name: s.name,
          desc: s.description,
          icon: iconMap[s.type] || Zap,
          type: s.type,
        };
      })
    : [
        { step: 1, name: "DATASET & TESTBED", desc: currentExperiment?.dataset_strategy?.name || "Benchmark Testbed", icon: Database, type: "dataset" },
        { step: 2, name: "PREPROCESSING & AUGMENTATION", desc: currentExperiment?.dataset_strategy?.preprocessing?.[0] || "Data normalization & splitting", icon: Sliders, type: "preprocess" },
        { step: 3, name: "BASELINE BENCHMARKS", desc: currentExperiment?.baseline_models?.join(", ") || "Standard reference implementations", icon: Cpu, type: "baseline" },
        { step: 4, name: "PROPOSED ARCHITECTURE", desc: currentExperiment?.proposed_architecture || "Proposed model / framework", icon: Layers, type: "proposed" },
        { step: 5, name: "TRAINING & OPTIMIZATION", desc: "Parameter convergence & hyperparameter sweeps", icon: Activity, type: "training" },
        { step: 6, name: "VALIDATION & ABLATION", desc: "Stratified cross-validation with held-out partitions", icon: ShieldCheck, type: "validation" },
        { step: 7, name: "QUANTITATIVE EVALUATION", desc: currentExperiment?.evaluation_metrics?.join(", ") || "Performance & efficiency metrics", icon: TrendingUp, type: "evaluation" },
        { step: 8, name: "STATISTICAL SIGNIFICANCE", desc: currentExperiment?.statistical_analysis || "Hypothesis testing (p < 0.01)", icon: Scale, type: "statistical" },
      ];

  const totalProcedureSteps = currentExperiment?.experimental_procedure?.length || 0;
  const procedureProgress = totalProcedureSteps > 0 ? Math.round((completedProcedureSteps.length / totalProcedureSteps) * 100) : 0;

  // =========================================================================
  // 1. EMPTY STATE: NO EXPERIMENT DESIGNED YET
  // =========================================================================
  if (!currentExperiment) {
    return (
      <div className="max-w-5xl mx-auto py-6 space-y-6 animate-fade-slide">
        {/* Hero Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mx-auto shadow-2xs">
            <TestTube className="w-8 h-8" />
          </div>

          <div className="max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scientific Experimental Architect</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
              Experimental Validation Protocol
            </h1>

            <p className="text-sm text-slate-500 leading-relaxed">
              Synthesize a rigorous, reproducible 8-stage experimental protocol: baseline benchmarks, variable controls, step-by-step procedures, and statistical significance testing strictly tailored to this research inquiry.
            </p>
          </div>

          {/* Research Context Box */}
          {project && (
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 text-left max-w-2xl mx-auto space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium border-b border-slate-200/60 pb-1.5">
                <span className="font-semibold text-slate-700 uppercase tracking-wider">Research Scope</span>
                <span className="font-mono">ID: {project.id.slice(0, 12)}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Question: </span>
                <span className="text-slate-800 font-medium">{project.research_question || project.title}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-slate-500">
                <span>Field: <strong className="text-slate-700">{project.research_field}</strong></span>
                <span>•</span>
                <span>Literature Corpus: <strong className="text-blue-600">{project.papers?.length || 0} Papers</strong></span>
                <span>•</span>
                <span>Gaps Documented: <strong className="text-amber-600">{project.gaps?.length || 0} Gaps</strong></span>
              </div>
            </div>
          )}

          {/* AI Generation Box */}
          <div className="pt-2 max-w-md mx-auto space-y-3">
            {isGenerating ? (
              <div className="p-5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 space-y-2.5 animate-pulse">
                <div className="flex items-center justify-center gap-2 text-xs font-bold">
                  <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                  <span>{generationStep}</span>
                </div>
                <div className="h-1.5 w-full bg-teal-200/70 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full animate-progress" />
                </div>
                <p className="text-[11px] text-teal-600">
                  Formulating baseline benchmarks, control variables, and reproducibility protocol...
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <Button
                  onClick={() => handleGenerateProtocol()}
                  disabled={isGenerating}
                  className="w-full sm:w-auto bg-[#243B64] hover:bg-[#1D3154] text-white text-xs font-semibold h-10 px-5 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4 text-teal-300" />
                  <span>Generate Protocol with AI</span>
                </Button>

                <Button
                  onClick={() => {
                    const sample = getDomainSpecificExperimentPlan(project || ({} as any));
                    setEditForm(sample);
                    setIsEditModalOpen(true);
                  }}
                  variant="outline"
                  className="w-full sm:w-auto text-slate-700 hover:text-slate-900 border-slate-200 text-xs font-semibold h-10 px-4 rounded-xl cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Create Custom Protocol</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 8-Stage Overview Preview */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Standard 8-Stage Scientific Protocol Pipeline
            </h2>
            <span className="text-xs text-slate-400">Reproducibility Blueprint</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {[
              { step: 1, title: "1. Dataset & Testbed", desc: "Corpus curation, ground-truth collection, and stratified splits.", icon: Database },
              { step: 2, title: "2. Preprocessing & Augmentation", desc: "Data normalization, noise injection, and transformation.", icon: Sliders },
              { step: 3, title: "3. Baseline Benchmarks", desc: "Standard published algorithms and literature reference models.", icon: Cpu },
              { step: 4, title: "4. Proposed Architecture", desc: "Novel methodology, module decoupling, and mechanisms.", icon: Layers },
              { step: 5, title: "5. Training & Tuning", desc: "Convergence optimization, parameter grid, and learning schedules.", icon: Activity },
              { step: 6, title: "6. Validation & Ablation", desc: "Stratified k-fold cross-validation and component ablations.", icon: ShieldCheck },
              { step: 7, title: "7. Quantitative Evaluation", desc: "Accuracy, throughput, latency, precision, and efficiency.", icon: TrendingUp },
              { step: 8, title: "8. Statistical Rigor", desc: "Wilcoxon signed-rank, Student's t-test, p < 0.01 verification.", icon: Scale },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1.5">
                  <div className="flex items-center gap-2 text-teal-700 font-semibold text-[11px]">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal for Custom Authoring */}
        {isEditModalOpen && renderEditModal()}
      </div>
    );
  }

  // =========================================================================
  // 2. LOADED STATE: EXPERIMENTAL PROTOCOL ACTIVE
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto py-2 space-y-5 animate-fade-slide">
      {/* 🧭 Module Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
              <TestTube className="w-5 h-5" />
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
                  Experimental Protocol
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  8-Stage Scientific Protocol
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {currentExperiment.baseline_models?.length || 3} Baselines Configured
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Reproducible empirical validation blueprint: variable controls, baseline benchmarks, procedural checklist, and statistical testing framework.
              </p>

              {project && (
                <div className="text-xs text-slate-400 font-medium pt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>Scoped to Research: <strong className="text-slate-700">{project.title}</strong></span>
                  <span>•</span>
                  <span className="font-mono text-slate-500">ID: {project.id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onToggleStageCompletion && (
              <StageCompletionButton
                stageName="Experiment Protocol"
                isCompleted={isStageCompleted}
                onToggle={onToggleStageCompletion}
                size="default"
              />
            )}

            <Button
              onClick={() => handleGenerateProtocol()}
              disabled={isGenerating}
              size="sm"
              className="bg-[#243B64] hover:bg-[#1D3154] text-white text-xs font-semibold h-9 px-3.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{generationStep || "Synthesizing..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                  <span>Regenerate with AI</span>
                </>
              )}
            </Button>

            <Button
              onClick={handleOpenEdit}
              variant="outline"
              size="sm"
              className="text-xs font-semibold h-9 px-3.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Protocol</span>
            </Button>

            <Button
              onClick={handleCopyMarkdown}
              variant="outline"
              size="sm"
              className="text-xs font-semibold h-9 px-3 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
              title="Copy academic markdown to clipboard"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Copy MD</span>
            </Button>

            <Button
              onClick={handleDownloadJSON}
              variant="outline"
              size="sm"
              className="text-xs font-semibold h-9 px-3 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
              title="Download JSON specification"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">JSON</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Target Scientific Hypothesis Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3.5 border-l-4 border-l-teal-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-teal-600" />
            <span>Target Scientific Hypothesis Under Empirical Validation</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Formal Hypothesis Statement</span>
        </div>

        <p className="text-base sm:text-lg font-bold font-heading text-slate-900 leading-snug italic">
          &ldquo;{currentExperiment.hypothesis}&rdquo;
        </p>

        {/* Variable Controls Chips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Independent Variables
            </span>
            <div className="flex flex-wrap gap-1">
              {currentExperiment.independent_variables?.map((v, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                  {v}
                </span>
              )) || <span className="text-slate-400">Method configuration</span>}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Dependent Variables (Measured)
            </span>
            <div className="flex flex-wrap gap-1">
              {currentExperiment.dependent_variables?.map((v, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 text-[11px] font-medium">
                  {v}
                </span>
              )) || <span className="text-slate-400">Accuracy, Latency</span>}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Controlled Constants
            </span>
            <div className="flex flex-wrap gap-1">
              {currentExperiment.control_variables?.map((v, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                  {v}
                </span>
              )) || <span className="text-slate-400">Fixed environment</span>}
            </div>
          </div>
        </div>
      </div>

      {/* 8-Step Visual Protocol Execution Workflow */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-teal-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              8-Step Protocol Execution Workflow
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Sequential Scientific Pipeline</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {protocolStages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.step}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-400 hover:shadow-2xs transition-all space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                    STAGE {stage.step}
                  </span>
                  <Icon className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
                </div>

                <div className="font-bold text-xs text-slate-900">
                  {stage.name}
                </div>

                <p className="text-[11px] text-slate-500 leading-snug line-clamp-3">
                  {stage.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step-by-Step Procedure Checklist with Interactive Progress */}
      {currentExperiment.experimental_procedure && currentExperiment.experimental_procedure.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Step-by-Step Execution Procedure
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Check off execution steps as you run experiments in your environment.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-600">
                {completedProcedureSteps.length} of {totalProcedureSteps} Completed ({procedureProgress}%)
              </span>
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-300"
                  style={{ width: `${procedureProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {currentExperiment.experimental_procedure.map((stepText, idx) => {
              const isChecked = completedProcedureSteps.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={() => toggleProcedureStep(idx)}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? "bg-teal-50/50 border-teal-200 text-teal-950"
                      : "bg-slate-50/60 hover:bg-slate-50 border-slate-200/80 text-slate-700"
                  }`}
                >
                  <button
                    type="button"
                    className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      isChecked
                        ? "bg-teal-600 border-teal-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <div className="text-xs font-medium leading-relaxed flex-1">
                    <strong className="font-semibold text-slate-900 mr-1.5">Step {idx + 1}:</strong>
                    <span className={isChecked ? "line-through text-slate-500" : ""}>{stepText}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Technical Specification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* Dataset Strategy */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold uppercase text-[11px] border-b border-slate-100 pb-2">
            <Database className="w-4 h-4 text-teal-600" />
            <span>Dataset & Data Partitioning Strategy</span>
          </div>

          <div className="space-y-2">
            <div>
              <span className="font-semibold text-slate-700">Corpus / Dataset: </span>
              <span className="text-slate-900 font-medium">
                {currentExperiment.dataset_strategy?.name || "Benchmark Testbed"}
              </span>
            </div>

            {currentExperiment.dataset_strategy?.data_collection && (
              <p className="text-slate-600 leading-relaxed text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {currentExperiment.dataset_strategy.data_collection}
              </p>
            )}

            {currentExperiment.dataset_strategy?.sample_size_target && (
              <div>
                <span className="font-semibold text-slate-700">Sample Target / Split: </span>
                <span className="text-slate-800">{currentExperiment.dataset_strategy.sample_size_target}</span>
              </div>
            )}

            {currentExperiment.dataset_strategy?.preprocessing && currentExperiment.dataset_strategy.preprocessing.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Preprocessing Pipeline:
                </span>
                <ul className="space-y-1 list-disc list-inside text-slate-600 text-[11px]">
                  {currentExperiment.dataset_strategy.preprocessing.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Baselines vs Proposed Method */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold uppercase text-[11px] border-b border-slate-100 pb-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span>Standard Baselines vs. Proposed Approach</span>
          </div>

          <div className="space-y-2.5">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Comparative Published Baselines
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentExperiment.baseline_models?.map((b, i) => (
                  <span key={i} className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg font-semibold text-[11px]">
                    {b}
                  </span>
                )) || <span className="text-slate-400">Baseline models</span>}
              </div>
            </div>

            <div className="pt-1 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Proposed Architecture / Mechanism
              </span>
              <p className="text-slate-800 font-medium leading-relaxed bg-teal-50/50 p-2.5 rounded-lg border border-teal-200/70 text-[11px]">
                {currentExperiment.proposed_architecture || "Proposed innovative framework"}
              </p>
            </div>
          </div>
        </div>

        {/* Evaluation Metrics & Expected Results */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold uppercase text-[11px] border-b border-slate-100 pb-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Evaluation Metrics & Expected Outcomes</span>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {currentExperiment.evaluation_metrics?.map((m, i) => (
                <span key={i} className="bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-lg font-semibold text-[11px]">
                  {m}
                </span>
              )) || <span className="text-slate-400">Accuracy, F1-Score, Latency</span>}
            </div>

            {currentExperiment.expected_results && (
              <div className="pt-1.5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Hypothesis Confirmation Threshold
                </span>
                <p className="text-slate-700 leading-relaxed text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                  {currentExperiment.expected_results}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Statistical Rigor & Reproducibility */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold uppercase text-[11px] border-b border-slate-100 pb-2">
            <Scale className="w-4 h-4 text-purple-600" />
            <span>Statistical Significance & Reproducibility</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div>
              <span className="font-semibold text-slate-800">Hypothesis Testing Method: </span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                {currentExperiment.statistical_analysis || "Paired t-test and Wilcoxon signed-rank tests at alpha = 0.01."}
              </p>
            </div>

            {currentExperiment.reproducibility_protocol && currentExperiment.reproducibility_protocol.length > 0 && (
              <div className="pt-1 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Reproducibility Controls:
                </span>
                <ul className="space-y-1 list-disc list-inside text-slate-600">
                  {currentExperiment.reproducibility_protocol.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action: Proceed to Findings Tab */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          Ready to log quantitative metrics, confusion matrices, and ablation data from your experiment?
        </div>

        <Button
          onClick={() => {
            if (onNavigateTab) {
              onNavigateTab("findings");
            } else if (onProceedToResults) {
              onProceedToResults();
            } else {
              toast.info("Navigate to the 'Findings' tab in the sidebar to log results.");
            }
          }}
          className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold h-9 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>Record Empirical Results in Findings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && renderEditModal()}
    </div>
  );

  // =========================================================================
  // 3. EDIT / CREATE MODAL
  // =========================================================================
  function renderEditModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TestTube className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold font-heading text-slate-900 text-base">
                Customize Experimental Protocol
              </h3>
            </div>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Target Hypothesis */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Target Hypothesis Statement
              </label>
              <textarea
                value={editForm.hypothesis || ""}
                onChange={(e) => setEditForm({ ...editForm, hypothesis: e.target.value })}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none bg-slate-50 text-slate-800 text-xs"
                placeholder="Formulate the primary scientific hypothesis to test..."
              />
            </div>

            {/* Dataset Name */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Dataset / Benchmark Testbed Name
              </label>
              <input
                type="text"
                value={editForm.dataset_strategy?.name || ""}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    dataset_strategy: {
                      ...(editForm.dataset_strategy || { data_collection: "", preprocessing: [], sample_size_target: "" }),
                      name: e.target.value,
                    },
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none bg-slate-50 text-slate-800 text-xs"
                placeholder="e.g., SWC-107 Vulnerability Benchmark, ImageNet-1k, Clinical Cohort"
              />
            </div>

            {/* Baseline Models */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Baseline Models (Comma separated)
              </label>
              <input
                type="text"
                value={(editForm.baseline_models || []).join(", ")}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    baseline_models: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none bg-slate-50 text-slate-800 text-xs"
                placeholder="e.g., Mythril, Slither, Manticore"
              />
            </div>

            {/* Proposed Architecture */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Proposed Method / Architecture
              </label>
              <textarea
                value={editForm.proposed_architecture || ""}
                onChange={(e) => setEditForm({ ...editForm, proposed_architecture: e.target.value })}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none bg-slate-50 text-slate-800 text-xs"
                placeholder="Description of proposed novel mechanism or architecture..."
              />
            </div>

            {/* Evaluation Metrics */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Evaluation Metrics (Comma separated)
              </label>
              <input
                type="text"
                value={(editForm.evaluation_metrics || []).join(", ")}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    evaluation_metrics: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none bg-slate-50 text-slate-800 text-xs"
                placeholder="e.g., Sensitivity, Precision, Latency, Gas Overhead"
              />
            </div>

            {/* Expected Results */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Expected Quantitative Outcomes
              </label>
              <input
                type="text"
                value={editForm.expected_results || ""}
                onChange={(e) => setEditForm({ ...editForm, expected_results: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none bg-slate-50 text-slate-800 text-xs"
                placeholder="e.g., >98% sensitivity with <5% overhead"
              />
            </div>

            {/* Statistical Test */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Statistical Significance Test Framework
              </label>
              <input
                type="text"
                value={editForm.statistical_analysis || ""}
                onChange={(e) => setEditForm({ ...editForm, statistical_analysis: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none bg-slate-50 text-slate-800 text-xs"
                placeholder="e.g., Paired Wilcoxon signed-rank test (p < 0.01)"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
              className="text-xs h-8 px-3 rounded-lg border-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              size="sm"
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold h-8 px-4 rounded-lg"
            >
              Save Protocol
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
