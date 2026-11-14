"use client";
import Link from"next/link";
import {modePolicy,type LearningSubject}from"@/lib/learning-modes";
import{Listen,useApp}from"./app-provider";
export function ModeGuide({subject}:{subject:LearningSubject}){const{student,modes}=useApp();const policy=modePolicy(student,subject,modes[student.id][subject]);return <section className="mode-guide"><div><strong className="capitalize">{policy.mode} · {subject}</strong><p>{policy.description}</p><Listen text={`${policy.mode} mode. ${policy.description}. Your learning tools stay available.`}/></div><details><summary>Your learning tools stay available</summary><ul>{policy.requiredAccommodations.map(a=><li key={a}>{a}</li>)}</ul><p className="fine">A required accommodation takes priority over the mode default. Read-aloud, dictation, planning, breaks, and visual tools remain available. Only the adult demo view can change the mode.</p><Link href="/progress" className="text-button">Teacher/demo controls →</Link></details></section>;}
