"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {approvedFocus} from "@/lib/analysis";
import { alignTranscript, analyzeReading, checkedStory, simulatedTranscript, validStory, wordBank, words, type ReadingObservation, type ReadingSource, type ReadingStudentId } from "@/lib/reading";
import { Dictate, Listen, useApp } from "./app-provider";

export function ReadingPractice() {
  const {student,modes,complete,recordReading,sessions}=useApp();const id=student.id as ReadingStudentId;
  const approved=approvedFocus(sessions[student.id]?.session_log??[],"reading");
  const [story,setStory]=useState(()=>checkedStory(id));
  const [source,setSource]=useState<ReadingSource>("typed");
  const [transcript,setTranscript]=useState("");
  const [retell,setRetell]=useState("");const [retellSaved,setRetellSaved]=useState(false);
  const [notice,setNotice]=useState("Checked demo story · Fictional sample student");
  const [busy,setBusy]=useState(false);const [error,setError]=useState("");
  const [observation,setObservation]=useState<ReadingObservation|null>(null);
  const [entry,setEntry]=useState<"transcript"|"word">("transcript");
  const [expected,setExpected]=useState(story.targetWords[0]);const [observed,setObserved]=useState("");
  const [pairs,setPairs]=useState<{expected:string;observed:string}[]>([]);
  const [highlight,setHighlight]=useState(-1);const [audioStatus,setAudioStatus]=useState("");
  const pending=useRef<AbortController|null>(null);
  const mode=modes[student.id].reading;
  const readStory=useCallback(()=>{
    if(!("speechSynthesis" in window)){setAudioStatus("Read-aloud is unavailable here. You can read the text.");return;}
    window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(story.text);utterance.rate=.8;
    utterance.onboundary=e=>{if(e.name==="word")setHighlight(words(story.text.slice(0,e.charIndex)).length);};
    utterance.onend=()=>{setHighlight(-1);setAudioStatus("");};
    utterance.onerror=()=>{setHighlight(-1);setAudioStatus("Read-aloud could not start. Try the Listen to story button.");};
    setAudioStatus("Reading the story…");window.speechSynthesis.speak(utterance);
  },[story.text,setAudioStatus,setHighlight]);
  useEffect(()=>{const frame=mode==="support"?window.requestAnimationFrame(readStory):null;return()=>{if(frame!==null)window.cancelAnimationFrame(frame);if("speechSynthesis"in window)window.speechSynthesis.cancel();};},[mode,readStory]);
  useEffect(()=>()=>{pending.current?.abort();pending.current=null;},[]);
  async function generate(){
    if(pending.current)return;const controller=new AbortController();pending.current=controller;setBusy(true);setError("");
    const timer=window.setTimeout(()=>controller.abort(),25000);
    try{
      const response=await fetch("/api/reading/story",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({studentId:id,mode}),signal:controller.signal,cache:"no-store"});
      if(!response.ok)throw new Error();const data=await response.json();
      if(!validStory(data.story,id)||!["ai","checked-demo"].includes(data.source))throw new Error();
      if(pending.current!==controller||controller.signal.aborted)return;
      setStory(data.story);setExpected(data.story.targetWords[0]);setTranscript("");setObserved("");setPairs([]);setObservation(null);setSource("typed");
      setNotice(data.source==="ai"?"New AI story · Word bank checked":"Checked demo story · Live generation was unavailable");
    }catch{if(pending.current===controller)setError("A new story is not ready. You can keep reading this one.");}
    finally{window.clearTimeout(timer);if(pending.current===controller){pending.current=null;setBusy(false);}}
  }
  function submit(){
    setError("");
    try{
      const comparison=entry==="transcript"?alignTranscript(story.text,transcript):{matchingWords:0,differences:pairs.map(pair=>({...pair,position:words(story.text).indexOf(pair.expected),kind:"substitution" as const}))};
      if(entry==="word"&&!pairs.length){setError("Add a word pair first.");return;}
      const result={...analyzeReading(story,entry==="word"?"manual":source,comparison),instructionalMode:mode};
      recordReading(result);setObservation(result);complete("reading",`${story.title}: ${result.differences.length} word differences submitted (${result.source}).`);
    }catch{setError("Add the words you read, using up to 400 words.");}
  }
  let tokenIndex=-1;
  return <div className="reading-practice"><div className="reading-toolbar"><span className="pill">{words(story.text).length} words</span><button type="button" className="outline-button" disabled={busy} onClick={()=>void generate()}>{busy?"Preparing a story…":"Generate a new story"}</button></div>
    <p className="fine" role="status">{notice}</p><p className="fine">A new story clears the transcript editor.</p>
    {approved&&<div className="hint-box"><p>Before this story, practice the words your teacher chose.</p><div className="word-grid">{[...new Set(approved.recommendedNextActivity.words)].filter(w=>wordBank(id).targetWords.includes(w)).map(w=><ApprovedWord key={w} word={w}/>)}</div><Listen text={approved.recommendedNextActivity.focus}/></div>}{mode==="stretch"&&<div className="hint-box"><h3>Learn the sound, then blend.</h3><p>{id==="mira"?"The letters ee work together to say the long e sound.":id==="jonah"?"In st, say the s sound and the t sound, then join them.":"The letters ar work together to make the ar sound."}</p><p className="sound-model">{story.targetWords[0].replace(id==="mira"?"ee":id==="jonah"?"st":"ar",m=>` [ ${m} ] `)}</p><Listen text={`${story.targetPattern}. Listen to ${story.targetWords[0]}. Now join the sounds and try the word.`} label="Hear the blending model"/></div>}<h3 className="story-title">{story.title}</h3>
    <div className="story-controls"><button className="outline-button" type="button" onClick={readStory}>Listen to story</button><button className="text-button" type="button" onClick={()=>{if("speechSynthesis"in window)window.speechSynthesis.cancel();setAudioStatus("");setHighlight(-1);}}>Stop reading</button></div>
    <p role="status" className="fine">{audioStatus}</p>
    <div className="story-passage" aria-label={story.title}>{story.text.split(/([a-z]+)/gi).map((part,i)=>{if(!/^[a-z]+$/i.test(part))return <span key={i}>{part}</span>;tokenIndex++;return <StoryWord key={i} word={part} active={highlight===tokenIndex} target={story.targetWords.includes(part.toLowerCase())}/>;})}</div>
    <div className="reading-focus"><strong>Today’s sound focus</strong><p>{story.targetPattern}</p><Listen text={`Today’s sound focus. ${story.targetPattern}. ${story.targetWords.join(", ")}`}/><p className="fine">Tap any story word to hear it.</p></div>
    <section className="comprehension"><h3>Let’s talk about the story</h3>{story.questions.map(q=><div key={q}><p>{q}</p><Listen text={q} label="Hear question"/></div>)}<p className="fine">You can tell your teacher your ideas.</p>{mode==="support"&&<><label className="input-label" htmlFor="story-meaning">Tell what happened in the story.</label><textarea id="story-meaning" rows={3} maxLength={1500} value={retell} onChange={e=>{setRetell(e.target.value);setRetellSaved(false);}}/><Dictate label="Speak my story ideas" onText={text=>{setRetell(old=>`${old} ${text}`.trim().slice(0,1500));setRetellSaved(false);}}/><button type="button" className="primary" disabled={!retell.trim()||retellSaved} onClick={()=>{complete("reading",`Supported comprehension: ${retell}`);setRetellSaved(true);}}>{retellSaved?"Story ideas saved":"Share my story ideas"}</button><Listen text="Tell what happened in the story. You can listen again while you think."/></>}</section>
    <section><h3>{mode==="support"?"Optional word observations":"Share the words you read"}</h3><p>Use a fictional demo transcript.</p><Listen text="Share the words you read. Use a fictional demo transcript. You can type the story or add a word pair."/>
      <label className="input-label" htmlFor="reading-entry">How would you like to share?</label><select id="reading-entry" value={entry} onChange={e=>{setEntry(e.target.value as "transcript"|"word");setObservation(null);}}><option value="transcript">Full typed or simulated transcript</option><option value="word">Individual word pairs</option></select>
      {entry==="transcript"?<><label className="input-label" htmlFor="reading-transcript">Words I read</label><textarea id="reading-transcript" rows={6} maxLength={4000} value={transcript} onChange={e=>{setTranscript(e.target.value);setSource("typed");setObservation(null);}} placeholder="Type the whole story as it was read…"/>
      <div className="transcript-tools"><button type="button" className="outline-button" onClick={()=>{setTranscript(simulatedTranscript(story,student.reading.misreadings));setSource("simulated");setObservation(null);}}>Load simulated reading</button><button type="button" className="text-button" onClick={()=>{setTranscript(story.text);setSource("simulated");setObservation(null);}}>Load a matching sample</button></div>
      <Dictate key={story.text} continuous label="Read with microphone" onText={text=>{setTranscript(old=>`${old} ${text}`.trim().slice(0,4000));setSource("speech");setObservation(null);}}/>
      <p className="fine">Input: {source}. Review speech text before submitting. Your browser may use an online speech service. This app saves no audio.</p></>:<form onSubmit={e=>{e.preventDefault();const said=words(observed);if(said.length!==1||said[0]===expected){setError("Add the one word you said instead.");return;}if(pairs.some(p=>p.expected===expected)){setError("That story word is already in your list.");return;}setPairs(old=>[...old,{expected,observed:said[0]}]);setObserved("");setError("");setObservation(null);}}>
        <label className="input-label" htmlFor="expected-word">Story word</label><select id="expected-word" value={expected} onChange={e=>setExpected(e.target.value)}>{[...new Set(words(story.text))].map(w=><option key={w} value={w}>{w}</option>)}</select>
        <label className="input-label" htmlFor="spoken-word">Word I said</label><input id="spoken-word" maxLength={40} value={observed} onChange={e=>setObserved(e.target.value)}/><Dictate onText={setObserved}/><button className="outline-button" type="submit">Add word pair</button>
        <ul>{pairs.map(pair=><li key={pair.expected}>{pair.expected} → {pair.observed} <button type="button" className="text-button" aria-label={`Remove ${pair.expected} pair`} onClick={()=>{setPairs(old=>old.filter(p=>p.expected!==pair.expected));setObservation(null);}}>Remove</button></li>)}</ul>
      </form>}
      <div className="lesson-actions"><button type="button" className="primary" disabled={busy||!!observation} onClick={submit}>{observation?"Reading saved":"Submit reading"}</button></div>
      {error&&<div className="hint-box" role="alert"><p>{error}</p><Listen text={error}/></div>}
      {observation&&<section className="feedback" aria-live="polite"><h3>You shared your reading.</h3><p>{observation.differences.length?"Let’s look at a few words together.":"The words in this transcript match the story."}</p><Listen text="You shared your reading. Your teacher can help you choose what to practice next."/><p className="fine">{observation.source} input · For teacher review</p>{observation.differences.length>0&&<ul>{observation.differences.map((d,i)=><li key={i}>{d.expected||"Added word"} → {d.observed||"Not in transcript"} <Listen text={d.expected||d.observed} label="Hear word"/></li>)}</ul>}<p className="fine">Text differences may come from typing or speech recognition. They are not a diagnosis or a reading score.</p></section>}
    </section><details className="reading-inventory"><summary>Adult view: checked word bank</summary><p className="fine">{wordBank(id).wordBankNote}</p><p className="fine">Mastered-pattern words: {wordBank(id).masteredWords.join(", ")}</p><p className="fine">Supported sight words: {wordBank(id).sightWords.join(", ")}</p><p className="fine">Target words: {story.targetWords.join(", ")}</p></details>
  </div>;
}
function StoryWord({word,active,target}:{word:string;active:boolean;target:boolean}){const {speak}=useApp();return <button type="button" onClick={()=>speak(word)} className={`story-word ${target?"target-word":""} ${active?"spoken-word":""}`} aria-label={`Hear ${word}`}>{word}</button>;}

function ApprovedWord({word}:{word:string}){const {speak}=useApp();return <button type="button" onClick={()=>speak(word)} aria-label={`Hear ${word}`}>{word}</button>;}
