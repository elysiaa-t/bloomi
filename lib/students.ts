import mira from "@/data/students/mira.json";
import jonah from "@/data/students/jonah.json";
import asha from "@/data/students/asha.json";
import miraWork from "@/data/sample-work/mira.json";
import jonahWork from "@/data/sample-work/jonah.json";
import ashaWork from "@/data/sample-work/asha.json";
export const students = [mira, jonah, asha];
export type Student = typeof mira | typeof jonah | typeof asha;
export type Subject = "reading" | "writing" | "math";
export type Mode = "support" | "stretch";
export const subjects: Subject[] = ["reading", "writing", "math"];
export const work = { mira: miraWork, jonah: jonahWork, asha: ashaWork };
export type StudentId = keyof typeof work;
export const themes: Record<string, { title: string; symbol: string; color: string; topic: string }> = {
  mira: { title: "Ocean explorer", symbol: "◒", color: "peach", topic: "A day by the sea" },
  jonah: { title: "Creative inventor", symbol: "✳", color: "lavender", topic: "Build a helpful robot" },
  asha: { title: "Garden designer", symbol: "❋", color: "sage", topic: "A garden of your own" },
};
export function readingWords(student: Student) { return student.reading.misreadings.map(x => x.word); }
export function writingPrompt(student: Student) { return student.id === "mira" ? "Tell me about a crab by the sea." : student.id === "jonah" ? "Tell me how your robot helps." : "Tell me how you would plant your garden."; }
