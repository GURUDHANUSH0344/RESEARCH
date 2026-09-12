/**
 * 🔬 OpenAlex API Service
 * Primary scientific literature search and metadata retrieval
 */

export interface OpenAlexAuthor {
  author: {
    id: string;
    display_name: string;
    orcid?: string;
  };
  institutions?: {
    id: string;
    display_name: string;
    country_code?: string;
    type?: string;
  }[];
}

export interface OpenAlexWork {
  id: string;
  doi?: string;
  title: string;
  display_name: string;
  publication_year: number;
  publication_date?: string;
  ids: {
    openalex: string;
    doi?: string;
    mag?: string;
    pmid?: string;
  };
  language?: string;
  primary_location?: {
    source?: {
      id?: string;
      display_name?: string;
      type?: string;
      issn_l?: string;
      host_organization_name?: string;
    };
    is_oa?: boolean;
    landing_page_url?: string;
    pdf_url?: string;
  };
  open_access?: {
    is_oa: boolean;
    oa_status?: string;
    oa_url?: string;
  };
  authorships?: OpenAlexAuthor[];
  cited_by_count: number;
  concepts?: {
    id: string;
    display_name: string;
    score: number;
    level: number;
  }[];
  keywords?: {
    keyword: string;
    score: number;
  }[];
  abstract_inverted_index?: Record<string, number[]>;
  referenced_works?: string[];
  related_works?: string[];
}

export interface NormalizedPaper {
  id: string;
  external_id: string;
  title: string;
  authors: string[];
  abstract: string;
  year: number;
  doi?: string;
  url?: string;
  venue: string;
  citation_count: number;
  source: string;
  open_access: boolean;
  concepts: string[];
  institutions?: string[];
  keywords?: string[];
  relevance_score?: number;
}

export interface OpenAlexSearchParams {
  query: string;
  yearFrom?: number;
  yearTo?: number;
  limit?: number;
  sortBy?: "relevance_score" | "cited_by_count:desc" | "publication_year:desc";
  openAccessOnly?: boolean;
}

/**
 * Reconstructs standard plaintext abstract from OpenAlex inverted index
 */
export function reconstructAbstract(invertedIndex?: Record<string, number[]> | null): string {
  if (!invertedIndex || Object.keys(invertedIndex).length === 0) return "";
  try {
    const wordPositions: { word: string; pos: number }[] = [];
    for (const [word, positions] of Object.entries(invertedIndex)) {
      if (Array.isArray(positions)) {
        for (const pos of positions) {
          wordPositions.push({ word, pos });
        }
      }
    }
    wordPositions.sort((a, b) => a.pos - b.pos);
    return wordPositions.map((item) => item.word).join(" ");
  } catch {
    return "";
  }
}

/**
 * Normalizes OpenAlex raw response into application's unified Paper schema
 */
export function normalizeOpenAlexWork(work: OpenAlexWork): NormalizedPaper {
  const abstract = reconstructAbstract(work.abstract_inverted_index);
  const authors = (work.authorships || []).map((a) => a.author?.display_name).filter(Boolean);
  const institutions = (work.authorships || [])
    .flatMap((a) => (a.institutions || []).map((inst) => inst.display_name))
    .filter(Boolean);
  const uniqueInstitutions = Array.from(new Set(institutions));

  const concepts = (work.concepts || [])
    .filter((c) => c.score > 0.3)
    .map((c) => c.display_name);

  const keywords = (work.keywords || []).map((k) => k.keyword);

  const doiClean = (work.doi || work.ids?.doi || "").replace(/^https?:\/\/doi\.org\//, "");
  const venue = work.primary_location?.source?.display_name || "Academic Publication";
  const url = work.primary_location?.landing_page_url || work.open_access?.oa_url || (doiClean ? `https://doi.org/${doiClean}` : work.id);
  const isOpenAccess = Boolean(work.open_access?.is_oa || work.primary_location?.is_oa);

  return {
    id: work.id || `openalex_${Math.random().toString(36).substring(2, 9)}`,
    external_id: work.id,
    title: work.title || work.display_name || "Untitled Research Paper",
    authors: authors.length > 0 ? authors : ["Unknown Researcher"],
    abstract: abstract || "No abstract available in OpenAlex index.",
    year: work.publication_year || new Date().getFullYear(),
    doi: doiClean,
    url: url || "",
    venue: venue,
    citation_count: work.cited_by_count || 0,
    source: "OpenAlex",
    open_access: isOpenAccess,
    concepts: concepts.slice(0, 8),
    institutions: uniqueInstitutions.slice(0, 5),
    keywords: keywords.slice(0, 6),
  };
}

/**
 * Searches scientific literature using the OpenAlex Works API
 */
export async function searchOpenAlex(params: OpenAlexSearchParams): Promise<NormalizedPaper[]> {
  const {
    query,
    yearFrom,
    yearTo,
    limit = 12,
    sortBy = "relevance_score",
    openAccessOnly = false,
  } = params;

  const url = new URL("https://api.openalex.org/works");
  url.searchParams.set("search", query.trim());
  url.searchParams.set("per_page", Math.min(limit, 50).toString());

  const filters: string[] = [];
  if (yearFrom && yearTo) {
    filters.push(`publication_year:${yearFrom}-${yearTo}`);
  } else if (yearFrom) {
    filters.push(`publication_year:>${yearFrom - 1}`);
  } else if (yearTo) {
    filters.push(`publication_year:<${yearTo + 1}`);
  }

  if (openAccessOnly) {
    filters.push("is_oa:true");
  }

  if (filters.length > 0) {
    url.searchParams.set("filter", filters.join(","));
  }

  if (sortBy && sortBy !== "relevance_score") {
    url.searchParams.set("sort", sortBy);
  }

  // Set mailto polite pool if configured
  const email = (typeof import.meta !== "undefined" && import.meta.env?.VITE_OPENALEX_EMAIL) || "researcher@autonomous-scientist.io";
  if (email) {
    url.searchParams.set("mailto", email);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "AutonomousResearchScientist/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`OpenAlex API responded with status ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const results: OpenAlexWork[] = data.results || [];
  return results.map(normalizeOpenAlexWork);
}
