"use client";
import { useState, useEffect } from "react";

type Candidate = { handle: string; platform: string; followers: string; focus: string; matchScore: number; why: string; angle: string };

const SCOUT_STEPS = [
  "🔎 Scanning the niche for matching creators",
  "📊 Scoring each on audience & product fit",
  "🧮 Ranking and assembling your shortlist",
];

// Stepped loader — advances through the pipeline phases so the wait feels alive.
function StepLoader({ steps }: { steps: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    const t = setInterval(() => setI((x) => Math.min(x + 1, steps.length - 1)), 2400);
    return () => clearInterval(t);
  }, [steps]);
  return (
    <div className="panel mb-6 space-y-3 p-5">
      {steps.map((s, idx) => (
        <div key={s} className="flex items-center gap-3 text-sm transition-opacity" style={{ opacity: idx <= i ? 1 : 0.35 }}>
          {idx < i ? (
            <span className="text-[#7ee787]">✓</span>
          ) : idx === i ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
          ) : (
            <span className="inline-block h-4 w-4 rounded-full border-2 border-[var(--color-line)]" />
          )}
          <span style={{ color: idx === i ? "var(--color-accent)" : undefined }}>{s}{idx === i ? "…" : ""}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [product, setProduct] = useState("An AI tool that lets businesses build custom chatbots trained on their own data.");
  const [niche, setNiche] = useState("AI / SaaS / marketing automation");
  const [platform, setPlatform] = useState("LinkedIn");
  const [audience, setAudience] = useState("10k–100k");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Candidate[]>([]);
  const [err, setErr] = useState("");
  const [outreach, setOutreach] = useState<{ handle: string; text: string } | null>(null);
  const [drafting, setDrafting] = useState("");

  async function scout() {
    setErr(""); setLoading(true); setRows([]); setOutreach(null);
    try {
      const res = await fetch("/api/scout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product, niche, platform, audience }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRows(data.candidates);
    } catch (e) { setErr((e as Error).message); } finally { setLoading(false); }
  }
  async function draft(c: Candidate) {
    setDrafting(c.handle); setOutreach(null);
    const res = await fetch("/api/outreach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product, candidate: c }) });
    const data = await res.json();
    setDrafting("");
    if (res.ok) setOutreach({ handle: c.handle, text: data.text });
  }
  function exportCsv() {
    const head = "handle,platform,followers,focus,matchScore,why,angle\n";
    const body = rows.map((r) => [r.handle, r.platform, r.followers, r.focus, r.matchScore, r.why, r.angle].map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([head + body], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "leadscout.csv"; a.click();
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">LeadScout <span className="text-[var(--color-accent)]">⌖</span></h1>
        <p className="mt-1 text-[var(--color-mute)]">Describe your product → the agent finds matching B2B creators, scores fit, and drafts outreach. <span className="chip">candidates are AI-generated examples</span></p>
      </div>

      <div className="panel mb-6 space-y-3 p-5">
        <div><label className="label">Your product</label><textarea className="input mt-1" rows={2} value={product} onChange={(e) => setProduct(e.target.value)} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="label">Niche</label><input className="input mt-1" value={niche} onChange={(e) => setNiche(e.target.value)} /></div>
          <div><label className="label">Platform</label><input className="input mt-1" value={platform} onChange={(e) => setPlatform(e.target.value)} /></div>
          <div><label className="label">Audience</label><input className="input mt-1" value={audience} onChange={(e) => setAudience(e.target.value)} /></div>
        </div>
        <button className="btn" onClick={scout} disabled={loading}>{loading ? "Scouting…" : "Find creators →"}</button>
        {err && <p className="text-sm text-red-400">{err}</p>}
      </div>

      {loading && <StepLoader steps={SCOUT_STEPS} />}

      {rows.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <p className="label">{rows.length} candidates · ranked by fit</p>
          <button className="chip" onClick={exportCsv}>⬇ Export CSV</button>
        </div>
      )}

      <div className="space-y-3">
        {rows.map((c) => (
          <div key={c.handle} className="panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">@{c.handle.replace(/^@/, "")} <span className="text-[var(--color-mute)]">· {c.platform} · {c.followers}</span></p>
                <p className="text-sm text-[var(--color-mute)]">{c.focus}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xl font-bold" style={{ color: c.matchScore >= 75 ? "#7ee787" : c.matchScore >= 55 ? "#e3b341" : "#8b90a6" }}>{c.matchScore}%</div>
                <div className="text-[10px] text-[var(--color-mute)]">fit</div>
              </div>
            </div>
            <p className="mt-2 text-sm">{c.why}</p>
            <p className="mt-1 text-sm text-[var(--color-accent)]">↳ angle: {c.angle}</p>
            <button className="chip mt-3" onClick={() => draft(c)} disabled={drafting === c.handle}>{drafting === c.handle ? "Drafting…" : "✉ Draft outreach"}</button>
            {outreach?.handle === c.handle && (
              <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-[var(--color-line)] bg-[#0e1019] p-3 text-sm">{outreach.text}</pre>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
