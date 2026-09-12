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
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    workspaceService
      .getTimeline(project.id)
      .then((data) => setEvents(data))
      .finally(() => setLoading(false));
  }, [project.id]);

  const getEventIcon = (type: ResearchTimelineEvent["event_type"]) => {
    switch (type) {
      case "research_created":
        return <Activity className="w-3.5 h-3.5 text-blue-600" />;
      case "paper_added":
      case "paper_removed":
        return <BookOpen className="w-3.5 h-3.5 text-indigo-600" />;
      case "note_created":
      case "note_updated":
        return <FileText className="w-3.5 h-3.5 text-teal-600" />;
      case "finding_added":
        return <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
      case "task_created":
      case "task_completed":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case "ai_chat":
        return <Bot className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getEventBadge = (type: ResearchTimelineEvent["event_type"]) => {
    switch (type) {
      case "paper_added":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/70";
      case "note_created":
        return "bg-teal-50 text-teal-700 border-teal-200/70";
      case "task_completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/70";
      case "finding_added":
        return "bg-amber-50 text-amber-700 border-amber-200/70";
      case "ai_chat":
        return "bg-purple-50 text-purple-700 border-purple-200/70";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200/70";
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
      <div className="card-mice p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold font-heading text-slate-900 tracking-tight">
              Research Activity Timeline
            </h2>
            <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-xs font-semibold px-2.5 py-0.5">
              {events.length} Events
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chronological audit stream of activities performed within Research ID:{" "}
            <span className="font-mono font-semibold text-slate-700">{project.id}</span>
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                filterType === f.id
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="space-y-4 pl-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-mice p-5 space-y-2.5">
              <div className="flex justify-between">
                <div className="skeleton-shimmer h-4 w-40" />
                <div className="skeleton-shimmer h-3 w-20" />
              </div>
              <div className="skeleton-shimmer h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200/80">
          {filteredEvents.map((event) => (
            <div key={event.id} className="relative group">
              {/* Event Bullet Node */}
              <div className="absolute -left-6 top-2 w-5 h-5 rounded-full bg-white border-2 border-slate-400 group-hover:border-blue-600 flex items-center justify-center shadow-xs transition-colors duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-blue-600 transition-colors duration-200" />
              </div>

              {/* Event Card */}
              <div className="card-mice card-mice-hover p-5 transition-all duration-200 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getEventBadge(
                        event.event_type
                      )}`}
                    >
                      {getEventIcon(event.event_type)}
                      <span>{event.event_type.replace("_", " ")}</span>
                    </span>

                    <h3 className="text-sm font-bold font-heading text-slate-900">
                      {event.title}
                    </h3>
                  </div>

                  <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(event.timestamp).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-mice p-12 text-center space-y-3">
          <History className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold font-heading text-slate-800">No Timeline Events Recorded</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Activities such as adding papers, taking notes, creating tasks, and consulting AI will be logged chronologically here.
          </p>
        </div>
      )}
    </div>
  );
}
