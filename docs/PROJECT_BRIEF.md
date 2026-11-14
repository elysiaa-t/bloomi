# PROJECT CONTEXT: AI Learning Companion for Students with Specific Learning Disabilities

## 1. Project Overview

I'm building an AI-powered educational platform for a **promptathon** focused on helping students with **Specific Learning Disabilities (SLDs)**.

Specific Learning Disabilities represent approximately 32% of students served under the Individuals with Disabilities Education Act (IDEA), making SLD the largest disability category under IDEA.

The project focuses on three learning disabilities that can overlap:

- **Dyslexia:** Difficulty with reading, decoding words, phonemic awareness, and spelling.
- **Dysgraphia:** Difficulty with handwriting, spelling, writing mechanics, and organizing written thoughts.
- **Dyscalculia:** Difficulty with number sense, mathematical concepts, and computation.

### Core Vision

Build **one unified AI learning companion instead of three separate tools**.

Rather than simply checking whether a student gets an answer correct, the AI identifies *why* they are struggling, adapts its teaching approach, and uses what it learns to personalize future lessons.

**Core question:** "Why is this student struggling, and what different way of teaching this concept would help?"

The goal is to make education more accessible, personalized, engaging, and confidence-building while supporting the development of independent learning skills.

---

## 2. Five Core Components

### Component 1: Unified Student Profile

Every student has a personalized profile containing:

- Grade level, interests, strengths, and motivators
- Diagnosed learning disabilities and how they affect classroom learning
- Mastered skills and skills currently being developed
- Specific error patterns across reading, writing, and mathematics
- Learning accommodations and relevant IEP supports
- Preferred methods of explanation and communication
- Frustration triggers and learning progress

**Purpose:** Every AI feature reads from and updates the same profile, allowing learning across subjects to remain connected.

The profile should emphasize what students can do, not only their difficulties.

### Component 2: "Support or Stretch" Learning Modes

The platform distinguishes between two types of learning activities.

**SUPPORT MODE — Remove barriers to learning**

Use accommodations when the student's learning disability is not the skill being assessed.

Examples:
- Dyslexia: Text-to-speech when learning science or history
- Dysgraphia: Speech-to-text when demonstrating comprehension
- Dyscalculia: Calculator access when computation is not the learning objective
- All students: Simplified instructions, visual explanations, and alternative response formats

**STRETCH MODE — Strengthen the underlying skill**

Use structured, guided practice when the goal is to develop an area of difficulty.

Examples:
- Dyslexia: Explicit phonics practice, decoding, and phonemic awareness
- Dysgraphia: Guided sentence construction, spelling practice, and writing organization
- Dyscalculia: Number lines, visual manipulatives, number-sense exercises, and step-by-step calculations

Teachers or the IEP team determine the intended instructional mode and accommodations. Students should not be able to bypass required skill-building simply by changing a setting.

**Key principle:** AI should balance accessibility with learning rather than automatically giving answers.

### Component 3: One Conversational AI Learning Companion

The same AI tutor takes on different instructional roles depending on the task.

**Reading:** Pre-teaches vocabulary, reads text aloud, highlights words, listens to the student read, and provides targeted decoding assistance.

**Writing:** Interviews students about their ideas, organizes their own spoken responses into notes, and guides them in constructing original written work.

**Mathematics:** Uses visual models, offers step-by-step hints, and acts as a confused classmate whom the student must teach.

**General learning:** Answers questions students may feel embarrassed to ask, repeats explanations without judgment, and adjusts its instructional approach when students struggle.

The AI should guide students through problem-solving instead of immediately supplying completed answers.

### Component 4: Cross-Subject Error Diagnosis

The system analyzes student responses to identify **specific underlying misconceptions**, not just incorrect answers.

Examples:

**Reading**
- Confusing particular vowel patterns
- Difficulty blending phonemes
- Repeatedly misreading specific letter combinations

**Writing**
- Consistent spelling errors
- Difficulty with sentence structure
- Trouble organizing ideas into logical paragraphs

**Mathematics**
- Misunderstanding place value
- Confusing subtraction and addition
- Treating denominators incorrectly when adding fractions
- Difficulty understanding numerical magnitude

The AI records specific, observable error patterns in the student's profile and uses them to generate future lessons.

Important: Error detection is an instructional hypothesis, not a medical diagnosis. Uncertain patterns should be flagged for teacher review rather than treated as established facts.

### Component 5: Teacher and Parent Progress Dashboard

Provide plain-language reports covering:

- Skills practiced and mastered
- Specific recurring error patterns
- Progress over multiple sessions
- Learning strategies that helped
- Areas requiring additional support
- Suggested activities for future sessions

Teachers can review and correct AI interpretations before using them to inform instruction.

**Purpose:** Make student progress understandable and actionable without requiring parents or teachers to interpret complicated AI analytics.

---

## 3. Learning Features by Disability

### Dyslexia: AI Reading Assistant

**Primary features:**
1. Generate personalized decodable stories based on student interests.
2. Restrict story vocabulary to phonics patterns already taught, except explicitly identified and supported exceptions.
3. Use text-to-speech with synchronized word highlighting.
4. Listen to oral reading and detect possible decoding errors.
5. Offer guided phoneme blending and targeted pronunciation practice.
6. Adapt reading difficulty based on demonstrated mastery.
7. Ask comprehension questions using accessible language.

**Example:**

A student struggling with "ship" receives prompts to identify /sh/, /i/, and /p/ and blend them before hearing the full word.

The AI remembers which patterns require more practice.

### Dysgraphia: AI Writing Coach

**Primary features:**
1. Allow students to speak ideas aloud.
2. Transcribe speech into written notes.
3. Organize notes into outlines or mind maps.
4. Guide students through independent sentence and paragraph construction.
5. Identify repeated spelling and grammar difficulties.
6. Explain writing mistakes rather than automatically correcting everything.
7. Support handwriting practice where appropriate, without assuming all dysgraphia-related challenges can be detected from a photograph.

**Example:**

Student says: "Dogs are good pets because they're friendly and help people."

AI organizes the student's original ideas:

- Main idea: Dogs make good pets.
- Supporting point 1: They're friendly.
- Supporting point 2: They help people.

The student then uses the outline to write their own paragraph.

**Design principle:** The AI should preserve student authorship rather than writing assignments for them.

### Dyscalculia: AI Visual Math Tutor

**Primary features:**
1. Explain math using number lines, fraction bars, blocks, and diagrams.
2. Break abstract concepts into concrete steps.
3. Identify specific mathematical misconceptions.
4. Generate adaptive practice questions.
5. Connect math problems to student interests.
6. Have students explain their reasoning back to the AI.
7. Use interactive, real-world scenarios involving money, measurements, time, or sports statistics.

**Example:**

For 13 − 8, the AI uses a number line:

13 → 10 (subtract 3) → 5 (subtract 5)

The student then explains why the total amount subtracted was 8.

The AI should verify calculations before providing feedback.

---

## 4. Additional Cross-Platform Features

### Multimodal Learning

Students can interact through:
- Spoken conversation
- Written text
- Audio playback
- Visual diagrams
- Interactive activities

Multiple input and output methods help students demonstrate knowledge without unnecessary barriers.

### Adaptive Learning Engine

The system should:

1. Present a task aligned with the student's profile.
2. Observe their answer and reasoning.
3. Identify a possible underlying error pattern.
4. Provide an appropriate hint, visual explanation, or alternative strategy.
5. Check whether the student understands.
6. Record meaningful observations in the profile.
7. Adjust future practice accordingly.

### Interest-Based Personalization

Use interests such as soccer, video games, animals, music, or cooking to make exercises more engaging.

The same interest can connect lessons across multiple academic subjects.

### Guided Independence

The platform should avoid encouraging dependency on AI.

Where appropriate, students first receive a small hint, then a stronger hint, then a worked example if necessary. The AI should gradually remove support as the student demonstrates understanding.

---

## 5. Example End-to-End Student Session

A fictional student loves soccer and has difficulties with reading, writing, and mathematics.

**Step 1: Reading**

The AI generates a soccer-themed story using the student's current phonics patterns.

The student reads aloud.

The AI detects possible difficulty decoding words containing the "ea" vowel pattern.

**Step 2: Writing**

The AI asks the student what happened in the story.

The student explains verbally.

The AI converts the student's spoken ideas into an organized outline, then guides the student to write an original paragraph.

**Step 3: Mathematics**

The AI introduces math problems based on the soccer story's league standings.

The student solves a problem and explains their reasoning.

The AI notices a potential subtraction misconception and provides a visual explanation.

**Step 4: Profile Update**

The platform records:
- Reading: Needs more practice with a particular "ea" pronunciation pattern.
- Writing: Successfully organized a paragraph with verbal brainstorming.
- Mathematics: Needs support with subtraction across ten.
- Strength: Demonstrated strong verbal storytelling.

**Step 5: Next Session**

The following session includes:
- A new soccer story with appropriate practice for the targeted vowel pattern
- A writing activity building on the student's storytelling strengths
- Additional subtraction practice using visual models

This creates continuity across lessons.

---

## 6. Promptathon Demonstration Plan

The demonstration should show the AI making meaningfully different instructional decisions based on different student profiles.

### Fictional Student Profiles

Create 2–3 contrasting students with realistic combinations of learning challenges, strengths, and interests.

All students must be clearly labeled **FICTIONAL — SYNTHETIC DEMO DATA**.

Store each profile as structured JSON with the following information:

**Basic information**
- First name
- Grade
- Interests

**Learning disabilities**
- Diagnoses
- How each condition appears in classroom learning

**Reading**
- Mastered phonics patterns
- Phonics patterns in progress
- Five realistic misreadings, including intended and spoken words

**Writing**
- Strengths
- Areas of difficulty
- Five realistic spelling errors
- Common organizational challenges

**Mathematics**
- Mastered skills
- Skills in progress
- Two concrete misconceptions
- Worked examples of incorrect student reasoning

**Accommodations**
- Relevant IEP accommodations
- Instructional support requirements
- Support-or-stretch settings for each subject

**Personal characteristics**
- Learning strengths
- Motivators
- Frustration triggers

### Matching Student Work Samples

For each fictional student, generate:
- One writing sample displaying their characteristic difficulties
- A reading sample containing their five realistic misreadings
- Two math problems with incorrect student answers and reasoning

The AI should analyze the work samples, explain its instructional hypotheses, and recommend targeted practice.

### Demonstrate Adaptation

Give the same educational objective to two different fictional students.

Show how the AI changes:
- Instruction format
- Difficulty level
- Scaffolding
- Type of feedback
- Visual or auditory support

This demonstrates that the platform is truly personalized rather than merely generating generic exercises.

### Technical Prompting Architecture

Each instructional feature follows this structure:

**Student profile JSON + Current task + Instructional mode + Safety/pedagogy constraints → AI-generated activity**

After the student responds:

**Student response + Current profile + Skill objective → Error analysis + Appropriate feedback + Proposed profile update**

Teacher-reviewed or otherwise validated observations then influence subsequent sessions.

For the prototype, profiles can be stored in local JSON files or a simple database. A production application would require stronger safeguards for sensitive student data.

---

## 7. Product Architecture

The ideal system includes five connected layers.

1. **Student Profile and Skill Model:** Stores learning goals, mastery evidence, accommodations, interests, and teacher-reviewed misconceptions.
2. **Personalization Engine:** Chooses activities based on skills, interests, and learning preferences.
3. **Multimodal Conversational Tutor:** Handles reading, speaking, writing, visual explanations, and instructional dialogue.
4. **Learning Analysis Engine:** Evaluates student work and proposes evidence-based profile updates.
5. **Adult Dashboard:** Presents understandable progress reports and allows teacher oversight.

For a promptathon MVP, prioritize demonstrating the core personalization loop rather than implementing every feature.

A compelling minimal prototype would include:
- Two fictional profiles
- One shared conversational interface
- Support-or-stretch mode
- A reading, writing, and math example
- Error recognition tied to the profile
- A profile update
- A personalized next lesson
- A basic progress summary

---

## 8. Design Constraints and Responsible AI

- AI supplements teacher-led, evidence-based instruction rather than replacing educators.
- The system must not diagnose disabilities or autonomously make IEP decisions.
- Accommodations should not be removed simply because performance improves.
- Error analysis should be transparent and allow teacher corrections.
- Student records, disability information, voice recordings, and academic performance are sensitive and require careful privacy design.
- Use fictional data throughout the promptathon.
- Avoid deficit-only profiles; emphasize strengths, interests, and success.
- Ensure accessibility features can coexist with targeted skill-building.
- Use explicit, systematic instruction where appropriate, rather than assuming any AI-generated activity is clinically or educationally validated.
- Do not claim improved learning outcomes without testing.
- For real-world deployment, evaluate relevant student privacy, accessibility, and education requirements, including FERPA, COPPA where applicable, and IDEA-related obligations.

---

## 9. Key Differentiator

Typical AI tutors focus on:

**Question → Student answer → Correct/incorrect → Explanation**

This platform focuses on:

**Student profile → Personalized activity → Student reasoning → Specific misconception → Targeted teaching → Updated profile → Better next lesson**

The differentiator is not simply offering text-to-speech, speech-to-text, or visual math explanations.

It is **connecting those supports through a unified student profile and an adaptive learning process that understands the student's learning needs across subjects.**

This approach is designed to support students with overlapping learning disabilities rather than treating reading, writing, and mathematics as unrelated challenges.

---

## 10. Positioning and Pitch

**One-line description:**

An AI learning companion that identifies how students struggle, adapts to how they learn, and turns each session into more personalized support for the next.

**Short pitch:**

Students with learning disabilities often need different forms of support across reading, writing, and mathematics. Our AI learning companion unifies these supports into a single personalized platform. It learns from students' specific mistakes, adjusts its teaching strategies, and connects progress across subjects while keeping educators involved. Instead of simply giving answers, it helps students build skills, confidence, and independence.

**Core message:**

*One student. One learning companion. A different approach for every learning need.*

---

## 11. What I Need From This Conversation

You are helping me develop this project for a promptathon.

Use the complete context above when generating ideas, prompts, architecture, demo materials, or pitch content.

Prioritize:
- Features that meaningfully use AI rather than ordinary programmed logic
- Practicality for a short promptathon
- A compelling demonstration of personalized learning
- Concrete, realistic examples of student errors
- Accessibility and responsible educational design
- Clear differentiation from existing generic AI tutors

Do not assume the platform has already been built.

When suggesting features, distinguish between what can realistically be demonstrated in a promptathon prototype and what would require production-level implementation, educational validation, or more advanced technology.

**MY NEXT REQUEST:**

[Insert the next task here, such as generating fictional student profiles, creating JSON structures, writing feature prompts, planning the prototype architecture, designing the user interface, building a demo script, or preparing the pitch.]