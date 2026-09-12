import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { type ResearchProject } from "@/types/research";

interface DeleteResearchDialogProps {
  project: ResearchProject | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteResearchDialog({
  project,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteResearchDialogProps) {
  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border-slate-200 text-slate-900 rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-2xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Delete Research Project?
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-xs mt-0.5">
                This action is permanent and cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs text-slate-600">
          <p>
            You are about to permanently delete:
            <br />
            <strong className="text-slate-900 text-sm font-bold block mt-1">
              &ldquo;{project.title}&rdquo;
            </strong>
            <span className="font-mono text-[11px] text-slate-500">ID: {project.id}</span>
          </p>

          <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-100 text-rose-800 space-y-1 text-xs">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Cascading Deletion Guarantee</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              All data associated with this Research ID will be permanently removed, including:
            </p>
            <ul className="list-disc list-inside text-[11px] pl-1 space-y-0.5">
              <li>{project.papers?.length || 0} Collected Research Papers</li>
              <li>All isolated Research Notes and Tags</li>
              <li>Documented Key Findings and Evidence Gaps</li>
              <li>Active & Completed Research Tasks</li>
              <li>AI Assistant conversation transcripts</li>
              <li>Chronological Activity Timeline records</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? "Deleting..." : "Permanently Delete"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
