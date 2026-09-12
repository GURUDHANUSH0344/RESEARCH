/**
 * 📚 Citation Formatter Service
 * Generates verified APA, IEEE, MLA, and BibTeX citation strings
 */

import { type NormalizedPaper } from "./openalex";

export interface FormattedCitations {
  apa: string;
  ieee: string;
  mla: string;
  chicago: string;
  harvard: string;
  bibtex: string;
}

/**
 * Format author names for APA: "Last, F. M., & Last, F."
 */
function formatAuthorsAPA(authors: string[]): string {
  if (!authors || authors.length === 0) return "Anonymous";
  const formatted = authors.map((name) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0] || name;
    const lastName = parts[parts.length - 1] || name;
    const initials = parts.slice(0, -1).map((p) => `${p.charAt(0)}.`).join(" ");
    return `${lastName}, ${initials}`;
  });

  if (formatted.length === 1) return formatted[0] || "Anonymous";
  if (formatted.length === 2) return `${formatted[0] || ""} & ${formatted[1] || ""}`;
  const lastAuthor = formatted[formatted.length - 1] || "";
  return `${formatted.slice(0, -1).join(", ")}, & ${lastAuthor}`;
}

/**
 * Format author names for IEEE: "F. M. Last, and F. Last"
 */
function formatAuthorsIEEE(authors: string[]): string {
  if (!authors || authors.length === 0) return "Anon.";
  const formatted = authors.map((name) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0] || name;
    const lastName = parts[parts.length - 1] || name;
    const initials = parts.slice(0, -1).map((p) => `${p.charAt(0)}.`).join(" ");
    return `${initials} ${lastName}`;
  });

  if (formatted.length === 1) return formatted[0] || "Anon.";
  if (formatted.length === 2) return `${formatted[0] || ""} and ${formatted[1] || ""}`;
  if (formatted.length > 3) return `${formatted[0] || "Anon."} et al.`;
  const lastAuthor = formatted[formatted.length - 1] || "";
  return `${formatted.slice(0, -1).join(", ")}, and ${lastAuthor}`;
}

/**
 * Format author names for MLA: "Last, First, and First Last."
 */
function formatAuthorsMLA(authors: string[]): string {
  if (!authors || authors.length === 0) return "Anonymous";
  if (authors.length === 1) {
    const parts = (authors[0] || "").trim().split(" ");
    if (parts.length === 1) return parts[0] || authors[0] || "Anonymous";
    return `${parts[parts.length - 1] || ""}, ${parts.slice(0, -1).join(" ")}`;
  }
  if (authors.length === 2) {
    const p1 = (authors[0] || "").trim().split(" ");
    const a1 = p1.length === 1 ? p1[0] : `${p1[p1.length - 1] || ""}, ${p1.slice(0, -1).join(" ")}`;
    return `${a1}, and ${authors[1] || ""}`;
  }
  const p1 = (authors[0] || "").trim().split(" ");
  const a1 = p1.length === 1 ? p1[0] : `${p1[p1.length - 1] || ""}, ${p1.slice(0, -1).join(" ")}`;
  return `${a1}, et al.`;
}

/**
 * Generates APA, IEEE, MLA, and BibTeX citations
 */
export function generateCitations(paper: NormalizedPaper): FormattedCitations {
  const year = paper.year || new Date().getFullYear();
  const title = (paper.title || "Untitled").trim().replace(/\.$/, "");
  const venue = paper.venue || "Academic Proceedings";
  const doi = paper.doi ? `https://doi.org/${paper.doi}` : paper.url;

  // APA 7th Edition
  const apa = `${formatAuthorsAPA(paper.authors)} (${year}). ${title}. ${venue}.${doi ? ` ${doi}` : ""}`;

  // IEEE
  const ieee = `${formatAuthorsIEEE(paper.authors)}, "${title}," ${venue}, ${year}.${doi ? ` doi: ${paper.doi || doi}.` : ""}`;

  // MLA 9th Edition
  const mla = `${formatAuthorsMLA(paper.authors)}. "${title}." ${venue}, ${year}.${doi ? ` ${doi}` : ""}`;

  // Chicago 17th Edition
  const chicago = `${formatAuthorsMLA(paper.authors)}. "${title}." ${venue} (${year}).${doi ? ` ${doi}.` : ""}`;

  // Harvard
  const harvard = `${formatAuthorsAPA(paper.authors)} ${year}, '${title}', ${venue}.${doi ? ` Available at: ${doi}.` : ""}`;

  // BibTeX
  const firstAuthor = paper.authors[0] || "author";
  const firstAuthorLast = firstAuthor.split(" ").pop()?.toLowerCase().replace(/[^a-z]/g, "") || "author";
  const bibtexKey = `${firstAuthorLast}${year}${title.slice(0, 10).toLowerCase().replace(/[^a-z]/g, "")}`;
  const bibtexAuthors = (paper.authors || ["Unknown"]).join(" and ");

  const bibtex = `@article{${bibtexKey},
  author    = {${bibtexAuthors}},
  title     = {${title}},
  journal   = {${venue}},
  year      = {${year}},${paper.doi ? `\n  doi       = {${paper.doi}},` : ""}${paper.url ? `\n  url       = {${paper.url}},` : ""}
}`;

  return { apa, ieee, mla, chicago, harvard, bibtex };
}
