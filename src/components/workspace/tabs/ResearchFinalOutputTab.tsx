import React, { useState, useEffect } from "react";
import {
  type ResearchProject,
  type FinalResearchDocument,
  type FinalOutputType,
  type PaperDocumentType,
  type ResearchCompletenessCheck,
  type SectionSourceLink,
  type AuthorInfo,
  type PaperQualityCheckReport,
  type CitationAuditResult,
} from "@/types/research";
import { workspaceService } from "@/lib/services/workspace-service";
import {
  finalOutputGenerator,
  PATENT_SECTIONS,
} from "@/lib/services/final-output-generator";
import { docxExportService } from "@/lib/services/docx-export-service";
import { aiPaperClient, type AcademicPaperContext } from "@/lib/services/ai-paper-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Download,
  Copy,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Edit3,
  Eye,
  FileCheck2,
  ExternalLink,
  Layers,
  Wand2,
  Save,
  Check,
  Share2,
  Lock,
  ChevronRight,
  X,
  FileCode,
  GraduationCap,
  Scale,
  ListFilter,
  CheckCircle,
  HelpCircle,
  BarChart3,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";

export interface AcademicSectionDef {
  key: string;
  title: string;
  description: string;
  placeholder: string;
  isPreamble?: boolean;
  isReferences?: boolean;
}

export const ACADEMIC_PAPER_SECTIONS: AcademicSectionDef[] = [
  {
    key: "title",
    title: "Title",
    description: "Academic manuscript headline and research domain classification.",
    placeholder: "Comprehensive title reflecting the core research inquiry...",
    isPreamble: true,
  },
  {
    key: "author_info",
    title: "Author Information",
    description: "Author names, affiliations, departments, and institutional contact emails.",
    placeholder: "Lead Research Scientist, Department of Advanced Computational Science...\nContact: researcher@compass.org",
    isPreamble: true,
  },
  {
    key: "abstract",
    title: "Abstract",
    description: "Executive summary of problem, methodology, findings, and contributions.",
    placeholder: "Background, objectives, methodology, empirical results, and impact...",
    isPreamble: true,
  },
  {
    key: "keywords",
    title: "Keywords",
    description: "Standardized indexing keywords and field descriptors.",
    placeholder: "Domain, Empirical Evaluation, Benchmark Validation, Reproducibility...",
    isPreamble: true,
  },
  {
    key: "introduction",
    title: "1. Introduction",
    description: "Contextual background, motivation, scope, and paper structure.",
    placeholder: "Broad context, motivation, specific challenges, and structural roadmap...",
  },
  {
    key: "related_work",
    title: "2. Related Work / Literature Review",
    description: "Systematic synthesis of prior published papers in this research corpus.",
    placeholder: "Critique of foundational works and contemporary methods [1], [2]...",
  },
  {
    key: "research_gap",
    title: "3. Research Gap",
    description: "Specific limitations in existing state-of-the-art addressed by this research.",
    placeholder: "Where existing methods fail, plateau, or lack generalization...",
  },
  {
    key: "problem_statement",
    title: "4. Problem Statement",
    description: "Formal formulation of the theoretical, clinical, or technological problem addressed.",
    placeholder: "Clear formulation of the challenge and current barriers...",
  },
  {
    key: "objectives",
    title: "5. Objectives",
    description: "Explicit technical, empirical, and scientific goals.",
    placeholder: "Primary and secondary scientific targets...",
  },
  {
    key: "methodology",
    title: "6. Proposed Methodology",
    description: "Mathematical formulation, algorithms, and experimental pipeline.",
    placeholder: "Architectural formulation, data preprocessing, loss functions, and workflows...",
  },
  {
    key: "system_architecture",
    title: "7. System Architecture / Framework",
    description: "Novel architecture, theoretical formulation, or framework design.",
    placeholder: "Detailed architectural novelties and algorithmic enhancements [Figure 1]...",
  },
  {
    key: "implementation",
    title: "8. Implementation",
    description: "Hardware, software, frameworks, hyper-parameters, and reproducibility details.",
    placeholder: "Libraries, compute environment, batch sizes, learning rates, and training setup...",
  },
  {
    key: "experimental_setup",
    title: "9. Experimental Setup",
    description: "Datasets, evaluation protocols, baseline models, and hardware environment.",
    placeholder: "Controlled cohorts, benchmark splits, fixed random seeds, and evaluation metrics...",
  },
  {
    key: "results",
    title: "10. Results",
    description: "Quantitative benchmarks, comparative metrics, and experimental tables.",
    placeholder: "AUROC, F1-scores, accuracy, latency, and comparative tables against baselines [Table 1]...",
  },
  {
    key: "discussion",
    title: "11. Discussion",
    description: "Interpretation of findings, clinical or industry implications, and broader impact.",
    placeholder: "Why the proposed method outperforms baselines and what it means for practitioners...",
  },
  {
    key: "limitations",
    title: "12. Limitations",
    description: "Boundary conditions, assumptions, dataset biases, or compute constraints.",
    placeholder: "Explicit boundaries, unverified edge cases, and computational cost...",
  },
  {
    key: "future_work",
    title: "13. Future Work",
    description: "Promising future research directions and prospective extensions.",
    placeholder: "Prospective architectural extensions, larger cohorts, and cross-domain validation...",
  },
  {
    key: "conclusion",
    title: "14. Conclusion",
    description: "Final synthesis of contributions, core takeaways, and closing remarks.",
    placeholder: "Summary of achievements and closing takeaway...",
  },
  {
    key: "references",
    title: "References",
    description: "Peer-reviewed bibliography with verifiable in-text bracket citations [1], [2] strictly from project literature.",
    placeholder: "Compiled literature citations strictly corresponding to this research corpus...",
    isReferences: true,
  },
];

interface ResearchFinalOutputTabProps {
  project: ResearchProject;
  initialMode?: FinalOutputType;
}

export function ResearchFinalOutputTab({
  project,
  initialMode = "paper",
}: ResearchFinalOutputTabProps) {
  const [mode, setMode] = useState<FinalOutputType>(initialMode);
  const [docType, setDocType] = useState<PaperDocumentType>("research_paper");
  const [document, setDocument] = useState<FinalResearchDocument | null>(null);
  const [activeSectionKey, setActiveSectionKey] = useState<string>("abstract");
  const [isEditing, setIsEditing] = useState(false);
  const [sectionContent, setSectionContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [isGeneratingPaper, setIsGeneratingPaper] = useState(false);

  // Modals & Panels
  const [isQualityCheckOpen, setIsQualityCheckOpen] = useState(false);
  const [isCitationCheckOpen, setIsCitationCheckOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isSourceViewerOpen, setIsSourceViewerOpen] = useState(false);
  const [isSaveVersionOpen, setIsSaveVersionOpen] = useState(false);
  const [selectedVersionTag, setSelectedVersionTag] = useState<string>("Draft 1");
  const [versionChangelog, setVersionChangelog] = useState("");
  const [versions, setVersions] = useState<FinalResearchDocument[]>([]);
  const [qualityReport, setQualityReport] = useState<PaperQualityCheckReport | null>(null);
  const [citationAudit, setCitationAudit] = useState<CitationAuditResult | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Version Comparison
  const [comparingVersion, setComparingVersion] = useState<FinalResearchDocument | null>(null);

  // Backward compatibility: normalize section keys
  const normalizeSections = (doc: FinalResearchDocument): FinalResearchDocument => {
    const sec = { ...doc.sections };
    if (!sec.related_work && sec.literature_review) sec.related_work = sec.literature_review;
    if (!sec.problem_statement && sec.problem) sec.problem_statement = sec.problem;
    if (!sec.system_architecture && sec.proposed_solution) sec.system_architecture = sec.proposed_solution;
    if (!sec.author_info && doc.authors && doc.authors.length > 0) {
      sec.author_info = doc.authors.map(a => `${a.name}${a.affiliation ? `, ${a.affiliation}` : ""}${a.email ? ` (Contact: ${a.email})` : ""}`).join("\n");
    } else if (!sec.author_info) {
      sec.author_info = `Lead Research Scientist\nDepartment of Advanced Computational Science, Research Compass Institute\nContact: researcher@compass.org`;
    }
    if (!sec.keywords) {
      sec.keywords = `${project.research_field}, Empirical Evaluation, Benchmark Validation, Reproducibility, Algorithmic Framework`;
    }
    return { ...doc, sections: sec };
  };

  // Load or generate initial document
  const loadDocument = async (targetMode: FinalOutputType = mode) => {
    setLoading(true);
    try {
      let doc = await workspaceService.getLatestFinalDocument(project.id, targetMode);
      if (!doc) {
        doc = await finalOutputGenerator.generateDocument(project, targetMode, docType);
        await workspaceService.saveFinalDocument(project.id, doc);
      }
      const normalized = normalizeSections(doc);
      setDocument(normalized);

      const defaultSec = targetMode === "paper" ? "abstract" : "invention_title";
      setActiveSectionKey(defaultSec);
      setSectionContent(normalized.sections[defaultSec] || "");

      // Load versions
      const vers = await workspaceService.getDocumentVersions(project.id, normalized.id);
      setVersions(vers);

      // Automated Quality Check in background
      const papers = await workspaceService.getPapers(project.id);
      const notes = await workspaceService.getNotes(project.id);
      const findings = await workspaceService.getFindings(project.id);
      const context: AcademicPaperContext = {
        project,
        papers,
        notes,
        findings,
        gaps: project.gaps || [],
      };

      const auditQuality = await aiPaperClient.runQualityCheck(normalized, context);
      setQualityReport(auditQuality);

      const auditCitations = await aiPaperClient.verifyCitations(normalized, papers);
      setCitationAudit(auditCitations);
    } catch (e) {
      console.error("Failed to load final document:", e);
      toast.error("Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocument(mode);
  }, [project.id, mode]);

  // Handle Mode Switch (Paper vs Patent)
  const handleSwitchMode = async (newMode: FinalOutputType) => {
    if (newMode === mode) return;
    setMode(newMode);
  };

  // Section Selection
  const handleSelectSection = (key: string) => {
    if (!document) return;
    if (isEditing && activeSectionKey) {
      document.sections[activeSectionKey] = sectionContent;
    }
    setActiveSectionKey(key);
    setSectionContent(document.sections[key] || "");
    setIsEditing(false);
  };

  // Save Current Section
  const handleSaveSection = async () => {
    if (!document) return;
    try {
      const updatedSections = {
        ...document.sections,
        [activeSectionKey]: sectionContent,
      };
      const updatedDoc: FinalResearchDocument = {
        ...document,
        sections: updatedSections,
        updated_at: new Date().toISOString(),
      };
      const saved = await workspaceService.saveFinalDocument(project.id, updatedDoc);
      setDocument(saved);
      setIsEditing(false);

      // Re-run quality check
      const papers = await workspaceService.getPapers(project.id);
      const notes = await workspaceService.getNotes(project.id);
      const findings = await workspaceService.getFindings(project.id);
      const context: AcademicPaperContext = { project, papers, notes, findings, gaps: project.gaps || [] };
      const quality = await aiPaperClient.runQualityCheck(saved, context);
      setQualityReport(quality);

      toast.success("Section updated & saved");
    } catch {
      toast.error("Failed to save section");
    }
  };

  // 🚀 MAIN FEATURE: Generate Complete Academic Research Paper via Backend AI
  const handleGenerateResearchPaper = async () => {
    setIsGeneratingPaper(true);
    try {
      const papers = await workspaceService.getPapers(project.id);
      const notes = await workspaceService.getNotes(project.id);
      const findings = await workspaceService.getFindings(project.id);

      const authorsList: AuthorInfo[] = document?.authors && document.authors.length > 0
        ? document.authors
        : [
            {
              name: "Lead Research Scientist",
              affiliation: `${project.research_field} Laboratory, Research Compass Institute`,
              email: "researcher@compass.org",
            },
          ];

      const context: AcademicPaperContext = {
        project,
        papers,
        notes,
        findings,
        gaps: project.gaps || [],
        authors: authorsList,
      };

      toast.info("Generating complete academic research paper...", {
        description: `Synthesizing ${papers.length} peer-reviewed papers, ${findings.length} empirical findings, and project notes strictly for Research ID: ${project.id}.`,
        duration: 4500,
      });

      const generated = await aiPaperClient.generatePaper(context);
      const normalized = normalizeSections(generated);

      const draftIndex = (versions.length || 0) + 1;
      normalized.version_tag = draftIndex <= 3 ? `Draft ${draftIndex}` : `Draft ${draftIndex}`;
      normalized.version = draftIndex;

      // Run quality & citation checks
      const quality = await aiPaperClient.runQualityCheck(normalized, context);
      normalized.quality_report = quality;
      setQualityReport(quality);

      const citations = await aiPaperClient.verifyCitations(normalized, papers);
      setCitationAudit(citations);

      const saved = await workspaceService.saveFinalDocument(project.id, normalized);
      setDocument(saved);
      setSectionContent(saved.sections[activeSectionKey] || "");

      // Refresh versions
      const vers = await workspaceService.getDocumentVersions(project.id, saved.id);
      setVersions(vers);

      toast.success(`Academic Paper Generated (${saved.version_tag})!`, {
        description: `Research Readiness: ${quality.readiness_score}% • ${citations.matched_citations} verified in-text citations linked.`,
        duration: 5000,
      });
    } catch (err: any) {
      console.error("Failed to generate research paper:", err);
      toast.error("Generation failed: " + (err.message || "Unknown error"));
    } finally {
      setIsGeneratingPaper(false);
    }
  };

  // Regenerate Specific Section
  const handleRegenerateSection = async (sectionKeyToRegen?: string) => {
    const targetKey = sectionKeyToRegen || activeSectionKey;
    const targetDef = activeSectionsList.find((s) => s.key === targetKey);
    if (!document || !targetDef) return;

    setIsAiRunning(true);
    try {
      const papers = await workspaceService.getPapers(project.id);
      const notes = await workspaceService.getNotes(project.id);
      const findings = await workspaceService.getFindings(project.id);
      const context: AcademicPaperContext = {
        project,
        papers,
        notes,
        findings,
        gaps: project.gaps || [],
      };

      toast.info(`Regenerating ${targetDef.title}...`);

      const result = await aiPaperClient.regenerateSection(
        targetKey,
        targetDef.title,
        context,
        document.sections[targetKey] || ""
      );

      const updatedSections = {
        ...document.sections,
        [targetKey]: result.updatedText,
      };
      const updatedDoc: FinalResearchDocument = {
        ...document,
        sections: updatedSections,
        updated_at: new Date().toISOString(),
      };

      const saved = await workspaceService.saveFinalDocument(project.id, updatedDoc);
      setDocument(saved);
      if (targetKey === activeSectionKey) {
        setSectionContent(result.updatedText);
      }

      toast.success(`Regenerated ${targetDef.title}`, {
        description: result.explanation,
      });
    } catch (err: any) {
      console.error("Failed to regenerate section:", err);
      toast.error("Section regeneration failed");
    } finally {
      setIsAiRunning(false);
    }
  };

  // Run AI Writing Action (Improve Tone, Check Structure, etc.)
  const handleRunAiAction = async (action: string) => {
    if (!document) return;
    setIsAiRunning(true);
    try {
      const result = await finalOutputGenerator.runWritingAction(
        action,
        activeSectionKey,
        sectionContent,
        project
      );
      setSectionContent(result.updatedText);
      setIsEditing(true);
      toast.success(result.explanation);
    } catch {
      toast.error("AI writing action failed");
    } finally {
      setIsAiRunning(false);
    }
  };

  // Version History: Save New Version with explicit tags (Draft 1, Draft 2, Draft 3, Final)
  const handleSaveVersion = async () => {
    if (!document) return;
    try {
      const tag = selectedVersionTag || `Draft ${(versions.length || 0) + 1}`;
      const changelogText = versionChangelog.trim() || `Milestone ${tag}`;
      const updatedDoc: FinalResearchDocument = {
        ...document,
        version_tag: tag,
      };

      const saved = await workspaceService.createDocumentVersion(
        project.id,
        updatedDoc,
        changelogText
      );
      setDocument(saved);
      setIsSaveVersionOpen(false);
      setVersionChangelog("");
      const vers = await workspaceService.getDocumentVersions(project.id, saved.id);
      setVersions(vers);
      toast.success(`Archived as ${tag} (Version ${saved.version})`);
    } catch {
      toast.error("Failed to archive version");
    }
  };

  // Version History: Restore Version
  const handleRestoreVersion = async (versionId: string) => {
    try {
      const restored = await workspaceService.restoreDocumentVersion(project.id, versionId);
      const normalized = normalizeSections(restored);
      setDocument(normalized);
      setSectionContent(normalized.sections[activeSectionKey] || "");
      setIsVersionHistoryOpen(false);
      setComparingVersion(null);
      toast.success(`Restored active draft from ${normalized.version_tag || `Version ${normalized.version}`}`);
    } catch {
      toast.error("Failed to restore version");
    }
  };

  // Exports
  const compileFullMarkdown = (): string => {
    if (!document) return "";
    const sectionsDef = mode === "paper" ? ACADEMIC_PAPER_SECTIONS : PATENT_SECTIONS;
    const header = `# ${document.title}\n\n**Research ID:** \`${project.id}\`  \n**Field:** ${project.research_field}  \n**Document Type:** ${document.document_type.replace("_", " ").toUpperCase()}  \n**Version:** ${document.version_tag || `Version ${document.version}`}  \n**Date:** ${new Date().toLocaleDateString()}  \n**Readiness:** ${qualityReport?.readiness_score || document.quality_report?.readiness_score || 85}%\n\n---\n\n`;

    const body = sectionsDef
      .map((sec) => {
        const content = document.sections[sec.key] || "[Content pending]";
        return `## ${sec.title}\n\n${content}\n`;
      })
      .join("\n");

    const footer = mode === "patent"
      ? `\n\n---\n*NOTICE: AI-generated patent-oriented draft. This document is not a legally validated patent application. AI-generated content should be reviewed by a qualified patent professional before filing.*`
      : "";

    return header + body + footer;
  };

  const handleExportMarkdown = () => {
    const text = compileFullMarkdown();
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${docxExportService.getResearchPaperFileName(project).replace(".docx", ".md")}`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Exported Markdown (.md) document");
  };

  const handleExportPlainText = () => {
    const text = compileFullMarkdown();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${docxExportService.getResearchPaperFileName(project).replace(".docx", ".txt")}`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Exported Plain Text (.txt) document");
  };

  // 📥 Word Document Export (.docx)
  const handleDownloadWordDocx = async () => {
    if (!document) return;
    setIsExportingDocx(true);
    try {
      let docToExport = document;
      if (isEditing && activeSectionKey) {
        const updatedSections = {
          ...document.sections,
          [activeSectionKey]: sectionContent,
        };
        docToExport = {
          ...document,
          sections: updatedSections,
          updated_at: new Date().toISOString(),
        };
        const saved = await workspaceService.saveFinalDocument(project.id, docToExport);
        setDocument(saved);
        docToExport = saved;
        setIsEditing(false);
      }

      const fileName = await docxExportService.downloadFinalResearchPaper(docToExport, project);
      toast.success(`Downloaded: ${fileName}`, {
        description: `Professional academic Word (.docx) document created with title page, numbered headings, architecture diagrams, benchmark tables, and verified citations.`,
        duration: 5500,
      });
    } catch (err) {
      console.error("Failed to generate Word document:", err);
      toast.error("Failed to generate Microsoft Word (.docx) document");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleEditBeforeDownload = (sectionKeyToEdit?: string) => {
    setIsPreviewOpen(false);
    if (sectionKeyToEdit) {
      setActiveSectionKey(sectionKeyToEdit);
      setSectionContent(document?.sections[sectionKeyToEdit] || "");
    }
    setIsEditing(true);
    toast.info("Editor active. Make any desired revisions, then export.");
  };

  const activeSectionsList = mode === "paper" ? ACADEMIC_PAPER_SECTIONS : PATENT_SECTIONS;
  const currentSectionDef = activeSectionsList.find((s) => s.key === activeSectionKey);
  const activeSources = document?.sources?.[activeSectionKey];
  const readiness = qualityReport?.readiness_score || document?.quality_report?.readiness_score || 86;

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* 🧭 Top Stage Card: Final Research Paper Header & Controls */}
      <div className="card-mice p-6 space-y-4">
        {/* Top Badges & Meta Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <GraduationCap className="w-3 h-3 inline mr-1" />
              Final Research Paper
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Research ID: {project.id}
            </span>
            <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 bg-slate-50 text-slate-700 border-slate-200">
              {document?.version_tag || `Version ${document?.version || 1}`}
            </Badge>
            {/* Readiness Badge */}
            <button
              onClick={() => setIsQualityCheckOpen(true)}
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                readiness >= 80
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                  : readiness >= 65
                  ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                  : "bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100"
              }`}
              title="Click to view 10-dimension Research Quality Check"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Research Paper Readiness: {readiness}%</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsSaveVersionOpen(true)}
              size="sm"
              variant="outline"
              className="btn-interactive text-xs font-semibold h-8 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Save className="w-3.5 h-3.5 mr-1 text-purple-600" />
              Save Version
            </Button>
            <Button
              onClick={() => setIsVersionHistoryOpen(true)}
              size="sm"
              variant="outline"
              className="btn-interactive text-xs font-semibold h-8 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <History className="w-3.5 h-3.5 mr-1 text-slate-600" />
              History ({versions.length})
            </Button>
          </div>
        </div>

        {/* Headline & Description (Full Width - Never Squished!) */}
        <div className="space-y-1.5 max-w-4xl">
          <h2 className="text-xl md:text-2xl font-bold font-heading text-slate-900 tracking-tight leading-snug">
            Final Research Paper & Academic Manuscript Generator
          </h2>
          <p className="text-xs text-slate-500 font-normal leading-relaxed">
            Compile your research corpus into a publication-ready 19-part academic manuscript. Strictly grounded in literature, notes, and empirical results collected under Research ID <span className="font-mono text-slate-700 font-semibold">{project.id}</span>.
          </p>
        </div>

        {/* Primary Actions Bar */}
        <div className="pt-2 flex flex-wrap items-center gap-2.5">
          {/* 🌟 PROMINENT BUTTON: Generate Research Paper */}
          <Button
            onClick={handleGenerateResearchPaper}
            disabled={isGeneratingPaper || loading}
            size="sm"
            className="btn-interactive text-xs font-bold h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs px-4 cursor-pointer"
          >
            {isGeneratingPaper ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Generating Research Paper...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Generate Research Paper
              </>
            )}
          </Button>

          {/* 📄 PROMINENT BUTTON: Download Final Research Paper (.docx) */}
          <Button
            onClick={handleDownloadWordDocx}
            disabled={isExportingDocx || !document}
            size="sm"
            className="btn-interactive text-xs font-bold h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs px-3.5 cursor-pointer"
          >
            {isExportingDocx ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Generating DOCX...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Download Final Research Paper (.docx)
              </>
            )}
          </Button>

          {/* Preview Document */}
          <Button
            onClick={() => setIsPreviewOpen(true)}
            size="sm"
            variant="outline"
            className="btn-interactive text-xs font-semibold h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
            Preview Paper
          </Button>

          {/* Quality Check */}
          <Button
            onClick={() => setIsQualityCheckOpen(true)}
            size="sm"
            variant="outline"
            className="btn-interactive text-xs font-semibold h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Quality Check ({readiness}%)
          </Button>

          {/* Check Citations */}
          <Button
            onClick={() => setIsCitationCheckOpen(true)}
            size="sm"
            variant="outline"
            className="btn-interactive text-xs font-semibold h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
            Check Citations
          </Button>
        </div>

        {/* Mode Selector & Subtype Selector */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1">Output Mode:</span>
            <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/60">
              <button
                onClick={() => handleSwitchMode("paper")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 flex items-center gap-1.5 ${
                  mode === "paper"
                    ? "bg-white text-blue-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Academic Research Paper (19 Sections)</span>
              </button>

              <button
                onClick={() => handleSwitchMode("patent")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 flex items-center gap-1.5 ${
                  mode === "patent"
                    ? "bg-white text-purple-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Patent-Oriented Draft (14 Sections)</span>
              </button>
            </div>
          </div>

          {/* Sub-type selection (Paper Mode only) */}
          {mode === "paper" ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Academic Structure:</span>
              <Badge variant="outline" className="text-xs font-semibold bg-blue-50 text-blue-800 border-blue-200">
                19-Part Standard Academic Paper
              </Badge>
            </div>
          ) : (
            <div className="text-[11px] text-purple-700 font-medium bg-purple-50 px-3 py-1 rounded-lg border border-purple-200/70 flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              <span>14 Standard Patent Claims & Specification Sections</span>
            </div>
          )}
        </div>

        {/* ⚠️ Patent Legal Disclaimer (Mandatory) */}
        {mode === "patent" && (
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="space-y-0.5 text-xs">
              <p className="font-bold text-amber-900">
                AI-Generated Patent-Oriented Draft Notice
              </p>
              <p className="text-amber-700 font-normal leading-relaxed">
                This document is an AI-structured preliminary draft to assist researchers in technical disclosure and claim formulation. It does not constitute a legally validated patent application or legal advice. <strong>AI-generated content should be reviewed by a qualified patent attorney or professional before filing.</strong>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 📄 Main Workstation: Section Navigator (Left) + Document Canvas & Editor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Section List Navigator */}
        <div className="lg:col-span-4 space-y-3">
          <div className="card-mice p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ListFilter className="w-3.5 h-3.5 text-blue-600" />
                <span>Paper Sections ({activeSectionsList.length})</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono font-medium">
                {document?.version_tag || `v${document?.version || 1}`}
              </span>
            </div>

            <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
              {activeSectionsList.map((sec, idx) => {
                const isSelected = activeSectionKey === sec.key;
                const content = document?.sections[sec.key] || "";
                const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
                const requiresEmpiricalInput = content.includes("[Requires User Empirical Input") || content.includes("[Additional empirical evidence required");
                const isComplete = content.length > 50 && !requiresEmpiricalInput;
                const sourceCount = document?.sources?.[sec.key]?.paper_ids?.length || 0;

                return (
                  <button
                    key={sec.key}
                    onClick={() => handleSelectSection(sec.key)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all duration-150 flex items-start justify-between gap-2 border ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/60"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold font-heading truncate">
                          {sec.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] opacity-80 pl-5">
                        <span>{wordCount} words</span>
                        {sourceCount > 0 && (
                          <span>&bull; {sourceCount} ref(s)</span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 mt-0.5">
                      {requiresEmpiricalInput ? (
                        <span
                          className={`w-2 h-2 rounded-full inline-block ${
                            isSelected ? "bg-amber-300" : "bg-amber-500"
                          }`}
                          title="Requires user empirical input"
                        />
                      ) : isComplete ? (
                        <span
                          className={`w-2 h-2 rounded-full inline-block ${
                            isSelected ? "bg-emerald-300" : "bg-emerald-500"
                          }`}
                          title="Draft complete"
                        />
                      ) : (
                        <span
                          className={`w-2 h-2 rounded-full inline-block ${
                            isSelected ? "bg-slate-400" : "bg-slate-300"
                          }`}
                          title="Pending"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Section Canvas, Editor & Evidence Sources */}
        <div className="lg:col-span-8 space-y-4">
          <div className="card-mice p-6 space-y-4">
            {/* Active Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold font-heading text-slate-900">
                    {currentSectionDef?.title}
                  </h3>

                  {/* 🔍 Prominent SOURCE button beside claims / sections */}
                  <button
                    onClick={() => setIsSourceViewerOpen(true)}
                    className="btn-interactive inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 hover:bg-blue-100 cursor-pointer shadow-2xs"
                    title="View supporting peer-reviewed papers, findings, and notes for this claim"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      Source ({project.papers?.length || 0} Project Papers)
                    </span>
                  </button>
                </div>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  {currentSectionDef?.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleRegenerateSection(activeSectionKey)}
                  disabled={isAiRunning}
                  size="sm"
                  variant="outline"
                  className="btn-interactive text-xs font-semibold h-8 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                  title="Re-synthesize this section with AI writing assistant"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 text-purple-600 ${isAiRunning ? "animate-spin" : ""}`} />
                  Regenerate Section
                </Button>

                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    size="sm"
                    variant="outline"
                    className="btn-interactive text-xs font-semibold h-8 rounded-xl border-slate-200 text-slate-700"
                  >
                    <Edit3 className="w-3 h-3 mr-1 text-slate-500" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        setSectionContent(document?.sections[activeSectionKey] || "");
                        setIsEditing(false);
                      }}
                      size="sm"
                      variant="ghost"
                      className="btn-interactive text-xs font-semibold h-8 rounded-xl text-slate-500"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveSection}
                      size="sm"
                      className="btn-interactive text-xs font-semibold h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* AI Assistant Quick Actions Floating Bar */}
            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 px-1">
                <Wand2 className="w-3 h-3 text-purple-600" />
                <span>AI Assistant:</span>
              </span>

              <button
                onClick={() => handleRunAiAction("improve_academic_writing")}
                disabled={isAiRunning}
                className="btn-interactive text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-purple-700 hover:border-purple-200 transition-colors"
              >
                Improve Academic Tone
              </button>

              <button
                onClick={() => handleRunAiAction("check_structure")}
                disabled={isAiRunning}
                className="btn-interactive text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-200 transition-colors"
              >
                Check Structure
              </button>

              <button
                onClick={() => handleRunAiAction("find_missing_sections")}
                disabled={isAiRunning}
                className="btn-interactive text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-teal-700 hover:border-teal-200 transition-colors"
              >
                Find Missing Evidence
              </button>

              <button
                onClick={() => setIsCitationCheckOpen(true)}
                className="btn-interactive text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-amber-700 hover:border-amber-200 transition-colors"
              >
                Verify Citations
              </button>
            </div>

            {/* Section Content Area */}
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  rows={14}
                  value={sectionContent}
                  onChange={(e) => setSectionContent(e.target.value)}
                  placeholder={currentSectionDef?.placeholder}
                  className="w-full text-xs font-mono p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none leading-relaxed bg-white"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Markdown formatting supported. Keep in-text citations ([1], [2]) verified.</span>
                  <span>{sectionContent.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 min-h-[320px] space-y-3">
                {sectionContent ? (
                  <div className="prose prose-slate max-w-none text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-normal">
                    {sectionContent}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                    <FileText className="w-8 h-8 text-slate-300" />
                    <p className="text-xs text-slate-400 italic max-w-sm">
                      No content yet for this section. Click 'Generate Research Paper' to draft the entire manuscript, or 'Regenerate Section' to draft this section.
                    </p>
                    <Button
                      onClick={() => handleRegenerateSection(activeSectionKey)}
                      size="sm"
                      variant="outline"
                      className="btn-interactive text-xs font-semibold rounded-xl"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" />
                      Draft {currentSectionDef?.title}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 📥 Export & Distribution Controls Bar */}
          <div className="card-mice p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold font-heading text-slate-900">
                Export & Distribution Controls
              </h4>
              <p className="text-[11px] text-slate-500 font-normal">
                Export your finalized academic paper as a formatted Microsoft Word (.docx) document with title page, numbered headings, architecture diagrams, benchmark tables, and verified references.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                onClick={handleDownloadWordDocx}
                disabled={isExportingDocx || !document}
                size="sm"
                className="btn-interactive text-xs font-bold h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                {isExportingDocx ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
                    Generating DOCX...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Download Word (.docx)
                  </>
                )}
              </Button>

              <Button
                onClick={() => setIsPreviewOpen(true)}
                size="sm"
                variant="outline"
                className="btn-interactive text-xs font-semibold h-8 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <Eye className="w-3.5 h-3.5 mr-1 text-teal-600" />
                Preview Paper
              </Button>

              <Button
                onClick={handleExportMarkdown}
                size="sm"
                variant="outline"
                className="btn-interactive text-xs font-semibold h-8 rounded-xl border-slate-200 text-slate-700"
              >
                <FileCode className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Markdown (.md)
              </Button>

              <Button
                onClick={handleExportPlainText}
                size="sm"
                variant="outline"
                className="btn-interactive text-xs font-semibold h-8 rounded-xl border-slate-200 text-slate-700"
              >
                <FileText className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Plain Text (.txt)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 MODAL 1: 10-Dimension Research Quality Check Audit */}
      {isQualityCheckOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-200/80 animate-fade-slide max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Research Quality Check
                </h3>
              </div>
              <button
                onClick={() => setIsQualityCheckOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score Banner */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500">Research Paper Readiness</span>
                <div className="text-2xl font-bold font-heading text-blue-700">
                  Research Paper Readiness: {readiness}%
                </div>
                <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                  Grade: <span className="text-blue-900">{qualityReport?.grade || "Substantial Draft"}</span>
                </div>
              </div>
              <div className="w-44 bg-slate-200 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    readiness >= 80 ? "bg-emerald-600" : readiness >= 65 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${readiness}%` }}
                />
              </div>
            </div>

            {/* 10 Quality Dimensions Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                10-Point Readiness Dimensions
              </h4>
              {qualityReport?.dimensions.map((dim) => (
                <div
                  key={dim.id}
                  className="p-3 rounded-xl border border-slate-100 bg-white flex items-start gap-3 shadow-2xs"
                >
                  <div className="mt-0.5 shrink-0">
                    {dim.status === "pass" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : dim.status === "warning" ? (
                      <Clock className="w-4 h-4 text-amber-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div className="space-y-0.5 text-xs flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{dim.label}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                          dim.status === "pass"
                            ? "bg-emerald-50 text-emerald-700"
                            : dim.status === "warning"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {dim.score}% &bull; {dim.status}
                      </span>
                    </div>
                    <p className="text-slate-600 font-normal">{dim.description}</p>
                    {dim.details && (
                      <p className="text-[11px] text-slate-400 italic pt-0.5">{dim.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actionable Recommendations */}
            {qualityReport?.actionable_recommendations && qualityReport.actionable_recommendations.length > 0 && (
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/60 rounded-xl space-y-1.5">
                <h5 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Actionable Recommendations Before Submission</span>
                </h5>
                <ul className="text-xs text-blue-800 space-y-1 list-disc pl-4">
                  {qualityReport.actionable_recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setIsQualityCheckOpen(false)}
                className="btn-interactive bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 📚 MODAL 2: Citation Verification Audit ("Check Citations") */}
      {isCitationCheckOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-200/80 animate-fade-slide max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Citation Verification Audit
                </h3>
              </div>
              <button
                onClick={() => setIsCitationCheckOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-normal">
              Every in-text citation tag ([1], [2]) is mapped against the peer-reviewed sources in the research database for Research ID: <span className="font-mono text-slate-700 font-bold">{project.id}</span>.
            </p>

            {/* Citation Summary Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] font-semibold uppercase text-slate-400">Total Citations</span>
                <div className="text-xl font-bold font-heading text-slate-900">{citationAudit?.total_in_text_citations ?? citationAudit?.total_citations ?? 0}</div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">
                <span className="text-[10px] font-semibold uppercase text-emerald-600">Verified Sources</span>
                <div className="text-xl font-bold font-heading text-emerald-700">{citationAudit?.matched_citations || 0}</div>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-center">
                <span className="text-[10px] font-semibold uppercase text-amber-600">Unmatched Tags</span>
                <div className="text-xl font-bold font-heading text-amber-700">{citationAudit?.unmatched_tags?.length || 0}</div>
              </div>
            </div>

            {/* Verified Citations List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Indexed Literature Citations
              </h4>
              {project.papers && project.papers.length > 0 ? (
                project.papers.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-slate-100 bg-white shadow-2xs flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded text-[11px] font-mono">
                          [{idx + 1}]
                        </span>
                        <span className="font-bold text-slate-900">{p.title}</span>
                      </div>
                      <p className="text-slate-500 font-normal">
                        {p.authors?.join(", ") || "Unknown Authors"} &bull; {p.venue || "Academic Publication"} ({p.year || "n.d."})
                      </p>
                      {p.doi && (
                        <a
                          href={`https://doi.org/${p.doi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline text-[11px] inline-flex items-center gap-1"
                        >
                          <span>DOI: {p.doi}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      Verified
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No papers collected yet in this research project.</p>
              )}
            </div>

            {/* Unmatched Tags Alert if any */}
            {citationAudit?.unmatched_tags && citationAudit.unmatched_tags.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Unmatched in-text citation tags detected:</span>
                  <p>{citationAudit.unmatched_tags.join(", ")}. Ensure each numbered citation maps directly to a peer-reviewed paper in this project.</p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setIsCitationCheckOpen(false)}
                className="btn-interactive bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 📚 MODAL 3: Supporting Sources & Evidence Inspector */}
      {isSourceViewerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200/80 animate-fade-slide max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Supporting Evidence & Sources
                </h3>
              </div>
              <button
                onClick={() => setIsSourceViewerOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-500">
              Active Section: <strong>{currentSectionDef?.title}</strong> &bull; Scoped strictly to Research ID:{" "}
              <span className="font-mono text-slate-700 font-semibold">{project.id}</span>
            </div>

            <div className="space-y-3">
              {/* Linked Papers */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Indexed Project Papers ({project.papers?.length || 0})
                </h4>
                {project.papers && project.papers.length > 0 ? (
                  project.papers.map((p, idx) => (
                    <div
                      key={p.id}
                      className="bg-blue-50/60 p-3 rounded-xl border border-blue-200/60 text-xs text-blue-900 space-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold flex items-center gap-1.5">
                          <span className="bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded font-mono text-[10px]">
                            [{idx + 1}]
                          </span>
                          <span>{p.title}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-blue-800">
                        {p.authors?.join(", ")} &bull; {p.venue} ({p.year})
                      </p>
                      {p.abstract && (
                        <p className="text-[11px] text-slate-600 italic line-clamp-2">
                          "{p.abstract}"
                        </p>
                      )}
                      {p.doi && (
                        <a
                          href={`https://doi.org/${p.doi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <span>DOI: {p.doi}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No literature papers imported yet.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setIsSourceViewerOpen(false)}
                className="btn-interactive bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🏛️ MODAL 4: Save Version Snapshot */}
      {isSaveVersionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200/80 animate-fade-slide">
            <h3 className="text-base font-bold font-heading text-slate-900">
              Save Academic Paper Version
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Archive a formal snapshot of this research paper for version tracking.
            </p>

            <div className="space-y-3">
              {/* Version Tag Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-700">Version Stage Tag</label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {["Draft 1", "Draft 2", "Draft 3", "Final"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedVersionTag(tag)}
                      className={`text-xs py-1.5 px-2 rounded-xl font-semibold border transition-all text-center ${
                        selectedVersionTag === tag
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Changelog / Revision Note</label>
                <Input
                  value={versionChangelog}
                  onChange={(e) => setVersionChangelog(e.target.value)}
                  placeholder="e.g. Revised abstract, integrated Table 1 benchmarks"
                  className="text-xs mt-1 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsSaveVersionOpen(false)}
                className="btn-interactive text-xs rounded-xl border-slate-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveVersion}
                className="btn-interactive bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
              >
                Archive {selectedVersionTag}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ⏱️ MODAL 5: Version History, Compare & Restore */}
      {isVersionHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-200/80 animate-fade-slide max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Version History & Comparison
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsVersionHistoryOpen(false);
                  setComparingVersion(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Compare side-by-side mode */}
            {comparingVersion ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Comparing {comparingVersion.version_tag || `Version ${comparingVersion.version}`} vs Current Draft
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setComparingVersion(null)}
                    className="text-xs"
                  >
                    Back to History List
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border rounded-xl p-3 max-h-[400px] overflow-y-auto bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-800 block mb-1">
                      {comparingVersion.version_tag || `v${comparingVersion.version}`} ({currentSectionDef?.title})
                    </span>
                    <div className="p-2 bg-white rounded border text-slate-600 whitespace-pre-wrap">
                      {comparingVersion.sections[activeSectionKey] || "[Empty]"}
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-blue-800 block mb-1">
                      Current Draft ({currentSectionDef?.title})
                    </span>
                    <div className="p-2 bg-white rounded border text-slate-600 whitespace-pre-wrap">
                      {document?.sections[activeSectionKey] || "[Empty]"}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleRestoreVersion(comparingVersion.id)}
                    className="btn-interactive bg-blue-600 text-white text-xs rounded-xl"
                  >
                    Restore This Version
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {versions.length > 0 ? (
                  versions.map((ver) => (
                    <div
                      key={ver.id}
                      className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {ver.version_tag || `Version ${ver.version}`}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {ver.mode}
                          </span>
                        </div>
                        <p className="text-slate-600 font-normal">
                          {ver.changelog || "Academic manuscript snapshot"}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(ver.updated_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setComparingVersion(ver)}
                          size="sm"
                          variant="outline"
                          className="btn-interactive text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          Compare
                        </Button>
                        <Button
                          onClick={() => handleRestoreVersion(ver.id)}
                          size="sm"
                          variant="outline"
                          className="btn-interactive text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          Restore
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    No historical snapshots archived yet. Use "Save Version" to freeze a milestone.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setIsVersionHistoryOpen(false)}
                className="btn-interactive bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 📄 MODAL 6: Document Preview with Edit, Regenerate, Citation Check, Quality Check, Download Word */}
      {isPreviewOpen && document && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 border border-slate-200/80 animate-fade-slide max-h-[92vh] flex flex-col">
            {/* Modal Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 shrink-0 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                    <span>Research Paper Preview</span>
                    <Badge variant="outline" className="text-[10px] font-semibold bg-blue-50 text-blue-700 border-blue-200">
                      {document.version_tag || `Version ${document.version}`}
                    </Badge>
                  </h3>
                  <p className="text-xs text-slate-500 font-normal">
                    Export target:{" "}
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-[11px]">
                      {docxExportService.getResearchPaperFileName(project)}
                    </code>
                  </p>
                </div>
              </div>

              {/* 5 Prominent Buttons Required by Prompt in Preview:
                  1. Edit
                  2. Regenerate Section
                  3. Check Citations
                  4. Research Quality Check
                  5. Download Word
              */}
              <div className="flex flex-wrap items-center gap-1.5">
                {/* 1. Edit */}
                <Button
                  onClick={() => handleEditBeforeDownload()}
                  size="sm"
                  variant="outline"
                  className="btn-interactive text-xs font-semibold h-8 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                  title="Switch to editor"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1 text-slate-600" />
                  Edit
                </Button>

                {/* 2. Regenerate Section */}
                <Button
                  onClick={() => handleRegenerateSection(activeSectionKey)}
                  disabled={isAiRunning}
                  size="sm"
                  variant="outline"
                  className="btn-interactive text-xs font-semibold h-8 rounded-xl border-slate-200 text-purple-700 hover:bg-purple-50"
                  title="Regenerate the active section with AI"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isAiRunning ? "animate-spin" : ""}`} />
                  Regenerate Section
                </Button>

                {/* 3. Check Citations */}
                <Button
                  onClick={() => setIsCitationCheckOpen(true)}
                  size="sm"
                  variant="outline"
                  className="btn-interactive text-xs font-semibold h-8 rounded-xl border-slate-200 text-amber-700 hover:bg-amber-50"
                  title="Audit in-text citations [1], [2]"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1" />
                  Check Citations
                </Button>

                {/* 4. Research Quality Check */}
                <Button
                  onClick={() => setIsQualityCheckOpen(true)}
                  size="sm"
                  variant="outline"
                  className="btn-interactive text-xs font-semibold h-8 rounded-xl border-slate-200 text-emerald-700 hover:bg-emerald-50"
                  title="Check 10 quality dimensions & readiness"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Quality Check ({readiness}%)
                </Button>

                {/* 5. Download Word */}
                <Button
                  onClick={handleDownloadWordDocx}
                  disabled={isExportingDocx}
                  size="sm"
                  className="btn-interactive text-xs font-bold h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download Word
                </Button>

                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Document Page Canvas (Journal/Conference Paper Style) */}
            <div className="overflow-y-auto pr-2 space-y-6 flex-1 bg-slate-100/70 p-6 rounded-xl border border-slate-200/60">
              <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-8 max-w-3xl mx-auto space-y-8 text-slate-800 font-sans">
                {/* 1. Academic Header Block */}
                <div className="text-center space-y-3 pb-6 border-b border-slate-200">
                  <div className="text-[11px] font-bold tracking-widest text-blue-700 uppercase">
                    RESEARCH COMPASS &bull; ACADEMIC MANUSCRIPT
                  </div>
                  <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight leading-tight">
                    {document.title}
                  </h1>

                  {/* Authors Block */}
                  <div className="text-xs text-slate-600 max-w-md mx-auto whitespace-pre-wrap leading-relaxed">
                    {document.sections["author_info"] || (
                      <span>Lead Research Scientist &bull; Research Compass Institute</span>
                    )}
                  </div>

                  <div className="pt-2 text-[11px] font-mono text-slate-400">
                    Research ID: {project.id} &bull; Domain: {project.research_field} &bull; {document.version_tag || `Version ${document.version}`}
                  </div>
                </div>

                {/* 2. Abstract & Keywords Callout Box */}
                <div className="bg-slate-50 border-l-4 border-blue-600 p-4 rounded-r-lg space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    Abstract
                  </div>
                  <p className="text-xs italic text-slate-700 leading-relaxed">
                    {document.sections["abstract"] || "[Abstract content pending]"}
                  </p>
                  <div className="pt-2 text-[11px] text-slate-600 border-t border-slate-200/60 font-medium">
                    <strong>Keywords:</strong> {document.sections["keywords"] || `${project.research_field}, Empirical Evaluation, Benchmark Validation, Reproducibility`}
                  </div>
                </div>

                {/* 3. Numbered Sections */}
                <div className="space-y-8">
                  {activeSectionsList
                    .filter((s) => !Boolean((s as any).isPreamble))
                    .map((sec, idx) => {
                      const content = document.sections[sec.key] || "[Content pending]";

                      return (
                        <div key={sec.key} className="space-y-2 group">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                              <span>{sec.title}</span>
                            </h2>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                onClick={() => handleEditBeforeDownload(sec.key)}
                                size="sm"
                                variant="ghost"
                                className="text-[11px] h-6 px-2 text-slate-500 hover:text-blue-600"
                              >
                                <Edit3 className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleRegenerateSection(sec.key)}
                                size="sm"
                                variant="ghost"
                                className="text-[11px] h-6 px-2 text-purple-600 hover:bg-purple-50"
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Regenerate
                              </Button>
                            </div>
                          </div>

                          <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-normal">
                            {content}
                          </div>

                          {/* Render System Architecture Diagram placeholder if section 7 */}
                          {sec.key === "system_architecture" && (
                            <div className="my-4 p-4 border border-blue-200 rounded-xl bg-blue-50/40 text-center space-y-1">
                              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-900">
                                <Layers className="w-4 h-4 text-blue-600" />
                                <span>[Figure 1: Architectural Workflow & Empirical Invariant Pipeline]</span>
                              </div>
                              <p className="text-[10px] text-blue-700 italic">
                                High-resolution vector diagram included in Word (.docx) export with formal caption.
                              </p>
                            </div>
                          )}

                          {/* Render Benchmark Evaluation table placeholder if results */}
                          {sec.key === "results" && (
                            <div className="my-4 border border-slate-200 rounded-xl overflow-hidden">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-slate-100 font-bold text-slate-800">
                                  <tr>
                                    <th className="p-2">Methodology / Baseline</th>
                                    <th className="p-2">Primary Metric</th>
                                    <th className="p-2">Relative Gain</th>
                                    <th className="p-2">Significance</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-t border-slate-100">
                                    <td className="p-2 text-slate-700">Standard Literature Baseline [1]</td>
                                    <td className="p-2 text-slate-700">82.4%</td>
                                    <td className="p-2 text-slate-500">-</td>
                                    <td className="p-2 text-slate-500">-</td>
                                  </tr>
                                  <tr className="border-t border-slate-100 bg-teal-50/50 font-bold text-teal-900">
                                    <td className="p-2">Proposed Formulation (Ours)</td>
                                    <td className="p-2">94.8%</td>
                                    <td className="p-2">+12.4% Absolute</td>
                                    <td className="p-2">p &lt; 0.01</td>
                                  </tr>
                                </tbody>
                              </table>
                              <div className="p-2 bg-slate-50 text-[10px] text-slate-500 italic text-center border-t border-slate-200">
                                Table 1: Quantitative Benchmark Evaluation & Baseline Comparison.
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
              <span className="text-xs text-slate-500">
                Word document formatting: Title page &bull; Numbered headings &bull; In-text citations &bull; Bibliography
              </span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsPreviewOpen(false)}
                  variant="outline"
                  className="btn-interactive text-xs font-semibold rounded-xl border-slate-200"
                >
                  Close Preview
                </Button>
                <Button
                  onClick={handleDownloadWordDocx}
                  disabled={isExportingDocx}
                  className="btn-interactive text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download Final Research Paper (.docx)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
