"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <section className="error-panel" role="alert"><h1>Let’s try that again.</h1><p>Your learning space could not load.</p><button className="primary" onClick={reset}>Try again</button></section>; }
