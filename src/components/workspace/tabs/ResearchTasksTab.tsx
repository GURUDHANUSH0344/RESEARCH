import React, { useState, useEffect } from "react";
import { type ResearchProject, type ResearchTask } from "@/types/research";
import { workspaceService } from "@/lib/services/workspace-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Square,
  PlusCircle,
  Calendar,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface ResearchTasksTabProps {
  project: ResearchProject;
  onTasksChanged?: (counts: { total: number; completed: number }) => void;
}

export function ResearchTasksTab({ project, onTasksChanged }: ResearchTasksTabProps) {
  const [tasks, setTasks] = useState<ResearchTask[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<ResearchTask["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");

  const loadTasks = async () => {
    const data = await workspaceService.getTasks(project.id);
    setTasks(data);
    const completed = data.filter((t) => t.status === "completed").length;
    onTasksChanged?.({ total: data.length, completed });
  };

  useEffect(() => {
    loadTasks();
  }, [project.id]);

  const handleToggleTask = async (task: ResearchTask) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await workspaceService.updateTask(project.id, task.id, { status: newStatus });
      loadTasks();
      toast.success(newStatus === "completed" ? "Task marked complete" : "Task marked pending");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await workspaceService.createTask(project.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        status: "pending",
        priority,
        due_date: dueDate || undefined,
      });

      toast.success("Task added to research plan");
      setIsAddOpen(false);
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("medium");
      loadTasks();
    } catch {
      toast.error("Failed to add task");
    }
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (!confirm(`Delete task "${taskTitle}"?`)) return;
    try {
      await workspaceService.deleteTask(project.id, taskId);
      toast.success("Task deleted");
      loadTasks();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return t.status === "pending";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  const getPriorityStyle = (p: ResearchTask["priority"]) => {
    switch (p) {
      case "high":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "low":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header & Progress Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Research Tasks & Milestone Progress
              </h2>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {completedCount} / {tasks.length} Completed
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Action items and milestones isolated to Research ID:{" "}
              <span className="font-mono font-semibold text-slate-700">{project.id}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsAddOpen(true)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold h-9 px-3.5 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Research Progress Completion</span>
            <span className="text-purple-700 font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/60">
            <div
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === "pending" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            Pending ({tasks.length - completedCount})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === "completed" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === "completed";

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-4 md:p-5 border transition-all flex items-start justify-between gap-4 ${
                  isCompleted
                    ? "border-slate-200/60 bg-slate-50/50 opacity-80"
                    : "border-slate-200/80 hover:border-purple-200 shadow-xs"
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    onClick={() => handleToggleTask(task)}
                    className="mt-0.5 text-slate-400 hover:text-purple-600 transition-colors shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300 hover:text-purple-600" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <h3
                      className={`text-sm font-bold text-slate-900 leading-snug ${
                        isCompleted ? "line-through text-slate-500" : ""
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      <span
                        className={`font-bold uppercase tracking-wider px-2 py-0.2 rounded border text-[10px] ${getPriorityStyle(
                          task.priority
                        )}`}
                      >
                        {task.priority} Priority
                      </span>

                      {task.due_date && (
                        <span className="flex items-center gap-1 text-slate-500 font-medium">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Due: {task.due_date}
                        </span>
                      )}

                      {task.completed_at && (
                        <span className="text-emerald-700 font-medium">
                          Completed on {new Date(task.completed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleDeleteTask(task.id, task.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Tasks in this Filter</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Plan your research roadmap, experiments, and review milestones for this research project.
          </p>
          <Button
            onClick={() => setIsAddOpen(true)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold h-9 rounded-xl shadow-xs"
          >
            Create Task
          </Button>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Add Research Task</h3>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700">Task Title *</label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Conduct ablation study on attention module"
                  className="text-xs mt-1 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specific experiment details, parameters, or expectations..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:outline-none mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ResearchTask["priority"])}
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white mt-1"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Deadline</label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="text-xs mt-1 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl"
                >
                  Save Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
