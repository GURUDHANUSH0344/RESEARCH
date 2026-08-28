import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Sparkles,
  Award,
  Hash,
  Layers,
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
  AreaChart,
  Area,
} from "recharts";
import { type NormalizedPaper } from "@/lib/services/openalex";

interface ResearchTrendsProps {
  papers: NormalizedPaper[];
}

export function ResearchTrends({ papers }: ResearchTrendsProps) {
  if (!papers || papers.length === 0) {
    return (
      <div className="card-scientific text-center py-16 bg-white p-6 max-w-4xl mx-auto">
        <TrendingUp className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-900">No Bibliometric Analytics Available</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Start autonomous research to generate publication volume trajectories, method distributions, and citation curves.
        </p>
      </div>
    );
  }

  // 1. Publications by Year
  const yearCounts: Record<number, number> = {};
  papers.forEach((p) => {
    const y = p.year || 2024;
    yearCounts[y] = (yearCounts[y] || 0) + 1;
  });
  const publicationsByYear = Object.entries(yearCounts)
    .map(([year, count]) => ({ year: Number(year), count }))
    .sort((a, b) => a.year - b.year);

  // 2. Methodology & Concept Distribution
  const conceptCounts: Record<string, number> = {};
  papers.forEach((p) => {
    p.concepts?.forEach((c) => {
      conceptCounts[c] = (conceptCounts[c] || 0) + 1;
    });
  });
  const conceptDistribution = Object.entries(conceptCounts)
    .map(([concept, count]) => ({ concept, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  // 3. Citations by Top Papers
  const topCitedPapers = [...papers]
    .sort((a, b) => (b.citation_count || 0) - (a.citation_count || 0))
    .slice(0, 6)
    .map((p) => ({
      name: p.title.slice(0, 22) + "...",
      citations: p.citation_count || 0,
      fullTitle: p.title,
    }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="card-scientific p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              RESEARCH TRENDS & BIBLIOMETRICS
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {papers.length} Publications Analyzed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quantitative bibliometric patterns: temporal trajectories, architectural paradigm distributions, and citation impact.
          </p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Publications by Year */}
        <div className="card-scientific p-6 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Publication Volume Trajectory by Year</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Temporal Growth</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={publicationsByYear} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="yearGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="year" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E2E8F0",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#0F172A",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Publications"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#yearGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Methodology & Concept Frequency */}
        <div className="card-scientific p-6 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase">
              <Hash className="w-4 h-4 text-teal-600" />
              <span>Core Methodology & Concept Frequency</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">AI Concepts</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={conceptDistribution}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" stroke="#64748B" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="concept" type="category" stroke="#64748B" fontSize={10} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E2E8F0",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#0F172A",
                  }}
                />
                <Bar dataKey="count" name="Frequency" fill="#00A99D" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Cited Papers */}
        <div className="card-scientific p-6 bg-white space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Citation Impact Ranking across Analyzed Corpus</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Semantic Scholar Verified</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCitedPapers} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E2E8F0",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#0F172A",
                  }}
                />
                <Bar dataKey="citations" name="Citations" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
