import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartNoAxesCombined,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Table as TableIcon,
  Zap,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  parseCSV,
  analyzeExperimentData,
  getSampleExperimentCSV,
  type ParsedMetricData,
} from "@/lib/services/result-analyzer";
import { interpretExperimentResultsWithLLM, type ResultAnalysisInterpretation } from "@/lib/services/llm";
import { toast } from "sonner";

interface ExperimentResultAnalyzerProps {
  hypothesisText?: string;
}

export function ExperimentResultAnalyzer({ hypothesisText }: ExperimentResultAnalyzerProps) {
  const [data, setData] = useState<ParsedMetricData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [interpretation, setInterpretation] = useState<ResultAnalysisInterpretation | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const rows = parseCSV(text);
      const parsed = analyzeExperimentData(file.name, rows);
      setData(parsed);
      toast.success(`Parsed ${parsed.rowCount} rows from ${file.name}`);

      // Run grounded AI interpretation
      runAIInterpretation(parsed);
    };
    reader.readAsText(file);
  };

  const loadSampleBenchmark = () => {
    const csv = getSampleExperimentCSV();
    const rows = parseCSV(csv);
    const parsed = analyzeExperimentData("crop_disease_model_benchmark.csv", rows);
    setData(parsed);
    toast.success("Loaded AI Crop Disease benchmark dataset!");
    runAIInterpretation(parsed);
  };

  const runAIInterpretation = async (parsedData: ParsedMetricData) => {
    setIsAnalyzing(true);
    try {
      const metricsSummary: Record<string, unknown> = {};
      parsedData.metrics.forEach((m) => {
        metricsSummary[m.name] = { mean: m.mean, min: m.min, max: m.max, std: m.std };
      });

      const res = await interpretExperimentResultsWithLLM(
        metricsSummary,
        parsedData.rawRows.slice(0, 8),
        hypothesisText,
      );
      setInterpretation(res);
    } catch (e) {
      console.warn("AI result interpretation fallback:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="card-scientific p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ChartNoAxesCombined className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              EXPERIMENT RESULT ANALYZER
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Statistical Evaluation
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ingest real tabular benchmarks (.csv / .xlsx), compute statistical aggregates, and generate grounded AI conclusions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold h-9 px-3.5 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>UPLOAD CSV / XLSX</span>
            </div>
          </label>

          <Button
            onClick={loadSampleBenchmark}
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold h-9 px-3.5 rounded-lg shadow-xs flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Load Benchmark Data</span>
          </Button>
        </div>
      </div>

      {!data ? (
        <div className="card-scientific text-center py-16 bg-white p-8 max-w-2xl mx-auto space-y-4 border-2 border-dashed border-slate-200">
          <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Upload Experimental Results</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Upload evaluation runs containing columns like Accuracy, F1, Loss, Latency, Precision, or Recall.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <label className="cursor-pointer">
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              <div className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs">
                Browse CSV File
              </div>
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSampleBenchmark}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Load AI Crop Benchmark
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {data.metrics.slice(0, 4).map((m) => (
              <div key={m.name} className="card-scientific p-4 bg-white space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase truncate block">
                  {m.name}
                </span>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {m.mean.toFixed(3)}
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between font-mono pt-1">
                  <span>Std: &plusmn;{m.std.toFixed(3)}</span>
                  <span>Max: {m.max.toFixed(3)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Graphical Visualization */}
          <div className="card-scientific p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Model Metric Distribution & Comparison
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-500">{data.fileName}</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.rawRows.slice(0, 8)}
                  margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey={data.headers[0] || "model"}
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis stroke="#64748B" fontSize={11} domain={[0, "auto"]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E2E8F0",
                      borderRadius: "10px",
                      fontSize: "12px",
                      color: "#0F172A",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  {data.metrics.slice(0, 3).map((m, idx) => (
                    <Bar
                      key={m.name}
                      dataKey={m.name}
                      fill={idx === 0 ? "#2563EB" : idx === 1 ? "#00A99D" : "#7C3AED"}
                      radius={[6, 6, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grounded AI Statistical Interpretation */}
          {interpretation && (
            <div className="card-scientific p-6 bg-white border-l-4 border-l-teal-500 space-y-3">
              <div className="flex items-center gap-2 text-teal-800 font-bold uppercase text-xs">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Grounded AI Statistical Interpretation</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Key Finding</span>
                  <p className="text-slate-900 font-medium leading-relaxed">
                    {interpretation.key_findings}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Hypothesis Validation Status</span>
                  <p className="text-teal-800 font-medium leading-relaxed">
                    {interpretation.hypothesis_verification}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Raw Tabular Ingestion Preview */}
          <div className="card-scientific bg-white overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold text-slate-900 uppercase">
                  Raw Ingested Dataset Preview ({data.rowCount} rows)
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold text-[10px]">
                    {data.headers.map((h, i) => (
                      <th key={i} className="py-2.5 px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data.rawRows.slice(0, 10).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50">
                      {data.headers.map((h, cIdx) => (
                        <td key={cIdx} className="py-2 px-4 whitespace-nowrap">
                          {String(row[h] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
