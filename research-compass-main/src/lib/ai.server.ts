const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

export class AiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        /* fallthrough */
      }
    }
    throw new AiError(502, "The analysis engine returned an unreadable response. Please try again.");
  }
}

export const SCIENTIFIC_SAFETY = `You are an evidence-disciplined research assistant.
Rules you must never break:
- Only use the papers provided in the context. NEVER invent papers, authors, DOIs, numbers or citations.
- Refer to papers only by the numeric ids given ("P1", "P2", ...).
- Clearly frame gaps and hypotheses as AI-assisted, potential, derived from the analysed literature — never as established scientific fact.
- If the evidence is thin, say so and lower the confidence value.
- Scores are AI-assisted estimates, not objective measurements.
Return ONLY valid JSON matching the requested shape. No markdown, no commentary.`;

export async function callAiJson<T>(system: string, user: string): Promise<T> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiError(401, "AI is not configured for this workspace.");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 429)
      throw new AiError(429, "The AI service is rate limited right now. Please retry in a moment.");
    if (res.status === 402)
      throw new AiError(402, "AI credits are exhausted for this workspace. Add credits to continue.");
    throw new AiError(res.status, `AI request failed (${res.status}). ${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content ?? "";
  return extractJson(content) as T;
}

export async function callAiText(system: string, user: string): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiError(401, "AI is not configured for this workspace.");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    if (res.status === 429) throw new AiError(429, "The AI service is rate limited. Please retry shortly.");
    if (res.status === 402) throw new AiError(402, "AI credits are exhausted for this workspace.");
    throw new AiError(res.status, `AI request failed (${res.status}).`);
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "";
}
