# Local AI endpoint

Keep `OPENAI_API_KEY` in `.env.local` in the application directory and restart
`npm run dev` after changing it. The file and accidental credential-assignment
filenames are ignored by Git. Never put a key in a `NEXT_PUBLIC_` variable,
client component, Next.js `env` configuration, screenshot, or commit.

`POST /api/companion` accepts exactly:

```json
{
  "studentId": "mira",
  "subject": "reading",
  "mode": "stretch",
  "skillObjective": "Practice ee representing long e.",
  "message": "Help me read seed.",
  "intent": "feedback",
  "attempt": 1
}
```

Valid students: `mira`, `jonah`, `asha`. Valid subjects: `reading`, `writing`,
`math`. Requests need `Content-Type: application/json` and a matching `Origin`
(for example `http://localhost:3000`). Browser requests from the same page
supply Origin automatically. The response is `{ "reply": { ... }, "fictional": true }`
or a generic `{ "error": "…" }` with an appropriate HTTP status.

The server loads the selected fictional profile from local JSON; arbitrary
client profiles, models, prompts, and endpoints are rejected. It validates the
subject, support/stretch enum, attempt (1 or 2), intent (feedback/hint/question),
and exact skill objective derived from the profile. The adult dashboard's
selected demo mode is sent with each request and overrides the JSON default
for that request only. This is not authenticated teacher authorization.

It sends the fictional profile, subject, current mode, skill objective, current
task, and student message to the OpenAI Responses API using `gpt-4.1-mini`,
`store: false`, a 20-second timeout, and a 600-token output limit. Replies use
strict JSON Schema fields: `feedback`, `hint`, `nextStep`, `workedExample`
(nullable), and `needsTeacherReview`. The server also validates returned values;
malformed/incomplete/refused replies produce generic errors. Worked examples
are rejected on first attempts and for unscored hints/questions. Model-generated
pedagogy still needs adult oversight; JSON validation does not prove correctness.
`store: false` disables response storage; it is not a zero-data-retention claim.
No upstream errors, request headers, credentials, or profile contents are logged.

The learning screen now calls this route for feedback, hints, and unscored
questions. Drafts remain on failure; saved local hints are explicitly labeled.
Read-aloud and dictation remain available. Changing subject, mode, or profile
aborts the pending browser request and discards stale replies. Aborting the
browser request does not guarantee cancellation of provider processing/charges.
Practice is recorded separately from mastery or diagnostic claims; no profile
JSON or session_log is automatically rewritten. Only fictional messages should
be used. A second math attempt can show a verified worked answer without
requiring a third attempt. This is now a live, potentially billable integration.

Because the demo has no authentication, live AI is deliberately limited to
localhost in development and is disabled in production. The in-process limits
(20 requests/minute, two concurrent calls) are local-demo safeguards, not a
distributed rate limiter. Before enabling hosted access, add real access control,
server-authorized mode settings, and durable spending/rate controls.

Tests use a fake key and a mocked transport and never call the real API.
Run them with `node --test tests/companion-api.test.mjs`.

For an optional, potentially billable server-side smoke check, run
`node scripts/check-openai.mjs` from the application directory. This loads the
local environment and exercises the real server transport with Mira's fictional
profile and one reading question, printing only status and validation metadata.
It does not print credentials, model text, or raw errors. It needs outbound
network access to `api.openai.com`.
