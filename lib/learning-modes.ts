export type LearningSubject="reading"|"writing"|"math";
export type LearningMode="support"|"stretch";
type AccessProfile={accommodations:string[];iep_supports:{accommodations:string[]};required_access?:{calculatorAlways?:boolean}};
export function modePolicy(profile:AccessProfile,subject:LearningSubject,mode:LearningMode){
  const support=mode==="support";
  const descriptions={
    reading:{support:"Listen to the story, then share what it means.",stretch:"Practice the sound pattern, then read the story."},
    writing:{support:"Speak your ideas and use a plan to share them.",stretch:"Practice a spelling pattern, then write your own sentences."},
    math:{support:"Use a calculator and a model, then explain your thinking.",stretch:"Work through the calculation with one visual hint at a time."},
  };
  const instructions={
    reading:{support:"Bypass decoding with read-aloud. Focus on meaning and oral comprehension; do not treat supported listening as decoding evidence.",stretch:"Explicitly model the target sound pattern, ask for blending, then guided decoding. Keep read-aloud, word playback, and alternate response formats available."},
    writing:{support:"Bypass transcription and spelling barriers with dictation, a student-authored outline, and quiet correction. Evaluate ideas, not unsupported spelling performance. Never write the assignment.",stretch:"Explicitly teach a profile spelling feature with a cue and guided attempt. Use spelling hints, not automatic correction. Preserve required dictation and planning supports and student authorship."},
    math:{support:"Computation is not the assessment target. Encourage calculator use, show a worked first step and a visual model, and ask what the quantities or answer mean.",stretch:"Computation is the target. Explicitly teach counting moves, equal groups, or regrouping with one guided step at a time. Never withhold required manipulatives, spoken directions, or alternate response formats."},
  };
  return {subject,mode,description:descriptions[subject][mode],aiInstruction:instructions[subject][mode],
    autoRead:subject==="reading"&&support,quietSpellingCorrection:subject==="writing"&&support,
    calculatorAvailable:subject==="math"&&(support||profile.required_access?.calculatorAlways===true),
    workedFirstStep:subject==="math"&&support,readAloudAvailable:true,dictationAvailable:true,visualModelsAvailable:true,
    requiredAccommodations:[...new Set([...profile.accommodations,...profile.iep_supports.accommodations])],
  };
}
