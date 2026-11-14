"use client";
import { useEffect, useRef, useState } from "react";
import { askCompanion } from "@/lib/companion-client";
import { skillObjective, type CompanionReply, type CompanionRequest } from "@/lib/companion-contract";
import { work, type Mode, type StudentId, type Subject } from "@/lib/students";
import { Dictate, Listen, useApp } from "./app-provider";

export function LivePractice({ subject, mode, fallbackHint }: { subject: Subject; mode: Mode; fallbackHint: string }) {
  const { student, sessions, draft, complete } = useApp();
  const response = sessions[student.id]?.drafts[subject] ?? "";
  const finished = sessions[student.id]?.activities.some(a => a.subject === subject);
  const [reply, setReply] = useState<CompanionReply | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showLocalHint, setShowLocalHint] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [question, setQuestion] = useState("");
  const [canSave, setCanSave] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => { controller.current?.abort(); controller.current = null; }, []);

  async function send(intent: CompanionRequest["intent"]) {
    if (controller.current) return;
    const message = intent === "question" ? question.trim() : response.trim() || (intent === "hint" ? "Please give me a hint for this activity." : "");
    if (!message) { setError(intent === "question" ? "Add your question first." : "Add your idea first, or use your voice."); return; }
    const active = new AbortController(); controller.current = active;
    setBusy(true); setError(""); setReply(null); setCanSave(false);
    const nextAttempt = intent === "feedback" ? Math.min(attempts + 1, 2) as 1 | 2 : 1;
    const timer = window.setTimeout(() => active.abort(), 25_000);
    try {
      const result = await askCompanion({ studentId: student.id as StudentId, subject, mode, skillObjective: skillObjective(student, subject,mode), message, intent, attempt: nextAttempt }, active.signal);
      if (controller.current !== active || active.signal.aborted) return;
      setReply(result);
      if (intent === "feedback") {
        setAttempts(nextAttempt);
        if (subject === "math") {
          const expected = work[student.id as StudentId].activities.math[0].expected_answer;
          if (Number(message) === Number(expected) || nextAttempt === 2) complete(subject, response);
        } else setCanSave(true);
      }
    } catch (cause) {
      if (controller.current !== active) return;
      setError(active.signal.aborted ? "bloomi took a little too long. Your idea is still here. Please try again." : cause instanceof Error ? cause.message : "bloomi could not reply. Please try again.");
    } finally {
      window.clearTimeout(timer);
      if (controller.current === active) { controller.current = null; setBusy(false); }
    }
  }
  const workedExample = reply?.workedExample ?? (finished && subject === "math" && attempts === 2 ? `${work[student.id as StudentId].activities.math[0].expression} = ${work[student.id as StudentId].activities.math[0].expected_answer}. Check it with the visual model.` : null);
  return <div aria-busy={busy}>
    <p className="fine">Live AI guidance · Use fictional demo ideas only.</p>
    <form onSubmit={event => { event.preventDefault(); void send("feedback"); }}>
      <label className="input-label" htmlFor="response">{subject === "reading" ? "Which word would you like to practice?" : subject === "writing" ? "Your idea" : "Your answer"}</label>
      <textarea id="response" maxLength={2000} rows={subject === "writing" ? 4 : 2} readOnly={finished || busy} value={response} inputMode={subject === "math" ? "numeric" : "text"}
        onBlur={() => { if (subject === "writing" && mode === "support" && !finished && !busy) { let corrected = response; for (const x of student.writing.misspellings) corrected = corrected.replace(new RegExp(`\\b${x.student_writes}\\b`, "gi"), x.word); if (corrected !== response) draft(subject, corrected); } }}
        onChange={event => { draft(subject, event.target.value); setCanSave(false); }} placeholder="Type here, or use your voice…" />
      {!finished && !busy && <Dictate onText={text => { draft(subject, `${response} ${text}`.trim().slice(0, 2000)); setCanSave(false); }}/>}
      <div className="lesson-actions"><button type="button" className="outline-button" disabled={busy} onClick={() => void send("hint")}>A little hint</button><button type="submit" className="primary" disabled={busy || finished}>{busy ? "bloomi is thinking…" : finished ? "Practice saved" : "Share my thinking"}</button></div>
    </form>
    {busy && <p role="status">bloomi is finding a helpful next step…</p>}
    {error && <div className="hint-box" role="alert"><p>{error}</p><Listen text={error}/><button className="text-button" type="button" onClick={() => setShowLocalHint(true)}>Use a saved hint instead</button></div>}
    {showLocalHint && <div className="hint-box"><strong>Saved activity hint</strong><p>{fallbackHint}</p><Listen text={fallbackHint}/></div>}
    {reply && <section className="feedback" aria-label="bloomi’s guidance" aria-live="polite"><p>{reply.feedback}</p><Listen text={reply.feedback}/><h3>A little hint</h3><p>{reply.hint}</p><Listen text={reply.hint}/><h3>Your next step</h3><p>{reply.nextStep}</p><Listen text={reply.nextStep}/>{workedExample && <><h3>Let’s look together</h3><p>{workedExample}</p><Listen text={workedExample}/></>}{reply.needsTeacherReview && <p className="fine">Your teacher can help us look at this together.</p>}{canSave && !finished && <button type="button" className="outline-button" onClick={() => complete(subject, response)}>Save this practice</button>}</section>}
    <div className="question-row"><button type="button" className="text-button" onClick={() => setShowQuestion(!showQuestion)}>I have a question</button><span>Questions are never scored.</span></div>
    {showQuestion && <form onSubmit={event => { event.preventDefault(); void send("question"); }}><label className="input-label" htmlFor="question">What would you like to ask?</label><textarea id="question" maxLength={2000} rows={2} value={question} readOnly={busy} onChange={event => setQuestion(event.target.value)}/>{!busy && <Dictate onText={text => setQuestion(old => `${old} ${text}`.trim().slice(0,2000))}/>}<button className="outline-button" disabled={busy} type="submit">Ask bloomi</button></form>}
  </div>;
}
