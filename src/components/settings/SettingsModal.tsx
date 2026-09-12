import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Key, Server, Cpu, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [baseUrl, setBaseUrl] = useState("https://api.openai.com/v1");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setApiKey(localStorage.getItem("autonomous_scientist_llm_key") || "");
      setProvider(localStorage.getItem("autonomous_scientist_llm_provider") || "openai");
      setModel(localStorage.getItem("autonomous_scientist_llm_model") || "gpt-4o-mini");
      setBaseUrl(localStorage.getItem("autonomous_scientist_llm_baseurl") || "https://api.openai.com/v1");
    }
  }, [isOpen]);

  const handleProviderChange = (val: string) => {
    setProvider(val);
    if (val === "openai") {
      setBaseUrl("https://api.openai.com/v1");
      setModel("gpt-4o-mini");
    } else if (val === "groq") {
      setBaseUrl("https://api.groq.com/openai/v1");
      setModel("llama-3.3-70b-versatile");
    } else if (val === "openrouter") {
      setBaseUrl("https://openrouter.ai/api/v1");
      setModel("google/gemini-2.5-flash");
    } else if (val === "gemini") {
      setBaseUrl("https://generativelanguage.googleapis.com/v1beta/openai");
      setModel("gemini-1.5-flash");
    }
  };

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("autonomous_scientist_llm_key", apiKey.trim());
      localStorage.setItem("autonomous_scientist_llm_provider", provider);
      localStorage.setItem("autonomous_scientist_llm_model", model.trim());
      localStorage.setItem("autonomous_scientist_llm_baseurl", baseUrl.trim());
    }
    toast.success("AI Service Configuration saved!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white border-slate-200 text-slate-900 rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">AI Engine & API Configuration</DialogTitle>
              <DialogDescription className="text-slate-500 text-xs">
                Configure LLM endpoints for paper analysis, gap detection, hypothesis generation, and chat.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-3">
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-blue-800">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Smart Resilience Mode Active</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              If a custom API key is not entered, the application smoothly utilizes built-in scientific inference models with zero crashes.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">LLM Provider</Label>
            <Select value={provider} onValueChange={handleProviderChange}>
              <SelectTrigger className="bg-white border-slate-200 text-slate-900 h-10 text-xs">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900 text-xs">
                <SelectItem value="openai">OpenAI (GPT-4o, GPT-4o-mini)</SelectItem>
                <SelectItem value="gemini">Google Gemini (Gemini 2.5 Flash / 1.5 Flash)</SelectItem>
                <SelectItem value="groq">Groq (Llama-3.3 70B, Ultra-Fast)</SelectItem>
                <SelectItem value="openrouter">OpenRouter (Multi-Model Gateway)</SelectItem>
                <SelectItem value="custom">Custom OpenAI-Compatible Server / Ollama</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-600" />
              <span>API Key (Optional for Custom Models)</span>
            </Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-... or gsk_..."
              className="bg-white border-slate-200 text-slate-900 text-xs h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>Model Name</span>
              </Label>
              <Input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gpt-4o-mini"
                className="bg-white border-slate-200 text-slate-900 text-xs h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-blue-600" />
                <span>Base URL</span>
              </Label>
              <Input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="bg-white border-slate-200 text-slate-900 text-xs h-10"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 px-4 rounded-lg shadow-xs"
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
