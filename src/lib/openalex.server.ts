export type FetchedPaper = {
  external_id: string;
  title: string;
  authors: string[];
  abstract: string | null;
  year: number | null;
  doi: string | null;
  url: string | null;
  venue: string | null;
  citation_count: number;
  source: string;
  open_access: boolean;
  concepts: string[];
};

function reconstructAbstract(inverted: Record<string, number[]> | null | undefined): string | null {
  if (!inverted) return null;
  const slots: string[] = [];
  for (const [word, positions] of Object.entries(inverted)) {
    for (const p of positions) slots[p] = word;
  }
  const text = slots.filter(Boolean).join(" ").trim();
  return text.length > 0 ? text.slice(0, 2200) : null;
}

type OpenAlexWork = {
  id?: string;
  doi?: string | null;
  title?: string | null;
  display_name?: string | null;
  publication_year?: number | null;
  cited_by_count?: number | null;
  abstract_inverted_index?: Record<string, number[]> | null;
  authorships?: { author?: { display_name?: string } }[];
  primary_location?: { source?: { display_name?: string } | null; landing_page_url?: string | null } | null;
  open_access?: { is_oa?: boolean } | null;
  concepts?: { display_name?: string }[];
};

/** Search OpenAlex. Never throws — returns [] so the pipeline can degrade gracefully. */
export async function searchOpenAlex(opts: {
  query: string;
  limit: number;
  yearFrom?: number | null;
  yearTo?: number | null;
}): Promise<FetchedPaper[]> {
  const params = new URLSearchParams();
  params.set("search", opts.query);
  params.set("per_page", String(Math.min(Math.max(opts.limit, 1), 25)));
  params.set("sort", "relevance_score:desc");
  const filters = ["has_abstract:true"];
  if (opts.yearFrom) filters.push(`from_publication_date:${opts.yearFrom}-01-01`);
  if (opts.yearTo) filters.push(`to_publication_date:${opts.yearTo}-12-31`);
  params.set("filter", filters.join(","));
  const mailto = process.env["OPENALEX_EMAIL"];
  if (mailto) params.set("mailto", mailto);

  try {
    const res = await fetch(`https://api.openalex.org/works?${params.toString()}`, {
      headers: { Accept: "application/json", "User-Agent": "autonomous-research-scientist" },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { results?: OpenAlexWork[] };
    const results = json.results ?? [];
    const seen = new Set<string>();
    const papers: FetchedPaper[] = [];
    for (const w of results) {
      const title = (w.display_name ?? w.title ?? "").trim();
      if (!title) continue;
      const key = title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      papers.push({
        external_id: w.id ?? title,
        title,
        authors: (w.authorships ?? []).map((a) => a.author?.display_name ?? "").filter(Boolean).slice(0, 8),
        abstract: reconstructAbstract(w.abstract_inverted_index),
        year: w.publication_year ?? null,
        doi: w.doi ? w.doi.replace("https://doi.org/", "") : null,
        url: w.primary_location?.landing_page_url ?? w.doi ?? w.id ?? null,
        venue: w.primary_location?.source?.display_name ?? null,
        citation_count: w.cited_by_count ?? 0,
        source: "OpenAlex",
        open_access: Boolean(w.open_access?.is_oa),
        concepts: (w.concepts ?? []).map((c) => c.display_name ?? "").filter(Boolean).slice(0, 6),
      });
    }
    return papers;
  } catch {
    return [];
  }
}

/** Enrich with Semantic Scholar where the OpenAlex abstract is missing. Best effort only. */
export async function enrichWithSemanticScholar(papers: FetchedPaper[]): Promise<FetchedPaper[]> {
  const missing = papers.filter((p) => !p.abstract).slice(0, 5);
  if (missing.length === 0) return papers;
  const apiKey = process.env["SEMANTIC_SCHOLAR_API_KEY"];
  await Promise.all(
    missing.map(async (p) => {
      try {
        const url = `https://api.semanticscholar.org/graph/v1/paper/search?limit=1&fields=abstract,venue,citationCount&query=${encodeURIComponent(p.title)}`;
        const res = await fetch(url, { headers: apiKey ? { "x-api-key": apiKey } : {} });
        if (!res.ok) return;
        const json = (await res.json()) as { data?: { abstract?: string | null; venue?: string | null }[] };
        const hit = json.data?.[0];
        if (hit?.abstract) {
          p.abstract = hit.abstract.slice(0, 2200);
          p.source = "OpenAlex + Semantic Scholar";
        }
        if (!p.venue && hit?.venue) p.venue = hit.venue;
      } catch {
        /* ignore — graceful degradation */
      }
    }),
  );
  return papers;
}
