import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Lightbulb,
  BookOpen,
  Loader2,
  Trash2,
  Download,
  FileText,
} from "lucide-react";
import { chatWithResearchContext } from "@/lib/services/llm";
import { workspaceService } from "@/lib/services/workspace-service";
import { type ResearchProject, type ResearchChatMessage, type ResearchNote, type ResearchFinding } from "@/types/research";
import { toast } from "sonner";

interface ResearchAssistantChatProps {
  project: ResearchProject | null;
}

export function ResearchAssistantChat({ project }: ResearchAssistantChatProps) {
  const [messages, setMessages] = useState<ResearchChatMessage[]>([]);
  const [notes, setNotes] = useState<ResearchNote[]>([]);
  const [findings, setFindings] = useState<ResearchFinding[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const paperCount = project?.papers?.length || 0;
  const researchId = project?.id || "default";

  // Load chat history, notes, and findings strictly for this project.id
  useEffect(() => {
    if (!project) return;
    workspaceService.getChatHistory(project.id).then((history) => {
      if (history.length === 0) {
        // Initialize default greeting
        workspaceService
          .addChatMessage(
            project.id,
            "assistant",
            `Hello! I am your AI Research Assistant strictly configured for: "${project.title}".\n\nI have loaded your ${paperCount} collected papers, research notes, and key findings. Ask me to compare study findings, evaluate gaps, or critique your methodology.`
          )
          .then((msg) => setMessages([msg]));
      } else {
        setMessages(history);
      }
    });

    workspaceService.getNotes(project.id).then(setNotes);
    workspaceService.getFindings(project.id).then(setFindings);
  }, [project?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    if (!project) return;
    const text = queryText || input;
    if (!text.trim() || isLoading) return;

    // Persist user message to this research
    const userMsg = await workspaceService.addChatMessage(project.id, "user", text.trim());
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setIsLoading(true);

    try {
      // Pass isolated context: papers, notes, findings, and references from this research
      const response = await chatWithResearchContext(
        text.trim(),
        messages.map((m) => ({ role: m.role, content: m.content })),
        {
          researchQuestion: project.research_question || project.title,
          papers: project.papers || [],
          notes: notes.map((n) => ({ title: n.title, content: n.content, category: n.category })),
          findings: findings.map((f) => ({ title: f.title, description: f.description, type: f.type })),
          gaps: project.gaps || [],
          hypotheses: project.hypotheses || [],
          experiment: project.experiment,
        }
      );

      // Persist assistant message to this research
      const botMsg = await workspaceService.addChatMessage(project.id, "assistant", response);
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg = await workspaceService.addChatMessage(
        project.id,
        "assistant",
        "I apologize, but I encountered an error while synthesizing the research response. Please try again."
      );
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!project) return;
    if (!confirm("Clear AI conversation history for this research project?")) return;
    await workspaceService.clearChatHistory(project.id);
    const welcome = await workspaceService.addChatMessage(
      project.id,
      "assistant",
      `Chat history cleared. I am ready to answer questions grounded in "${project.title}".`
    );
    setMessages([welcome]);
    toast.success("Chat history cleared for this research");
  };

  const handleExportChat = () => {
    if (!project || messages.length === 0) return;
    const transcript = messages
      .map((m) => `[${m.timestamp}] ${m.role.toUpperCase()}:\n${m.content}\n`)
      .join("\n---\n\n");
    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.title.slice(0, 30).replace(/[^a-z0-9]/gi, "_")}_ai_chat.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Chat transcript exported");
  };

  const samplePrompts = [
    `Summarize the key takeaways from the ${paperCount} papers in this research.`,
    "What are the primary research gaps identified so far?",
    "Review my notes and suggest next experimental steps.",
    "Which methodologies have the highest reported empirical success?",
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto py-2 h-[calc(100vh-8.5rem)] flex flex-col">
      {/* Header with Current Research Context */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-2xs shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-sm font-bold text-slate-900 truncate">
                AI Assistant — {project?.title || "Research Workspace"}
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 shrink-0">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                Research Context: {project?.title ? project.title.slice(0, 24) + "..." : "Isolated"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Grounded strictly in {paperCount} papers &bull; {notes.length} notes &bull; {findings.length} findings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            onClick={handleExportChat}
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-slate-800 text-xs h-8 px-2.5 rounded-lg btn-interactive"
            title="Export conversation transcript"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Export
          </Button>
          <Button
            onClick={handleClearChat}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs h-8 px-2.5 rounded-lg btn-interactive"
            title="Clear chat history for this research"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id || idx}
              className={`flex gap-3 max-w-3xl animate-fade-slide ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                  isUser
                    ? "bg-blue-600 text-white"
                    : "bg-purple-50 border border-purple-200 text-purple-700"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-1">
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-xs shadow-xs"
                      : "bg-slate-50 text-slate-800 border border-slate-200/70 rounded-tl-xs whitespace-pre-wrap shadow-2xs"
                  }`}
                >
                  {msg.content}
                </div>
                <div
                  className={`text-[10px] text-slate-400 font-medium px-1 ${
                    isUser ? "text-right" : "text-left"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto animate-fade-slide">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl rounded-tl-xs space-y-2 w-72 sm:w-80 shadow-2xs">
              <div className="flex items-center gap-2 text-xs text-purple-700 font-semibold mb-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing isolated research context...</span>
              </div>
              <div className="h-3 w-full skeleton-shimmer" />
              <div className="h-3 w-4/5 skeleton-shimmer" />
              <div className="h-3 w-2/3 skeleton-shimmer" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 select-none no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
          <Lightbulb className="w-3 h-3 text-amber-500" />
          Prompt:
        </span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="text-[11px] text-slate-600 bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-slate-200/80 px-3 py-1 rounded-full whitespace-nowrap transition-colors shadow-2xs font-medium shrink-0 cursor-pointer btn-interactive"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex items-center gap-2 shrink-0">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={`Ask about "${project?.title || "this research"}"...`}
          disabled={isLoading}
          className="border-0 shadow-none focus-visible:ring-0 text-xs px-3 bg-transparent h-10"
        />
        <Button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 flex items-center gap-1.5 shrink-0 shadow-xs btn-interactive cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Ask AI</span>
        </Button>
      </div>
    </div>
  );
}
