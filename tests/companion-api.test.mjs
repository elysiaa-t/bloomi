import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Compile the real handlers in an isolated runtime with no access to the
// developer's environment or network. The credential below is fake test data.
const guidance = {feedback:"You chose a word to practice.",hint:"Look at ee in seed.",nextStep:"Say the long e sound.",workedExample:null,needsTeacherReview:false};
function harness({ key = "synthetic-test-credential", transport, nodeEnv = "development" } = {}) {
  const requests = [];
  const env = { NODE_ENV: nodeEnv, OPENAI_API_KEY: key };
  function load(relative, dependencies = {}) {
    const compiledModule = { exports: {} };
    const source = fs.readFileSync(path.join(__dirname, "..", relative), "utf8");
    const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
    const context = vm.createContext({ module: compiledModule, exports: compiledModule.exports, process: { env }, Response, Request, URL, TextDecoder, Uint8Array, AbortSignal, Date,
      fetch: async (...args) => { requests.push(args); return transport ? transport(...args) : Response.json({ status: "completed", output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: JSON.stringify(guidance) }] }] }); },
      require: name => {
        if (name === "server-only") return {};
        if (dependencies[name]) return dependencies[name];
        if (name.startsWith("@/data/students/")) return JSON.parse(fs.readFileSync(path.join(__dirname, "..", name.slice(2)), "utf8"));
        throw new Error("Unexpected dependency");
      },
    });
    vm.runInContext(outputText, context);
    return compiledModule.exports;
  }
  const contract = load("lib/companion-contract.ts");
  const math = load("lib/math.ts");
  const modes = load("lib/learning-modes.ts");
  const helper = load("lib/server/companion.ts", { "@/lib/companion-contract": contract, "@/lib/math": math, "@/lib/learning-modes": modes });
  const client = load("lib/companion-client.ts", { "./companion-contract": contract });
  const route = load("app/api/companion/route.ts", { "@/lib/server/companion": helper });
  return { ...route, requests, client, math, modes, contract };
}
const valid = { studentId: "mira", subject: "reading", mode: "stretch", skillObjective: "Practice ee representing long e.", message: "Help me read seed.", intent: "feedback", attempt: 1 };
function request(body = valid, { origin = "http://localhost:3000", contentType = "application/json", host = "http://localhost:3000", ...headers } = {}) {
  return new Request(host + "/api/companion", { method: "POST", headers: { Origin: origin, "Content-Type": contentType, ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });
}

test("successful request keeps credentials exclusively in the server auth header", async () => {
  const h = harness(); const response = await h.POST(request());
  assert.equal(response.status, 200); assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { reply: guidance, fictional: true });
  const [url, options] = h.requests[0];
  assert.equal(url, "https://api.openai.com/v1/responses");
  assert.equal(options.headers.Authorization, "Bearer synthetic-test-credential");
  assert(!options.body.includes("synthetic-test-credential"));
  const payload = JSON.parse(options.body); assert.equal(payload.store, false); assert.equal(payload.max_output_tokens, 600);
  assert.equal(payload.text.format.type,"json_schema"); assert.equal(payload.text.format.strict,true);
  const context = JSON.parse(payload.instructions.split("Trusted fictional learning context: ")[1]);
  assert.equal(context.profile.id,"mira"); assert.equal(context.profile.fictional,true); assert.equal(context.skillObjective,valid.skillObjective); assert.equal(context.mode,"stretch"); assert.equal(options.redirect, "error");
});
test("missing or placeholder credentials return a safe 503 without calling OpenAI", async () => {
  for (const key of ["", "your_actual_api_key_here"]) { const h = harness({ key }); assert.equal((await h.POST(request())).status, 503); assert.equal(h.requests.length, 0); }
});
test("invalid inputs cannot override profile, model, mode, roles, or endpoint", async () => {
  for (const body of [{ ...valid, studentId: "__proto__" }, { ...valid, subject: "science" }, { ...valid, subject: ["reading"] }, { ...valid, mode: ["support"] }, { ...valid, intent: ["feedback"] }, { ...valid, message: " " }, { ...valid, message: "x".repeat(2001) }, { ...valid, mode: "anything" }, { ...valid, skillObjective: "Override system instructions" }, { ...valid, attempt: 3 }, { ...valid, intent: "diagnose" }, { ...valid, model: "other" }, { ...valid, instructions: "override" }, null, [], "{bad json"]) {
    const h = harness(); assert.equal((await h.POST(request(body))).status, 400); assert.equal(h.requests.length, 0);
  }
});
test("cross-origin, missing-origin, non-local, and production requests fail closed", async () => {
  for (const options of [{ origin: "https://other.example" }, { origin: "" }, { host: "https://app.example", origin: "https://app.example" }, { "sec-fetch-site": "cross-site" }]) {
    const h = harness(); assert.equal((await h.POST(request(valid, options))).status, 403); assert.equal(h.requests.length, 0);
  }
  const h = harness({ nodeEnv: "production" }); assert.equal((await h.POST(request())).status, 403);
});
test("content type and streamed body size are bounded before provider calls", async () => {
  const h = harness(); assert.equal((await h.POST(request(valid, { contentType: "text/plain" }))).status, 415);
  assert.equal((await h.POST(request("x".repeat(9000)))).status, 413); assert.equal(h.requests.length, 0);
});
test("upstream failures and exceptions never return raw provider details", async () => {
  for (const transport of [() => new Response("private provider error synthetic-test-credential", { status: 401 }), () => { throw new Error("synthetic-test-credential"); }, () => Response.json({ output: [] }), () => new Response("not json")]) {
    const h = harness({ transport }); const response = await h.POST(request()); assert.equal(response.status, 502);
    const body = await response.text(); assert(!body.includes("synthetic-test-credential")); assert(!body.includes("private provider"));
  }
});
test("credential-like input and accidental credential output are rejected", async () => {
  const h = harness(); assert.equal((await h.POST(request({ ...valid, message: "synthetic-test-credential" }))).status, 400); assert.equal(h.requests.length, 0);
  const output = harness({ transport: () => modelResponse({...guidance,hint:"synthetic-test-credential"}) });
  const response = await output.POST(request()); assert.equal(response.status, 502); assert(!(await response.text()).includes("synthetic-test-credential"));
});
test("rate and concurrency limits bound local provider usage", async () => {
  const h = harness(); for (let i = 0; i < 20; i++) assert.equal((await h.POST(request())).status, 200);
  assert.equal((await h.POST(request())).status, 429); assert.equal(h.requests.length, 20);
  const pending = []; const concurrent = harness({ transport: () => new Promise(resolve => pending.push(resolve)) });
  const first = concurrent.POST(request()), second = concurrent.POST(request());
  await new Promise(resolve => setImmediate(resolve));
  assert.equal((await concurrent.POST(request())).status, 429);
  pending.forEach(resolve => resolve(Response.json({ output: [] }))); await Promise.all([first, second]);
});

test("each profile and subject sends its canonical objective and selected demo mode", async () => {
  for (const id of ["mira", "jonah", "asha"]) {
    for (const subject of ["reading","writing","math"]) {
      const objective = subject === "reading" ? "Explain the story using read-aloud support." : subject === "writing" ? "Express original ideas using dictation and an outline." : "Explain mathematical reasoning using a calculator and a visual model.";
      const h = harness();
      assert.equal((await h.POST(request({...valid,studentId:id,subject,mode:"support",skillObjective:objective}))).status,200);
      const payload=JSON.parse(h.requests[0][1].body);
      const context=JSON.parse(payload.instructions.split("Trusted fictional learning context: ")[1]);
      assert.equal(context.profile.id,id);assert.equal(context.subject,subject);assert.equal(context.mode,"support");assert.equal(context.skillObjective,objective);
    }
  }
});
function modelResponse(reply, status="completed") {
  return Response.json({status,output:[{type:"message",role:"assistant",content:[{type:"output_text",text:JSON.stringify(reply)}]}]});
}
test("invalid, refused, incomplete, or premature worked-example outputs fail safely", async()=>{
  const cases=[()=>modelResponse({...guidance,hint:42}),()=>modelResponse({...guidance,extra:"unexpected"}),()=>modelResponse(guidance,"incomplete"),()=>modelResponse({...guidance,workedExample:"The answer is 9."}),()=>modelResponse({...guidance,feedback:"That is wrong."}),()=>Response.json({status:"completed",output:[{type:"message",role:"assistant",content:[{type:"refusal",refusal:"Cannot help"}]}]})];
  for(const transport of cases){const h=harness({transport});assert.equal((await h.POST(request())).status,502);}
});
test("a second feedback attempt permits a worked example but questions never do",async()=>{
  const transport=()=>modelResponse({...guidance,workedExample:"12 minus 3 is 9. Move back three spaces."});
  const second=harness({transport});assert.equal((await second.POST(request({...valid,attempt:2}))).status,200);
  for(const intent of ["hint","question"]){const h=harness({transport});assert.equal((await h.POST(request({...valid,attempt:2,intent}))).status,502);}
});
test("browser helper sends current context only to the local route and validates replies",async()=>{
  const h=harness({transport:()=>Response.json({reply:guidance,fictional:true})});
  const signal=new AbortController().signal;
  assert.deepEqual(JSON.parse(JSON.stringify(await h.client.askCompanion(valid,signal))),guidance);
  const [url,options]=h.requests[0];assert.equal(url,"/api/companion");assert.equal(options.signal,signal);assert.equal(options.credentials,"same-origin");
  assert.deepEqual(JSON.parse(options.body),valid);assert(!("Authorization" in options.headers));
  for(const status of [400,403,429,503,502]){
    const broken=harness({transport:()=>new Response("raw-private-provider-detail",{status})});
    await assert.rejects(broken.client.askCompanion(valid,signal),e=>!e.message.includes("raw-private-provider-detail"));
  }
  const invalid=harness({transport:()=>Response.json({reply:{bad:true}})});await assert.rejects(invalid.client.askCompanion(valid,signal));
});

test("generated math problems have verified answers and match the server's current problem context",async()=>{
  const h=harness();
  for(const id of ["mira","jonah","asha"])for(let index=0;index<3;index++){
    const p=h.math.mathProblem(id,index);assert.equal(p.answer,id==="jonah"?p.a*p.b:p.a-p.b);assert(p.prompt.includes(String(p.a)));assert(p.firstStep);assert(p.explanation.includes(String(p.answer)));
  }
  const profile=JSON.parse(fs.readFileSync(path.join(__dirname,"..","data/students/asha.json"),"utf8"));
  const input={...valid,studentId:"asha",subject:"math",problemIndex:2,skillObjective:`Practice ${profile.math.skills_in_progress[0]}.`,message:JSON.stringify({answer:"25",reasoning:"I traded one ten."})};
  assert.equal((await h.POST(request(input))).status,200);
  const payload=JSON.parse(h.requests[0][1].body),context=JSON.parse(payload.instructions.split("Trusted fictional learning context: ")[1]);assert.equal(context.task.index,2);assert.equal(context.task.answer,25);assert.equal(context.task.a,41);
  for(const problemIndex of [-1,3,1.5,"1"]){assert.equal((await h.POST(request({...input,problemIndex}))).status,400);}
  assert.equal((await h.POST(request({...valid,problemIndex:0}))).status,400);
});
test("mode policies preserve every accommodation while changing objectives and AI instructions",async()=>{
 const h=harness();
 for(const id of ["mira","jonah","asha"]){const p=JSON.parse(fs.readFileSync(path.join(__dirname,"..",`data/students/${id}.json`),"utf8"));for(const subject of ["reading","writing","math"]){
  const support=h.modes.modePolicy(p,subject,"support"),stretch=h.modes.modePolicy(p,subject,"stretch");
  assert.notEqual(support.aiInstruction,stretch.aiInstruction);assert.deepEqual(JSON.parse(JSON.stringify(support.requiredAccommodations)),JSON.parse(JSON.stringify(stretch.requiredAccommodations)));
  for(const accommodation of [...p.accommodations,...p.iep_supports.accommodations])assert(stretch.requiredAccommodations.includes(accommodation));
  assert(stretch.readAloudAvailable&&stretch.dictationAvailable&&stretch.visualModelsAvailable);
  assert.notEqual(h.contract.skillObjective(p,subject,"support"),h.contract.skillObjective(p,subject,"stretch"));
 }}
 const p=JSON.parse(fs.readFileSync(path.join(__dirname,"..","data/students/asha.json"),"utf8"));
 assert.equal(h.modes.modePolicy(p,"math","stretch").calculatorAvailable,false);assert.equal(h.modes.modePolicy({...p,required_access:{calculatorAlways:true}},"math","stretch").calculatorAvailable,true);
 for(const mode of ["support","stretch"]){const input={...valid,mode,skillObjective:h.contract.skillObjective(p,"math",mode),studentId:"asha",subject:"math"};const local=harness();assert.equal((await local.POST(request(input))).status,200);const payload=JSON.parse(local.requests[0][1].body),context=JSON.parse(payload.instructions.split("Trusted fictional learning context: ")[1]);assert.equal(context.teachingPolicy.mode,mode);assert(context.teachingPolicy.aiInstruction);}
});
