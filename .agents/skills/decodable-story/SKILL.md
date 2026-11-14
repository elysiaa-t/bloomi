---
name: decodable-story
description: Use when writing or changing the feature or prompt that
  generates reading passages for a student. Not for math problems or
  UI text.
---
A story is built from the student's profile:

- Topic comes from one of the student's interests.
- Use only words the student can decode: patterns_mastered plus a
  small set of common sight words.
- Include 6 to 10 words that practice one pattern from
  patterns_in_progress. This is the target pattern.
- Length: 80 to 150 words for grades 1 to 3, up to 250 for grades
  4 to 6. Short sentences. One idea per sentence.
- The story must make sense and have a small event or surprise. It is
  a story first and practice second.

The feature returns: title, story text, the target pattern, the list
of target words, and two spoken comprehension questions.

Before showing a story, check every word against the allowed patterns
and replace any word that breaks the rule.
