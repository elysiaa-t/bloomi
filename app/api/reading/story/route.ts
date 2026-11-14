import { generateReadingStory } from "@/lib/server/reading-story";
let requests = 0;
let start = 0;
let pending = false;
function json(value: object, status=200) { return Response.json(value,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}}); }
export async function POST(request: Request) {
  const url = new URL(request.url);
  if (process.env.NODE_ENV !== "development" || !["localhost","127.0.0.1","[::1]"].includes(url.hostname) || request.headers.get("origin") !== url.origin || request.headers.get("sec-fetch-site") === "cross-site") return json({error:"This request is not allowed."},403);
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return json({error:"Send JSON."},415);
  if (Date.now()-start>=60000) {start=Date.now();requests=0;}
  if (requests>=6||pending) return json({error:"Please wait before generating another story."},429);
  const reader=request.body?.getReader();
  if(!reader) return json({error:"Choose a fictional learner."},400);
  const chunks:Uint8Array[]=[];let length=0;
  try { while(true) {const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>256){await reader.cancel();return json({error:"Request is too long."},413);}chunks.push(value);} }
  catch {return json({error:"Could not read this request."},400);} finally {reader.releaseLock();}
  let body:unknown;
  try {const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}body=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes));}catch{return json({error:"Send valid JSON."},400);}
  if (!body||typeof body!=="object"||Array.isArray(body)||![1,2].includes(Object.keys(body).length)||Object.keys(body).some(k=>!["studentId","mode"].includes(k))||!("studentId" in body)||typeof body.studentId!=="string"||!["mira","jonah","asha"].includes(body.studentId)||("mode"in body&&body.mode!=="support"&&body.mode!=="stretch")) return json({error:"Choose a fictional learner and mode."},400);
  requests++;pending=true;
  try {return json(await generateReadingStory(body.studentId as "mira"|"jonah"|"asha","mode"in body?body.mode as "support"|"stretch":"stretch"));}
  finally {pending=false;}
}
