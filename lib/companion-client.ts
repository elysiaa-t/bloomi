import { isCompanionReply, type CompanionReply, type CompanionRequest } from "./companion-contract";

export async function askCompanion(input: CompanionRequest, signal: AbortSignal): Promise<CompanionReply> {
  let response: Response;
  try {
    response = await fetch("/api/companion", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input), signal, cache: "no-store", credentials: "same-origin",
    });
  } catch { throw new Error("bloomi could not connect. Your idea is still here. Please try again."); }
  // Never display arbitrary server/transport text to a student.
  if (!response.ok) {
    if (response.status === 503) throw new Error("bloomi is not set up yet. Ask an adult for help.");
    if (response.status === 429) throw new Error("bloomi needs a moment. Please try again soon.");
    if (response.status === 403) throw new Error("Live bloomi is available in the local demo. Ask an adult for help.");
    if (response.status === 400 || response.status === 413) throw new Error("Use a short question about this demo task.");
    throw new Error("bloomi could not reply. Your idea is still here. Please try again.");
  }
  let result: unknown;
  try { result = await response.json(); }
  catch { throw new Error("bloomi could not read that reply. Please try again."); }
  if (!result || typeof result !== "object" || !("reply" in result) || !isCompanionReply(result.reply)) throw new Error("bloomi could not read that reply. Please try again.");
  return result.reply;
}
