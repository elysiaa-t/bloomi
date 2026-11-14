// Optional server-side smoke check. Prints metadata only, never credentials,
// prompts, model text, exception messages, or raw provider errors.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
let upstreamStatus = null;
function load(relative, dependencies = {}) {
  const compiledModule = { exports: {} };
  const source = fs.readFileSync(relative, "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
  const context = vm.createContext({ module: compiledModule, exports: compiledModule.exports,
    process: { env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY } }, Response, AbortSignal,
    fetch: async (...args) => { const response = await fetch(...args); upstreamStatus = response.status; return response; },
    require: name => {
      if (name === "server-only") return {};
      if (dependencies[name]) return dependencies[name];
      if (name.startsWith("@/data/students/")) return JSON.parse(fs.readFileSync(path.join(process.cwd(), name.slice(2)), "utf8"));
      throw new Error("Unexpected dependency");
    },
  });
  vm.runInContext(outputText, context);
  return compiledModule.exports;
}
try {
  const contract = load("lib/companion-contract.ts");
  const math = load("lib/math.ts");
  const modes = load("lib/learning-modes.ts");
  const helper = load("lib/server/companion.ts", { "@/lib/companion-contract": contract, "@/lib/math": math, "@/lib/learning-modes": modes });
  const input = helper.validateInput({ studentId: "mira", subject: "reading", mode: "stretch", skillObjective: "Practice ee representing long e.", message: "Help me read seed.", intent: "hint", attempt: 1 });
  const reply = await helper.getCompanionReply(input);
  console.log(JSON.stringify({ upstreamStatus, structuredReplyValid: contract.isCompanionReply(reply), hintOnly: reply.workedExample === null, contentsDisplayed: false }));
} catch (error) {
  console.log(JSON.stringify({ upstreamStatus, successful: false, publicStatus: typeof error.status === "number" ? error.status : null, contentsDisplayed: false }));
  process.exitCode = 1;
}
