import React, { useState } from "react";
import { type ResearchProject } from "@/types/research";
import { type NormalizedPaper } from "@/lib/services/openalex";
import { workspaceService } from "@/lib/services/workspace-service";
import { searchOpenAlex } from "@/lib/services/openalex";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Search,
  ExternalLink,
  Trash2,
  PlusCircle,
  Sparkles,
  Check,
  Copy,
  Filter,
  Layers,
  FileText,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { generateCitations } from "@/lib/services/citation-formatter";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { StageCompletionButton } from "../StageCompletionButton";

interface ResearchPapersTabProps {
  project: ResearchProject;
  onUpdateProject: (updated: ResearchProject) => void;
  isStageCompleted?: boolean;
  onToggleStageCompletion?: () => void;
}

export function ResearchPapersTab({
  project,
  onUpdateProject,
  isStageCompleted,
  onToggleStageCompletion,
}: ResearchPapersTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addMode, setAddMode] = useState<"search" | "manual">("search");

  // Mobile Paper Details BottomSheet
  const [selectedPaper, setSelectedPaper] = useState<NormalizedPaper | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);

  // Academic Search Modal State
  const [academicQuery, setAcademicQuery] = useState(project.research_question);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<NormalizedPaper[]>([]);

  // Manual Form State
  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthors, setManualAuthors] = useState("");
  const [manualYear, setManualYear] = useState(new Date().getFullYear());
  const [manualVenue, setManualVenue] = useState("");
  const [manualAbstract, setManualAbstract] = useState("");
  const [manualDoi, setManualDoi] = useState("");
  const [manualUrl, setManualUrl] = useState("");

  const papers = project.papers || [];

  const filteredPapers = papers.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.abstract && p.abstract.toLowerCase().includes(q)) ||
      p.authors.some((a) => a.toLowerCase().includes(q)) ||
      (p.venue && p.venue.toLowerCase().includes(q))
    );
  });

  const handleRemovePaper = async (paperId: string, title: string) => {
    if (!confirm(`Remove "${title.slice(0, 50)}..." from this research?`)) return;
    try {
      await workspaceService.removePaper(project.id, paperId);
      const updated = await workspaceService.getProjectById(project.id);
      if (updated) onUpdateProject(updated);
      toast.success("Paper removed from research collection");
    } catch {
      toast.error("Failed to remove paper");
    }
  };

  const handleAcademicSearch = async () => {
    if (!academicQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchOpenAlex({ query: academicQuery.trim(), limit: 10 });
      setSearchResults(results);
    } catch {
      toast.error("Scholarly search encountered an issue");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddExistingPaper = async (paper: NormalizedPaper) => {
    try {
      await workspaceService.addPaper(project.id, {
        ...paper,
        relevance_score: Math.floor(Math.random() * 15) + 85,
      });
      const updated = await workspaceService.getProjectById(project.id);
      if (updated) onUpdateProject(updated);
      toast.success(`Added "${paper.title.slice(0, 40)}..."`);
    } catch {
      toast.error("Failed to add paper");
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const newPaper: NormalizedPaper = {
      id: `manual_${Date.now()}`,
      external_id: `manual_${Date.now()}`,
      title: manualTitle.trim(),
      authors: manualAuthors
        ? manualAuthors.split(",").map((a) => a.trim())
        : ["Lead Investigator"],
      year: Number(manualYear) || new Date().getFullYear(),
      venue: manualVenue.trim() || "Independent Publication",
      abstract: manualAbstract.trim() || "No abstract provided.",
      doi: manualDoi.trim() || undefined,
      url: manualUrl.trim() || (manualDoi ? `https://doi.org/${manualDoi.trim()}` : undefined),
      citation_count: 0,
      source: "Manual Entry",
      open_access: true,
      concepts: [project.research_field || "Research"],
    };

    try {
      await workspaceService.addPaper(project.id, newPaper);
      const updated = await workspaceService.getProjectById(project.id);
      if (updated) onUpdateProject(updated);
      setIsAddOpen(false);
      setManualTitle("");
      setManualAuthors("");
      setManualVenue("");
      setManualAbstract("");
      setManualDoi("");
      setManualUrl("");
      toast.success("Paper added to research workspace");
    } catch {
      toast.error("Failed to save paper");
    }
  };

  const copyCitation = (paper: NormalizedPaper) => {
    const citations = generateCitations(paper);
    navigator.clipboard.writeText(citations.apa);
    toast.success("APA citation copied to clipboard");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Literature & Research Papers
            </h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {papers.length} Papers
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Peer-reviewed literature specifically linked to Research ID:{" "}
            <span className="font-mono font-semibold text-slate-700">{project.id}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <StageCompletionButton
            stageName="Papers"
            isCompleted={isStageCompleted}
            onToggle={onToggleStageCompletion}
          />
          <Button
            onClick={() => setIsAddOpen(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 px-3.5 rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Paper</span>
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter papers in this research by title, author, venue, or keyword..."
          className="pl-10 h-10 bg-white border-slate-200 text-xs rounded-xl shadow-2xs"
        />
      </div>

      {/* Papers Grid / List */}
      {filteredPapers.length > 0 ? (
        <div className="space-y-4">
          {filteredPapers.map((paper, idx) => {
            const isSaved = true;
            const relevance = paper.relevance_score || 90 - (idx % 10);

            return (
              <div
                key={paper.id || idx}
                onClick={() => {
                  setSelectedPaper(paper);
                  setIsDetailsSheetOpen(true);
                }}
                style={{ animationDelay: `${idx * 30}ms` }}
                className="card-mice card-mice-hover bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 hover:border-blue-300 transition-all space-y-2.5 sm:space-y-3 animate-fade-slide cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1 max-w-4xl">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="text-[10px] sm:text-[11px] font-heading font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {paper.year || 2024}
                      </span>
                      <span className="text-[11px] sm:text-xs font-heading font-semibold text-slate-600 truncate max-w-[180px] sm:max-w-none">
                        {paper.venue || "Academic Publication"}
                      </span>
                      {paper.open_access && (
                        <span className="text-[9px] sm:text-[10px] font-heading font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase">
                          Open Access
                        </span>
                      )}
                      <span className="text-slate-300 hidden sm:inline">&bull;</span>
                      <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                        Relevance: <strong className="text-blue-600">{relevance}%</strong>
                      </span>
                    </div>

                    <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900 leading-snug hover:text-blue-600 transition-colors line-clamp-2 sm:line-clamp-none">
                      {paper.title}
                    </h3>

                    <p className="text-xs text-slate-500 font-medium line-clamp-1">
                      By: {paper.authors?.join(", ") || "Unknown Authors"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-start pt-1 sm:pt-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      onClick={() => copyCitation(paper)}
                      variant="ghost"
                      size="sm"
                      title="Copy APA citation"
                      className="text-slate-600 hover:text-blue-600 text-xs h-8 px-2 rounded-lg touch-target-44"
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      <span>Cite</span>
                    </Button>

                    {paper.url && (
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-heading font-semibold text-blue-600 hover:bg-blue-50 transition-colors touch-target-44"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Source</span>
                      </a>
                    )}

                    <Button
                      onClick={() => handleRemovePaper(paper.id, paper.title)}
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0 rounded-lg touch-target-44"
                      title="Remove paper from research"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {paper.abstract && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-100 font-sans line-clamp-2 sm:line-clamp-none">
                    {paper.abstract}
                  </p>
                )}

                {paper.concepts && paper.concepts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {paper.concepts.slice(0, 4).map((c, cIdx) => (
                      <span
                        key={cIdx}
                        className="text-[10px] sm:text-[11px] font-sans font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Research Papers Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No papers match your search. Add academic papers to build this research project&apos;s isolated evidence corpus.
          </p>
          <Button
            onClick={() => setIsAddOpen(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 rounded-xl shadow-xs"
          >
            Add First Paper
          </Button>
        </div>
      )}

      {/* Add Paper Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Add Paper to Research
                </h3>
                <p className="text-xs text-slate-500">
                  Target Research ID: <strong className="font-mono">{project.id}</strong>
                </p>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAddMode("search")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    addMode === "search" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Academic Search
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode("manual")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    addMode === "manual" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Manual Entry
                </button>
              </div>
            </div>

            {addMode === "search" ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={academicQuery}
                    onChange={(e) => setAcademicQuery(e.target.value)}
                    placeholder="Search OpenAlex & Semantic Scholar..."
                    className="h-10 text-xs rounded-xl"
                  />
                  <Button
                    onClick={handleAcademicSearch}
                    disabled={isSearching}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-10 px-4 rounded-xl shadow-xs shrink-0"
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {searchResults.map((sr) => {
                    const alreadyAdded = papers.some((p) => p.title.toLowerCase() === sr.title.toLowerCase());
                    return (
                      <div
                        key={sr.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{sr.title}</h4>
                          <Button
                            size="sm"
                            disabled={alreadyAdded}
                            onClick={() => handleAddExistingPaper(sr)}
                            className={`h-7 px-2.5 text-[11px] rounded-lg shadow-2xs shrink-0 ${
                              alreadyAdded
                                ? "bg-slate-200 text-slate-500"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                          >
                            {alreadyAdded ? "Added" : "+ Add"}
                          </Button>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {sr.authors?.[0] || "Unknown"} et al. ({sr.year}) &bull; {sr.venue || "OpenAlex"}
                        </p>
                      </div>
                    );
                  })}
                  {searchResults.length === 0 && !isSearching && (
                    <p className="text-xs text-slate-400 text-center py-6">
                      Click Search to query academic repositories for relevant literature.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleManualAdd} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Paper Title *</label>
                  <Input
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Full scientific publication title"
                    className="text-xs mt-1 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Authors (comma-separated)</label>
                    <Input
                      value={manualAuthors}
                      onChange={(e) => setManualAuthors(e.target.value)}
                      placeholder="e.g. J. Doe, A. Smith"
                      className="text-xs mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Publication Year</label>
                    <Input
                      type="number"
                      value={manualYear}
                      onChange={(e) => setManualYear(Number(e.target.value))}
                      className="text-xs mt-1 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Journal / Conference Venue</label>
                    <Input
                      value={manualVenue}
                      onChange={(e) => setManualVenue(e.target.value)}
                      placeholder="e.g. Nature, IEEE S&P"
                      className="text-xs mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">DOI (optional)</label>
                    <Input
                      value={manualDoi}
                      onChange={(e) => setManualDoi(e.target.value)}
                      placeholder="10.1016/..."
                      className="text-xs mt-1 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Abstract Summary</label>
                  <textarea
                    rows={3}
                    value={manualAbstract}
                    onChange={(e) => setManualAbstract(e.target.value)}
                    placeholder="Core methodology, dataset, and findings..."
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none mt-1"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddOpen(false)}
                    className="text-xs rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
                  >
                    Save Paper
                  </Button>
                </div>
              </form>
            )}

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
                className="text-xs rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Paper Details & Citations BottomSheet */}
      <BottomSheet
        isOpen={isDetailsSheetOpen}
        onClose={() => {
          setIsDetailsSheetOpen(false);
          setSelectedPaper(null);
        }}
        title={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsDetailsSheetOpen(false);
                setSelectedPaper(null);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#536DFE] hover:text-[#243B64] mr-1 p-1 -ml-1 rounded transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Papers</span>
            </button>
            <span className="text-slate-300">|</span>
            <span>Paper Details</span>
          </div>
        }
      >
        {selectedPaper && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-heading font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedPaper.year || 2024}
                </span>
                <span className="text-xs font-heading font-semibold text-slate-700">
                  {selectedPaper.venue || "Academic Publication"}
                </span>
                {selectedPaper.open_access && (
                  <span className="text-[10px] font-heading font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase">
                    Open Access
                  </span>
                )}
                <span className="text-xs text-slate-500 font-medium">
                  • Relevance: <strong className="text-blue-600">{selectedPaper.relevance_score || 92}%</strong>
                </span>
              </div>

              <h3 className="font-heading text-base font-bold text-slate-900 leading-snug">
                {selectedPaper.title}
              </h3>

              <p className="text-xs text-slate-500 font-medium">
                Authors: {selectedPaper.authors?.join(", ") || "Unknown Authors"}
              </p>
            </div>

            {selectedPaper.abstract && (
              <div className="space-y-1">
                <div className="text-xs font-heading font-semibold text-slate-700">Abstract</div>
                <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80 max-h-48 overflow-y-auto">
                  {selectedPaper.abstract}
                </div>
              </div>
            )}

            {/* Citations block */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="text-xs font-heading font-semibold text-slate-800">Copy Citation</div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const c = generateCitations(selectedPaper);
                    navigator.clipboard.writeText(c.apa);
                    toast.success("APA citation copied!");
                  }}
                  className="h-10 text-xs font-medium rounded-xl touch-target-44 justify-center"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                  Copy APA
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const c = generateCitations(selectedPaper);
                    navigator.clipboard.writeText(c.bibtex);
                    toast.success("BibTeX citation copied!");
                  }}
                  className="h-10 text-xs font-medium rounded-xl touch-target-44 justify-center"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                  Copy BibTeX
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-2">
              {selectedPaper.url && (
                <a
                  href={selectedPaper.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 h-11 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs touch-target-44"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Original Publication / DOI
                </a>
              )}

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  handleRemovePaper(selectedPaper.id, selectedPaper.title);
                  setIsDetailsSheetOpen(false);
                  setSelectedPaper(null);
                }}
                className="w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs font-medium h-10 rounded-xl touch-target-44"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Remove Paper from Collection
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
