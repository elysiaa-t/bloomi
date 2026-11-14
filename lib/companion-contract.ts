// Shared data shapes only: this module must never read environment variables.
export type CompanionReply = {
  feedback: string;
  hint: string;
  nextStep: string;
  workedExample: string | null;
  needsTeacherReview: boolean;
};
export type CompanionRequest = {
  studentId: "mira" | "jonah" | "asha";
  subject: "reading" | "writing" | "math";
  mode: "support" | "stretch";
  skillObjective: string;
  message: string;
  intent: "feedback" | "hint" | "question";
  attempt: 1 | 2;
  problemIndex?: number;
};
type LearningProfile = { reading: { patterns_in_progress: string[] }; math: { skills_in_progress: string[] } };
export function skillObjective(profile: LearningProfile, subject: CompanionRequest["subject"],mode:"support"|"stretch"="stretch"): string {
  if(mode==="support")return subject==="reading"?"Explain the story using read-aloud support.":subject==="writing"?"Express original ideas using dictation and an outline.":"Explain mathematical reasoning using a calculator and a visual model.";
  if (subject === "reading") return `Practice ${profile.reading.patterns_in_progress[0]}.`;
  if (subject === "writing") return "Organize an original idea into a clear sentence.";
  return `Practice ${profile.math.skills_in_progress[0]}.`;
}
export const replySchema = {
  type: "object",
  additionalProperties: false,
  required: ["feedback", "hint", "nextStep", "workedExample", "needsTeacherReview"],
  properties: {
    feedback: { type: "string" }, hint: { type: "string" }, nextStep: { type: "string" },
    workedExample: { type: ["string", "null"] }, needsTeacherReview: { type: "boolean" },
  },
};
export function isCompanionReply(value: unknown): value is CompanionReply {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  if (Object.keys(data).length !== 5 || Object.keys(data).some(key => !replySchema.required.includes(key))) return false;
  return [data.feedback, data.hint, data.nextStep].every(x => typeof x === "string" && x.trim().length > 0 && x.length <= 1200)
    && (data.workedExample === null || (typeof data.workedExample === "string" && data.workedExample.trim().length > 0 && data.workedExample.length <= 1200))
    && typeof data.needsTeacherReview === "boolean";
}
