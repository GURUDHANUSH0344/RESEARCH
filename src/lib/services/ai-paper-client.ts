/**
 * 💻 Client-Side AI Research Paper Gateway
 * Communicates strictly with the backend AI via TanStack Start server RPC & secure endpoints.
 * Zero API keys are exposed to, stored in, or transmitted through the browser.
 */

import {
  type FinalResearchDocument,
  type PaperQualityCheckReport,
  type CitationAuditResult,
  type AuthorInfo,
  type ResearchProject,
  type ResearchNote,
  type ResearchFinding,
} from "@/types/research";
import { type NormalizedPaper } from "./openalex";
import {
  serverGeneratePaperFn,
  serverRegenerateSectionFn,
  serverQualityCheckFn,
  serverVerifyCitationsFn,
  type AcademicPaperContext,
} from "./ai-paper.functions";

export type { AcademicPaperContext };

export class AiPaperClient {
  /**
   * Dispatches generation request to the secure backend AI endpoint.
   */
  public async generatePaper(context: AcademicPaperContext): Promise<FinalResearchDocument> {
    try {
      return await serverGeneratePaperFn({ data: context });
    } catch (err: any) {
      console.warn("RPC generation fallback, trying API endpoint:", err?.message);
      const response = await fetch("/api/ai/generate-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context),
      });

      if (response.ok) {
        return await response.json();
      }
      throw err;
    }
  }

  public async regenerateSection(
    sectionKey: string,
    sectionTitle: string,
    context: AcademicPaperContext,
    currentContent: string,
    instructions?: string
  ): Promise<{ updatedText: string; explanation: string }> {
    try {
      return await serverRegenerateSectionFn({
        data: {
          sectionKey,
          sectionTitle,
          context,
          currentContent,
          instructions,
        },
      });
    } catch (err: any) {
      console.warn("RPC regenerate section fallback, trying API endpoint:", err?.message);
      const response = await fetch("/api/ai/regenerate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionKey,
          sectionTitle,
          context,
          currentContent,
          instructions,
        }),
      });

      if (response.ok) {
        return await response.json();
      }
      throw err;
    }
  }

  public async runQualityCheck(
    document: FinalResearchDocument,
    context: AcademicPaperContext
  ): Promise<PaperQualityCheckReport> {
    try {
      return await serverQualityCheckFn({
        data: { document, context },
      });
    } catch (err: any) {
      console.warn("RPC quality check fallback, trying API endpoint:", err?.message);
      const response = await fetch("/api/ai/quality-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document, context }),
      });

      if (response.ok) {
        return await response.json();
      }
      throw err;
    }
  }

  public async verifyCitations(
    document: FinalResearchDocument,
    papers: NormalizedPaper[]
  ): Promise<CitationAuditResult> {
    try {
      return await serverVerifyCitationsFn({
        data: { document, papers },
      });
    } catch (err: any) {
      console.warn("RPC citation verification fallback, trying API endpoint:", err?.message);
      const response = await fetch("/api/ai/verify-citations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document, papers }),
      });

      if (response.ok) {
        return await response.json();
      }
      throw err;
    }
  }
}

export const aiPaperClient = new AiPaperClient();
