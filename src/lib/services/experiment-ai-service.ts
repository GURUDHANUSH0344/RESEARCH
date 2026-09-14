/**
 * 🧪 Experimental Protocol AI Reasoning Engine
 * Designs reproducible, rigorous, domain-grounded scientific experimental protocols
 * tailored strictly to the current Research ID and inquiry.
 */

import { type ResearchProject } from "@/types/research";
import { type ExperimentPlanResult, callLLM, safeParseJSON } from "./llm";

/**
 * Synthesizes domain-specific fallback experimental protocol when LLM is unavailable
 */
export function getDomainSpecificExperimentPlan(
  project: ResearchProject,
  customHypothesis?: string
): ExperimentPlanResult {
  const field = (project.research_field || "").toLowerCase();
  const question = project.research_question || project.title;
  const qLower = question.toLowerCase();

  const isBlockchain =
    field.includes("blockchain") ||
    field.includes("smart contract") ||
    field.includes("security") ||
    field.includes("crypto") ||
    qLower.includes("smart contract") ||
    qLower.includes("reentrancy") ||
    qLower.includes("formal verification");

  const isMedicalBio =
    field.includes("medical") ||
    field.includes("bio") ||
    field.includes("health") ||
    field.includes("clinical") ||
    field.includes("pharma") ||
    qLower.includes("disease") ||
    qLower.includes("patient") ||
    qLower.includes("drug");

  const isMLVision =
    field.includes("vision") ||
    field.includes("image") ||
    field.includes("deep learning") ||
    qLower.includes("image") ||
    qLower.includes("detection") ||
    qLower.includes("vision");

  if (isBlockchain) {
    const defaultHypothesis =
      customHypothesis ||
      `Integrating automated symbolic execution with zero-knowledge assertion circuits will detect and eliminate 100% of reentrancy call-stack anomalies while keeping on-chain gas overhead below 4.5%.`;

    return {
      research_question: question,
      hypothesis: defaultHypothesis,
      dataset_strategy: {
        name: "Curated EVM Smart Contract Vulnerability Corpus (SWC-107 + DeFi Exploit Benchmark)",
        data_collection:
          "Compiled corpus of 650 verified Ethereum mainnet smart contracts, including 250 documented historical exploit victims (e.g., TheDAO, Lendf.Me, Cream Finance) and 400 audited non-vulnerable control contracts.",
        preprocessing: [
          "AST generation and CFG (Control Flow Graph) extraction using solc-0.8.20",
          "SSA (Static Single Assignment) canonical normalization of external call sites",
          "State-variable mutation mapping across reentrant execution paths",
        ],
        sample_size_target:
          "650 smart contracts partitioned into 70% training/tuning set (455 contracts) and 30% held-out blind evaluation suite (195 contracts).",
      },
      baseline_models: [
        "Slither v0.10.0 (Datalog Static Taint Analysis)",
        "Mythril v0.24.4 (Laser EVM Symbolic Execution)",
        "Manticore v0.3.7 (Dynamic Binary Tracing & SMT)",
        "Securify2 (Stratified Property Checker)",
      ],
      proposed_architecture:
        "ZK-FormalGuard: Inductive SMT Invariant Prover with Succinct Zero-Knowledge Transition Verification for State Reentrancy Invariance.",
      independent_variables: [
        "Verification Engine Mode (ZK-FormalGuard vs. 4 baseline static/symbolic analyzers)",
        "Contract Cyclomatic Complexity (ranging from 3 to 28 independent control branches)",
        "Inter-contract Call Nesting Depth (1 to 5 external call hops)",
      ],
      dependent_variables: [
        "Vulnerability Detection Sensitivity / Recall (%)",
        "False Positive Rate (FPR %)",
        "SMT Verification Latency per KLOC (seconds)",
        "ZK Proof Generation Time & Gas Execution Surcharge (Wei / %)",
      ],
      control_variables: [
        "Standardized EVM London/Cancun execution environment on local Anvil node",
        "Pinned compiler version (solc 0.8.20 with optimizer runs=200)",
        "Fixed Z3 SMT solver timeout set strictly to 60 seconds per path query",
      ],
      experimental_procedure: [
        "Phase 1: Ingest and validate SWC-107 vulnerability corpus; verify test suite determinism on local EVM node.",
        "Phase 2: Execute baseline static & symbolic tools (Slither, Mythril, Manticore) across all 650 benchmark contracts.",
        "Phase 3: Deploy proposed ZK-FormalGuard prover; extract inductive invariants for all state-mutating external calls.",
        "Phase 4: Run automated mutation testing by injecting 120 synthetic reentrancy variants into audited contracts.",
        "Phase 5: Measure verification proof generation latency and simulate on-chain gas cost differences.",
        "Phase 6: Conduct non-parametric statistical significance testing (Wilcoxon signed-rank and McNemar's tests).",
      ],
      evaluation_metrics: [
        "Recall / True Positive Rate (Target: >= 98.5%)",
        "Precision (Target: >= 94.0%)",
        "False Discovery Rate (Target: <= 6.0%)",
        "Average Prover Latency (< 1.8s per contract)",
        "Gas Overhead (< 5.0% compared to unverified contract execution)",
      ],
      expected_results:
        "ZK-FormalGuard is predicted to achieve 99.1% detection sensitivity on reentrancy exploits with an FPR under 3.2%, outperforming standard symbolic execution by 4.2x in speed and avoiding path explosion.",
      statistical_analysis:
        "Paired McNemar's test for binary detection discrepancy and Wilcoxon signed-rank test for verification time distributions with significance threshold alpha = 0.01.",
      reproducibility_protocol: [
        "Containerized Docker environment with pinned Solc, Z3 Solver 4.12, and Foundry toolchain",
        "Deterministic test scripts with fixed random seeds for property fuzzing (seed=0x42)",
        "Public GitHub repository containing all contract bytecodes, ASTs, and reproduction logs",
      ],
      visual_workflow: {
        steps: [
          { step: 1, name: "Corpus Ingestion & AST Extraction", description: "Parse 650 smart contracts into canonical Control Flow Graphs", type: "dataset" },
          { step: 2, name: "SSA Normalization & Call-site Mapping", description: "Trace state mutations before and after external call boundaries", type: "preprocess" },
          { step: 3, name: "Baseline Symbolic Analyzer Execution", description: "Run Mythril, Slither, and Manticore under fixed SMT timeouts", type: "baseline" },
          { step: 4, name: "Proposed SMT Invariant Synthesis", description: "Synthesize inductive state assertions for reentrancy locking", type: "proposed" },
          { step: 5, name: "ZK Constraint Proof Generation", description: "Compile assertions into zero-knowledge state-transition circuits", type: "training" },
          { step: 6, name: "Synthetic Mutation Invalidation", description: "Validate detection robustness on 120 mutated exploit variants", type: "validation" },
          { step: 7, name: "Multi-Metric Benchmark Assessment", description: "Measure Recall, False Positive Rate, and Gas Overhead", type: "evaluation" },
          { step: 8, name: "Statistical Rigor Verification", description: "Compute McNemar's and Wilcoxon tests at p < 0.01 threshold", type: "statistical" },
        ],
      },
    };
  }

  if (isMedicalBio) {
    const defaultHypothesis =
      customHypothesis ||
      `Stratified biomarker modeling combined with calibrated uncertainty estimation achieves superior diagnostic sensitivity while reducing false positive referrals by >25%.`;

    return {
      research_question: question,
      hypothesis: defaultHypothesis,
      dataset_strategy: {
        name: "Multi-Center De-identified Clinical Evaluation Cohort",
        data_collection:
          "Multi-institutional cohort comprising 4,200 retrospective clinical samples with verified pathology ground-truth and standardized laboratory metadata.",
        preprocessing: [
          "Outlier screening and missing value imputation using MissForest",
          "Batch effect correction via ComBat normalization",
          "Stratified clinical feature scaling",
        ],
        sample_size_target:
          "4,200 patient samples split into 60% training (2,520), 20% validation (840), and 20% independent hospital test set (840).",
      },
      baseline_models: [
        "Standard Clinical Risk Score (Baseline Standard of Care)",
        "XGBoost Clinical Classifier",
        "Multi-Layer Perceptron with L2 Regularization",
        "Random Survival Forest",
      ],
      proposed_architecture:
        "DeepCalibrated-Net: Hierarchical Bayesian Architecture with Multi-Task Biomarker Calibration and Monte-Carlo Dropout Uncertainty.",
      independent_variables: [
        "Diagnostic Model Type (Proposed vs. 4 clinical baselines)",
        "Biomarker Imputation Strategy",
        "Clinical Subgroup Demographics",
      ],
      dependent_variables: [
        "Area Under the ROC Curve (AUROC)",
        "Diagnostic Sensitivity & Specificity at 95% operating threshold",
        "Brier Calibration Score",
        "Number of Unnecessary Invasive Follow-ups Avoided",
      ],
      control_variables: [
        "Fixed patient-level split (no sample leakage between cohorts)",
        "Standardized calibration temperature scaling",
        "Fixed cross-validation random seed (seed=101)",
      ],
      experimental_procedure: [
        "Phase 1: Harmonize clinical cohort data across center protocols; ensure strict IRB-compliant anonymization.",
        "Phase 2: Train baseline models under 10-fold stratified cross-validation.",
        "Phase 3: Train proposed DeepCalibrated-Net with uncertainty estimation bounds.",
        "Phase 4: Evaluate diagnostic discrimination across independent test centers.",
        "Phase 5: Perform decision curve analysis (DCA) to quantify clinical net benefit.",
        "Phase 6: Conduct paired Delong test comparing AUROC curves against standard of care.",
      ],
      evaluation_metrics: [
        "AUROC (Target: >= 0.94)",
        "Sensitivity (Target: >= 92.5% at 90% specificity)",
        "Expected Calibration Error (ECE < 0.03)",
        "Net Clinical Benefit Index",
      ],
      expected_results:
        "Proposed protocol is projected to achieve AUROC 0.952 (p < 0.001 vs. baseline clinical score 0.814) with an ECE of 0.024.",
      statistical_analysis:
        "DeLong's test for paired ROC comparisons and bootstrap resampling (1,000 iterations) for 95% confidence intervals.",
      reproducibility_protocol: [
        "Open-source preprocessing pipeline in Python with exact seed configuration",
        "Complete configuration YAML with all hyperparameter settings",
      ],
      visual_workflow: {
        steps: [
          { step: 1, name: "Multi-Center Cohort Harmonization", description: "Consolidate 4,200 patient profiles with ground-truth pathology", type: "dataset" },
          { step: 2, name: "Batch Correction & Imputation", description: "Apply ComBat normalization to remove inter-hospital batch variance", type: "preprocess" },
          { step: 3, name: "Standard of Care Baseline Benchmark", description: "Evaluate traditional clinical scoring and XGBoost baselines", type: "baseline" },
          { step: 4, name: "Proposed Calibrated Model Training", description: "Train Bayesian hierarchical network with uncertainty head", type: "proposed" },
          { step: 5, name: "Independent Hospital Validation", description: "Test generalization on out-of-domain independent test cohort", type: "validation" },
          { step: 6, name: "Decision Curve & Benefit Analysis", description: "Quantify reduction in false positive referrals and net clinical gain", type: "evaluation" },
          { step: 7, name: "DeLong Statistical Significance Test", description: "Compute ROC divergence significance at p < 0.001", type: "statistical" },
        ],
      },
    };
  }

  // General Scientific / Computational Default
  const defaultHypothesis =
    customHypothesis ||
    `Applying structured empirical constraints and modular attention architectures to ${project.title} outperforms conventional baselines by >15% across core target benchmarks.`;

  return {
    research_question: question,
    hypothesis: defaultHypothesis,
    dataset_strategy: {
      name: `Benchmark Evaluation Corpus for ${project.title}`,
      data_collection:
        "Curated multi-source experimental benchmark dataset gathered from standard domain repositories and peer-reviewed literature baselines.",
      preprocessing: [
        "Statistical outlier elimination and data normalization",
        "Stratified domain-aware partitioning across experimental groups",
        "Artifact deduplication and balance adjustments",
      ],
      sample_size_target:
        "Partitioned systematically into 70% training, 15% validation, and 15% blind test cohorts.",
    },
    baseline_models: [
      "Standard Published Baseline Model (Current Literature Benchmark)",
      "Traditional Heuristic / Statistical Approach",
      "Modernized Ablated Reference Architecture",
    ],
    proposed_architecture: `Proposed ${project.title} Methodology: Integrated framework with modular feature decoupling and optimized convergence controls.`,
    independent_variables: [
      "Methodology Configuration (Proposed vs. Baseline Implementations)",
      "Parameter Scale and Optimization Regime",
    ],
    dependent_variables: [
      "Primary Task Accuracy / Performance Metric (%)",
      "Computational Efficiency and Latency (ms)",
      "Generalization Error across unseen evaluation folds",
    ],
    control_variables: [
      "Identical training and test splits across all compared methods",
      "Standardized hardware testbed and runtime seed controls",
      "Uniform convergence criteria and epoch ceilings",
    ],
    experimental_procedure: [
      "Phase 1: Ingest and verify benchmark corpus integrity; establish baseline verification harness.",
      "Phase 2: Train baseline models under standardized evaluation settings.",
      "Phase 3: Implement and train proposed methodology with modular improvements.",
      "Phase 4: Run 5-fold cross-validation to construct variance confidence bands.",
      "Phase 5: Benchmark computational latency and resource utilization.",
      "Phase 6: Conduct paired statistical significance tests (Student's t-test and Wilcoxon signed-rank).",
    ],
    evaluation_metrics: [
      "Primary Performance Metric (Target: > 15% improvement over baseline)",
      "Secondary Quality / Reliability Metric",
      "Inference Latency & Throughput",
      "Resource Utilization (Memory / FLOPs)",
    ],
    expected_results:
      "The proposed approach is expected to demonstrate statistically significant improvements over published baselines (p < 0.01) with competitive computational efficiency.",
    statistical_analysis:
      "Paired Student's t-test and non-parametric Wilcoxon signed-rank test across 5 stratified folds with alpha = 0.01.",
    reproducibility_protocol: [
      "Environment Dockerfile with exact software dependencies and versions",
      "Deterministic execution seeds fixed across all evaluation runs",
      "Complete reproduction script and open data indices published",
    ],
    visual_workflow: {
      steps: [
        { step: 1, name: "Data Ingestion & Integrity Check", description: "Curate and verify standardized evaluation benchmark suite", type: "dataset" },
        { step: 2, name: "Feature Normalization & Preprocessing", description: "Apply domain normalization and outlier filtering", type: "preprocess" },
        { step: 3, name: "Baseline Implementations Benchmark", description: "Train and evaluate established state-of-the-art baselines", type: "baseline" },
        { step: 4, name: "Proposed System Implementation", description: "Train proposed methodology with target architectural improvements", type: "proposed" },
        { step: 5, name: "Cross-Validation & Ablation Study", description: "Validate across stratified folds to quantify subcomponent gains", type: "validation" },
        { step: 6, name: "Multi-Metric Quantitative Evaluation", description: "Compute accuracy, speed, and resource efficiency metrics", type: "evaluation" },
        { step: 7, name: "Statistical Hypothesis Verification", description: "Execute paired significance tests at p < 0.01 confidence", type: "statistical" },
      ],
    },
  };
}

/**
 * Generate a complete, rigorous experimental protocol using LLM or domain fallback
 */
export async function generateExperimentProtocol(
  project: ResearchProject,
  customHypothesis?: string
): Promise<ExperimentPlanResult> {
  const papersContext = (project.papers || [])
    .slice(0, 5)
    .map((p, idx) => `[${idx + 1}] "${p.title}" (${p.year || 2024}) - Abstract: ${p.abstract ? p.abstract.slice(0, 200) : "N/A"}`)
    .join("\n");

  const systemPrompt = `You are an elite scientific experimental architect and research methodologist.
Design a rigorous, reproducible, 8-stage experimental protocol to validate a scientific hypothesis.

CRITICAL REQUIREMENTS:
1. The protocol must be DEEPLY TAILORED to the exact research inquiry: "${project.research_question}".
2. Include concrete baseline models/tools from published literature.
3. Define exact independent, dependent, and control variables.
4. Specify clear evaluation metrics with quantitative acceptance thresholds.
5. Provide a step-by-step procedural workflow with 7-8 clear execution stages.
6. Specify statistical hypothesis tests (e.g., paired t-test, Wilcoxon, p-value thresholds).
7. Return strictly valid JSON adhering to the ExperimentPlanResult schema.`;

  const userPrompt = `Research Title: ${project.title}
Research Question: ${project.research_question}
Research Field: ${project.research_field}
Target Hypothesis: ${customHypothesis || project.hypotheses?.[0]?.statement || "Formulate optimal hypothesis from research question"}

Indexed Literature Evidence:
${papersContext || "No papers indexed yet; deduce standard domain benchmarks."}

Please output strictly valid JSON with this structure:
{
  "research_question": string,
  "hypothesis": string,
  "dataset_strategy": {
    "name": string,
    "data_collection": string,
    "preprocessing": string[],
    "sample_size_target": string
  },
  "baseline_models": string[],
  "proposed_architecture": string,
  "independent_variables": string[],
  "dependent_variables": string[],
  "control_variables": string[],
  "experimental_procedure": string[],
  "evaluation_metrics": string[],
  "expected_results": string,
  "statistical_analysis": string,
  "reproducibility_protocol": string[],
  "visual_workflow": {
    "steps": [
      { "step": number, "name": string, "description": string, "type": "dataset" | "preprocess" | "baseline" | "proposed" | "training" | "validation" | "evaluation" | "statistical" }
    ]
  }
}`;

  try {
    const raw = await callLLM(systemPrompt, userPrompt);
    const parsed = safeParseJSON<ExperimentPlanResult>(
      raw,
      getDomainSpecificExperimentPlan(project, customHypothesis)
    );
    return parsed;
  } catch {
    return getDomainSpecificExperimentPlan(project, customHypothesis);
  }
}

/**
 * Format the protocol into an academic Markdown document for clipboard or export
 */
export function formatExperimentProtocolAsMarkdown(
  experiment: ExperimentPlanResult,
  project: ResearchProject
): string {
  return `# Scientific Experimental Protocol
**Project:** ${project.title}
**Research ID:** \`${project.id}\`
**Research Field:** ${project.research_field}
**Primary Question:** ${experiment.research_question}

---

## 1. Target Scientific Hypothesis
> ${experiment.hypothesis}

### Variable Controls:
- **Independent Variables:** ${experiment.independent_variables?.join(", ") || "N/A"}
- **Dependent Variables:** ${experiment.dependent_variables?.join(", ") || "N/A"}
- **Control Variables:** ${experiment.control_variables?.join(", ") || "N/A"}

---

## 2. Dataset Strategy & Partitioning
- **Dataset / Corpus:** ${experiment.dataset_strategy?.name || "Standard benchmark"}
- **Collection Protocol:** ${experiment.dataset_strategy?.data_collection || "N/A"}
- **Sample Size Target:** ${experiment.dataset_strategy?.sample_size_target || "N/A"}
- **Preprocessing Pipeline:**
${(experiment.dataset_strategy?.preprocessing || []).map((step) => `  - ${step}`).join("\n")}

---

## 3. Baseline Benchmarks & Proposed Method
- **Standard Baseline Models:**
${(experiment.baseline_models || []).map((m) => `  - ${m}`).join("\n")}
- **Proposed Architecture / Mechanism:**
  ${experiment.proposed_architecture || "N/A"}

---

## 4. Step-by-Step Experimental Procedure
${(experiment.experimental_procedure || []).map((step, idx) => `${idx + 1}. ${step}`).join("\n")}

---

## 5. Evaluation Metrics & Target Outcomes
- **Quantitative Metrics:** ${(experiment.evaluation_metrics || []).join(", ")}
- **Expected Results & Thresholds:** ${experiment.expected_results || "N/A"}
- **Statistical Significance Framework:** ${experiment.statistical_analysis || "N/A"}

---

## 6. Reproducibility & Open Science Protocol
${(experiment.reproducibility_protocol || []).map((item) => `- ${item}`).join("\n")}

---
*Generated via Research Compass • Scientific Experimental Architect*
`;
}
