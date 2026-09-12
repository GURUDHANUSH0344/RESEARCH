import React, { useState, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Network,
  BookOpen,
  Search,
  Lightbulb,
  TestTube,
  Sparkles,
  Info,
  Maximize2,
  Cpu,
  Database,
} from "lucide-react";
import { type ResearchProjectData } from "@/lib/services/orchestrator";

interface ResearchKnowledgeGraphProps {
  project: ResearchProjectData | null;
}

export function ResearchKnowledgeGraph({ project }: ResearchKnowledgeGraphProps) {
  const [selectedNodeData, setSelectedNodeData] = useState<{
    label: string;
    type: string;
    description?: string;
    meta?: string;
  } | null>(null);

  // Build Graph Nodes & Edges dynamically from the research project
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!project) {
      return { initialNodes: [], initialEdges: [] };
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // 1. Root Node: Research Question (Primary Scientific Navy)
    nodes.push({
      id: "root",
      type: "input",
      data: {
        label: `🔬 ${project.research_question}`,
        type: "Research Question",
        description: `Primary research inquiry: "${project.research_question}"`,
      },
      position: { x: 400, y: 20 },
      style: {
        background: "#123B63",
        color: "#FFFFFF",
        borderColor: "#2563EB",
        borderWidth: "1.5px",
        borderRadius: "12px",
        padding: "12px 16px",
        fontWeight: "700",
        fontSize: "12px",
        width: 320,
        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
      },
    });

    // 2. Paper Nodes (Blue Literature Color)
    const papers = project.papers.slice(0, 3);
    papers.forEach((p, i) => {
      const paperNodeId = `paper_${i}`;
      const xPos = 100 + i * 310;
      const yPos = 140;

      nodes.push({
        id: paperNodeId,
        data: {
          label: `📄 ${p.title.slice(0, 35)}...`,
          type: "Paper",
          description: p.abstract,
          meta: `Authors: ${p.authors.slice(0, 2).join(", ")} | Year: ${p.year} | Citations: ${p.citation_count}`,
        },
        position: { x: xPos, y: yPos },
        style: {
          background: "#FFFFFF",
          color: "#0F172A",
          borderColor: "#2563EB",
          borderWidth: "1.5px",
          borderRadius: "10px",
          padding: "10px 14px",
          fontSize: "11px",
          fontWeight: "600",
          width: 250,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        },
      });

      edges.push({
        id: `e_root_${paperNodeId}`,
        source: "root",
        target: paperNodeId,
        animated: true,
        style: { stroke: "#2563EB", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#2563EB" },
      });

      // 3. Method & Dataset sub-nodes
      if (p.concepts && p.concepts.length > 0) {
        const conceptId = `concept_${i}`;
        nodes.push({
          id: conceptId,
          data: {
            label: `⚙️ ${p.concepts[0]}`,
            type: "Methodology",
            description: `Core architecture / method used in study.`,
          },
          position: { x: xPos + 10, y: yPos + 100 },
          style: {
            background: "#F0FDFA",
            color: "#0F766E",
            borderColor: "#00A99D",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "10px",
            fontWeight: "600",
            width: 180,
          },
        });

        edges.push({
          id: `e_${paperNodeId}_${conceptId}`,
          source: paperNodeId,
          target: conceptId,
          style: { stroke: "#00A99D", strokeDasharray: "4 4" },
        });
      }
    });

    // 4. Research Gap Node (Amber Warning / Conflict)
    if (project.gaps && project.gaps.length > 0) {
      const topGap = project.gaps[0];
      nodes.push({
        id: "gap_0",
        data: {
          label: `🔍 ${topGap.title.slice(0, 36)}...`,
          type: "Research Gap",
          description: topGap.description,
          meta: `Category: ${topGap.category} | Confidence: ${Math.round((topGap.confidence || 0.85) * 100)}%`,
        },
        position: { x: 420, y: 350 },
        style: {
          background: "#FFFBEB",
          color: "#92400E",
          borderColor: "#D97706",
          borderWidth: "1.5px",
          borderRadius: "10px",
          padding: "10px 14px",
          fontSize: "11px",
          fontWeight: "700",
          width: 280,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        },
      });

      papers.forEach((_, i) => {
        edges.push({
          id: `e_paper_${i}_gap`,
          source: `paper_${i}`,
          target: "gap_0",
          style: { stroke: "#D97706", strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#D97706" },
        });
      });
    }

    // 5. Hypothesis Node (AI Hypothesis Purple)
    if (project.hypotheses && project.hypotheses.length > 0) {
      const topHyp = project.hypotheses[0];
      nodes.push({
        id: "hyp_0",
        data: {
          label: `💡 H1: ${topHyp.statement.slice(0, 35)}...`,
          type: "Hypothesis",
          description: topHyp.statement,
          meta: `Score: ${topHyp.overall_score}/10 | Variables: ${topHyp.independent_variables}`,
        },
        position: { x: 420, y: 470 },
        style: {
          background: "#FAF5FF",
          color: "#6B21A8",
          borderColor: "#7C3AED",
          borderWidth: "1.5px",
          borderRadius: "10px",
          padding: "10px 14px",
          fontSize: "11px",
          fontWeight: "700",
          width: 280,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        },
      });

      edges.push({
        id: "e_gap_hyp",
        source: "gap_0",
        target: "hyp_0",
        animated: true,
        style: { stroke: "#7C3AED", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#7C3AED" },
      });
    }

    // 6. Experiment Node (Discovery Teal)
    if (project.experiment) {
      nodes.push({
        id: "exp_0",
        type: "output",
        data: {
          label: `🧪 8-Stage Protocol`,
          type: "Experiment",
          description: `Evaluation: ${project.experiment.metrics?.join(", ") || "Accuracy, F1"}`,
          meta: `Baselines: ${project.experiment.baselines?.join(", ") || "ResNet, ViT"}`,
        },
        position: { x: 450, y: 590 },
        style: {
          background: "#F0FDFA",
          color: "#0F766E",
          borderColor: "#00A99D",
          borderWidth: "1.5px",
          borderRadius: "10px",
          padding: "10px 14px",
          fontSize: "11px",
          fontWeight: "700",
          width: 220,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        },
      });

      edges.push({
        id: "e_hyp_exp",
        source: "hyp_0",
        target: "exp_0",
        style: { stroke: "#00A99D", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#00A99D" },
      });
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [project]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="card-scientific p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              SCIENTIFIC KNOWLEDGE GRAPH
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Interactive Ontology
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic relational topology: Research Question &rarr; Literature &rarr; Gaps &rarr; Hypotheses &rarr; Experiment Blueprint.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span> Papers
          </span>
          <span className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Gaps
          </span>
          <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
            <span className="w-2 h-2 rounded-full bg-purple-600"></span> Hypotheses
          </span>
          <span className="flex items-center gap-1.5 bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span> Experiments
          </span>
        </div>
      </div>

      {/* Graph Canvas Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 card-scientific bg-white h-[620px] rounded-2xl overflow-hidden relative shadow-xs">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_, node) => setSelectedNodeData(node.data as any)}
            fitView
          >
            <Background color="#CBD5E1" gap={20} size={1} />
            <Controls className="bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm" />
            <MiniMap
              nodeColor={(node) => {
                if (node.id === "root") return "#123B63";
                if (node.id.startsWith("paper")) return "#2563EB";
                if (node.id.startsWith("gap")) return "#D97706";
                if (node.id.startsWith("hyp")) return "#7C3AED";
                return "#00A99D";
              }}
              className="bg-white border border-slate-200 rounded-lg"
            />
          </ReactFlow>
        </div>

        {/* Node Property Inspector */}
        <div className="card-scientific p-5 bg-white space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Info className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Node Inspector
            </h2>
          </div>

          {selectedNodeData ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Entity Type</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedNodeData.type}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Label</span>
                <div className="text-xs font-medium text-slate-800 mt-0.5">
                  {selectedNodeData.label}
                </div>
              </div>

              {selectedNodeData.description && (
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Details</span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100 mt-1">
                    {selectedNodeData.description}
                  </p>
                </div>
              )}

              {selectedNodeData.meta && (
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Metadata</span>
                  <div className="text-[11px] font-mono text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                    {selectedNodeData.meta}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs space-y-1">
              <Sparkles className="w-6 h-6 text-slate-300 mx-auto mb-1" />
              <p className="font-semibold text-slate-600">No Node Selected</p>
              <p className="text-[11px] text-slate-400">Click any entity on the canvas to inspect connections and metadata.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
