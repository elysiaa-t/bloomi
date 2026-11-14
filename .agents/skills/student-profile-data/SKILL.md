---
name: student-profile-data
description: Use when creating, reading, or changing student profile
  data or sample work, or when a feature needs student information.
  Defines the profile format and the fictional-data rule.
---
All students are fictional. Store one JSON file per student in
data/students/. Never add real names, schools, or records. Every
screen that shows a profile displays a "Fictional sample student"
label.

Each profile has these fields:
- name (first name only), grade, interests (3 to 4 specific ones)
- diagnoses: each with one sentence on how it shows up in class
- reading: patterns_mastered, patterns_in_progress, misreadings
  (word and what the student says)
- writing: strengths, difficulties, misspellings
- math: skills_mastered, skills_in_progress, misconceptions (each with
  a worked example of the wrong answer)
- accommodations
- support_or_stretch: a setting for reading, writing, and math
- strengths, motivators, frustration_triggers
- session_log: dated notes on error patterns seen

Rules:
- Errors must be concrete examples, not general statements.
- Every profile includes real strengths, not only difficulties.
- Features read the profile; only the error-diagnosis step writes to
  session_log.
- Keep at least two contrasting students so the demo can show the tool
  adapting.
