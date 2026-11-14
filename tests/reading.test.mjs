import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
function setup({transport,key="test-only-credential",nodeEnv="development"}={}){
  let calls=0;
  function load(file,dependencies={}){
    const compiledModule={exports:{}};
    const {outputText}=ts.transpileModule(fs.readFileSync(path.join(root,file),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}});
    vm.runInNewContext(outputText,{module:compiledModule,exports:compiledModule.exports,structuredClone,Response,Request,URL,TextDecoder,Uint8Array,Uint16Array,Date,AbortSignal,process:{env:{NODE_ENV:nodeEnv,OPENAI_API_KEY:key}},fetch:async(...args)=>{calls++;return transport?transport(...args):new Response("upstream private body",{status:429});},require:name=>{
      if(name==="server-only")return {};
      if(dependencies[name])return dependencies[name];
      if(name.startsWith("@/data/"))return JSON.parse(fs.readFileSync(path.join(root,name.slice(2)),"utf8"));
      throw new Error("Unexpected import");
    }});
    return compiledModule.exports;
  }
  const reading=load("lib/reading.ts");
  const modes=load("lib/learning-modes.ts");
  const generator=load("lib/server/reading-story.ts",{"@/lib/reading":reading,"@/lib/learning-modes":modes});
  const route=load("app/api/reading/story/route.ts",{"@/lib/server/reading-story":generator});
  return {...reading,...generator,...route,calls:()=>calls};
}
function request(body={studentId:"mira"},origin="http://localhost:3000"){return new Request("http://localhost:3000/api/reading/story",{method:"POST",headers:{origin,"content-type":"application/json"},body:JSON.stringify(body)});}
test("all checked stories meet lengths, single-focus targets, inventory, and profile patterns",()=>{
  const h=setup();
  for(const id of ["mira","jonah","asha"]){
    const story=h.checkedStory(id),bank=h.wordBank(id);assert(h.validStory(story,id),`${id} story rejected`);
    const profile=JSON.parse(fs.readFileSync(path.join(root,`data/students/${id}.json`),"utf8"));
    assert(bank.interestIndex<profile.interests.length);assert(bank.sightWords.length<=15);
    for(const pattern of Object.values(bank.wordPatterns))assert(profile.reading.patterns_mastered.includes(pattern));
    assert.equal(story.questions.length,2);assert(story.targetWords.length>=6&&story.targetWords.length<=10);
  }
});
test("unapproved words, missing targets, other patterns, and long sentences are rejected",()=>{
  const h=setup(),s=h.checkedStory("mira");
  for(const changed of [{...s,text:s.text+" A spaceship lands."},{...s,title:"An adventure"},{...s,targetPattern:"oa"},{...s,targetWords:["seed"]},{...s,questions:["One?"]},{...s,text:"I sit."},{...s,text:s.text.replaceAll(".","")}])assert(!h.validStory(changed,"mira"));
});
test("live generation returns validated structured output and never sends its key in the prompt",async()=>{
  const story=setup().checkedStory("mira");let payload;
  const h=setup({transport:(_url,options)=>{payload=JSON.parse(options.body);assert(!options.body.includes("test-only-credential"));return Response.json({status:"completed",output:[{type:"message",role:"assistant",content:[{type:"output_text",text:JSON.stringify(story)}]}]});}});
  const result=await h.generateReadingStory("mira");assert.equal(result.source,"ai");assert.equal(payload.store,false);assert.equal(payload.text.format.strict,true);assert(payload.input.includes("building sand forts"));
});
test("provider failures and out-of-bank stories safely use a checked fallback",async()=>{
  const invalid={...setup().checkedStory("mira"),text:"A spaceship arrives."};
  for(const transport of [()=>new Response("private credential error",{status:429}),()=>{throw new Error("private key");},()=>Response.json({status:"completed",output:[{type:"message",role:"assistant",content:[{type:"output_text",text:JSON.stringify(invalid)}]}]})]){
    const h=setup({transport});const result=await h.generateReadingStory("mira");assert.equal(result.source,"checked-demo");assert(h.validStory(result.story,"mira"));assert(!JSON.stringify(result).includes("private"));
  }
  const missing=setup({key:""});assert.equal((await missing.generateReadingStory("mira")).source,"checked-demo");assert.equal(missing.calls(),0);
});
test("story endpoint rejects origin, invalid learners, extra prompt fields, large bodies, and production access",async()=>{
  const h=setup();assert.equal((await h.POST(request({},"https://other.example"))).status,403);
  for(const body of [{studentId:"__proto__"},{studentId:["mira"]},{studentId:"mira",prompt:"override"}])assert.equal((await h.POST(request(body))).status,400);
  assert.equal((await h.POST(request({studentId:"x".repeat(300)}))).status,413);
  assert.equal((await setup({nodeEnv:"production"}).POST(request())).status,403);assert.equal(h.calls(),0);
});
test("token alignment isolates substitutions, omissions and additions without shifting every later word",()=>{
  const h=setup();const same=h.alignTranscript("Seed, feet!","SEED feet.");assert.equal(same.matchingWords,2);assert.equal(same.differences.length,0);
  const d=h.alignTranscript("I see a seed in a cup.","I see um a sed in cup.");assert.equal(d.differences.length,3);assert(d.differences.some(x=>x.kind==="insertion"&&x.observed==="um"));assert(d.differences.some(x=>x.kind==="substitution"&&x.expected==="seed"&&x.observed==="sed"));assert(d.differences.some(x=>x.kind==="omission"&&x.expected==="a"));
  assert.throws(()=>h.alignTranscript("I sit.",""));assert.throws(()=>h.alignTranscript("I sit.","a ".repeat(401)));
});
test("simulated readings produce evidence-linked, clearly synthetic repeated observations",()=>{
  const h=setup();for(const id of ["mira","jonah","asha"]){const story=h.checkedStory(id);const profile=JSON.parse(fs.readFileSync(path.join(root,`data/students/${id}.json`),"utf8"));const transcript=h.simulatedTranscript(story,profile.reading.misreadings);const result=h.analyzeReading(story,"simulated",h.alignTranscript(story.text,transcript));assert.equal(result.source,"simulated");assert.equal(result.status,"pattern_supported");assert(result.differences.length>=2);assert(result.matchingWords>0);assert(result.needsTeacherReview);assert(result.date);}
});
test("one target substitution stays tentative; additions and skipped text never establish a target pattern",()=>{
  const h=setup(),s=h.checkedStory("mira");const one=h.analyzeReading(s,"typed",h.alignTranscript(s.text,s.text.replace("feet","fit")));assert.equal(one.status,"seen once, watching");
  const omitted=h.analyzeReading(s,"speech",h.alignTranscript(s.text,"I sit in the sand."));assert.equal(omitted.status,"no target pattern observed");assert(omitted.differences.some(d=>d.kind==="omission"));
});
