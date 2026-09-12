import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Sprout, CheckCircle2, ArrowRight, ShieldCheck, Cpu } from "lucide-react";

interface CropDiseaseDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchDemo: () => void;
}

export function CropDiseaseDemoModal({
  isOpen,
  onClose,
  onLaunchDemo,
}: CropDiseaseDemoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-white border-slate-200 text-slate-900 rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-2xs">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold text-slate-900">
                  Featured Research Benchmark Demo
                </DialogTitle>
                <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold px-2 py-0.5 rounded">
                  Peer-Verified Topic
                </span>
              </div>
              <DialogDescription className="text-slate-500 text-xs">
                End-to-End AI Agriculture Discovery: From In-the-Wild Foliar Pathology to Edge Deployable Models.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs uppercase font-bold text-teal-700 tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-teal-600" />
              <span>Target Research Question</span>
            </div>
            <p className="text-sm font-bold text-slate-900 italic">
              &ldquo;How can AI improve crop disease detection?&rdquo;
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700">Autonomous Workflow Pipeline Stages:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900">1. Literature Retrieval</div>
                  <div className="text-[11px] text-slate-500">Queries OpenAlex for top peer-reviewed computer vision & agronomy papers</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900">2. Gap Discovery</div>
                  <div className="text-[11px] text-slate-500">Identifies the Lab vs In-the-Wild environmental generalization deficit</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900">3. Hypothesis Lab (H1)</div>
                  <div className="text-[11px] text-slate-500">Formulates Hybrid Conv-Attention + Background Decoupling for edge robustness</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900">4. Experiment Blueprint</div>
                  <div className="text-[11px] text-slate-500">Generates 8-step visual validation protocol, baselines & metrics</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-[11px] text-teal-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Grounded in Real Scholarly Metadata</span>
            </span>
            <span className="text-[10px] font-bold uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
              Ready for Jury
            </span>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                onClose();
                onLaunchDemo();
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold h-9 px-4 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <span>RUN BENCHMARK DISCOVERY</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
