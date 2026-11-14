import { CompanionError, getCompanionReply, validateInput } from "@/lib/server/companion";

const MAX_BODY_BYTES = 8192;
let windowStart = 0;
let requests = 0;
let inFlight = 0;

function json(body: object, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}

export async function POST(request: Request) {
  // There are deliberately no accounts in this prototype. Fail closed outside
  // local development rather than publish an unauthenticated, billable proxy.
  const url = new URL(request.url);
  if (process.env.NODE_ENV !== "development" || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    return json({ error: "Live AI is available only in the local development demo." }, 403);
  }
  if (request.headers.get("origin") !== url.origin || request.headers.get("sec-fetch-site") === "cross-site") {
    return json({ error: "This request is not allowed." }, 403);
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return json({ error: "Send a JSON learning question." }, 415);
  }
  const now = Date.now();
  if (now - windowStart >= 60_000) { windowStart = now; requests = 0; }
  if (requests >= 20 || inFlight >= 2) return json({ error: "Please wait before asking another question." }, 429);
  requests++;
  inFlight++;
  try {
    if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) return json({ error: "This question is too long." }, 413);
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "Send a learning question." }, 400);
    const chunks: Uint8Array[] = [];
    let length = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > MAX_BODY_BYTES) { await reader.cancel(); return json({ error: "This question is too long." }, 413); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    let body: unknown;
    try { body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
    catch { return json({ error: "Send a valid JSON learning question." }, 400); }
    const input = validateInput(body);
    if (!input) return json({ error: "Send a demo student, subject, mode, matching skill objective, and a message of up to 2,000 characters." }, 400);
    const reply = await getCompanionReply(input);
    return json({ reply, fictional: true });
  } catch (error) {
    if (error instanceof CompanionError) return json({ error: error.publicMessage }, error.status);
    return json({ error: "The learning companion is unavailable. Please try again later." }, 502);
  } finally { inFlight--; }
}
