export type WritingPlan = { topic: string; answers: string[]; question: number; stage: "interview" | "outline" | "write" };
export const interviewQuestions = ["What is your main idea?", "What is one detail?", "How would you like to finish?"];
export function buildOutline(answers: string[]) {
  if (answers.length !== 3 || answers.some(a => typeof a !== "string" || a.length > 1000)) throw new Error("Share three short ideas.");
  return answers.map((text,index)=>({heading:["Main idea","A detail","My ending"][index],text:text.trim()}));
}
