/**
 * 🔬 Semantic Scholar API Service
 * Secondary research paper search, citation graph enrichment, and fallback
 */

import { type NormalizedPaper } from "./openalex";

export interface SemanticScholarAuthor {
  authorId: string;
  name: string;
}

export interface SemanticScholarPaper {
  paperId: string;
  title: string;
  abstract?: string | null;
  year?: number | null;
  venue?: string | null;
  citationCount?: number | null;
  isOpenAccess?: boolean | null;
  openAccessPdf?: {
    url?: string;
  } | null;
  url?: string | null;
  authors?: SemanticScholarAuthor[] | null;
  externalIds?: {
    DOI?: string;
    CorpusId?: number;
    ArXiv?: string;
  } | null;
  fieldsOfStudy?: string[] | null;
}

/**
 * Normalizes Semantic Scholar response into unified Paper schema
 */
export function normalizeSemanticScholarPaper(paper: SemanticScholarPaper): NormalizedPaper {
  const authors = (paper.authors || []).map((a) => a.name).filter(Boolean);
  const doi = paper.externalIds?.DOI || "";
  const url = paper.openAccessPdf?.url || paper.url || (doi ? `https://doi.org/${doi}` : `https://www.semanticscholar.org/paper/${paper.paperId}`);

  return {
    id: paper.paperId || `s2_${Math.random().toString(36).substring(2, 9)}`,
    external_id: paper.paperId,
    title: paper.title || "Untitled Paper",
    authors: authors.length > 0 ? authors : ["Unknown Researcher"],
    abstract: paper.abstract || "No abstract available in Semantic Scholar index.",
    year: paper.year || new Date().getFullYear(),
    doi: doi,
    url: url,
    venue: paper.venue || "Academic Publication",
    citation_count: paper.citationCount || 0,
    source: "Semantic Scholar",
    open_access: Boolean(paper.isOpenAccess || paper.openAccessPdf?.url),
    concepts: paper.fieldsOfStudy || ["Computer Science", "Artificial Intelligence"],
    institutions: [],
    keywords: paper.fieldsOfStudy || [],
  };
}

/**
 * Searches scientific literature via Semantic Scholar Graph API
 */
export async function searchSemanticScholar(
  query: string,
  limit: number = 10,
  apiKey?: string,
): Promise<NormalizedPaper[]> {
  const fields = "title,authors,year,abstract,citationCount,isOpenAccess,openAccessPdf,venue,url,externalIds,fieldsOfStudy";
  const url = new URL("https://api.semanticscholar.org/graph/v1/paper/search");
  url.searchParams.set("query", query);
  url.searchParams.set("limit", Math.min(limit, 30).toString());
  url.searchParams.set("fields", fields);

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const key = apiKey || (typeof import.meta !== "undefined" && import.meta.env?.VITE_SEMANTIC_SCHOLAR_API_KEY);
  if (key) {
    headers["x-api-key"] = key;
  }

  const response = await fetch(url.toString(), { headers });
  if (!response.ok) {
    throw new Error(`Semantic Scholar responded with ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const papers: SemanticScholarPaper[] = data.data || [];
  return papers.map(normalizeSemanticScholarPaper);
}
