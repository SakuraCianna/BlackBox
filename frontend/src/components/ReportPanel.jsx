export default function ReportPanel({ reportText, onReportTextChange, selectedFactors, onSubmit, loading }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur">
      <div className="mb-4">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-radar/80">Final Report</p>
        <h2 className="mt-1 text-xl font-semibold text-paper">提交调查结论</h2>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {selectedFactors.length === 0 ? (
          <span className="text-sm text-white/45">尚未选择事故因素</span>
        ) : (
          selectedFactors.map((factor) => (
            <span key={factor} className="rounded-full border border-radar/25 bg-radar/10 px-3 py-1 text-xs text-radar">
              {factor}
            </span>
          ))
        )}
      </div>
      <textarea
        value={reportText}
        onChange={(event) => onReportTextChange(event.target.value)}
        placeholder="写下你的调查结论：直接原因、促成因素、根本原因分别是什么？证据如何支持这些判断？"
        className="min-h-36 w-full resize-none rounded-3xl border border-white/10 bg-cockpit/80 p-4 text-sm leading-7 text-white outline-none transition placeholder:text-white/35 focus:border-radar/70 focus:shadow-glow"
      />
      <button
        onClick={onSubmit}
        disabled={loading}
        className="mt-4 w-full rounded-2xl bg-radar px-5 py-3 font-semibold text-cockpit transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? '正在评分...' : '提交调查报告'}
      </button>
    </section>
  );
}
