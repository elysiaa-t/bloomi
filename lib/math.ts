export type MathLearner = "mira" | "jonah" | "asha";
export function mathProblem(id: MathLearner, index=0) {
  if (!Number.isInteger(index)||index<0||index>2) throw new Error("Choose a demo problem.");
  const values = id==="mira"?[[12,3],[15,4],[14,6]]:id==="jonah"?[[6,4],[7,3],[6,5]]:[[52,28],[63,47],[41,16]];
  const [a,b]=values[index];const multiplication=id==="jonah";
  return {index,a,b,operation:multiplication?"multiply" as const:"subtract" as const,answer:multiplication?a*b:a-b,expression:`${a} ${multiplication?"×":"−"} ${b}`,
    prompt:id==="mira"?`You have ${a} shells by your sand hut. You give ${b} to a friend. How many shells are left?`:id==="jonah"?`Your robot has ${b} trays. Each tray holds ${a} bolts. How many bolts are there?`:`You have ${a} seeds for your garden. You plant ${b}. How many seeds are left?`,
    firstStep:id==="mira"?`Start at ${a}. Make one backward move to ${a-1}.`:id==="jonah"?`Draw ${b} trays. Put ${a} dots in the first tray.`:`Trade one ten from ${a}: now you have ${Math.floor(a/10)-1} tens and ${a%10+10} ones.`,
    explanation:id==="mira"?`Move back ${b} spaces from ${a}. You land on ${a-b}.`:id==="jonah"?`${b} equal groups of ${a} make ${a*b}.`:`After trading, take away ${Math.floor(b/10)} tens and ${b%10} ones. ${a-b} seeds remain.`,
  };
}
