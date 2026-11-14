import {test}from"node:test";
import assert from"node:assert/strict";
import fs from"node:fs";
import vm from"node:vm";
import ts from"typescript";
import path from"node:path";
import{fileURLToPath}from"node:url";
import{webcrypto}from"node:crypto";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
function load(file,dependencies={}){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:m.exports,module:m,crypto:webcrypto,require:name=>dependencies[name]});return m.exports;}
const math=load("lib/math.ts"),a=load("lib/analysis.ts",{"./math":math});
test("one error is tentative, retries do not inflate evidence, and two tasks support a repeated hypothesis",()=>{
 const first=a.analyzeMathResponse("asha",0,"36","I subtracted each smaller digit from the larger.");assert.equal(first.misconceptionHypothesis.status,"seen once, watching");assert.equal(first.uncertainty.level,"high");assert.equal(first.review.status,"pending");assert.equal(first.evidence[0].expected,"24");
 const retry=a.analyzeMathResponse("asha",0,"36","I used the same steps.",[first]);assert.equal(retry.misconceptionHypothesis.independentExamples,1);
 const second=a.analyzeMathResponse("asha",1,"24","I did 6 minus 4 and 7 minus 3.",[first,retry]);assert.equal(second.misconceptionHypothesis.independentExamples,2);assert.equal(second.misconceptionHypothesis.status,"repeated evidence");assert(second.recommendedNextActivity.problemIndex>=0);assert(second.strengths.length);
});
test("pending and rejected updates never adapt activities; approval is reversible and subject-specific",()=>{
 const entry=a.analyzeMathResponse("mira",0,"10","I counted 12, 11, 10.");assert.equal(a.approvedFocus([entry],"math"),undefined);
 const approved=a.reviewObservation([entry],entry.id,"approved");assert.equal(a.approvedFocus(approved,"math").id,entry.id);assert.equal(a.approvedFocus(approved,"reading"),undefined);assert.equal(entry.review.status,"pending");
 assert.equal(a.approvedFocus(a.reviewObservation(approved,entry.id,"rejected"),"math"),undefined);
});
test("rejected evidence and another student's work cannot establish a repeated pattern",()=>{
 const first=a.analyzeMathResponse("asha",0,"36","I subtracted the smaller digits.");const rejected=a.reviewObservation([first],first.id,"rejected");
 assert.equal(a.analyzeMathResponse("asha",1,"24","I subtracted the smaller digits.",rejected).misconceptionHypothesis.independentExamples,1);
 const foreign={...first,studentId:"mira"};assert.equal(a.analyzeMathResponse("asha",1,"24","I used the columns.",[foreign]).misconceptionHypothesis.independentExamples,1);
});
test("correct and unclassified answers do not invent misconceptions",()=>{
 const correct=a.analyzeMathResponse("jonah",0,"24","I drew four groups of six.");assert.equal(correct.misconceptionHypothesis.status,"not established");assert.equal(correct.misconceptionHypothesis.key,"matched");
 const unknown=a.analyzeMathResponse("mira",0,"5","I guessed.");assert.equal(unknown.misconceptionHypothesis.key,"unclassified");assert.equal(unknown.uncertainty.level,"high");assert.throws(()=>a.analyzeMathResponse("mira",0,"",""));
});
test("writing evidence quotes text and preserves uncertainty about intended spelling",()=>{
 const result=a.analyzeWritingResponse("mira","I put a sed by my fet.",[{word:"seed",student_writes:"sed"},{word:"feet",student_writes:"fet"}]);assert.equal(result.evidence.length,2);assert(result.evidence.every(e=>e.expected.includes("possible intended")));assert(result.uncertainty.reason.includes("teacher"));assert.equal(result.review.status,"pending");assert.equal(result.recommendedNextActivity.words.length,2);
});
test("reading analysis uses only target-word substitutions and labels simulated sources",()=>{
 const reading={date:new Date().toISOString(),subject:"reading",storyTitle:"A Sand Hut",source:"simulated",targetWords:["seed","feet"],differences:[{expected:"seed",observed:"sed",position:1,kind:"substitution"},{expected:"feet",observed:"fit",position:4,kind:"substitution"},{expected:"the",observed:"a",position:8,kind:"substitution"}],matchingWords:80,status:"pattern_supported",description:"Two target substitutions.",suggestedFocus:"Blend ee words.",strengths:"80 words matched."};
 const result=a.readingAnalysis("mira",reading);assert.equal(result.evidence.length,2);assert.equal(result.misconceptionHypothesis.status,"repeated evidence");assert(result.evidence.every(e=>e.source==="simulated"));assert(result.uncertainty.reason.includes("recognition"));
});
test("explanation arithmetic is checked even when the final answer matches",()=>{
 const result=a.analyzeMathResponse("jonah",0,"24","I used 6 + 4 = 24.");assert.equal(result.misconceptionHypothesis.key,"arithmetic-step-mismatch");assert.equal(result.reasoningChecks[0].expected,10);assert.equal(result.reasoningChecks[0].claimed,24);assert.equal(result.reasoningChecks[0].consistent,false);
 const transcription=a.analyzeMathResponse("asha",0,"36","52 minus 28 equals 24.");assert.equal(transcription.misconceptionHypothesis.key,"answer-explanation-disagreement");
});
test("accommodated Support work is not treated as independent target-skill evidence",()=>{
 const m=a.analyzeMathResponse("asha",0,"36","I used a calculator.",[],"student explanation","support");assert.equal(m.misconceptionHypothesis.status,"not established");assert.equal(m.instructionalMode,"support");
 const w=a.analyzeWritingResponse("mira","A sed.",[{word:"seed",student_writes:"sed"}],[],"support");assert.equal(w.misconceptionHypothesis.status,"not established");assert(w.evidence[0].explanation.includes("accommodations"));
});
