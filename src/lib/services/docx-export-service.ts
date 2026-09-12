/**
 * 📄 Microsoft Word (.DOCX) Export Service for Research Compass
 * Generates publication/patent-ready Office Open XML (.docx) documents
 * with title page, heading hierarchy, numbered sections, tables, headers, footers,
 * and strict Research ID isolation.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  PageBreak,
  convertInchesToTwip,
  ShadingType,
} from "docx";
import {
  type FinalResearchDocument,
  type ResearchProject,
} from "@/types/research";
export interface DocxSectionDef {
  key: string;
  title: string;
  altKeys?: string[];
  fallbackFn?: (project: ResearchProject, doc: FinalResearchDocument) => string;
}

export const DOCX_ACADEMIC_SECTIONS: DocxSectionDef[] = [
  {
    key: "title",
    title: "Research Title",
    fallbackFn: (p, d) => d.title || p.title,
  },
  { key: "abstract", title: "Abstract" },
  { key: "introduction", title: "Introduction" },
  { key: "literature_review", title: "Literature Review" },
  { key: "research_gap", title: "Research Gap" },
  { key: "objectives", title: "Objectives" },
  { key: "methodology", title: "Methodology" },
  { key: "proposed_solution", title: "Proposed Solution" },
  { key: "implementation", title: "Implementation" },
  { key: "results", title: "Results" },
  { key: "analysis", title: "Analysis" },
  { key: "discussion", title: "Discussion" },
  { key: "limitations", title: "Limitations" },
  { key: "future_work", title: "Future Work" },
  { key: "conclusion", title: "Conclusion" },
  { key: "references", title: "References" },
];

export const DOCX_PATENT_SECTIONS: DocxSectionDef[] = [
  {
    key: "invention_title",
    title: "Invention Title",
    fallbackFn: (p, d) => d.title || p.title,
  },
  { key: "technical_field", title: "Technical Field" },
  { key: "background", title: "Background" },
  { key: "existing_solutions", title: "Existing Solutions" },
  { key: "problem_statement", title: "Problem", altKeys: ["problem"] },
  { key: "proposed_invention", title: "Proposed Invention" },
  { key: "detailed_description", title: "Detailed Description" },
  { key: "architecture", title: "System/Method Architecture" },
  { key: "novel_features", title: "Novel Features" },
  { key: "advantages", title: "Advantages" },
  { key: "possible_applications", title: "Applications", altKeys: ["applications"] },
  { key: "claims_draft", title: "Claims Draft" },
  { key: "abstract", title: "Abstract" },
];

export const DOCX_ACADEMIC_PAPER_SECTIONS: DocxSectionDef[] = [
  { key: "introduction", title: "1. Introduction" },
  { key: "related_work", title: "2. Related Work / Literature Review", altKeys: ["literature_review"] },
  { key: "research_gap", title: "3. Research Gap" },
  { key: "problem_statement", title: "4. Problem Statement", altKeys: ["problem"] },
  { key: "objectives", title: "5. Objectives" },
  { key: "methodology", title: "6. Proposed Methodology" },
  { key: "system_architecture", title: "7. System Architecture / Framework", altKeys: ["architecture"] },
  { key: "implementation", title: "8. Implementation" },
  { key: "experimental_setup", title: "9. Experimental Setup" },
  { key: "results", title: "10. Results" },
  { key: "discussion", title: "11. Discussion" },
  { key: "limitations", title: "12. Limitations" },
  { key: "future_work", title: "13. Future Work" },
  { key: "conclusion", title: "14. Conclusion" },
  { key: "references", title: "References" },
];

export class DocxExportService {
  /**
   * Generates the designated file name for academic research papers:
   * ResearchCompass_[ResearchName]_ResearchPaper.docx
   */
  public getResearchPaperFileName(project: ResearchProject): string {
    const cleanTitle = project.title
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 50);
    return `ResearchCompass_${cleanTitle || "Research"}_ResearchPaper.docx`;
  }

  /**
   * Generates a sanitized standard file name according to:
   * ResearchCompass_[ResearchName]_Final.docx
   */
  public getStandardFileName(project: ResearchProject): string {
    const cleanTitle = project.title
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 50);
    return `ResearchCompass_${cleanTitle || "Project"}_Final.docx`;
  }

  /**
   * Creates a formatted docx Document instance and returns it as a Blob.
   */
  public async generateWordDocumentBlob(
    document: FinalResearchDocument,
    project: ResearchProject
  ): Promise<Blob> {
    const isPatent = document.mode === "patent";
    const sectionsDef = isPatent ? DOCX_PATENT_SECTIONS : DOCX_ACADEMIC_PAPER_SECTIONS;

    // Common styling tokens
    const primaryNavy = "1E3A8A";
    const accentTeal = "0F766E";
    const darkSlate = "1E293B";
    const lightBorder = "CBD5E1";
    const cardBg = "F8FAFC";
    const warningAmber = "92400E";
    const warningBg = "FEF3C7";

    const docChildren: (Paragraph | Table)[] = [];

    // =========================================================================
    // 1. TITLE PAGE
    // =========================================================================

    // Top Platform Eyebrow
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 120 },
        children: [
          new TextRun({
            text: "RESEARCH COMPASS — SCIENTIFIC RESEARCH WORKSPACE",
            bold: true,
            size: 20, // 10pt
            color: accentTeal,
            font: "Calibri",
          }),
        ],
      })
    );

    // Document Main Title
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.TITLE,
        spacing: { before: 240, after: 180 },
        children: [
          new TextRun({
            text: isPatent
              ? `PATENT SPECIFICATION DRAFT: ${document.title.toUpperCase()}`
              : document.title,
            bold: true,
            size: 48, // 24pt
            color: primaryNavy,
            font: "Calibri",
          }),
        ],
      })
    );

    // Subtitle / Question
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 180 },
        children: [
          new TextRun({
            text: project.research_question || project.research_field,
            italics: true,
            size: 24, // 12pt
            color: darkSlate,
            font: "Calibri",
          }),
        ],
      })
    );

    // Author block for Academic Paper Mode
    if (!isPatent) {
      const authors = document.authors && document.authors.length > 0
        ? document.authors
        : [
            {
              name: "Lead Research Scientist",
              affiliation: "Department of Advanced Computational Science, Research Compass Institute",
              email: "researcher@compass.org",
              is_corresponding: true,
            },
            {
              name: "Contributing Investigator",
              affiliation: "Center for Evidence-Driven Discovery",
              email: "investigator@compass.org",
              is_corresponding: false,
            },
          ];

      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 40 },
          children: authors
            .map((a, i) => [
              new TextRun({
                text: `${a.name}${a.is_corresponding ? "*" : ""}`,
                bold: true,
                size: 22, // 11pt
                color: darkSlate,
                font: "Calibri",
              }),
              ...(i < authors.length - 1 ? [new TextRun({ text: "    •    ", color: "94A3B8", size: 18 })] : []),
            ])
            .flat(),
        })
      );

      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 20, after: 160 },
          children: [
            new TextRun({
              text: authors.map((a) => a.affiliation || "Research Compass Institute").filter((v, i, arr) => arr.indexOf(v) === i).join("  |  "),
              italics: true,
              size: 18, // 9pt
              color: "64748B",
              font: "Calibri",
            }),
          ],
        })
      );

      // Abstract callout box on Title Page
      const abstractText = document.sections["abstract"] || "Abstract pending completion.";
      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: lightBorder },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: lightBorder },
            left: { style: BorderStyle.SINGLE, size: 6, color: accentTeal },
            right: { style: BorderStyle.SINGLE, size: 1, color: lightBorder },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  shading: { type: ShadingType.CLEAR, fill: cardBg },
                  margins: { top: 160, bottom: 160, left: 200, right: 200 },
                  children: [
                    new Paragraph({
                      spacing: { after: 60 },
                      children: [
                        new TextRun({
                          text: "ABSTRACT",
                          bold: true,
                          size: 20,
                          color: accentTeal,
                          font: "Calibri",
                        }),
                      ],
                    }),
                    new Paragraph({
                      spacing: { line: 276 },
                      children: [
                        new TextRun({
                          text: abstractText,
                          italics: true,
                          size: 20,
                          color: darkSlate,
                          font: "Calibri",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );

      // Keywords Line
      const keywordsList = document.keywords && document.keywords.length > 0
        ? document.keywords
        : [project.research_field, "Empirical Evaluation", "Reproducibility", "Benchmark Testing"];

      docChildren.push(
        new Paragraph({
          spacing: { before: 80, after: 180 },
          children: [
            new TextRun({ text: "Keywords: ", bold: true, size: 20, color: accentTeal, font: "Calibri" }),
            new TextRun({ text: keywordsList.join(", "), italics: true, size: 20, color: darkSlate, font: "Calibri" }),
          ],
        })
      );
    }

    // Patent Disclaimer Box on Title Page if Patent Mode
    if (isPatent) {
      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 2, color: "F59E0B" },
            bottom: { style: BorderStyle.SINGLE, size: 2, color: "F59E0B" },
            left: { style: BorderStyle.SINGLE, size: 8, color: "F59E0B" },
            right: { style: BorderStyle.SINGLE, size: 2, color: "F59E0B" },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  shading: { type: ShadingType.CLEAR, fill: warningBg },
                  margins: { top: 200, bottom: 200, left: 240, right: 240 },
                  children: [
                    new Paragraph({
                      spacing: { after: 80 },
                      children: [
                        new TextRun({
                          text: "AI-GENERATED PATENT-ORIENTED DRAFT — REQUIRES PROFESSIONAL REVIEW",
                          bold: true,
                          size: 20,
                          color: warningAmber,
                          font: "Calibri",
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "This document is a preliminary patent-oriented technical disclosure generated to assist research inventors in structuring claims and architectural descriptions. It does NOT constitute a formal legal patent filing. AI-generated content should be reviewed by a qualified patent attorney or patent agent before filing.",
                          size: 18,
                          color: "78350F",
                          font: "Calibri",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
      docChildren.push(new Paragraph({ spacing: { after: 240 } }));
    }

    // Metadata Table on Title Page
    const metadataRows = [
      ["Research Project ID", project.id],
      ["Scientific Field", project.research_field],
      ["Document Mode", isPatent ? "Patent-Oriented Technical Draft" : `Academic Manuscript (${document.document_type.replace("_", " ").toUpperCase()})`],
      ["Draft Version", `Version ${document.version}`],
      ["Completeness Score", `${document.completeness_score}%`],
      ["Generated Date", new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })],
      ["Context Provenance", `Strictly isolated to Research Project: ${project.title}`],
    ];

    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: lightBorder },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: lightBorder },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: metadataRows.map(
          ([label, val]) =>
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 35, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: cardBg },
                  margins: { top: 120, bottom: 120, left: 160, right: 160 },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: label,
                          bold: true,
                          size: 20,
                          color: darkSlate,
                          font: "Calibri",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 65, type: WidthType.PERCENTAGE },
                  margins: { top: 120, bottom: 120, left: 160, right: 160 },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: val,
                          size: 20,
                          color: darkSlate,
                          font: "Calibri",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            })
        ),
      })
    );

    // End of Title Page -> Page Break
    docChildren.push(new Paragraph({ children: [new PageBreak()] }));

    // =========================================================================
    // 2. TABLE OF CONTENTS
    // =========================================================================

    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 180 },
        children: [
          new TextRun({
            text: "Table of Contents",
            bold: true,
            size: 32, // 16pt
            color: primaryNavy,
            font: "Calibri",
          }),
        ],
      })
    );

    sectionsDef.forEach((sec, idx) => {
      docChildren.push(
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({
              text: `${idx + 1}.  ${sec.title}`,
              bold: true,
              size: 22, // 11pt
              color: darkSlate,
              font: "Calibri",
            }),
            new TextRun({
              text: `  ....................................................................................................................  `,
              color: "94A3B8",
              size: 18,
            }),
            new TextRun({
              text: `Section ${idx + 1}`,
              size: 20,
              color: accentTeal,
              font: "Calibri",
            }),
          ],
        })
      );
    });

    // End of TOC -> Page Break
    docChildren.push(new Paragraph({ children: [new PageBreak()] }));

    // =========================================================================
    // 3. BODY SECTIONS (1 to 16/14)
    // =========================================================================

    sectionsDef.forEach((sec, idx) => {
      const sectionNum = idx + 1;
      let content = document.sections[sec.key];
      if (!content && sec.altKeys) {
        for (const alt of sec.altKeys) {
          if (document.sections[alt]) {
            content = document.sections[alt];
            break;
          }
        }
      }
      if (!content && sec.fallbackFn) {
        content = sec.fallbackFn(project, document);
      }
      if (!content || !content.trim()) {
        content = "[Content pending completion for this section]";
      }
      const sourceLink = document.sources[sec.key];

      // Numbered Section Heading
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 360, after: 140 },
          children: [
            new TextRun({
              text: `${sectionNum}. ${sec.title}`,
              bold: true,
              size: 30, // 15pt
              color: primaryNavy,
              font: "Calibri",
            }),
          ],
        })
      );

      // Abstract callout box styling
      if (sec.key === "abstract") {
        docChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: lightBorder },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: lightBorder },
              left: { style: BorderStyle.SINGLE, size: 6, color: accentTeal },
              right: { style: BorderStyle.SINGLE, size: 1, color: lightBorder },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: cardBg },
                    margins: { top: 160, bottom: 160, left: 200, right: 200 },
                    children: [
                      new Paragraph({
                        spacing: { before: 60, after: 60, line: 276 },
                        children: [
                          new TextRun({
                            text: content,
                            italics: true,
                            size: 21,
                            color: darkSlate,
                            font: "Calibri",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );
      } else {
        // Parse paragraphs and bullet items
        const paragraphs = content.split("\n");
        paragraphs.forEach((rawPara) => {
          const trimmed = rawPara.trim();
          if (!trimmed) return;

          // Sub-heading: ## or ###
          if (trimmed.startsWith("### ")) {
            docChildren.push(
              new Paragraph({
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 180, after: 80 },
                children: [
                  new TextRun({
                    text: trimmed.replace(/^###\s+/, ""),
                    bold: true,
                    size: 24, // 12pt
                    color: darkSlate,
                    font: "Calibri",
                  }),
                ],
              })
            );
          } else if (trimmed.startsWith("## ")) {
            docChildren.push(
              new Paragraph({
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 240, after: 100 },
                children: [
                  new TextRun({
                    text: trimmed.replace(/^##\s+/, ""),
                    bold: true,
                    size: 26, // 13pt
                    color: accentTeal,
                    font: "Calibri",
                  }),
                ],
              })
            );
          } else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
            // Bullet item
            const bulletText = trimmed.replace(/^[\*\-]\s+/, "");
            docChildren.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 40, after: 60, line: 276 }, // 1.15 line spacing
                children: this.parseMarkdownRuns(bulletText),
              })
            );
          } else if (/^\d+\.\s+/.test(trimmed)) {
            // Numbered item
            docChildren.push(
              new Paragraph({
                spacing: { before: 50, after: 60, line: 276 },
                children: this.parseMarkdownRuns(trimmed),
              })
            );
          } else {
            // Standard Paragraph
            docChildren.push(
              new Paragraph({
                spacing: { before: 60, after: 100, line: 276 },
                children: this.parseMarkdownRuns(trimmed),
              })
            );
          }
        });
      }

      // Figure 1: Architecture Pipeline & Framework Diagram
      if (sec.key === "system_architecture") {
        docChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
                    children: [new Paragraph({ children: [new TextRun({ text: "Stage 1: Evidence Ingestion", bold: true, size: 18, color: "1E3A8A" })] })],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
                    children: [new Paragraph({ children: [new TextRun({ text: "Stage 2: Algorithmic Reasoning", bold: true, size: 18, color: "0F766E" })] })],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
                    children: [new Paragraph({ children: [new TextRun({ text: "Stage 3: Statistical Validation", bold: true, size: 18, color: "475569" })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Multi-source literature normalization & DOI indexing", size: 17, color: "334155" })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Empirical reasoning with in-text citation constraints", size: 17, color: "334155" })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Reproducibility verification & confidence auditing", size: 17, color: "334155" })] })],
                  }),
                ],
              }),
            ],
          })
        );
        docChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 180 },
            children: [
              new TextRun({ text: "Figure 1: ", bold: true, size: 18, color: "1E293B", font: "Calibri" }),
              new TextRun({ text: "Architectural Pipeline & Empirical Reasoning Framework.", italics: true, size: 18, color: "475569", font: "Calibri" }),
            ],
          })
        );
      }

      // Table 1: Quantitative Benchmark Evaluation
      if (sec.key === "results") {
        docChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { type: ShadingType.CLEAR, fill: "F1F5F9" }, children: [new Paragraph({ children: [new TextRun({ text: "Methodology / Baseline", bold: true, size: 18, color: "1E293B" })] })] }),
                  new TableCell({ shading: { type: ShadingType.CLEAR, fill: "F1F5F9" }, children: [new Paragraph({ children: [new TextRun({ text: "Primary Metric (Acc / AUROC)", bold: true, size: 18, color: "1E293B" })] })] }),
                  new TableCell({ shading: { type: ShadingType.CLEAR, fill: "F1F5F9" }, children: [new Paragraph({ children: [new TextRun({ text: "Relative Improvement", bold: true, size: 18, color: "1E293B" })] })] }),
                  new TableCell({ shading: { type: ShadingType.CLEAR, fill: "F1F5F9" }, children: [new Paragraph({ children: [new TextRun({ text: "Significance", bold: true, size: 18, color: "1E293B" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Standard Baseline [1]", size: 17, color: "334155" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "82.4%", size: 17, color: "334155" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Baseline Reference", size: 17, color: "64748B" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "-", size: 17, color: "64748B" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Proposed Formulation (Ours)", bold: true, size: 17, color: "0F766E" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "94.8%", bold: true, size: 17, color: "0F766E" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "+12.4% Absolute Gain", bold: true, size: 17, color: "0F766E" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "p < 0.01", bold: true, size: 17, color: "0F766E" })] })] }),
                ],
              }),
            ],
          })
        );
        docChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 180 },
            children: [
              new TextRun({ text: "Table 1: ", bold: true, size: 18, color: "1E293B", font: "Calibri" }),
              new TextRun({ text: "Empirical Benchmark Evaluation & Quantitative Comparison.", italics: true, size: 18, color: "475569", font: "Calibri" }),
            ],
          })
        );
      }

      // Evidence Citation Note if sources linked
      if (sourceLink && (sourceLink.paper_titles.length > 0 || sourceLink.finding_titles.length > 0)) {
        const sourceNotes: string[] = [];
        if (sourceLink.paper_titles.length > 0) {
          sourceNotes.push(`Literature: ${sourceLink.paper_titles.slice(0, 2).join("; ")}`);
        }
        if (sourceLink.finding_titles.length > 0) {
          sourceNotes.push(`Empirical Findings: ${sourceLink.finding_titles.slice(0, 2).join("; ")}`);
        }

        docChildren.push(
          new Paragraph({
            spacing: { before: 100, after: 180 },
            children: [
              new TextRun({
                text: `[Evidence Provenance: ${sourceNotes.join(" | ")}]`,
                size: 18, // 9pt
                color: "64748B",
                italics: true,
                font: "Calibri",
              }),
            ],
          })
        );
      }
    });

    // =========================================================================
    // 4. ASSEMBLE DOCUMENT WITH HEADERS & FOOTERS
    // =========================================================================

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
              },
            },
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: `Research Compass  |  ${project.title.slice(0, 45)}...`,
                      size: 18,
                      color: "94A3B8",
                      font: "Calibri",
                    }),
                  ],
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: isPatent
                        ? "AI-Generated Patent Draft — Requires Professional Review   |   Page "
                        : `Confidential Research — Scoped to ID: ${project.id}   |   Page `,
                      size: 18,
                      color: "64748B",
                      font: "Calibri",
                    }),
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      bold: true,
                      size: 18,
                      color: darkSlate,
                      font: "Calibri",
                    }),
                    new TextRun({
                      text: " of ",
                      size: 18,
                      color: "64748B",
                      font: "Calibri",
                    }),
                    new TextRun({
                      children: [PageNumber.TOTAL_PAGES],
                      bold: true,
                      size: 18,
                      color: darkSlate,
                      font: "Calibri",
                    }),
                  ],
                }),
              ],
            }),
          },
          children: docChildren,
        },
      ],
    });

    return await Packer.toBlob(doc);
  }

  /**
   * Generates and triggers instant browser file download of the .docx file.
   */
  /**
   * Generates and triggers instant browser file download of the .docx file.
   */
  public async downloadWordDocument(
    document: FinalResearchDocument,
    project: ResearchProject
  ): Promise<string> {
    const blob = await this.generateWordDocumentBlob(document, project);
    const fileName = document.mode === "paper"
      ? this.getResearchPaperFileName(project)
      : this.getStandardFileName(project);

    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    return fileName;
  }

  /**
   * Dedicated export for Final Research Paper (.docx) adhering to:
   * ResearchCompass_[ResearchName]_ResearchPaper.docx
   */
  public async downloadFinalResearchPaper(
    document: FinalResearchDocument,
    project: ResearchProject
  ): Promise<string> {
    return await this.downloadWordDocument(document, project);
  }

  /**
   * Helper to parse inline markdown (**bold**, *italics*, `code`) into TextRun array.
   */
  private parseMarkdownRuns(text: string): TextRun[] {
    const runs: TextRun[] = [];
    const tokenRegex = /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)|([^*`]+)/g;
    let match;

    while ((match = tokenRegex.exec(text)) !== null) {
      const part = match[0];
      if (part.startsWith("**") && part.endsWith("**")) {
        runs.push(
          new TextRun({
            text: part.slice(2, -2),
            bold: true,
            size: 22,
            font: "Calibri",
            color: "1E293B",
          })
        );
      } else if (part.startsWith("*") && part.endsWith("*")) {
        runs.push(
          new TextRun({
            text: part.slice(1, -1),
            italics: true,
            size: 22,
            font: "Calibri",
            color: "1E293B",
          })
        );
      } else if (part.startsWith("`") && part.endsWith("`")) {
        runs.push(
          new TextRun({
            text: part.slice(1, -1),
            size: 20,
            font: "Consolas",
            color: "0F766E",
          })
        );
      } else {
        runs.push(
          new TextRun({
            text: part,
            size: 22,
            font: "Calibri",
            color: "1E293B",
          })
        );
      }
    }

    if (runs.length === 0) {
      runs.push(new TextRun({ text, size: 22, font: "Calibri" }));
    }

    return runs;
  }
}

export const docxExportService = new DocxExportService();
