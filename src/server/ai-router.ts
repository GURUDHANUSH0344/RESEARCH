/**
 * 🛰️ Server AI Request Router
 * Dispatches backend AI research paper requests securely.
 */

import { aiPaperService } from "./ai-paper-service";

export async function handleAiApiRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (pathname.endsWith("/generate-paper")) {
      const body = await request.json();
      const document = await aiPaperService.generateResearchPaper(body);
      return new Response(JSON.stringify(document), {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (pathname.endsWith("/regenerate-section")) {
      const body = await request.json();
      const { sectionKey, sectionTitle, context, currentContent, instructions } = body;
      const result = await aiPaperService.regenerateSection(
        sectionKey,
        sectionTitle,
        context,
        currentContent,
        instructions
      );
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (pathname.endsWith("/quality-check")) {
      const body = await request.json();
      const { document, context } = body;
      const report = aiPaperService.runQualityCheck(document, context);
      return new Response(JSON.stringify(report), {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (pathname.endsWith("/verify-citations")) {
      const body = await request.json();
      const { document, papers } = body;
      const audit = aiPaperService.verifyCitations(document, papers);
      return new Response(JSON.stringify(audit), {
        status: 200,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ error: `Not found: ${pathname}` }), {
      status: 404,
      headers: corsHeaders,
    });
  } catch (err: any) {
    console.error("AI Router execution failed:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error during AI generation" }),
      { status: 500, headers: corsHeaders }
    );
  }
}
