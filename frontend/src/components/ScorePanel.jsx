export default function ScorePanel({ score }) {
  if (!score) return null;

  return (
    <section className="rounded-[2rem] border border-radar/25 bg-radar/10 p-5 shadow-glow">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-radar">Score</p>
          <h2 className="mt-2 text-4xl font-bold text-paper">{score.score}</h2>
        </div>
        <span className="rounded-full border border-radar/35 px-4 py-2 text-sm text-radar">{score.rating}</span>
      </div>
      <p className="mt-4 leading-7 text-white/72">{score.feedback}</p>
      <div className="mt-4 grid gap-3 text-sm">
        <ResultLine label="命中因素" items={score.matched_factors} tone="text-radar" />
        <ResultLine label="遗漏因素" items={score.missed_factors} tone="text-amber" />
        <ResultLine label="误判因素" items={score.extra_factors} tone="text-danger" />
      </div>

      {score.chain_order_score > 0 && (
        <div className="mt-3 rounded-2xl border border-white/10 bg-cockpit/70 p-3">
          <span className="text-white/45">因果链排序：</span>
          <span className="text-radar">{score.chain_order_score} 分</span>
          <span className="ml-2 text-[11px] text-white/30">（顺序越接近真实事故链，分越高）</span>
        </div>
      )}

      {score.ai_score > 0 && (
        <div className="mt-4 rounded-2xl border border-amber/25 bg-amber/10 p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-amber">AI 审查</p>
            <span className="rounded-full border border-amber/35 px-3 py-1 text-xs text-amber">{score.ai_score} 分 / 链条{score.chain_quality}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/68">{score.ai_feedback}</p>
        </div>
      )}
    </section>
  );
}

function ResultLine({ label, items, tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-cockpit/70 p-3">
      <span className="text-white/45">{label}：</span>
      {items.length ? <span className={tone}>{items.join('、')}</span> : <span className="text-white/35">无</span>}
    </div>
  );
}
