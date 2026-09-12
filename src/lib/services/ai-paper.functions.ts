/**
 * 🛡️ Server Functions for AI Research Paper Generation
 * Powered by TanStack Start createServerFn.
 * Executes strictly on the backend/server. Zero API keys exposed to browser.
 */

import { createServerFn } from "@tanstack/react-start";
import {
  type FinalResearchDocument,
  type PaperQualityCheckReport,
  type CitationAuditResult,
  type ResearchProject,
  type ResearchNote,
  type ResearchFinding,
  type AuthorInfo,
} from "@/types/research";
import { type NormalizedPaper } from "./openalex";

export interface AcademicPaperContext {
  project: ResearchProject;
  papers: NormalizedPaper[];
  notes: ResearchNote[];
  findings: ResearchFinding[];
  gaps?: any[];
  authors?: AuthorInfo[];
}

export const serverGeneratePaperFn = createServerFn({ method: "POST" })
  .validator((input: any) => input as AcademicPaperContext)
  .handler(async ({ data }) => {
    const { aiPaperService } = await import("@/server/ai-paper-service");
    return await aiPaperService.generateResearchPaper(data);
  });

export const serverRegenerateSectionFn = createServerFn({ method: "POST" })
  .validator(
    (input: any) =>
      input as {
        sectionKey: string;
        sectionTitle: string;
        context: AcademicPaperContext;
        currentContent: string;
        instructions?: string;
      }
  )
  .handler(async ({ data }) => {
    const { aiPaperService } = await import("@/server/ai-paper-service");
    return await aiPaperService.regenerateSection(
      data.sectionKey,
      data.sectionTitle,
      data.context,
      data.currentContent,
      data.instructions
    );
  });

export const serverQualityCheckFn = createServerFn({ method: "POST" })
  .validator(
    (input: any) =>
      input as {
        document: FinalResearchDocument;
        context: AcademicPaperContext;
      }
  )
  .handler(async ({ data }) => {
    const { aiPaperService } = await import("@/server/ai-paper-service");
    return await aiPaperService.runQualityCheck(data.document, data.context);
  });

export const serverVerifyCitationsFn = createServerFn({ method: "POST" })
  .validator(
    (input: any) =>
      input as {
        document: FinalResearchDocument;
        papers: NormalizedPaper[];
      }
  )
  .handler(async ({ data }) => {
    const { aiPaperService } = await import("@/server/ai-paper-service");
    return await aiPaperService.verifyCitations(data.document, data.papers);
  });
