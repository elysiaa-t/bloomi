import banks from "@/data/reading/word-banks.json";
export type ReadingStudentId = keyof typeof banks;
export type Story = { title: string; text: string; targetPattern: string; targetWords: string[]; questions: string[] };
export type ReadingSource = "typed" | "simulated" | "speech" | "manual";
export type WordDifference = { expected: string; observed: string; position: number; kind: "substitution" | "omission" | "insertion" };
export type ReadingObservation = {
  date: string; subject: "reading"; storyTitle: string; source: ReadingSource; targetWords: string[]; instructionalMode?:"support"|"stretch";
  differences: WordDifference[]; matchingWords: number; status: "pattern_supported" | "seen once, watching" | "no target pattern observed";
  description: string; suggestedFocus: string; strengths: string; needsTeacherReview: true;
};
export function words(text: string): string[] { return text.toLowerCase().match(/[a-z]+/g) ?? []; }
export function wordBank(id: ReadingStudentId) { return banks[id]; }
export function checkedStory(id: ReadingStudentId): Story { return structuredClone(banks[id].checkedStory); }
export function validStory(value: unknown, id: ReadingStudentId): value is Story {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const x = value as Record<string, unknown>, bank = banks[id];
  if (Object.keys(x).length !== 5 || typeof x.title !== "string" || !x.title.trim() || x.title.length > 100 || typeof x.text !== "string" || x.text.length > 4000 || x.targetPattern !== bank.targetPattern) return false;
  if (!Array.isArray(x.targetWords) || x.targetWords.length < 6 || x.targetWords.length > 10 || new Set(x.targetWords).size !== x.targetWords.length || x.targetWords.some(w => typeof w !== "string" || !bank.targetWords.includes(w))) return false;
  if (!Array.isArray(x.questions) || x.questions.length !== 2 || x.questions.some(q => typeof q !== "string" || !q.trim() || q.length > 160)) return false;
  const tokens = words(x.text), allowed = new Set([...bank.masteredWords, ...bank.sightWords, ...bank.targetWords]);
  const maxLength = id === "mira" ? 150 : 250;
  if (tokens.length < 80 || tokens.length > maxLength || /[^a-zA-Z\s.,!?]/.test(x.text + x.title)) return false;
  if (words(x.title + " " + x.text).some(w => !allowed.has(w))) return false;
  if (x.targetWords.some(w => !tokens.includes(w as string))) return false;
  if (tokens.some(w => bank.targetWords.includes(w) && !(x.targetWords as string[]).includes(w))) return false;
  if (x.text.split(/[.!?]+/).some(sentence => words(sentence).length > 14)) return false;
  return !/\b(wrong|incorrect|failed|easy|simple)\b/i.test([x.title, x.text, ...x.questions].join(" "));
}

// Token alignment tolerates punctuation/case and isolated insertions/deletions;
// it is a text comparison, never an acoustic or clinical assessment.
export function alignTranscript(text: string, transcript: string): { differences: WordDifference[]; matchingWords: number } {
  const a = words(text), b = words(transcript);
  if (a.length > 250 || b.length > 400 || !b.length) throw new Error("Use a transcript of up to 400 words.");
  const costs = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1));
  for (let i = 0; i <= a.length; i++) costs[i][0] = i;
  for (let j = 0; j <= b.length; j++) costs[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) costs[i][j] = Math.min(costs[i-1][j]+1,costs[i][j-1]+1,costs[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  let i = a.length, j = b.length, matchingWords = 0;
  const differences: WordDifference[] = [];
  while (i || j) {
    if (i && j && costs[i][j] === costs[i-1][j-1] + (a[i-1]===b[j-1]?0:1)) {
      if (a[i-1]===b[j-1]) matchingWords++; else differences.push({ expected:a[i-1], observed:b[j-1], position:i-1, kind:"substitution" });
      i--;j--;
    } else if (i && costs[i][j] === costs[i-1][j]+1) { differences.push({expected:a[i-1],observed:"",position:i-1,kind:"omission"});i--; }
    else { differences.push({expected:"",observed:b[j-1],position:i,kind:"insertion"});j--; }
  }
  return { differences: differences.reverse(), matchingWords };
}
export function analyzeReading(story: Story, source: ReadingSource, comparison: ReturnType<typeof alignTranscript>): ReadingObservation {
  const targetExamples = comparison.differences.filter(d => d.kind === "substitution" && story.targetWords.includes(d.expected));
  const count = targetExamples.length;
  return { date: new Date().toISOString(), subject: "reading", storyTitle: story.title, source, targetWords: story.targetWords,
    ...comparison, status: count >= 2 ? "pattern_supported" : count === 1 ? "seen once, watching" : "no target pattern observed",
    description: count ? `${count} word substitutions involve ${story.targetPattern}. Text alone does not establish which sound or strategy caused them.` : "No repeated target-word substitution was observed in this text comparison.",
    suggestedFocus: count ? `Review ${story.targetPattern} together using ${targetExamples.slice(0,2).map(d=>d.expected).join(" and ")}.` : "Continue the current reading focus and review any omitted or added words together.",
    strengths: comparison.matchingWords ? `${comparison.matchingWords} story words match the reviewed transcript; this is not a mastery score.` : "The learner shared a word to revisit and can hear a model on request.", needsTeacherReview: true };
}
export function simulatedTranscript(story: Story, examples: { word: string; student_says: string }[]) {
  const replacements = new Map(examples.map(e => [e.word, e.student_says]));
  const used = new Set<string>();
  return story.text.replace(/[a-z]+/gi, token => { const word = token.toLowerCase(); if (!used.has(word) && replacements.has(word)) { used.add(word); return replacements.get(word)!; } return token; });
}
