import "server-only";
import { checkedStory, validStory, wordBank, type ReadingStudentId } from "@/lib/reading";
import {modePolicy,type LearningMode}from"@/lib/learning-modes";
import mira from"@/data/students/mira.json";
import jonah from"@/data/students/jonah.json";
import asha from"@/data/students/asha.json";

export async function generateReadingStory(id: ReadingStudentId,mode:LearningMode="stretch") {
  const fallback = { story: checkedStory(id), source: "checked-demo" as const, notice: "Here is a checked demo story. Live generation is unavailable." };
  const bank = wordBank(id);
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key || key.includes("your_actual_api_key_here")) return fallback;
  try {
    const result = await fetch("https://api.openai.com/v1/responses", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(20_000),
      body: JSON.stringify({ model: "gpt-4.1-mini", store: false, max_output_tokens: 1000,
        instructions: "Write a coherent short decodable story for a fictional learner. Follow teachingPolicy for question focus and never remove its required accommodations. Use short sentences, one idea each, and a small event or surprise. Every word of the title and story MUST come from the supplied word bank. Never invent a proper name or use unsupported words. Use 6 to 10 distinct target words from the single target pattern. Return two brief comprehension questions. Questions can use accessible common vocabulary outside the story bank because they are read aloud. Do not diagnose or claim teaching efficacy. Return only the required JSON fields.",
        input: JSON.stringify({ teachingPolicy: modePolicy({mira,jonah,asha}[id],"reading",mode), questionFocus:mode==="support"?"Story meaning and oral retelling":"Meaning after guided sound blending", interest: id === "mira" ? "building sand forts" : id === "jonah" ? "designing robot arms (call a robot a bot)" : "planning a balcony herb garden", targetPattern: bank.targetPattern, targetWords: bank.targetWords, wordBank: [...bank.masteredWords,...bank.sightWords,...bank.targetWords], wordCount: id === "mira" ? "80 to 150" : "80 to 250", maxSentenceWords: 14 }),
        text: { format: { type: "json_schema", name: "decodable_story", strict: true, schema: {
          type: "object", additionalProperties: false, required: ["title","text","targetPattern","targetWords","questions"],
          properties: { title:{type:"string"},text:{type:"string"},targetPattern:{type:"string"},targetWords:{type:"array",items:{type:"string"}},questions:{type:"array",items:{type:"string"}} },
        } } },
      }),
    });
    if (!result.ok) { await result.body?.cancel().catch(()=>undefined); return fallback; }
    const data = await result.json();
    if (data.status !== "completed" || !Array.isArray(data.output)) return fallback;
    const parts: string[] = [];
    for (const item of data.output) if (item.type === "message" && item.role === "assistant" && Array.isArray(item.content)) {
      for (const content of item.content) { if (content.type === "refusal") return fallback; if (content.type === "output_text" && typeof content.text === "string") parts.push(content.text); }
    }
    const text = parts.join("");
    if (text.length > 8000 || text.includes(key) || /\bsk-[A-Za-z0-9_-]{16,}/.test(text)) return fallback;
    const story: unknown = JSON.parse(text);
    // Replace an out-of-bank draft with the whole checked story, rather than
    // substitute random words and accidentally destroy its meaning.
    if (!validStory(story,id)) return fallback;
    return { story, source: "ai" as const, notice: "New AI story checked against your word bank." };
  } catch { return fallback; }
}
