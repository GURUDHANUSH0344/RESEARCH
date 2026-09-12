import React, { useState, useEffect } from "react";
import {
  type ResearchProject,
  type FinalResearchDocument,
  type FinalOutputType,
  type PaperDocumentType,
  type ResearchCompletenessCheck,
  type SectionSourceLink,
} from "@/types/research";
import { workspaceService } from "@/lib/services/workspace-service";
import {
  finalOutputGenerator,
  PAPER_SECTIONS,
  PATENT_SECTIONS,
} from "@/lib/services/final-output-generator";
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
} from "lucide-react";
import { toast } from "sonner";

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

  // Modals & Panels
  const [isCompletenessOpen, setIsCompletenessOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isSourceViewerOpen, setIsSourceViewerOpen] = useState(false);
  const [isSaveVersionOpen, setIsSaveVersionOpen] = useState(false);
  const [versionChangelog, setVersionChangelog] = useState("");
  const [versions, setVersions] = useState<FinalResearchDocument[]>([]);
  const [completeness, setCompleteness] = useState<ResearchCompletenessCheck | null>(null);

  // Load or generate initial document
  const loadDocument = async (targetMode: FinalOutputType = mode) => {
    setLoading(true);
    try {
      let doc = await workspaceService.getLatestFinalDocument(project.id, targetMode);
      if (!doc) {
        doc = await finalOutputGenerator.generateDocument(project, targetMode, docType);
        await workspaceService.saveFinalDocument(project.id, doc);
      }
      setDocument(doc);
      const defaultSec = targetMode === "paper" ? "abstract" : "invention_title";
      setActiveSectionKey(defaultSec);
      setSectionContent(doc.sections[defaultSec] || "");

      // Load audit
      const audit = await workspaceService.calculateCompleteness(project.id, doc);
      setCompleteness(audit);

      // Load versions
      const vers = await workspaceService.getDocumentVersions(project.id, doc.id);
      setVersions(vers);
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
    // Auto-save active if editing
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

      // Re-run completeness
      const audit = await workspaceService.calculateCompleteness(project.id, saved);
      setCompleteness(audit);

      toast.success("Section updated & saved");
    } catch {
      toast.error("Failed to save section");
    }
  };

  // Run AI Writing Action
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

  // Regenerate Entire Document
  const handleRegenerateEntireDocument = async () => {
    if (!confirm("Regenerate entire document draft from current research corpus? Unsaved manual edits will be overwritten.")) {
      return;
    }
    setLoading(true);
    try {
      const newDoc = await finalOutputGenerator.generateDocument(project, mode, docType);
      await workspaceService.saveFinalDocument(project.id, newDoc);
      setDocument(newDoc);
      setSectionContent(newDoc.sections[activeSectionKey] || "");
      const audit = await workspaceService.calculateCompleteness(project.id, newDoc);
      setCompleteness(audit);
      toast.success("Regenerated evidence-linked draft from active research corpus");
    } finally {
      setLoading(false);
    }
  };

  // Version History: Save New Version
  const handleSaveVersion = async () => {
    if (!document) return;
    try {
      const saved = await workspaceService.createDocumentVersion(
        project.id,
        document,
        versionChangelog.trim() || `Milestone Version`
      );
      setDocument(saved);
      setIsSaveVersionOpen(false);
      setVersionChangelog("");
      const vers = await workspaceService.getDocumentVersions(project.id, saved.id);
      setVersions(vers);
      toast.success(`Archived as Version ${saved.version}`);
    } catch {
      toast.error("Failed to archive version");
    }
  };

  // Version History: Restore Version
  const handleRestoreVersion = async (versionId: string) => {
    try {
      const restored = await workspaceService.restoreDocumentVersion(project.id, versionId);
      setDocument(restored);
      setSectionContent(restored.sections[activeSectionKey] || "");
      setIsVersionHistoryOpen(false);
      toast.success(`Restored active draft from Version ${restored.version}`);
    } catch {
      toast.error("Failed to restore version");
    }
  };

  // Exports
  const compileFullMarkdown = (): string => {
    if (!document) return "";
    const sectionsDef = mode === "paper" ? PAPER_SECTIONS : PATENT_SECTIONS;
    const header = `# ${document.title}\n\n**Research ID:** \`${project.id}\`  \n**Field:** ${project.research_field}  \n**Document Type:** ${document.document_type.replace("_", " ").toUpperCase()}  \n**Version:** ${document.version}  \n**Date:** ${new Date().toLocaleDateString()}  \n**Completeness:** ${document.completeness_score}%\n\n---\n\n`;

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
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.title.slice(0, 30).replace(/[^a-z0-9]/gi, "_")}_${mode}_v${document?.version || 1}.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Exported Markdown (.md) document");
  };

  const handleExportPlainText = () => {
    const text = compileFullMarkdown();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.title.slice(0, 30).replace(/[^a-z0-9]/gi, "_")}_${mode}_v${document?.version || 1}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Exported Plain Text (.txt) document");
  };

  const handleExportDocx = () => {
    const text = compileFullMarkdown();
    // HTML wrapper recognized by Microsoft Word
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${document?.title}</title><meta charset='utf-8'></head>
      <body style="font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.5;">
        <h1 style="color: #1E3A8A;">${document?.title}</h1>
        <p><strong>Research ID:</strong> ${project.id} | <strong>Field:</strong> ${project.research_field}</p>
        <hr/>
        ${text.replace(/\n/g, "<br/>").replace(/## (.*?)(<br\/>)/g, "<h2 style='color:#0F766E;'>$1</h2>")}
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.title.slice(0, 30).replace(/[^a-z0-9]/gi, "_")}_${mode}_v${document?.version || 1}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Exported DOCX format document");
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleCopyFullText = () => {
    const text = compileFullMarkdown();
    navigator.clipboard.writeText(text);
    toast.success("Entire document copied to clipboard!");
  };

  const activeSectionsList = mode === "paper" ? PAPER_SECTIONS : PATENT_SECTIONS;
  const currentSectionDef = activeSectionsList.find((s) => s.key === activeSectionKey);
  const activeSources = document?.sources?.[activeSectionKey];

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* 🧭 Top Stage Card: Your Research is Ready & Mode Bar */}
      <div className="card-mice p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                Final Output Ready
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Research ID: {project.id}
              </span>
              <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 bg-slate-50 text-slate-700 border-slate-200">
                Version {document?.version || 1}
              </Badge>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-heading text-slate-900 tracking-tight">
              Final Research Output & Manuscript Workspace
            </h2>
            <p className="text-xs text-slate-500 font-normal max-w-2xl leading-relaxed">
              Compile your completed research into a structured, evidence-grounded academic paper or patent-oriented draft. All citations and empirical claims link back strictly to this research project.
            </p>
          </div>

          {/* Quick Triggers */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setIsCompletenessOpen(true)}
              size="sm"
              variant="outline"
              className="btn-interactive text-xs font-semibold h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <FileCheck2 className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
              Completeness: {completeness?.overall_percentage || 85}%
            </Button>

            <Button
              onClick={() => setIsSaveVersionOpen(true)}
              size="sm"
              variant="outline"
              className="btn-interactive text-xs font-semibold h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Save className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Save Version
            </Button>

            <Button
              onClick={() => setIsVersionHistoryOpen(true)}
              size="sm"
              variant="outline"
              className="btn-interactive text-xs font-semibold h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <History className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
              History ({versions.length})
            </Button>

            <Button
              onClick={handleRegenerateEntireDocument}
              size="sm"
              variant="outline"
              className="btn-interactive text-xs font-semibold h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
              title="Re-synthesize all sections from current corpus"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Sync Corpus
            </Button>
          </div>
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
                <span>Research Paper Mode</span>
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
                <span>Patent-Oriented Draft</span>
              </button>
            </div>
          </div>

          {/* Sub-type selection (Paper Mode only) */}
          {mode === "paper" ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Template / Style:</span>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as PaperDocumentType)}
                className="text-xs p-1.5 border border-slate-200 rounded-xl bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="research_paper">Research Paper (Standard)</option>
                <option value="conference_paper">Conference Paper (Concise)</option>
                <option value="journal_draft">Journal Manuscript (Comprehensive)</option>
                <option value="project_report">Technical Project Report</option>
              </select>
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
              <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-slate-700">
                Document Sections ({activeSectionsList.length})
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">
                {document?.mode.toUpperCase()}
              </span>
            </div>

            <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
              {activeSectionsList.map((sec, idx) => {
                const isSelected = activeSectionKey === sec.key;
                const content = document?.sections[sec.key] || "";
                const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
                const hasEvidenceReq = content.includes("[Additional empirical evidence required");
                const sourceCount = document?.sources[sec.key]?.paper_ids?.length || 0;

                return (
                  <button
                    key={sec.key}
                    onClick={() => handleSelectSection(sec.key)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-150 flex items-start justify-between gap-2 border ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/60"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
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
                      {hasEvidenceReq ? (
                        <span
                          className={`w-2 h-2 rounded-full inline-block ${
                            isSelected ? "bg-amber-300" : "bg-amber-500"
                          }`}
                          title="Needs additional empirical evidence"
                        />
                      ) : (
                        <span
                          className={`w-2 h-2 rounded-full inline-block ${
                            isSelected ? "bg-emerald-300" : "bg-emerald-500"
                          }`}
                          title="Complete"
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
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold font-heading text-slate-900">
                    {currentSectionDef?.title}
                  </h3>
                  {activeSources && (
                    <button
                      onClick={() => setIsSourceViewerOpen(true)}
                      className="btn-interactive inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 hover:bg-blue-100"
                      title="View supporting papers and notes for this claim"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>
                        View Sources ({activeSources.paper_ids.length + activeSources.finding_ids.length + activeSources.note_ids.length})
                      </span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  {currentSectionDef?.description}
                </p>
              </div>

              {/* Edit / View Toggles */}
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    size="sm"
                    variant="outline"
                    className="btn-interactive text-xs font-semibold h-8 rounded-xl border-slate-200 text-slate-700"
                  >
                    <Edit3 className="w-3 h-3 mr-1 text-slate-500" />
                    Edit Section
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
                      Save Section
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
                Improve Academic Writing
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
                Find Missing Elements
              </button>

              <button
                onClick={() => handleRunAiAction("suggest_references")}
                disabled={isAiRunning}
                className="btn-interactive text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-amber-700 hover:border-amber-200 transition-colors"
              >
                Suggest References
              </button>

              {activeSectionKey === "abstract" && (
                <button
                  onClick={() => handleRunAiAction("generate_abstract")}
                  disabled={isAiRunning}
                  className="btn-interactive text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  Generate Abstract
                </button>
              )}
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
                  <span>Markdown formatting supported. Keep citations verifiable.</span>
                  <span>{sectionContent.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 min-h-[300px]">
                <div className="prose prose-slate max-w-none text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-normal">
                  {sectionContent || (
                    <span className="text-slate-400 italic">
                      No content yet for this section. Click 'Edit Section' or use the AI Assistant to draft.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 📥 Export & Distribution Bar */}
          <div className="card-mice p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold font-heading text-slate-900">
                Export & Distribution
              </h4>
              <p className="text-[11px] text-slate-500 font-normal">
                Export your finalized {mode === "patent" ? "patent draft" : "academic manuscript"} in standard scientific formats.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handleCopyFullText}
                size="sm"
                variant="outline"
                className="btn-interactive text-xs font-semibold h-8 rounded-xl border-slate-200 text-slate-700"
              >
                <Copy className="w-3.5 h-3.5 mr-1" />
                Copy Full Text
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
                onClick={handleExportDocx}
                size="sm"
                variant="outline"
                className="btn-interactive text-xs font-semibold h-8 rounded-xl border-slate-200 text-slate-700"
              >
                <FileText className="w-3.5 h-3.5 mr-1 text-blue-600" />
                Word (.doc)
              </Button>

              <Button
                onClick={handleExportPdf}
                size="sm"
                className="btn-interactive bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-8 rounded-xl shadow-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Print / PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 Modal 1: Research Completeness Check & Audit */}
      {isCompletenessOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-200/80 animate-fade-slide max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Research Completeness Check
                </h3>
              </div>
              <button
                onClick={() => setIsCompletenessOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score Banner */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500">Overall Audit Score</span>
                <div className="text-2xl font-bold font-heading text-teal-700">
                  {completeness?.overall_percentage || 85}%
                </div>
              </div>
              <div className="w-48 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completeness?.overall_percentage || 85}%` }}
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2.5">
              {completeness?.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-white flex items-start gap-3"
                >
                  <div className="mt-0.5 shrink-0">
                    {item.status === "complete" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : item.status === "in_progress" ? (
                      <Clock className="w-4 h-4 text-amber-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.label}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded uppercase ${
                          item.status === "complete"
                            ? "bg-emerald-50 text-emerald-700"
                            : item.status === "in_progress"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-slate-600 font-normal">{item.description}</p>
                    {item.recommendation && (
                      <p className="text-teal-700 font-medium text-[11px] pt-0.5">
                        &bull; {item.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setIsCompletenessOpen(false)}
                className="btn-interactive bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
              >
                Close Audit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 📚 Modal 2: View Sources & Evidence Protection */}
      {isSourceViewerOpen && activeSources && (
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
              Section: <strong>{activeSources.section_title}</strong> &bull; Scoped strictly to Research ID:{" "}
              <span className="font-mono text-slate-700">{project.id}</span>
            </div>

            <div className="space-y-3">
              {/* Linked Papers */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Cited Papers ({activeSources.paper_titles.length})
                </h4>
                {activeSources.paper_titles.length > 0 ? (
                  activeSources.paper_titles.map((pt, i) => (
                    <div
                      key={i}
                      className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-200/60 text-xs text-blue-900 flex items-start gap-2"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No specific literature cited directly in this section.</p>
                )}
              </div>

              {/* Linked Findings */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Empirical Findings & Gaps ({activeSources.finding_titles.length})
                </h4>
                {activeSources.finding_titles.length > 0 ? (
                  activeSources.finding_titles.map((ft, i) => (
                    <div
                      key={i}
                      className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                      <span>{ft}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No empirical findings linked.</p>
                )}
              </div>

              {/* Linked Notes */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Research Notes ({activeSources.note_titles.length})
                </h4>
                {activeSources.note_titles.length > 0 ? (
                  activeSources.note_titles.map((nt, i) => (
                    <div
                      key={i}
                      className="bg-teal-50/60 p-2.5 rounded-xl border border-teal-200/60 text-xs text-teal-900 flex items-start gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
                      <span>{nt}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No procedural notes linked.</p>
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

      {/* 🏛️ Modal 3: Save Version Snapshot */}
      {isSaveVersionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200/80 animate-fade-slide">
            <h3 className="text-base font-bold font-heading text-slate-900">
              Save Document Version
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Archive a formal snapshot of this {mode === "patent" ? "patent draft" : "academic manuscript"}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Changelog / Milestone Summary</label>
                <Input
                  value={versionChangelog}
                  onChange={(e) => setVersionChangelog(e.target.value)}
                  placeholder="e.g. Revised abstract, finalized claims 1-5"
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
                Archive Snapshot
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ⏱️ Modal 4: Version History & Restore */}
      {isVersionHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200/80 animate-fade-slide max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Version History
                </h3>
              </div>
              <button
                onClick={() => setIsVersionHistoryOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

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
                          Version {ver.version}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          {ver.mode}
                        </span>
                      </div>
                      <p className="text-slate-600 font-normal">
                        {ver.changelog || "Standard milestone save"}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(ver.updated_at).toLocaleString()}
                      </span>
                    </div>

                    <Button
                      onClick={() => handleRestoreVersion(ver.id)}
                      size="sm"
                      variant="outline"
                      className="btn-interactive text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      Restore
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-6">
                  No historical snapshots archived yet. Use "Save Version" to freeze a milestone.
                </p>
              )}
            </div>

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
    </div>
  );
}
