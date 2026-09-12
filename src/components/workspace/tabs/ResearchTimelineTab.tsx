import React, { useState, useEffect } from "react";
import { type ResearchProject, type ResearchTimelineEvent } from "@/types/research";
import { workspaceService } from "@/lib/services/workspace-service";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  BookOpen,
  FileText,
  CheckCircle2,
  Sparkles,
  Bot,
  PlusCircle,
  Activity,
  Layers,
  History,
  Filter,
} from "lucide-react";

interface ResearchTimelineTabProps {
  project: ResearchProject;
}

export function ResearchTimelineTab({ project }: ResearchTimelineTabProps) {
  const [events, setEvents] = useState<ResearchTimelineEvent[]>([]);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    workspaceService.getTimeline(project.id).then(setEvents);
  }, [project.id]);

  const getEventIcon = (type: ResearchTimelineEvent["event_type"]) => {
    switch (type) {
      case "research_created":
        return <Activity className="w-4 h-4 text-blue-600" />;
      case "paper_added":
      case "paper_removed":
        return <BookOpen className="w-4 h-4 text-indigo-600" />;
      case "note_created":
      case "note_updated":
        return <FileText className="w-4 h-4 text-teal-600" />;
      case "finding_added":
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      case "task_created":
      case "task_completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "ai_chat":
        return <Bot className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getEventBadge = (type: ResearchTimelineEvent["event_type"]) => {
    switch (type) {
      case "paper_added":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "note_created":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "task_completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "finding_added":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "ai_chat":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const filteredEvents = events.filter((e) => {
    if (filterType === "all") return true;
    if (filterType === "papers") return e.event_type.includes("paper");
    if (filterType === "notes") return e.event_type.includes("note");
    if (filterType === "tasks") return e.event_type.includes("task");
    if (filterType === "findings") return e.event_type.includes("finding");
    if (filterType === "ai") return e.event_type.includes("ai");
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Research Activity Timeline
            </h2>
            <Badge variant="outline" className="bg-slate-100 text-slate-700">
              {events.length} Events
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chronological audit stream of activities performed within Research ID:{" "}
            <span className="font-mono font-semibold text-slate-700">{project.id}</span>
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {[
            { id: "all", label: "All" },
            { id: "papers", label: "Papers" },
            { id: "notes", label: "Notes" },
            { id: "tasks", label: "Tasks" },
            { id: "findings", label: "Findings" },
            { id: "ai", label: "AI" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterType === f.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      {filteredEvents.length > 0 ? (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {filteredEvents.map((event) => (
            <div key={event.id} className="relative group">
              {/* Event Bullet Node */}
              <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              </div>

              {/* Event Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getEventBadge(
                        event.event_type
                      )}`}
                    >
                      {getEventIcon(event.event_type)}
                      <span>{event.event_type.replace("_", " ")}</span>
                    </span>

                    <h3 className="text-sm font-bold text-slate-900">
                      {event.title}
                    </h3>
                  </div>

                  <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Clock className="w-3 h-3" />
                    {new Date(event.timestamp).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Timeline Events Recorded</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Activities such as adding papers, taking notes, creating tasks, and consulting AI will be logged chronologically here.
          </p>
        </div>
      )}
    </div>
  );
}
