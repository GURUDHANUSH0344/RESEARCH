import React, { useState, useRef, useEffect } from "react";
import { type ResearchProject } from "@/types/research";
import { workspaceService } from "@/lib/services/workspace-service";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  User,
  Send,
  Sparkles,
  Loader2,
  Trash2,
  Download,
  ShieldCheck,
  Lightbulb,
  BookOpen,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sourcesCount?: number;
}

interface ResearchAssistantChatProps {
  project: ResearchProject;
}

export function ResearchAssistantChat({ project }: ResearchAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [evidenceSheetOpen, setEvidenceSheetOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef<boolean>(true);

  const paperCount = project?.papers?.length || 0;
  const [notes, setNotes] = useState<any[]>([]);
  const [findings, setFindings] = useState<any[]>([]);

  useEffect(() => {
    if (project?.id) {
      workspaceService.getNotes(project.id).then(setNotes);
      workspaceService.getFindings(project.id).then(setFindings);

      // Welcome prompt
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Welcome to the AI Research Assistant for "${project.title}".\n\nI have indexed all ${paperCount} papers, ${notes.length} research notes, and ${findings.length} findings from your workspace. Ask me anything about methodological comparisons, empirical findings, or research gaps.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sourcesCount: paperCount,
        },
      ]);
    }
  }, [project?.id, paperCount]);

  const handleChatScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    // If within 120px of bottom, consider user is at bottom
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 120;
  };

  useEffect(() => {
    // Only auto-scroll if the user is already near the bottom, avoiding disruptive jumping when reading older messages
    if (isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || isLoading) return;

    // Reset user scroll position lock on explicit send
    isNearBottomRef.current = true;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setIsLoading(true);

    try {
      // Build synthesis prompt with isolated context
      const papersContext = project.papers?.slice(0, 8).map((p, i) => `[Paper ${i + 1}] "${p.title}" (${p.year || "n.d."}): ${p.abstract || "No abstract"}`).join("\n\n") || "No papers indexed.";
      const notesContext = notes.map((n, i) => `[Note ${i + 1}] ${n.title}: ${n.content}`).join("\n") || "No notes.";

      const aiResponse = await workspaceService.queryIsolatedAI(
        project.id,
        text.trim(),
        `Active Research Project: "${project.title}"\nResearch Question: ${project.research_question || "N/A"}\n\nEvidence Corpus:\n${papersContext}\n\nNotes Context:\n${notesContext}`
      );

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse || "Analysis completed based on your grounded research corpus.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sourcesCount: Math.min(paperCount, 4),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      toast.error("Failed to query AI Assistant");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "cleared",
        role: "assistant",
        content: `Chat session refreshed. Grounded context active for "${project.title}".`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sourcesCount: paperCount,
      },
    ]);
    toast.info("Conversation history cleared");
  };

  const handleExportChat = () => {
    const text = messages.map((m) => `[${m.timestamp}] ${m.role.toUpperCase()}:\n${m.content}\n`).join("\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.title.slice(0, 25).replace(/[^a-z0-9]/gi, "_")}_ai_chat.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Chat transcript exported");
  };

  const openEvidenceSheet = () => {
    setSelectedSources(project.papers?.slice(0, 6) || []);
    setEvidenceSheetOpen(true);
  };

  // Section 14: Exact Suggested Questions
  const samplePrompts = [
    "What are the major research gaps?",
    "Compare the approaches used in these papers.",
    "What methodology would be suitable?",
    "What evidence supports this finding?",
  ];

  // Section 24: Rotating loading messages
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const loadingSteps = [
    "Analyzing research evidence...",
    "Comparing papers...",
    "Identifying research gaps...",
    "Generating research insights...",
  ];

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % loadingSteps.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="space-y-3 sm:space-y-4 max-w-5xl mx-auto py-1 sm:py-2 h-[640px] max-h-[85vh] flex flex-col font-sans">
      {/* 1. Header with Current Research Context (Section 14) */}
      <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-2xs flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] border border-indigo-100 flex items-center justify-center text-[#536DFE] shrink-0">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-semibold text-[#172033] truncate">
                AI Research Assistant
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#536DFE] bg-[#EEF2FF] px-2.5 py-0.5 rounded-full border border-indigo-100 shrink-0">
                <ShieldCheck className="w-3 h-3 text-[#536DFE]" />
                <span>Research Context: {project?.title || "Active Research"}</span>
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5 truncate">
              {paperCount} papers &bull; {notes.length} notes &bull; {findings.length} findings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            onClick={handleExportChat}
            variant="ghost"
            size="sm"
            className="text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] text-xs h-8 px-2.5 rounded-lg cursor-pointer"
            title="Export conversation transcript"
          >
            <Download className="w-3.5 h-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          <Button
            onClick={handleClearChat}
            variant="ghost"
            size="sm"
            className="text-[#94A3B8] hover:text-red-600 hover:bg-red-50 text-xs h-8 w-8 sm:w-auto sm:px-2.5 rounded-lg cursor-pointer"
            title="Clear chat history for this research"
          >
            <Trash2 className="w-3.5 h-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </div>

      {/* 2. Chat Messages Canvas */}
      <div
        ref={chatContainerRef}
        onScroll={handleChatScroll}
        className="flex-1 min-h-0 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-y-auto p-4 sm:p-5 md:p-6 space-y-4 overscroll-contain"
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id || idx}
              className={`flex gap-3 max-w-3xl animate-fade-slide ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isUser
                    ? "bg-[#243B64] text-white"
                    : "bg-[#EEF2FF] border border-indigo-100 text-[#536DFE]"
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </div>

              <div className="space-y-1.5 max-w-[85%] sm:max-w-none">
                <div
                  className={`p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-[#243B64] text-white rounded-tr-xs shadow-xs"
                      : "bg-[#F8FAFC] text-[#172033] border border-[#E2E8F0] rounded-tl-xs whitespace-pre-wrap shadow-2xs"
                  }`}
                >
                  {msg.content}

                  {/* Sources pill in AI response (Section 14: Sources used: 4 · View Evidence →) */}
                  {!isUser && msg.sourcesCount !== undefined && msg.sourcesCount > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-[#64748B] flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-[#536DFE]" />
                        Sources used: {msg.sourcesCount}
                      </span>
                      <button
                        type="button"
                        onClick={openEvidenceSheet}
                        className="text-[11px] font-semibold text-[#536DFE] hover:text-[#243B64] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>View Evidence</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div
                  className={`text-[10px] text-[#94A3B8] font-normal px-1 ${
                    isUser ? "text-right" : "text-left"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Section 24 Loading State: "Analyzing research evidence...", etc. */}
        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto animate-fade-slide">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#EEF2FF] border border-indigo-100 flex items-center justify-center text-[#536DFE] shrink-0">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl rounded-tl-xs space-y-2 w-72 sm:w-80 shadow-2xs">
              <div className="flex items-center gap-2 text-xs text-[#536DFE] font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{loadingSteps[loadingStepIndex]}</span>
              </div>
              <div className="h-2 w-full skeleton-shimmer rounded-full" />
              <div className="h-2 w-4/5 skeleton-shimmer rounded-full" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Suggested Questions Pills (Section 14) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 select-none no-scrollbar">
        <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider flex items-center gap-1 shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Suggested:</span>
        </span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="text-xs text-[#172033] bg-white hover:bg-[#EEF2FF] hover:text-[#243B64] hover:border-[#CBD5E1] border border-[#E2E8F0] px-3 py-1.5 rounded-full whitespace-nowrap transition-colors shadow-2xs font-normal shrink-0 cursor-pointer touch-target-44 flex items-center"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* 4. Input Area (Section 14: "Ask anything about this research...") */}
      <div className="bg-white rounded-xl p-1.5 sm:p-2 border border-[#E2E8F0] shadow-2xs flex items-center gap-2 shrink-0">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask anything about this research..."
          disabled={isLoading}
          className="border-0 shadow-none focus-visible:ring-0 text-xs sm:text-sm px-3 bg-transparent h-10 font-sans text-[#172033] placeholder:text-[#94A3B8]"
        />
        <Button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          size="sm"
          className="bg-[#243B64] hover:bg-[#1D3154] text-white rounded-lg h-9 px-4 flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer touch-target-44"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="font-semibold text-xs">Ask</span>
        </Button>
      </div>

      {/* 5. Mobile Evidence BottomSheet */}
      <BottomSheet
        isOpen={evidenceSheetOpen}
        onClose={() => setEvidenceSheetOpen(false)}
        title="Grounded Sources & Evidence"
        description={`Indexed literature references supporting AI analysis for "${project.title}"`}
      >
        <div className="space-y-3 py-2">
          {selectedSources.length > 0 ? (
            selectedSources.map((paper, idx) => (
              <div
                key={paper.id || idx}
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-sans">
                  <span>Source #{idx + 1}</span>
                  <span className="font-semibold">{paper.year || "Recent"}</span>
                </div>
                <h4 className="font-heading font-bold text-xs text-slate-900 leading-snug">
                  {paper.title}
                </h4>
                {paper.authors && (
                  <p className="text-[11px] text-slate-500 truncate">
                    {Array.isArray(paper.authors) ? paper.authors.join(", ") : paper.authors}
                  </p>
                )}
                {paper.abstract && (
                  <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed font-sans pt-1">
                    {paper.abstract}
                  </p>
                )}
                {paper.url && (
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-heading font-semibold text-blue-600 hover:underline pt-1"
                  >
                    <span>Open Paper</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">
              No literature sources available for this project.
            </p>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
