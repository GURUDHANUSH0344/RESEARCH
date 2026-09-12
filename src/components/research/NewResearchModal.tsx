import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Sparkles,
  Cpu,
  Search,
  Lightbulb,
  Zap,
  BookOpen,
  FlaskConical,
  Database,
  Layers,
  PlusCircle,
} from "lucide-react";

interface NewResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartResearch: (
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
  ) => void;
}

export function NewResearchModal({
  isOpen,
  onClose,
  onStartResearch,
}: NewResearchModalProps) {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("How can AI improve crop disease detection?");
  const [objective, setObjective] = useState("");
  const [researchField, setResearchField] = useState("Artificial Intelligence & Agriculture");
  const [paperLimit, setPaperLimit] = useState(12);
  const [yearFrom, setYearFrom] = useState(2021);
  const [yearTo, setYearTo] = useState(2026);
  const [openAccessOnly, setOpenAccessOnly] = useState(false);
  const [preferredSource, setPreferredSource] = useState<
    "all" | "semanticscholar" | "openalex" | "crossref"
  >("all");

  const sampleQuestions = [
    {
      q: "How can AI improve crop disease detection?",
      title: "AI in Crop Pathology & Disease Detection",
      field: "Agricultural AI & Computer Vision",
    },
    {
      q: "Can self-supervised vision transformers generalize in low-resource medical imaging?",
      title: "Self-Supervised Vision Transformers in Clinical Imaging",
      field: "Medical AI & Computer Vision",
    },
    {
      q: "How can spatial-temporal graph neural networks enhance localized climate forecasting?",
      title: "Spatiotemporal GNNs in Microclimate Modeling",
      field: "Climate Science & Geospatial AI",
    },
    {
      q: "How can formal verification prevent smart contract reentrancy vulnerabilities?",
      title: "Smart Contract Formal Verification & SMT Solvers",
      field: "Blockchain Security & Cryptography",
    },
  ];

  const handleApplyPreset = (preset: (typeof sampleQuestions)[0]) => {
    setQuestion(preset.q);
    setTitle(preset.title);
    setResearchField(preset.field);
  };

  const handleSubmit = (mode: "autonomous" | "quick") => {
    if (!question.trim()) return;

    const finalTitle =
      title.trim() ||
      (question.length > 55 ? `${question.slice(0, 52)}...` : question);

    onStartResearch(question.trim(), {
      title: finalTitle,
      objective: objective.trim() || undefined,
      description: `Investigation into: ${question.trim()}`,
      researchField: researchField.trim() || "Scientific Inquiry",
      paperLimit,
      yearFrom: yearFrom ? Number(yearFrom) : undefined,
      yearTo: yearTo ? Number(yearTo) : undefined,
      openAccessOnly,
      preferredSource,
      mode,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-white border-slate-200 text-slate-900 rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-2xs">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Initialize Research Project
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-xs">
                Creates a new isolated workspace with a unique Research ID, isolated notes, literature, tasks, and AI history.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit("autonomous");
          }}
          className="space-y-4 pt-2"
        >
          {/* Research Title & Field */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700">
                Research Title (Optional)
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AI in Healthcare: Cardiac Risk"
                className="text-xs mt-1 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">
                Scientific Domain / Field
              </Label>
              <Input
                value={researchField}
                onChange={(e) => setResearchField(e.target.value)}
                placeholder="e.g. Cardiology, Climate, Cryptography"
                className="text-xs mt-1 rounded-xl"
              />
            </div>
          </div>

          {/* Research Question */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Primary Research Question *</span>
            </Label>
            <textarea
              rows={2}
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How can multimodal transformers improve early diagnosis of cardiovascular disease?"
              className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white resize-none"
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              <span>Suggested Benchmark Inquiry (1-Click Fill):</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleQuestions.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition-all text-left ${
                    question === preset.q
                      ? "bg-blue-50 text-blue-700 border border-blue-200 font-semibold"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Research Objectives */}
          <div>
            <Label className="text-xs font-semibold text-slate-700">
              Primary Objectives (Optional)
            </Label>
            <Input
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="e.g. Synthesize literature and benchmark attention backbones on MIMIC-IV"
              className="text-xs mt-1 rounded-xl"
            />
          </div>

          {/* Scholarly Database Selector */}
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-teal-600" />
              <span>Scholarly Database Engine</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "all", label: "Unified (All 3)", desc: "Semantic Scholar + OpenAlex + Crossref" },
                { id: "semanticscholar", label: "Semantic Scholar", desc: "214M+ Papers, PDFs & Citations" },
                { id: "openalex", label: "OpenAlex", desc: "Global Scholarly Graph & Concepts" },
                { id: "crossref", label: "Crossref", desc: "Publisher DOIs & Indexing" },
              ].map((src) => (
                <button
                  key={src.id}
                  type="button"
                  onClick={() => setPreferredSource(src.id as any)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    preferredSource === src.id
                      ? "bg-blue-50 border-blue-400 text-blue-950 ring-1 ring-blue-500/20"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div className="text-xs font-bold truncate">{src.label}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{src.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Controls: Paper Corpus Size & Year Bounds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700">Corpus Paper Limit</span>
                <span className="font-bold text-blue-600">{paperLimit} papers</span>
              </div>
              <Slider
                value={[paperLimit]}
                min={5}
                max={25}
                step={1}
                onValueChange={(val) => setPaperLimit(val[0])}
                className="py-1"
              />
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-slate-700 block">Publication Year Filter</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1990}
                  max={2026}
                  value={yearFrom}
                  onChange={(e) => setYearFrom(Number(e.target.value))}
                  className="h-8 text-xs bg-white border-slate-200 text-slate-900"
                />
                <span className="text-slate-400">to</span>
                <Input
                  type="number"
                  min={1990}
                  max={2026}
                  value={yearTo}
                  onChange={(e) => setYearTo(Number(e.target.value))}
                  className="h-8 text-xs bg-white border-slate-200 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Open Access Toggle */}
          <div className="flex items-center justify-between px-1">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold text-slate-800">
                Filter by Open Access Only
              </Label>
              <p className="text-[11px] text-slate-500">
                Restricts literature discovery to papers with freely accessible full texts.
              </p>
            </div>
            <Switch
              checked={openAccessOnly}
              onCheckedChange={setOpenAccessOnly}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit("quick")}
              className="text-xs font-semibold h-9 rounded-xl border-slate-300 hover:bg-slate-50"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1 text-slate-600" />
              Quick Workspace (Empty)
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-200 text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 px-4 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Launch Autonomous Discovery</span>
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
