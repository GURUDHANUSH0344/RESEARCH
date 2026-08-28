import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Copy,
  Check,
  Download,
  Printer,
  Sparkles,
  Share2,
  FileDown,
  FileCode,
} from "lucide-react";
import { toast } from "sonner";

interface ResearchReportViewerProps {
  reportContent?: string | null;
  projectTitle?: string;
}

export function ResearchReportViewer({
  reportContent,
  projectTitle = "Research Proposal Report",
}: ResearchReportViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!reportContent) return;
    navigator.clipboard.writeText(reportContent);
    setCopied(true);
    toast.success("Scientific report copied to clipboard in Markdown format!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!reportContent) return;
    const blob = new Blob([reportContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectTitle.replace(/[^a-zA-Z0-9]/g, "_")}_Research_Report.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded as Markdown (.md)!");
  };

  const handleDownloadPDF = () => {
    if (!reportContent) return;

    // Convert markdown paragraphs into HTML for academic PDF formatting
    const formattedHtml = reportContent
      .split("\n\n")
      .map((paragraph) => {
        const trimmed = paragraph.trim();
        if (trimmed.startsWith("# ")) {
          return `<h1 style="font-size: 22pt; font-weight: 800; color: #0f172a; margin-top: 24pt; margin-bottom: 12pt; border-bottom: 2pt solid #0284c7; padding-bottom: 6pt;">${trimmed.replace("# ", "")}</h1>`;
        }
        if (trimmed.startsWith("## ")) {
          return `<h2 style="font-size: 16pt; font-weight: 700; color: #0369a1; margin-top: 18pt; margin-bottom: 8pt; border-bottom: 1pt solid #cbd5e1; padding-bottom: 4pt;">${trimmed.replace("## ", "")}</h2>`;
        }
        if (trimmed.startsWith("### ")) {
          return `<h3 style="font-size: 13pt; font-weight: 600; color: #334155; margin-top: 14pt; margin-bottom: 6pt;">${trimmed.replace("### ", "")}</h3>`;
        }
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split("\n").map((it) => `<li style="margin-bottom: 4pt;">${it.replace(/^[-*]\s*/, "")}</li>`).join("");
          return `<ul style="padding-left: 20pt; margin-bottom: 12pt; color: #334155; line-height: 1.6;">${items}</ul>`;
        }
        if (trimmed.startsWith("---")) {
          return `<hr style="border: 0; border-top: 1pt solid #e2e8f0; margin: 18pt 0;" />`;
        }
        return `<p style="font-size: 10.5pt; line-height: 1.65; color: #1e293b; margin-bottom: 10pt; text-align: justify;">${trimmed}</p>`;
      })
      .join("\n");

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      // Fallback: trigger standard window.print()
      window.print();
      return;
    }

    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const docContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${projectTitle} - Scientific Report</title>
        <style>
          @page {
            size: A4;
            margin: 20mm 18mm 20mm 18mm;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none; }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 24px;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
          }
          .header-badge {
            display: inline-block;
            background: #f0f9ff;
            color: #0369a1;
            border: 1px solid #bae6fd;
            border-radius: 9999px;
            padding: 4px 12px;
            font-size: 9pt;
            font-weight: 600;
            margin-bottom: 12px;
          }
          .meta-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 24px;
            font-size: 9pt;
            color: #64748b;
          }
          .footer-note {
            margin-top: 36px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            font-size: 8pt;
            color: #94a3b8;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header-badge">🔬 THE AUTONOMOUS RESEARCH SCIENTIST</div>
        <div class="meta-box">
          <strong>Document:</strong> Peer-Reviewed Scientific Research Proposal &bull; 
          <strong>Date:</strong> ${currentDate} &bull; 
          <strong>Status:</strong> Verified Evidence-Driven Synthesis
        </div>
        <div>
          ${formattedHtml}
        </div>
        <div class="footer-note">
          Synthesized by The Autonomous Research Scientist Engine &bull; From Research Questions to Evidence-Driven Discoveries
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(docContent);
    printWindow.document.close();
    toast.success("Opening PDF print & download dialog...");
  };

  if (!reportContent) {
    return (
      <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl max-w-4xl mx-auto">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-200">No Research Report Generated</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Execute the autonomous research pipeline to synthesize a full peer-ready academic proposal and literature review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Scientific Synthesis Report</h1>
            <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/40 text-xs">
              Peer-Ready Document
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete formal research proposal, literature review, gap proofs, and reproducible experiment plan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleCopy}
            size="sm"
            variant="outline"
            className="border-slate-700 bg-slate-900 text-slate-200 text-xs h-9 flex items-center gap-1.5 hover:bg-slate-800"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Markdown"}</span>
          </Button>

          <Button
            onClick={handleDownloadMarkdown}
            size="sm"
            variant="outline"
            className="border-slate-700 bg-slate-900 text-slate-200 text-xs h-9 flex items-center gap-1.5 hover:bg-slate-800"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export .MD</span>
          </Button>

          {/* Primary Download PDF Action */}
          <Button
            onClick={handleDownloadPDF}
            size="sm"
            className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-semibold h-9 px-4 flex items-center gap-1.5 shadow-md shadow-sky-500/20"
          >
            <FileDown className="w-4 h-4" />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>

      {/* Styled Markdown Document Viewer */}
      <Card className="bg-slate-950 border-slate-800 shadow-2xl overflow-hidden print:bg-white print:text-black">
        <CardContent className="p-8 md:p-12 space-y-6 text-slate-200 leading-relaxed font-sans text-xs md:text-sm">
          <div className="prose prose-invert max-w-none space-y-4">
            {reportContent.split("\n\n").map((paragraph, index) => {
              const trimmed = paragraph.trim();

              if (trimmed.startsWith("# ")) {
                return (
                  <h1 key={index} className="text-xl md:text-2xl font-black text-white border-b border-slate-800 pb-2">
                    {trimmed.replace("# ", "")}
                  </h1>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h2 key={index} className="text-lg md:text-xl font-bold text-sky-300 pt-3 border-b border-slate-800/60 pb-1.5">
                    {trimmed.replace("## ", "")}
                  </h2>
                );
              }
              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={index} className="text-sm md:text-base font-bold text-indigo-300 pt-2">
                    {trimmed.replace("### ", "")}
                  </h3>
                );
              }
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                const items = trimmed.split("\n");
                return (
                  <ul key={index} className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
                    {items.map((it, i) => (
                      <li key={i}>{it.replace(/^[-*]\s*/, "")}</li>
                    ))}
                  </ul>
                );
              }
              if (trimmed.startsWith("---")) {
                return <hr key={index} className="border-slate-800 my-4" />;
              }

              return (
                <p key={index} className="text-slate-300 leading-relaxed text-xs md:text-sm">
                  {trimmed}
                </p>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
