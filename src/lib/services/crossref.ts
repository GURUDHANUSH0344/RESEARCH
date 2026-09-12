/**
 * 🔬 Crossref REST API Service
 * Comprehensive scholarly metadata, DOI resolution, journal publisher indexing, and open citation analysis
 */

import { type NormalizedPaper } from "./openalex";

export interface CrossrefAuthor {
  given?: string;
  family?: string;
  name?: string;
  sequence?: string;
}

export interface CrossrefWork {
  DOI: string;
  title?: string[];
  author?: CrossrefAuthor[];
  abstract?: string;
  "container-title"?: string[];
  publisher?: string;
  published?: {
    "date-parts"?: number[][];
  };
  "published-print"?: {
    "date-parts"?: number[][];
  };
  "published-online"?: {
    "date-parts"?: number[][];
  };
  "is-referenced-by-count"?: number;
  URL?: string;
  subject?: string[];
  license?: Array<{
    URL?: string;
    "content-version"?: string;
  }>;
}

/**
 * Normalizes Crossref response into unified Paper schema
 */
export function normalizeCrossrefWork(work: CrossrefWork): NormalizedPaper {
  const title = (work.title && work.title[0]) || "Untitled Publication";
  const authors = (work.author || [])
    .map((a) => {
      if (a.name) return a.name;
      if (a.given && a.family) return `${a.given} ${a.family}`;
      if (a.family) return a.family;
      return "";
    })
    .filter(Boolean);

  // Extract year from date-parts
  const dateParts =
    work.published?.["date-parts"]?.[0] ||
    work["published-online"]?.["date-parts"]?.[0] ||
    work["published-print"]?.["date-parts"]?.[0];
  const year = dateParts && dateParts[0] ? dateParts[0] : new Date().getFullYear();

  const venue =
    (work["container-title"] && work["container-title"][0]) ||
    work.publisher ||
    "Scholarly Journal / Conference";

  const citations = work["is-referenced-by-count"] || 0;
  const doi = work.DOI || "";
  const url = work.URL || (doi ? `https://doi.org/${doi}` : "");

  // Clean abstract if XML tags present (e.g. <jats:p>)
  let abstract = work.abstract || "Abstract indexed in Crossref database.";
  if (abstract.includes("<")) {
    abstract = abstract.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  const isOpenAccess = (work.license || []).some(
    (lic) => lic.URL && (lic.URL.includes("creativecommon") || lic.URL.includes("open-access")),
  );

  return {
    id: doi ? `crossref_${doi.replace(/[^a-zA-Z0-9]/g, "_")}` : `cr_${Math.random().toString(36).substring(2, 9)}`,
    external_id: doi,
    title,
    authors: authors.length > 0 ? authors : ["Unknown Researcher"],
    abstract,
    year,
    doi,
    url,
    venue,
    citation_count: citations,
    source: "Crossref",
    open_access: isOpenAccess,
    concepts: work.subject || ["Computer Science", "Scientific Discovery"],
    institutions: [],
    keywords: work.subject || [],
  };
}

/**
 * Searches scientific literature via Crossref REST API
 */
export async function searchCrossref(
  query: string,
  limit: number = 10,
  mailto?: string,
): Promise<NormalizedPaper[]> {
  const url = new URL("https://api.crossref.org/works");
  url.searchParams.set("query", query);
  url.searchParams.set("rows", Math.min(limit, 30).toString());
  url.searchParams.set("sort", "relevance");

  const email =
    mailto ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_CROSSREF_MAILTO) ||
    "research-scientist@academic-lab.org";

  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": `AutonomousResearchScientist/1.0 (mailto:${email})`,
  };

  const response = await fetch(url.toString(), { headers });
  if (!response.ok) {
    throw new Error(`Crossref API responded with ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const items: CrossrefWork[] = data.message?.items || [];
  return items.map(normalizeCrossrefWork);
}
