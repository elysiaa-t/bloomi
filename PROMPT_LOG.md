# Prompt log

## 2026-11-14 - Planning instructions

- Prompt used: Use only the relevant information from the supplied setup
  request; prepare project guidance and an implementation plan with
  milestones and acceptance criteria, without building features.
- What was wrong with the result: Existing guidance lacked architecture,
  coding conventions, and explicit planning-stage acceptance criteria.
  The complete project brief has not yet been supplied.
- What changed: Expanded AGENTS.md using the existing Next.js starter
  and relevant repository skills; proposed a provisional milestone plan.
- What improved: Future work has explicit scope, accessibility and data
  requirements, and verification expectations. No features were built.

## 2026-11-14 - Fictional profiles and sample work

- Prompt used: "Generate three realistic, fictional student profiles as
  JSON files in data/students/. Follow the project brief exactly. Include
  strengths, interests, mastered skills, areas of difficulty, sample
  mistakes, and accommodations. Generate matching sample work for testing.
  Label all data as fictional."
- What was wrong with the result: No student fixtures existed. The complete
  project brief is still absent, so exact conformance to that future brief
  cannot yet be verified; AGENTS.md and student-profile-data supply the
  currently available requirements.
- What changed: Created Mira, Jonah, and Asha profiles in the application's
  data/students/ and matching fixtures in data/sample-work/. Included
  observed responses, expected answers, response context, strengths, and
  evidence-linked expected analysis. Left session_log empty for the
  analysis step to populate; fictional diagnoses are background only.
- What improved: Three contrasting datasets can exercise personalization,
  subject modes, repeated patterns, and a seen-once case. Node checks
  passed for all six JSON files, required profile fields, fictional labels,
  file references, mode agreement, and analysis evidence counts.

## 2026-11-14 - Align fictional fixtures with the complete brief

- Prompt used: "Generate three realistic, fictional student profiles as
  JSON files in data/students/. Follow the project brief exactly. Include
  strengths, interests, mastered skills, areas of difficulty, sample
  mistakes, and accommodations. Generate matching sample work for testing.
  Label all data as fictional."
- What was wrong with the result: Earlier fixtures were created before
  sld-companion/docs/PROJECT_BRIEF.md existed. They lacked the exact
  synthetic-data label, five reading and spelling errors per student,
  two math misconceptions for every student, a continuous writing draft,
  organizational challenges, and explicit IEP and communication preferences.
- What changed: Updated all three profiles and matching sample-work files
  against the full brief. Added synthetic baseline progress evidence,
  adult-controlled modes, teacher-reviewable instructional hypotheses,
  proposed profile updates, next-session recommendations, and a shared
  adaptation objective. Corrected the stale brief location in AGENTS.md.
- What improved: Each profile now has five linked reading errors, five
  spelling errors present in its writing draft, and two worked math errors.
  All six JSON files passed checks for required fields, exact counts,
  matching examples, independently checked math answers, evidence references,
  mode agreement, and teacher-review policy. Each one-off math hypothesis
  remains "seen once, watching"; logs and diagnoses are not auto-updated.

## 2026-11-14 - Secure server-side OpenAI endpoint

- Prompt used: Verify .env.local is ignored; keep OPENAI_API_KEY only in
  server-side Next.js code; prevent public-variable, browser, logging, and
  GitHub exposure; inspect tracked secret files without displaying contents;
  implement the secure API route.
- What was wrong with the result: The frontend had no live backend endpoint.
  An accidental credential-assignment filename was not covered by .env rules.
  Validation also found an unfinished frontend calculator-prop change that
  prevented the production build.
- What changed: Confirmed .env.local exclusion and added assignment-filename
  ignore rules. Audited the Git index and its one reachable commit without
  printing file contents. Added server-only Responses API transport and
  POST /api/companion, bounded validated input, trusted fictional context,
  same-origin/local-development restrictions, request/concurrency limits,
  timeout, no-store responses, and sanitized failures. Added setup docs and
  eight isolated transport-mocked tests. Completed calculator props and
  profile-specific worked first steps to restore a clean build.
- What improved: Tests, lint, and production build pass. Audit found zero
  tracked secret files or credential-pattern matches. Scanned 14 browser
  assets with zero configured-credential matches, no client key access,
  and no secret-bearing public environment variables. Local HTTP rejection
  checks exercise the real route without calling OpenAI. No actual key or
  secret-file contents were displayed, no paid API call was made, and no
  changes were pushed. The frontend remains mocked; production live AI is
  disabled until authentication and durable usage controls are added.

## 2026-11-14 - Connect live structured learning guidance

- Prompt used: Integrate the OpenAI Responses API through a secure Next.js
  server route; send the selected fictional profile, subject, mode, skill
  objective, and message; guide with hints, validate input, handle errors,
  use structured fields, and keep credentials out of browser code.
- What was wrong with the result: The existing endpoint returned plain text,
  used JSON default modes, omitted an explicit objective, and was disconnected
  from the learning screen's mock replies.
- What changed: Connected feedback, hints, and unscored questions to the route.
  Added a shared credential-free contract, strict structured output schema,
  server-loaded fictional profiles, enum and objective validation, current
  adult-demo mode context, two-attempt guidance, and schema/refusal/incomplete
  output checks. Added abort handling for profile/subject/mode changes, loading
  and error states, draft preservation, labeled saved hints, and read-aloud for
  reply fields. Updated setup docs and added a metadata-only live smoke script.
- What improved: Twelve mocked tests cover server and browser request contracts,
  all nine profile/subject combinations, overrides and malformed inputs,
  credential containment, safe errors, limits, and hint-first structured replies.
  Lint and production build pass. A network-enabled smoke check reached OpenAI
  but received HTTP 429; live generation remains unverified due to provider
  rate/quota availability. No credentials or raw provider details were printed.
  Production remains disabled because adult mode selection is only a local-demo
  control, not authenticated authorization. No profile records are auto-written.

## 2026-11-14 - Decodable reading flow

- Prompt used: Generate an interest-based decodable story, support read-aloud,
  submit misread words via typed or simulated transcripts, and add speech
  recognition if feasible.
- What was wrong: Reading used isolated words without a story or transcript
  comparison, and the dashboard had no current-session reading observations.
- What changed: Added checked per-profile word banks and stories, secure AI
  story generation with whole-story fallback, sentence/word-count and vocabulary
  checks, spoken comprehension questions, word-level playback, speech-boundary
  highlighting, transcript alignment, manual word pairs, simulated samples,
  continuous browser dictation, and dated in-memory reading observations.
- What improved: Eight reading tests plus twelve existing API tests pass.
  The build passes. Repeated target-word differences are distinguished from
  single observations and omissions; speech/text differences require teacher
  review. Browser microphone/audio behavior has not been manually verified.

## 2026-11-14 - Student-authored writing interview

- Prompt used: Interview the student about a topic, turn their answers into an
  outline, and have the student write independently. Execute prompts faster.
- What was wrong: Writing had a single prompt with no brainstorming interview
  or outline stage.
- What changed: Added an interest-based three-question interview, editable
  outline containing only the student's answers, and a separate blank writing
  editor. Added read-aloud, dictation, support/stretch spelling behavior, saving
  to the dashboard, and per-student in-memory plans that survive navigation.
- What improved: The student controls their ideas and final prose; no paragraph
  is generated or copied automatically. Outline edits can be cleared safely.
  The application builds; browser interaction checks remain outstanding.

## 2026-11-14 - Explain-and-model mathematics

- Prompt used: Generate an interest-based problem, ask the student to explain
  their reasoning, and show a visual explanation when needed.
- What was wrong: Math accepted an answer without requiring reasoning and
  reused one baseline problem with a limited, mostly static visual panel.
- What changed: Added three checked problem variants per student: shells,
  robot trays, and garden seeds. Added separate answer and reasoning inputs,
  read-aloud/dictation, gradual number-line/equal-group/place-value models,
  support-mode calculation, two-attempt guidance, and saved reasoning in the
  session summary. The server validates problemIndex and independently loads
  the exact current problem and calculated answer for AI guidance. A labeled,
  checked local math guide works when the live API is unavailable.
- What improved: Students explain a strategy rather than only enter a number.
  Visual models reveal one step at a time and match the generated quantities.
  Added checks for all nine calculations, server task alignment, and invalid
  problem indexes. No credentials were added to browser code.

## 2026-11-14 - Reviewable error analysis and adaptive profile updates

- Prompt used: Build structured error analysis with evidence, possible
  misconceptions, uncertainty, feedback, next activities, per-student history,
  teacher approval/rejection, and adaptation from approved evidence.
- What was wrong: Reading had isolated observations, math saved only a summary,
  and baseline dashboard review selectors did not apply real profile updates.
- What changed: Added a transparent rule-based cross-subject analysis module.
  It checks numerical answers and explicit arithmetic in explanations, quotes
  evidence, preserves uncertainty, distinguishes repeated independent tasks
  from retries, and stores dated structured records in the active student's
  in-memory session_log. Added real approve/reject controls, inspectable JSON,
  simulated review examples, and an instructional_focus overlay on the active
  fictional profile. Approved records select subsequent math variants and
  visual scaffolds, reading-word warmups, and writing revision focuses.
- What improved: Pending/rejected records cannot drive adaptation; reversing
  approval removes its effect. No diagnosis, accommodation, or mode is changed.
  Reference-only baseline selectors were replaced with explicit labels.
  Added tests for evidence counting, student isolation, reversible reviews,
  all subjects, and explanation/final-answer disagreements. Session data is
  deliberately memory-only and resets on refresh; no real records or keys
  are written. Browser review interactions remain unautomated.

## 2026-11-14 - Subject-specific Support and Stretch

- Prompt used: Implement Support and Stretch for reading, writing, and math;
  set modes through teacher/demo controls, visibly change AI behavior, and
  preserve required accommodations in both modes.
- What was wrong: Modes mostly changed tool visibility; AI objectives were
  identical, required accommodations were not explicitly part of mode policy,
  and supported work could be interpreted as independent target-skill evidence.
- What changed: Added shared per-subject teaching policies, distinct validated
  objectives, an immutable accommodation list in AI context, and visible learner
  mode guides. Reading Support completes through listened comprehension;
  Stretch models sound blending. Writing Support emphasizes speech and quiet
  correction; Stretch adds explicit spelling attempts and hints. Math Support
  offers calculation and a worked step; Stretch teaches calculation gradually.
  Unconditional calculator requirements override mode defaults. Updated
  analysis to avoid independent-skill claims from accommodated Support work.
- What improved: Thirty tests cover all subjects/profiles, different objectives
  and AI instructions, preservation of every accommodation, unconditional access
  overrides, and mode-aware evidence. Build and lint pass. Controls stay in the
  adult demo view, and history/review decisions are preserved. Dictation stays
  user-initiated for browser permission. Browser/audio verification is pending.

## 2026-11-14 - Rename to bloomi

- Prompt used: Change the website name to "bloomi" and update all references.
- What was wrong: The visible brand, page title, tutor messages, accessibility
  labels, and server-side companion identity still used the previous name.
- What changed: Replaced the old name throughout application source, including
  matching decorative CSS selectors, with the requested lowercase "bloomi".
- What improved: Branding and companion identity now agree throughout the app.
  Verified that no old-name references remain in the searched project files.

## 2026-11-14 - GitHub and Vercel deployment preparation

- Prompt used: Deploy the existing bloomi Next.js project to the specified
  GitHub repository and Vercel; verify secret protection, build, configure the
  server-side API key securely, and test deployment without adding features.
- What was wrong: The application had no Git remote or deployment linkage.
- What changed: Verified the production build, scanned commit candidates
  without printing credentials, configured the requested GitHub remote, and
  expanded ignore rules for credential-assignment and private-key files.
- What improved: The source is ready for publication without local environment
  files or credentials. Production AI routes retain their existing restriction
  until hosted access controls are implemented; this deployment adds no features.
