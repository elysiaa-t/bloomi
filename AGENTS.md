<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes â€” APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` â€” verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project brief

We are building a promptathon demo: an AI learning companion for
students with Specific Learning Disabilities (dyslexia, dysgraphia,
dyscalculia), which often overlap.

One demo flow matters: a student opens the tool and completes a short
reading, writing, and math session built around their interests. Each
activity records error patterns that shape the next session.

Screens, in priority order: student session (reading, writing, math),
student profile, adult report.

Rules that always apply:
- All student data is fictional and loaded from JSON. No accounts, no
  database, no real student data.
- Build one screen at a time and keep the demo flow working after
  every change.
- Prefer the simplest implementation that makes the demo flow work.
- The tool supports teacher-led instruction. Never describe it as
  replacing a teacher or as diagnosing a disability.

## Planning and scope

- The complete project brief is in docs/PROJECT_BRIEF.md.
  Read it before changing project data or features.
- Do not build features during the planning stage. First propose
  milestones with observable acceptance criteria.
- MVP: one complete reading, writing, and math session, two contrasting
  fictional profiles, and an adult report showing patterns and next steps.
- Include per-subject support or stretch settings controlled by the adult.
- Exclude accounts, databases, real student records, and disability diagnosis.

## Architecture and coding conventions

- The existing application is in : Next.js App Router,
  TypeScript, React, and Tailwind CSS. Run app commands from that directory.
- Preserve AGENTS.md and read its required local Next.js
  documentation before writing framework code.
- Keep routes in app/, reusable UI in components/, and profile types,
  activity logic, and pattern analysis in lib/ within the application.
- Store fictional profiles as JSON in data/students/.
- Keep content generation, response analysis, and UI separate. Only the
  analysis step updates session_log; use in-memory session state initially.
- Use explicit TypeScript types, descriptive names, small components,
  and the existing formatting and lint conventions. Avoid unnecessary
  dependencies. Keep credentials out of client code and source control.
- Run lint and build after implementation changes, plus focused checks
  for changed behavior. Keep the demo flow working after each milestone.

## Accessibility and data requirements

- Apply the repository skills in .agents/skills/ when relevant; use
  demo-check for the final demo review.
- Use at least 18px sans-serif text, line height of at least 1.5,
  left alignment, readable line lengths, and WCAG AA contrast.
- Use one main task and one primary action per screen, labeled icons,
  targets at least 44px tall, keyboard access, and visible focus.
- Provide read-aloud for student text and dictation for text inputs.
  Plan clear unavailable and permission-denied states for speech controls.
- Respect reduced motion; omit timers, speed scores, and leaderboards.
- Follow student-voice for feedback. Support teacher-led instruction
  and describe observed work patterns without diagnosing students.
- Use fictional data only, with strengths and concrete error examples.
  Display "Fictional sample student" wherever a profile is shown.

Record keeping:
- After each significant prompt or feature change, add an entry to
  PROMPT_LOG.md: the prompt used, what was wrong with the result,
  what was changed, and what improved.
- When a feature is cut or simplified, add an entry to DECISIONS.md:
  what was decided, the alternative, and the reason.
