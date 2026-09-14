import React, { useState, useEffect } from "react";
import { type ResearchProject, type ResearchNote } from "@/types/research";
import { workspaceService } from "@/lib/services/workspace-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  PlusCircle,
  Search,
  Pin,
  Trash2,
  Edit3,
  Tag,
  Clock,
  Check,
  Filter,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { StageCompletionButton } from "../StageCompletionButton";

interface ResearchNotesTabProps {
  project: ResearchProject;
  onNotesChanged?: (count: number) => void;
  isStageCompleted?: boolean;
  onToggleStageCompletion?: () => void;
}

export function ResearchNotesTab({
  project,
  onNotesChanged,
  isStageCompleted,
  onToggleStageCompletion,
}: ResearchNotesTabProps) {
  const [notes, setNotes] = useState<ResearchNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<ResearchNote["category"]>("methodology");
  const [tagsInput, setTagsInput] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await workspaceService.getNotes(project.id);
      setNotes(data);
      onNotesChanged?.(data.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [project.id]);

  const handleOpenNewNote = () => {
    setEditingNoteId(null);
    setTitle("");
    setContent("");
    setCategory("methodology");
    setTagsInput("");
    setIsPinned(false);
    setIsEditorOpen(true);
  };

  const handleOpenEditNote = (n: ResearchNote) => {
    setEditingNoteId(n.id);
    setTitle(n.title);
    setContent(n.content);
    setCategory(n.category);
    setTagsInput(n.tags.join(", "));
    setIsPinned(!!n.pinned);
    setIsEditorOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      if (editingNoteId) {
        await workspaceService.updateNote(project.id, editingNoteId, {
          title: title.trim(),
          content: content.trim(),
          category,
          tags,
          pinned: isPinned,
        });
        toast.success("Note updated");
      } else {
        await workspaceService.createNote(project.id, {
          title: title.trim(),
          content: content.trim(),
          category,
          tags,
          pinned: isPinned,
        });
        toast.success("Note saved to research workspace");
      }
      setIsEditorOpen(false);
      loadNotes();
    } catch {
      toast.error("Failed to save note");
    }
  };

  const handleDeleteNote = async (noteId: string, noteTitle: string) => {
    if (!confirm(`Delete note "${noteTitle}"?`)) return;
    try {
      await workspaceService.deleteNote(project.id, noteId);
      toast.success("Note deleted");
      loadNotes();
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const togglePin = async (n: ResearchNote) => {
    await workspaceService.updateNote(project.id, n.id, {
      pinned: !n.pinned,
    });
    loadNotes();
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || n.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (cat: ResearchNote["category"]) => {
    switch (cat) {
      case "methodology":
        return "bg-sky-50 text-sky-700 border-sky-200/70";
      case "literature":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/70";
      case "observation":
        return "bg-amber-50 text-amber-700 border-amber-200/70";
      case "idea":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/70";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/70";
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header & Controls */}
      <div className="card-mice p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold font-heading text-slate-900 tracking-tight">
              Research Notes
            </h2>
            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 text-xs font-semibold px-2.5 py-0.5">
              {notes.length} Notes
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Notes and observations strictly associated with Research ID:{" "}
            <span className="font-mono font-semibold text-slate-700">{project.id}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onToggleStageCompletion && (
            <StageCompletionButton
              stageName="Methodology"
              isCompleted={isStageCompleted}
              onToggle={onToggleStageCompletion}
            />
          )}
          <Button
            onClick={handleOpenNewNote}
            size="sm"
            className="btn-interactive bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold h-9 px-3.5 rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Note</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar & Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes in this research by title, content, or tags..."
            className="pl-10 h-10 bg-white border-slate-200/80 text-xs rounded-xl shadow-2xs focus-visible:ring-teal-600/20"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 overflow-x-auto no-scrollbar scroll-snap-x">
          {["all", "methodology", "literature", "observation", "idea", "general"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize shrink-0 scroll-snap-align-start transition-all duration-150 touch-target-44 flex items-center ${
                selectedCategory === cat
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-mice p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="skeleton-shimmer h-4 w-24" />
                <div className="skeleton-shimmer h-4 w-12" />
              </div>
              <div className="skeleton-shimmer h-5 w-3/4" />
              <div className="space-y-2">
                <div className="skeleton-shimmer h-3 w-full" />
                <div className="skeleton-shimmer h-3 w-5/6" />
                <div className="skeleton-shimmer h-3 w-4/6" />
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <div className="skeleton-shimmer h-4 w-20" />
                <div className="skeleton-shimmer h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => handleOpenEditNote(note)}
              className={`card-mice card-mice-hover p-5 sm:p-6 transition-all duration-200 space-y-3.5 flex flex-col justify-between cursor-pointer ${
                note.pinned
                  ? "border-teal-300 ring-1 ring-teal-200/40 bg-teal-50/15"
                  : ""
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getCategoryColor(
                        note.category
                      )}`}
                    >
                      {note.category}
                    </span>
                    {note.pinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        <Pin className="w-2.5 h-2.5 fill-teal-600" />
                        Pinned
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(note);
                      }}
                      className={`p-2 rounded-lg transition-colors touch-target-44 flex items-center justify-center ${
                        note.pinned
                          ? "text-teal-700 bg-teal-50"
                          : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      }`}
                      title={note.pinned ? "Unpin note" : "Pin note"}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditNote(note);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-target-44 flex items-center justify-center"
                      title="Edit note"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id, note.title);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors touch-target-44 flex items-center justify-center"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold font-heading text-slate-900 leading-snug">
                  {note.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-5 font-normal">
                  {note.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100/90 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-slate-100/80 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium"
                    >
                      <Tag className="w-2.5 h-2.5 text-slate-400" />
                      {t}
                    </span>
                  ))}
                </div>

                <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {new Date(note.updated_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-mice p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold font-heading text-slate-800">No Notes Recorded</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Document research observations, methodological nuances, or theoretical ideas specifically for this research inquiry.
          </p>
          <Button
            onClick={handleOpenNewNote}
            size="sm"
            className="btn-interactive bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold h-9 rounded-xl shadow-xs"
          >
            Create First Note
          </Button>
        </div>
      )}

      {/* Editor Modal: Full-screen on mobile, centered on desktop */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-white md:bg-slate-900/40 md:backdrop-blur-xs flex md:items-center md:justify-center p-0 md:p-4 overflow-y-auto">
          <div className="bg-white md:rounded-2xl max-w-xl w-full h-full md:h-auto min-h-full md:min-h-0 p-4 sm:p-6 shadow-2xl flex flex-col justify-between border-0 md:border border-slate-200/80 animate-fade-slide overflow-y-auto">
            <form onSubmit={handleSaveNote} className="flex flex-col h-full space-y-4">
              {/* Sticky Header with Back / Cancel and Save */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0 sticky top-0 bg-white z-10">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#536DFE] hover:text-[#243B64] transition-colors p-1.5 -ml-1 rounded-lg hover:bg-slate-100 touch-target-44 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Cancel</span>
                </button>

                <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900 truncate max-w-[180px]">
                  {editingNoteId ? "Edit Note" : "New Note"}
                </h3>

                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#243B64] hover:bg-[#1D3154] text-white text-xs font-semibold rounded-lg h-8 px-3.5 shadow-2xs touch-target-44 cursor-pointer"
                >
                  Save Note
                </Button>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Note Title *</label>
                  <Input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Swin Transformer Feature Map Analysis"
                    className="text-xs mt-1 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ResearchNote["category"])}
                      className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white mt-1"
                    >
                      <option value="methodology">Methodology</option>
                      <option value="literature">Literature Review</option>
                      <option value="observation">Observation</option>
                      <option value="idea">Hypothesis / Idea</option>
                      <option value="general">General Note</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Tags (comma-separated)</label>
                    <Input
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="e.g. Attention, Benchmark, Edge"
                      className="text-xs mt-1 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-h-[180px] sm:min-h-[220px]">
                  <label className="text-xs font-semibold text-slate-700">Note Content *</label>
                  <textarea
                    rows={8}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write detailed notes, observations, mathematical proofs, or paper takeaways..."
                    className="w-full flex-1 text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none leading-relaxed mt-1 resize-y"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Pin to top of research workspace</span>
                  </label>
                </div>
              </div>

              {/* Bottom Sticky Action Bar for Mobile & Desktop */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 shrink-0 sticky bottom-0 bg-white z-10 pb-safe">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditorOpen(false)}
                  className="text-xs rounded-xl border-slate-200 touch-target-44"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#243B64] hover:bg-[#1D3154] text-white text-xs font-semibold rounded-xl h-10 px-5 shadow-2xs touch-target-44"
                >
                  Save Note
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Floating Action Button (FAB): + Add Note */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        <Button
          onClick={handleOpenNewNote}
          className="h-14 px-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-heading font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 border border-blue-500/20 active:scale-95 touch-target-44"
          aria-label="Add Note"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-sm">Add Note</span>
        </Button>
      </div>
    </div>
  );
}
