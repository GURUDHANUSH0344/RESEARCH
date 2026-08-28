import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Search,
  ExternalLink,
  Sparkles,
  Quote,
  Copy,
  Check,
  Building2,
  Users,
  Award,
  Filter,
  LockOpen,
  ChevronDown,
  ChevronUp,
  FileSearch,
  Cpu,
  Database,
  ArrowRight,
  FileText,
} from "lucide-react";
import { type NormalizedPaper } from "@/lib/services/openalex";
import { type PaperAnalysisResult } from "@/lib/services/llm";
import { generateCitations, type FormattedCitations } from "@/lib/services/citation-formatter";
import { toast } from "sonner";

interface LiteratureExplorerProps {
  papers: (NormalizedPaper & { analysis?: PaperAnalysisResult | null })[];
  onAnalyzePaper?: (paper: NormalizedPaper) => void;
}

export function LiteratureExplorer({
  papers,
  onAnalyzePaper,
}: LiteratureExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"citations" | "year" | "relevance">("relevance");
  const [openAccessFilter, setOpenAccessFilter] = useState(false);
  const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});
  const [selectedCitationPaper, setSelectedCitationPaper] = useState<NormalizedPaper | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [selectedAnalysisPaper, setSelectedAnalysisPaper] = useState<(NormalizedPaper & { analysis?: PaperAnalysisResult | null }) | null>(null);

  const toggleAbstract = (id: string) => {
    setExpandedAbstracts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCitation = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    toast.success(`Copied ${format.toUpperCase()} citation to clipboard!`);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  // Filter and Sort
  const filteredPapers = papers
    .filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.authors.some((a) => a.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.concepts.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchOA = !openAccessFilter || p.open_access;
      return matchSearch && matchOA;
    })
    .sort((a, b) => {
      if (sortBy === "citations") return (b.citation_count || 0) - (a.citation_count || 0);
      if (sortBy === "year") return (b.year || 0) - (a.year || 0);
      return 0;
    });

  const citations: FormattedCitations | null = selectedCitationPaper
    ? generateCitations(selectedCitationPaper)
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Top Header & Search Bar */}
      <div className="card-scientific p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Literature Explorer
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {filteredPapers.length} Publications
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Peer-reviewed scientific repository queried live from OpenAlex and Semantic Scholar Graph API.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search paper title, author, concept..."
              className="pl-9 text-xs h-9 bg-slate-50 border-slate-200 text-slate-900 rounded-lg focus:bg-white"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-semibold h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="citations">Sort: Most Cited</option>
            <option value="year">Sort: Newest First</option>
          </select>

          <Button
            variant={openAccessFilter ? "default" : "outline"}
            size="sm"
            onClick={() => setOpenAccessFilter(!openAccessFilter)}
            className={`text-xs h-9 rounded-lg font-semibold flex items-center gap-1.5 ${
              openAccessFilter
                ? "bg-teal-600 hover:bg-teal-700 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <LockOpen className="w-3.5 h-3.5" />
            <span>Open Access Only</span>
          </Button>
        </div>
      </div>

      {/* Papers Catalog Grid */}
      {filteredPapers.length === 0 ? (
        <div className="card-scientific text-center py-16 bg-white p-6">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No Research Papers Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or run a new autonomous research investigation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPapers.map((paper) => {
            const isExpanded = !!expandedAbstracts[paper.id];
            const hasAnalysis = !!paper.analysis;

            return (
              <div
                key={paper.id}
                className="card-scientific card-scientific-hover p-6 bg-white space-y-4"
              >
                {/* Title and Top Metadata */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {paper.source || "OpenAlex"}
                      </span>
                      {paper.year && (
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {paper.year}
                        </span>
                      )}
                      {paper.open_access && (
                        <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded flex items-center gap-1">
                          <LockOpen className="w-3 h-3" />
                          <span>Open Access</span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-base md:text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      {paper.title}
                    </h2>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
                      <span>{paper.authors?.slice(0, 4).join(", ") || "Unknown Researchers"}</span>
                      {paper.venue && (
                        <>
                          <span className="text-slate-400">&bull;</span>
                          <span className="italic text-slate-700">{paper.venue}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Citation Counter */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Citations</span>
                      <div className="text-lg font-extrabold text-blue-600">
                        {paper.citation_count?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Abstract Preview */}
                <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-lg border border-slate-100">
                  <p className={isExpanded ? "" : "line-clamp-2"}>
                    {paper.abstract || "Abstract indexed in scholarly repository. Click below to view full source."}
                  </p>
                  {paper.abstract && paper.abstract.length > 220 && (
                    <button
                      onClick={() => toggleAbstract(paper.id)}
                      className="text-blue-600 hover:underline font-semibold mt-1 inline-flex items-center gap-1 text-[11px]"
                    >
                      {isExpanded ? (
                        <>
                          <span>Show Less</span>
                          <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          <span>Read Full Abstract</span>
                          <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Scientific Metadata Tags: Method, Dataset, Concepts */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                  {paper.analysis?.methodology && (
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-blue-600" />
                      <span>Method: {paper.analysis.methodology.slice(0, 32)}</span>
                    </span>
                  )}
                  {paper.analysis?.dataset && (
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-teal-600" />
                      <span>Dataset: {paper.analysis.dataset.slice(0, 32)}</span>
                    </span>
                  )}
                  {paper.concepts?.slice(0, 3).map((concept, idx) => (
                    <span
                      key={idx}
                      className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded"
                    >
                      {concept}
                    </span>
                  ))}
                </div>

                {/* Card Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {hasAnalysis ? (
                      <Button
                        onClick={() => setSelectedAnalysisPaper(paper)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-8.5 px-3 rounded-lg shadow-2xs flex items-center gap-1.5"
                      >
                        <FileSearch className="w-3.5 h-3.5" />
                        <span>VIEW DEEP BREAKDOWN</span>
                      </Button>
                    ) : onAnalyzePaper ? (
                      <Button
                        onClick={() => onAnalyzePaper(paper)}
                        size="sm"
                        variant="outline"
                        className="border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-semibold h-8.5 px-3 rounded-lg flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>ANALYZE PAPER</span>
                      </Button>
                    ) : null}

                    <Button
                      onClick={() => setSelectedCitationPaper(paper)}
                      size="sm"
                      variant="outline"
                      className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold h-8.5 px-3 rounded-lg flex items-center gap-1.5"
                    >
                      <Quote className="w-3.5 h-3.5 text-slate-500" />
                      <span>Cite (APA / IEEE / BibTeX)</span>
                    </Button>
                  </div>

                  {paper.url && (
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 hover:underline"
                    >
                      <span>View Original Paper</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Citation Generator Dialog */}
      <Dialog
        open={!!selectedCitationPaper}
        onOpenChange={(open) => !open && setSelectedCitationPaper(null)}
      >
        <DialogContent className="max-w-2xl bg-white border-slate-200 text-slate-900 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Quote className="w-4 h-4 text-blue-600" />
              <span>Academic Citation Manager</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Verified standard format citations generated for academic bibliographies.
            </DialogDescription>
          </DialogHeader>

          {citations && (
            <Tabs defaultValue="apa" className="w-full mt-2">
              <TabsList className="grid grid-cols-4 bg-slate-100 p-1 rounded-lg">
                <TabsTrigger value="apa" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900">
                  APA (7th)
                </TabsTrigger>
                <TabsTrigger value="ieee" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900">
                  IEEE
                </TabsTrigger>
                <TabsTrigger value="mla" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900">
                  MLA (9th)
                </TabsTrigger>
                <TabsTrigger value="bibtex" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900">
                  BibTeX
                </TabsTrigger>
              </TabsList>

              <TabsContent value="apa" className="mt-3 space-y-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 leading-relaxed select-all">
                  {citations.apa}
                </div>
                <Button
                  onClick={() => handleCopyCitation(citations.apa, "apa")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 rounded-lg flex items-center justify-center gap-1.5"
                >
                  {copiedFormat === "apa" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedFormat === "apa" ? "Copied APA Citation" : "Copy APA Citation"}</span>
                </Button>
              </TabsContent>

              <TabsContent value="ieee" className="mt-3 space-y-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 leading-relaxed select-all">
                  {citations.ieee}
                </div>
                <Button
                  onClick={() => handleCopyCitation(citations.ieee, "ieee")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 rounded-lg flex items-center justify-center gap-1.5"
                >
                  {copiedFormat === "ieee" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedFormat === "ieee" ? "Copied IEEE Citation" : "Copy IEEE Citation"}</span>
                </Button>
              </TabsContent>

              <TabsContent value="mla" className="mt-3 space-y-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 leading-relaxed select-all">
                  {citations.mla}
                </div>
                <Button
                  onClick={() => handleCopyCitation(citations.mla, "mla")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 rounded-lg flex items-center justify-center gap-1.5"
                >
                  {copiedFormat === "mla" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedFormat === "mla" ? "Copied MLA Citation" : "Copy MLA Citation"}</span>
                </Button>
              </TabsContent>

              <TabsContent value="bibtex" className="mt-3 space-y-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed select-all">
                  {citations.bibtex}
                </div>
                <Button
                  onClick={() => handleCopyCitation(citations.bibtex, "bibtex")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 rounded-lg flex items-center justify-center gap-1.5"
                >
                  {copiedFormat === "bibtex" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedFormat === "bibtex" ? "Copied BibTeX Entry" : "Copy BibTeX Entry"}</span>
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Deep Paper Breakdown Structured Modal */}
      <Dialog
        open={!!selectedAnalysisPaper}
        onOpenChange={(open) => !open && setSelectedAnalysisPaper(null)}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white border-slate-200 text-slate-900 rounded-2xl shadow-2xl p-6 md:p-8 space-y-5">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded uppercase">
                Structured Research Extraction
              </span>
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 leading-snug mt-1">
              {selectedAnalysisPaper?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Extracted methodology, datasets, empirical benchmarks, and identified limitations.
            </DialogDescription>
          </DialogHeader>

          {selectedAnalysisPaper?.analysis && (
            <div className="space-y-4 pt-2">
              {/* Problem & Objective */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    RESEARCH PROBLEM
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {selectedAnalysisPaper.analysis.problem}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    PRIMARY OBJECTIVE
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {selectedAnalysisPaper.analysis.objective}
                  </p>
                </div>
              </div>

              {/* Methodology & Datasets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    METHODOLOGY & ARCHITECTURE
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {selectedAnalysisPaper.analysis.methodology}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                    DATASETS UTILIZED
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {selectedAnalysisPaper.analysis.dataset}
                  </p>
                </div>
              </div>

              {/* Experimental Setup & Results */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  EXPERIMENTAL SETUP & EVALUATION
                </span>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {selectedAnalysisPaper.analysis.experimental_setup}
                </p>
              </div>

              <div className="p-4 bg-teal-50/40 rounded-xl border border-teal-200/80 space-y-1.5">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                  REPORTED RESULTS & ACCURACY
                </span>
                <p className="text-xs text-slate-900 leading-relaxed font-medium">
                  {selectedAnalysisPaper.analysis.results}
                </p>
              </div>

              {/* Limitations & Key Contributions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    IDENTIFIED LIMITATIONS
                  </span>
                  <p className="text-xs text-slate-900 leading-relaxed font-medium">
                    {selectedAnalysisPaper.analysis.limitations}
                  </p>
                </div>

                <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-200/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                    KEY CONTRIBUTIONS
                  </span>
                  <p className="text-xs text-slate-900 leading-relaxed font-medium">
                    {selectedAnalysisPaper.analysis.contributions}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
