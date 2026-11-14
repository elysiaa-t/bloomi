"use client";
import {useEffect,useRef,useState} from "react";
import {modePolicy} from "@/lib/learning-modes";
import {approvedFocus} from "@/lib/analysis";
import {mathProblem,type MathLearner} from "@/lib/math";
import {askCompanion} from "@/lib/companion-client";
import {skillObjective,type CompanionReply} from "@/lib/companion-contract";
import {Dictate,Listen,useApp} from "./app-provider";
export function MathPractice(){
  const {student,modes,sessions,draft,complete,recordMath}=useApp();const mode=modes[student.id].math;
  const policy=modePolicy(student,"math",mode);
  const approved=approvedFocus(sessions[student.id]?.session_log??[],"math");
  const [index,setIndex]=useState(approved?.recommendedNextActivity.problemIndex??0);const problem=mathProblem(student.id as MathLearner,index);
  const [answer,setAnswer]=useState("");const reasoning=sessions[student.id]?.drafts.math??"";
  const [attempts,setAttempts]=useState(0);const [visual,setVisual]=useState(mode==="support"||approved?1:0);const [reply,setReply]=useState<CompanionReply|null>(null);const [busy,setBusy]=useState(false);const [status,setStatus]=useState("");const [saved,setSaved]=useState(false);const [offline,setOffline]=useState(false);const [calculated,setCalculated]=useState(false);
  const pending=useRef<AbortController|null>(null);
  useEffect(()=>()=>{pending.current?.abort();pending.current=null;},[]);
  async function submit(){
    if(pending.current)return;if(!answer.trim()||!Number.isFinite(Number(answer))){setStatus("Add a number for your answer.");return;}if(!reasoning.trim()){setStatus("Tell me how you worked it out.");return;}
    recordMath(index,answer,reasoning);
    const attempt=Math.min(attempts+1,2) as 1|2;const correct=Number(answer)===problem.answer;
    setBusy(true);setStatus("");setReply(null);setOffline(false);const controller=new AbortController();pending.current=controller;const timer=window.setTimeout(()=>controller.abort(),25000);
    try{const result=await askCompanion({studentId:student.id as MathLearner,subject:"math",mode,skillObjective:skillObjective(student,"math",mode),message:JSON.stringify({answer,reasoning}),intent:"feedback",attempt,problemIndex:index},controller.signal);if(pending.current!==controller||controller.signal.aborted)return;setReply(result);}
    catch{if(pending.current!==controller)return;setOffline(true);setStatus("Live bloomi is unavailable. The checked math guide is here to help.");}
    finally{window.clearTimeout(timer);if(pending.current===controller){pending.current=null;setBusy(false);}}
    if(controller.signal.aborted)return;
    setAttempts(attempt);if(!correct)setVisual(attempt===2?3:Math.max(visual,1));
    if(correct||attempt===2){complete("math",`${problem.prompt}\nAnswer: ${answer}\nMy reasoning: ${reasoning}`);setSaved(true);setStatus(correct?"Thank you for explaining your thinking. Your answer matches this model.":"Thank you for staying with it. Let’s look at the model together.");}
    else setStatus("You shared your thinking. Use the visual hint, then try once more.");
  }
  function next(){if(index>=2)return;setIndex(index+1);setAnswer("");draft("math","");setReply(null);setAttempts(0);setVisual(mode==="support"?1:0);setSaved(false);setStatus("");setCalculated(false);setOffline(false);}
  return <section className="math-practice"><h3>A problem from your world</h3><p>{mode==="support"?"Use the calculator to find the amount, then explain what it means.":"Try the calculation first, then explain the steps you took."}</p>{approved&&<div className="hint-box"><p>Your teacher chose this focus: {approved.recommendedNextActivity.focus}</p><Listen text={approved.recommendedNextActivity.focus}/></div>}<p>{problem.prompt}</p><Listen text={problem.prompt}/><div className="math-expression">{problem.expression} = ?</div>
    <form onSubmit={e=>{e.preventDefault();void submit();}}><label className="input-label" htmlFor="math-answer">My answer</label><input id="math-answer" inputMode="numeric" maxLength={10} readOnly={busy||saved} value={answer} onChange={e=>setAnswer(e.target.value)}/>{!busy&&!saved&&<Dictate onText={setAnswer}/>}
      <label className="input-label" htmlFor="math-reasoning">How did you work it out?</label><p>Help me see each step you took.</p><Listen text="How did you work it out? Help me see each step you took."/><textarea id="math-reasoning" rows={4} maxLength={1200} readOnly={busy||saved} value={reasoning} onChange={e=>draft("math",e.target.value)} placeholder="I started by…"/>{!busy&&!saved&&<Dictate onText={text=>draft("math",`${reasoning} ${text}`.trim().slice(0,1200))}/>}
      <div className="lesson-actions"><button type="button" className="outline-button" disabled={busy} onClick={()=>setVisual(v=>Math.max(1,v))}>Show a visual hint</button><button type="submit" className="primary" disabled={busy||saved}>{busy?"Thinking together…":saved?"Practice saved":"Share my reasoning"}</button></div></form>
    {busy&&<p role="status">bloomi is looking at your steps…</p>}{status&&<div className="feedback" role="status"><p>{status}</p>{offline&&<p className="fine">Saved, verified math guide</p>}<Listen text={status}/></div>}
    {reply&&<div className="feedback"><p>{reply.feedback}</p><p>{reply.hint}</p><p>{reply.nextStep}</p>{attempts===2&&reply.workedExample&&<p>{reply.workedExample}</p>}<Listen text={[reply.feedback,reply.hint,reply.nextStep,attempts===2?reply.workedExample:""].filter(Boolean).join(" ")}/>{reply.needsTeacherReview&&<p className="fine">Your teacher can help us review these steps.</p>}</div>}
    {visual>0&&<section className="support-box" aria-label="Visual math explanation"><h3>Let’s make it visible</h3><p>{mode==="support"?"Here is the first worked step.":"Let?s practice one step together."}</p><p>{problem.firstStep}</p><Listen text={problem.firstStep}/>
      {student.id==="mira"?<><ol className="number-line" aria-label="Backward moves on a number line">{Array.from({length:Math.min(visual===1?1:visual===2?2:problem.b,problem.b)+1},(_,i)=><li key={i}><span>{problem.a-i}</span>{i>0&&<small>back {i}</small>}</li>)}</ol><p>Each move takes away one shell.</p></>:student.id==="jonah"?<div className="math-groups" aria-label={`${visual===1?1:problem.b} trays with ${problem.a} bolts in each`}>{Array.from({length:visual===1?1:problem.b},(_,i)=><div className="math-tray" key={i}><strong>Tray {i+1}</strong><div aria-hidden="true">{Array.from({length:problem.a},(_,j)=><span key={j}>●</span>)}</div><span>{problem.a} bolts</span></div>)}</div>:<div className="place-value-model"><div><h4>Tens</h4><div className="ten-bars">{Array.from({length:visual<2?Math.floor(problem.a/10)-1:Math.floor(problem.answer/10)},(_,i)=><span key={i}>10</span>)}</div></div><div><h4>Ones</h4><div className="one-blocks">{Array.from({length:visual<2?problem.a%10+10:problem.answer%10},(_,i)=><span key={i}>1</span>)}</div></div>{visual>=2&&<p>Take away {Math.floor(problem.b/10)} tens and {problem.b%10} ones.</p>}</div>}
      {visual>=3&&<div className="math-solution"><strong>{problem.expression} = {problem.answer}</strong><p>{problem.explanation}</p><Listen text={problem.explanation}/></div>}{visual<3&&<button type="button" className="outline-button" onClick={()=>setVisual(v=>v+1)}>Show the next visual step</button>}
    </section>}
    {policy.calculatorAvailable&&<details className="calculator"><summary>Calculator for this problem</summary><button className="outline-button" type="button" onClick={()=>setCalculated(true)}>Calculate {problem.expression}</button>{calculated&&<><output aria-live="polite">{problem.answer}</output><Listen text={`${problem.expression} equals ${problem.answer}`}/></>}</details>}
    {saved&&index<2&&<button type="button" className="outline-button next-action" onClick={next}>Try another {student.id==="mira"?"shell":student.id==="jonah"?"robot":"garden"} problem</button>}
  </section>;
}
