import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  Search,
} from "lucide-react";
import { chatWithResearchContext } from "@/lib/services/llm";
import { type ResearchProjectData } from "@/lib/services/orchestrator";

interface ResearchAssistantChatProps {
  project: ResearchProjectData | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function ResearchAssistantChat({ project }: ResearchAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I am your Research Assistant. I have loaded full context over your active investigation into: "${project?.research_question || "AI-Based Scientific Discovery"}".\n\nYou can ask me to cross-reference study findings, evaluate identified research gaps, or critique experimental variable setups.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const paperCount = project?.papers?.length || 0;
  const gapCount = project?.gaps?.length || 0;
  const hypCount = project?.hypotheses?.length || 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setIsLoading(true);

    try {
      const response = await chatWithResearchContext(
        text.trim(),
        messages.map((m) => ({ role: m.role, content: m.content })),
        {
          researchQuestion: project?.research_question || "AI-driven scientific discovery",
          papers: project?.papers || [],
          gaps: project?.gaps || [],
          hypotheses: project?.hypotheses || [],
          experiment: project?.experiment,
        },
      );

      const botMsg: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: Message = {
        role: "assistant",
        content: "I apologize, but I encountered an error while synthesizing the research response. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    "Why is the environmental generalization gap important?",
    "Compare the top two papers in our corpus.",
    "Which hypothesis has the highest edge feasibility?",
    "What common limitations exist across these studies?",
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto py-2 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header with Current Research Context */}
      <div className="card-scientific p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              RESEARCH ASSISTANT
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Evidence Context Active
            </span>
          </div>
        </div>

        {/* Context Stats */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md">
            Papers: {paperCount}
          </span>
          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md">
            Gaps: {gapCount}
          </span>
          <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-md">
            Hypotheses: {hypCount}
          </span>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="card-scientific bg-white flex-1 p-5 overflow-y-auto space-y-4 shadow-xs">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
                msg.role === "user"
                  ? "bg-[#123B63] text-white"
                  : "bg-blue-50 border border-blue-200 text-blue-700"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#123B63] text-white"
                  : "bg-slate-50 border border-slate-200 text-slate-800"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div
                className={`text-[10px] mt-2 font-mono ${
                  msg.role === "user" ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl p-4 text-xs flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Grounding response in analyzed literature evidence...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="flex flex-wrap items-center gap-1.5 shrink-0 px-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">Suggested:</span>
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="text-[11px] font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md transition-colors truncate max-w-xs shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="card-scientific bg-white p-2 flex items-center gap-2 shrink-0"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a scientific inquiry about the corpus, gaps, or methodology..."
          disabled={isLoading}
          className="text-xs border-0 bg-transparent text-slate-900 focus-visible:ring-0 placeholder:text-slate-400 h-9"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!input.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 px-4 rounded-lg shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </Button>
      </form>
    </div>
  );
}
