"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { students, type Mode, type Student, type Subject } from "@/lib/students";
import {analyzeMathResponse,analyzeWritingResponse,readingAnalysis,reviewObservation,approvedFocus,type AnalysisObservation} from "@/lib/analysis";
import type { MathLearner } from "@/lib/math";
import type { WritingPlan } from "@/lib/writing";
import type { ReadingObservation } from "@/lib/reading";
export type Activity = { subject: Subject; response: string; mode: Mode; completed: boolean };
type Session = { activities: Activity[]; drafts: Partial<Record<Subject, string>>; writingPlan?: WritingPlan; session_log?: AnalysisObservation[]; reading_records?: ReadingObservation[] };
type Context = { student: Student & {instructional_focus:Partial<Record<Subject,string>>}; select: (id: string) => void; sessions: Record<string, Session>; draft: (subject: Subject, value: string) => void; complete: (subject: Subject, response: string) => void; recordReading: (observation: ReadingObservation) => void; saveWritingPlan: (plan: WritingPlan) => void; recordMath: (index:number,answer:string,reasoning:string,source?:string) => void; reviewAnalysis: (analysisId:string,status:"approved"|"rejected")=>void; modes: Record<string, Record<Subject, Mode>>; setMode: (subject: Subject, mode: Mode) => void; speak: (text: string) => void; speechStatus: string };
const AppContext = createContext<Context | null>(null);
export function useApp() { const value = useContext(AppContext); if (!value) throw new Error("App provider is missing"); return value; }
export function AppProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState("mira");
  const [sessions, setSessions] = useState<Record<string, Session>>({});
  const [modes, setModes] = useState<Record<string, Record<Subject, Mode>>>(() => Object.fromEntries(students.map(s => [s.id, s.support_or_stretch as Record<Subject, Mode>])));
  const [speechStatus, setSpeechStatus] = useState("");
  const baseStudent = students.find(s => s.id === id) ?? students[0];
  const student = {...baseStudent,instructional_focus:Object.fromEntries((["reading","writing","math"] as const).flatMap(subject=>{const focus=approvedFocus(sessions[id]?.session_log??[],subject);return focus?[[subject,focus.proposedProfileUpdate.value]]:[];}))}; const pathname = usePathname();
  function speak(text: string) {
    if (!("speechSynthesis" in window)) { setSpeechStatus("Read-aloud is unavailable in this browser."); return; }
    window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.rate = .85;
    utterance.onerror = () => setSpeechStatus("Read-aloud could not start. You can still read the text."); utterance.onend = () => setSpeechStatus("");
    setSpeechStatus("Reading aloud…"); window.speechSynthesis.speak(utterance);
  }
  function select(next: string) { if (students.some(s => s.id === next)) { setId(next); if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel(); setSpeechStatus(""); } }
  function draft(subject: Subject, value: string) { setSessions(old => ({ ...old, [id]: { ...old[id], activities: old[id]?.activities ?? [], drafts: { ...old[id]?.drafts, [subject]: value } } })); }
  function complete(subject: Subject, response: string) { setSessions(old => ({ ...old, [id]: { ...old[id], ...(subject === "writing" ? {session_log:[...(old[id]?.session_log??[]),analyzeWritingResponse(id,response,student.writing.misspellings,old[id]?.session_log??[],modes[id].writing)]}:{}), drafts: old[id]?.drafts ?? {}, activities: [...(old[id]?.activities ?? []).filter(a => a.subject !== subject), { subject, response, mode: modes[id][subject], completed: true }] } })); }
  function recordReading(observation:ReadingObservation){setSessions(old=>({...old,[id]:{...old[id],drafts:old[id]?.drafts??{},activities:old[id]?.activities??[],reading_records:[...(old[id]?.reading_records??[]),observation],session_log:[...(old[id]?.session_log??[]),readingAnalysis(id,observation,old[id]?.session_log??[])]}}));}
  function recordMath(index:number,answer:string,reasoning:string,source?:string){setSessions(old=>({...old,[id]:{...old[id],drafts:old[id]?.drafts??{},activities:old[id]?.activities??[],session_log:[...(old[id]?.session_log??[]),analyzeMathResponse(id as MathLearner,index,answer,reasoning,old[id]?.session_log??[],source,source==="simulated"?"stretch":modes[id].math)]}}));}
  function reviewAnalysis(analysisId:string,status:"approved"|"rejected"){setSessions(old=>old[id]?({...old,[id]:{...old[id],session_log:reviewObservation(old[id].session_log??[],analysisId,status)}}):old);}
  function saveWritingPlan(plan:WritingPlan){setSessions(old=>({...old,[id]:{...old[id],drafts:old[id]?.drafts??{},activities:old[id]?.activities??[],writingPlan:plan}}));}
  return <AppContext.Provider value={{ student, select, sessions, draft, complete, recordReading, saveWritingPlan, recordMath, reviewAnalysis, modes, setMode: (subject, mode) => setModes(old => ({ ...old, [id]: { ...old[id], [subject]: mode } })), speak, speechStatus }}>
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="topbar"><div className="topbar-inner"><Link href="/" className="brand" aria-label="bloomi home"><span className="brand-mark" aria-hidden="true">✳</span>bloomi<span className="brand-caption">a little help. a lot of possibility.</span></Link><span className="demo-badge"><span className="status-dot" /> Fictional demo</span></div></header>
    <div className="app-frame"><aside className="sidebar"><div><p className="eyebrow">Your learning space</p><nav aria-label="Main navigation">{[{ href: "/", title: "Our learners", icon: "◉" }, { href: "/companion", title: "Learning companion", icon: "✳" }, { href: "/progress", title: "Progress dashboard", icon: "▥" }].map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} className={`nav-item ${pathname === link.href ? "active" : ""}`}><span aria-hidden="true">{link.icon}</span>{link.title}</Link>)}</nav></div>
    <div className="sidebar-bottom"><div className="small-flower" aria-hidden="true">❋</div><strong>Every mind grows<br />in its own way.</strong><p>One step at a time,<br />with room to be you.</p><p className="fine">Supports teacher-led learning.</p></div></aside>
    <div className="content-wrap"><div className="context-bar"><span>Made for your kind of mind</span><button type="button" className="listen" onClick={() => speak(document.getElementById("main")?.innerText ?? "")}>Listen to page</button>{pathname !== "/" && <label className="profile-switch">Learner <select aria-label="Switch learner" value={student.id} onChange={e => select(e.target.value)}>{students.map(s => <option key={s.id} value={s.id}>{s.name} · Grade {s.grade}</option>)}</select></label>}</div><main id="main" tabIndex={-1}>{children}</main><footer>FICTIONAL — SYNTHETIC DEMO DATA <span>Thoughtfully different. Together.</span></footer></div></div>
    <div className="sr-only" role="status">{speechStatus}</div>
  </AppContext.Provider>;
}
export function Listen({ text, label = "Listen" }: { text: string; label?: string }) { const { speak, speechStatus } = useApp(); return <><button type="button" className="listen" onClick={() => speak(text)}><span aria-hidden="true">◖))</span> {label}</button>{speechStatus.includes("unavailable") || speechStatus.includes("could not") ? <span role="status" className="fine">{speechStatus}</span> : null}</>; }
type Recognition = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((event: { resultIndex: number; results: ({ transcript: string }[] & { isFinal: boolean })[] }) => void) | null; onerror: ((event: { error: string }) => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };
export function Dictate({ onText, continuous = false, label = "Use my voice" }: { onText: (text: string) => void; continuous?: boolean; label?: string }) {
  const [status, setStatus] = useState(""); const ref = useRef<Recognition | null>(null);
  useEffect(() => () => ref.current?.stop(), []);
  function start() {
    if (ref.current) { ref.current.stop(); ref.current = null; setStatus(""); return; }
    const browser = window as typeof window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Constructor = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Constructor) { setStatus("Dictation is unavailable here. You can type instead."); return; }
    const recognition = new Constructor(); ref.current = recognition; recognition.lang = "en-US";
    recognition.continuous = continuous; recognition.interimResults = false;
    recognition.onresult = event => { for(let i=event.resultIndex;i<event.results.length;i++) if(event.results[i].isFinal) onText(event.results[i][0].transcript); };
    recognition.onerror = event => setStatus(event.error === "not-allowed" ? "Microphone permission was not given. You can type instead." : "We could not hear you. You can type instead.");
    recognition.onend = () => { ref.current = null; setStatus(old => old === "Listening…" ? "" : old); };
    try { recognition.start(); setStatus("Listening…"); } catch { ref.current = null; setStatus("Dictation could not start. You can type instead."); }
  }
  return <div className="dictation"><button className="text-button" type="button" onClick={start}>♩ {status === "Listening…" ? "Stop dictation" : label}</button><span role="status" className="fine">{status}</span></div>;
}
