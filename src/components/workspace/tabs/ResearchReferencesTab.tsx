import React, { useState, useEffect } from "react";
import { type ResearchProject, type ResearchReference } from "@/types/research";
import { workspaceService } from "@/lib/services/workspace-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookMarked,
  Copy,
  Download,
  Search,
  ExternalLink,
  Check,
  FileCode,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface ResearchReferencesTabProps {
  project: ResearchProject;
}

export function ResearchReferencesTab({ project }: ResearchReferencesTabProps) {
  const [references, setReferences] = useState<ResearchReference[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<
    "apa" | "mla" | "chicago" | "harvard" | "ieee" | "bibtex"
  >("apa");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    workspaceService.getReferences(project.id).then(setReferences);
  }, [project.id, project.papers]);

  const filteredReferences = references.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.authors.some((a) => a.toLowerCase().includes(q)) ||
      (r.venue && r.venue.toLowerCase().includes(q))
    );
  });

  const copySingleCitation = (citationText: string) => {
    navigator.clipboard.writeText(citationText);
    toast.success("Citation copied to clipboard");
  };

  const copyAllBibliography = () => {
    if (references.length === 0) return;
    const allText = references
      .map((r, i) =>
        selectedFormat === "bibtex"
          ? r.citations.bibtex
          : `[${i + 1}] ${r.citations[selectedFormat]}`
      )
      .join("\n\n");

    navigator.clipboard.writeText(allText);
    toast.success(`Full ${selectedFormat.toUpperCase()} bibliography copied!`);
  };

  const exportBibTeX = () => {
    if (references.length === 0) return;
    const bibtexData = references.map((r) => r.citations.bibtex).join("\n\n");
    const blob = new Blob([bibtexData], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.title.slice(0, 30).replace(/[^a-z0-9]/gi, "_")}_references.bib`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Exported BibTeX (.bib) file");
  };

  const exportText = () => {
    if (references.length === 0) return;
    const textData = references
      .map((r, i) => `[${i + 1}] ${r.citations[selectedFormat]}`)
      .join("\n\n");
    const blob = new Blob([textData], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.title.slice(0, 30).replace(/[^a-z0-9]/gi, "_")}_citations_${selectedFormat}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedFormat.toUpperCase()} bibliography (.txt)`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              References & Citations
            </h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {references.length} Citations
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automatically compiled references strictly corresponding to Research ID:{" "}
            <span className="font-mono font-semibold text-slate-700">{project.id}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={copyAllBibliography}
            size="sm"
            variant="outline"
            className="text-xs font-semibold h-9 rounded-xl border-slate-200 hover:bg-slate-50"
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Copy All ({selectedFormat.toUpperCase()})
          </Button>

          <Button
            onClick={exportBibTeX}
            size="sm"
            variant="outline"
            className="text-xs font-semibold h-9 rounded-xl border-slate-200 hover:bg-slate-50"
          >
            <FileCode className="w-3.5 h-3.5 mr-1.5" />
            Export .bib
          </Button>

          <Button
            onClick={exportText}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 rounded-xl shadow-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export .txt
          </Button>
        </div>
      </div>

      {/* Format Selector & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search references by author, title, or publication venue..."
            className="pl-10 h-10 bg-white border-slate-200 text-xs rounded-xl shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {(["apa", "mla", "chicago", "harvard", "ieee", "bibtex"] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg uppercase transition-all ${
                selectedFormat === fmt
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* References List */}
      {filteredReferences.length > 0 ? (
        <div className="space-y-3">
          {filteredReferences.map((ref, idx) => {
            const formattedCitation = ref.citations[selectedFormat];

            return (
              <div
                key={ref.id || idx}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900">{ref.title}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {ref.authors.join(", ")} &bull; ({ref.year}) &bull; {ref.venue}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      onClick={() => copySingleCitation(formattedCitation)}
                      variant="ghost"
                      size="sm"
                      className="text-slate-500 hover:text-blue-600 text-xs h-8 px-2.5 rounded-lg"
                      title="Copy citation"
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copy
                    </Button>

                    {ref.url && (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Formatted Citation Block */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-mono text-xs text-slate-700 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
                  {formattedCitation}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <BookMarked className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No References Compiled</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Add papers in the Literature tab to generate formatted citations in APA, MLA, Chicago, Harvard, IEEE, and BibTeX.
          </p>
        </div>
      )}
    </div>
  );
}
