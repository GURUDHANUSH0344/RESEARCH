/**
 * 📊 Experiment Result Analyzer Service
 * Parses CSV/JSON tabular benchmark results, auto-detects metrics,
 * computes statistical aggregates, and prepares chart series.
 */

export interface ParsedMetricData {
  fileName: string;
  rowCount: number;
  columns: string[];
  numericColumns: string[];
  categoricalColumns: string[];
  metrics: {
    name: string;
    mean: number;
    std: number;
    min: number;
    max: number;
    median: number;
  }[];
  chartSeries: Record<string, unknown>[];
  rawRows: Record<string, unknown>[];
}

/**
 * Parses raw CSV text into array of object records
 */
export function parseCSV(csvText: string): Record<string, unknown>[] {
  const lines = csvText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  // Parse header
  const firstLine = lines[0] || "";
  const headers = firstLine.split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
  const rows: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i] || "";
    // Simple comma split respecting double quotes
    const values: string[] = [];
    let insideQuote = false;
    let currentVal = "";

    for (let c = 0; c < rawLine.length; c++) {
      const char = rawLine[c] || "";
      if (char === '"' || char === "'") {
        insideQuote = !insideQuote;
      } else if (char === "," && !insideQuote) {
        values.push(currentVal.trim());
        currentVal = "";
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim());

    const rowObj: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      const val = values[index] ?? "";
      const num = Number(val);
      rowObj[header] = !isNaN(num) && val !== "" ? num : val;
    });
    rows.push(rowObj);
  }

  return rows;
}

/**
 * Analyzes tabular data to extract columns, calculate aggregates, and build metric objects
 */
export function analyzeExperimentData(fileName: string, rows: Record<string, unknown>[]): ParsedMetricData {
  if (rows.length === 0 || !rows[0]) {
    return {
      fileName,
      rowCount: 0,
      columns: [],
      numericColumns: [],
      categoricalColumns: [],
      metrics: [],
      chartSeries: [],
      rawRows: [],
    };
  }

  const columns = Object.keys(rows[0] || {});
  const numericColumns: string[] = [];
  const categoricalColumns: string[] = [];

  columns.forEach((col) => {
    const isNum = rows.some((r) => typeof r[col] === "number");
    if (isNum) {
      numericColumns.push(col);
    } else {
      categoricalColumns.push(col);
    }
  });

  const metrics = numericColumns.map((col) => {
    const vals = rows.map((r) => Number(r[col])).filter((v) => !isNaN(v));
    vals.sort((a, b) => a - b);

    const count = vals.length;
    const sum = vals.reduce((acc, v) => acc + v, 0);
    const mean = count > 0 ? sum / count : 0;
    const variance = count > 1 ? vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (count - 1) : 0;
    const std = Math.sqrt(variance);
    const min = count > 0 ? (vals[0] ?? 0) : 0;
    const max = count > 0 ? (vals[count - 1] ?? 0) : 0;
    const median = count > 0 ? (vals[Math.floor(count / 2)] ?? 0) : 0;

    return {
      name: col,
      mean: Number(mean.toFixed(4)),
      std: Number(std.toFixed(4)),
      min: Number(min.toFixed(4)),
      max: Number(max.toFixed(4)),
      median: Number(median.toFixed(4)),
    };
  });

  // Prepare chart series: assign an index or use first categorical column as label
  const labelCol = categoricalColumns[0];
  const chartSeries = rows.slice(0, 50).map((r, idx) => ({
    name: labelCol && r[labelCol] ? String(r[labelCol]) : `Sample ${idx + 1}`,
    ...r,
  }));

  return {
    fileName,
    rowCount: rows.length,
    columns,
    numericColumns,
    categoricalColumns,
    metrics,
    chartSeries,
    rawRows: rows,
  };
}

/**
 * Generates sample synthetic crop disease experiment benchmark for 1-click test
 */
export function getSampleExperimentCSV(): string {
  return `Model,Epoch,Accuracy,Precision,Recall,F1_Score,Inference_Latency_ms,Params_M
ResNet-50 Baseline,100,0.914,0.908,0.912,0.910,88.4,25.6
MobileNetV3-Large,100,0.892,0.885,0.890,0.887,24.1,5.4
Swin-Transformer-Tiny,100,0.938,0.932,0.935,0.933,142.5,28.3
ConvNeXt-Femto,100,0.921,0.918,0.920,0.919,38.2,5.2
AgriEdge-Net (Proposed),100,0.965,0.962,0.964,0.963,32.4,3.2
AgriEdge-Net + Decoupling,100,0.978,0.975,0.977,0.976,33.1,3.4`;
}
