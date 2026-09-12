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
} from "lucide-react";
import { toast } from "sonner";

interface ResearchNotesTabProps {
  project: ResearchProject;
  onNotesChanged?: (count: number) => void;
}

export function ResearchNotesTab({ project, onNotesChanged }: ResearchNotesTabProps) {
  const [notes, setNotes] = useState<ResearchNote[]>([]);
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
    const data = await workspaceService.getNotes(project.id);
    setNotes(data);
    onNotesChanged?.(data.length);
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
        toast.success("Note created in research workspace");
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
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "literature":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "observation":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "idea":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Research Notes
            </h2>
            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
              {notes.length} Notes
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Notes strictly associated with Research ID:{" "}
            <span className="font-mono font-semibold text-slate-700">{project.id}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenNewNote}
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold h-9 px-3.5 rounded-xl shadow-xs flex items-center gap-1.5"
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
            className="pl-10 h-10 bg-white border-slate-200 text-xs rounded-xl shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {["all", "methodology", "literature", "observation", "idea", "general"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                selectedCategory === cat
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`bg-white rounded-2xl p-6 border shadow-xs transition-all space-y-3 flex flex-col justify-between ${
                note.pinned
                  ? "border-teal-300 ring-1 ring-teal-200/50 bg-teal-50/10"
                  : "border-slate-200/80 hover:border-slate-300"
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

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePin(note)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        note.pinned
                          ? "text-teal-600 bg-teal-50"
                          : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                      }`}
                      title={note.pinned ? "Unpin note" : "Pin note"}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditNote(note)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit note"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id, note.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {note.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-6">
                  {note.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium"
                    >
                      <Tag className="w-2.5 h-2.5 text-slate-400" />
                      {t}
                    </span>
                  ))}
                </div>

                <span className="flex items-center gap-1 text-[10px]">
                  <Clock className="w-3 h-3" />
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
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Notes Recorded</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Document research observations, methodological nuances, or theoretical ideas specifically for this research inquiry.
          </p>
          <Button
            onClick={handleOpenNewNote}
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold h-9 rounded-xl shadow-xs"
          >
            Create First Note
          </Button>
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              {editingNoteId ? "Edit Research Note" : "New Research Note"}
            </h3>

            <form onSubmit={handleSaveNote} className="space-y-4">
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

              <div className="grid grid-cols-2 gap-3">
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

              <div>
                <label className="text-xs font-semibold text-slate-700">Note Content *</label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write detailed notes, observations, mathematical proofs, or paper takeaways..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:outline-none mt-1"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Pin to top of research workspace</span>
                </label>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditorOpen(false)}
                    className="text-xs rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl"
                  >
                    Save Note
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
