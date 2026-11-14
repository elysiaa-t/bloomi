# Support and Stretch

Use Progress dashboard → Adult demo controls to choose a mode per subject.
The learner screen shows a mode badge, the current objective, and the tools
that remain available. These are demo controls, not authenticated teacher roles.

| Subject | Support: bypass a non-targeted barrier | Stretch: teach the target skill |
| --- | --- | --- |
| Reading | Automatic read-aloud; comprehension and oral retelling can complete the activity. | Explicit sound-pattern model, blending, then decodable story practice. Word playback and read-aloud remain available. |
| Writing | Dictation-first interview, student-owned outline, and quiet spelling correction in the final draft. | A guided spelling attempt with a cue, a model after two attempts, and independent writing without automatic spelling correction. Dictation and the outline remain available. |
| Mathematics | Calculator, worked first step, visual model, and an explanation of what the quantities mean. | Independent calculation followed by one visual step at a time; number lines, groups, and place-value tools remain available. |

The shared `modePolicy` preserves the union of the fictional profile's general
and IEP accommodations. It never changes diagnoses, modes, or required supports
based on performance. Read-aloud, dictation, visual models, planning, untimed work,
and the ability to take a break remain available across modes.

Calculator access is provided in Support. The sample IEP calculator requirement
applies when computation is not targeted, so it does not override these sample
Stretch computation activities. If a future fictional profile requires a
calculator unconditionally, set `required_access.calculatorAlways: true`; that
requirement overrides the mode default. The same priority applies to required
accommodations; a mode must not be used to withdraw an IEP support.

The server validates mode-specific objectives and includes a distinct teaching
policy plus the required accommodations in Responses API context. Reading-story
generation also receives the selected mode. The writing interview uses fixed
student-voice questions rather than generating the student's assignment.

Supported comprehension/composition/reasoning is not labeled as independent
decoding, spelling, or computation mastery. The analysis history records the
instructional mode when available. Synthetic math review examples are explicitly
unassisted Stretch baselines, independent of the current activity's mode.

Changing a mode preserves session history, approved instructional focuses,
completed activity modes, and writing plans. History and settings remain
in-memory and reset on refresh. Microphone access still requires a user gesture
and browser permission; dictation is never started automatically.

Build, lint, and 30 mocked/unit checks pass. Browser/audio behavior is not
manually verified; the existing live-API rate/quota limitation may still apply.
