import { motion } from 'framer-motion';

export default function AnalysisBoard({ accident, selectedFactors, onToggleFactor, notice }) {
  const selectedSet = new Set(selectedFactors);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-panel/80 p-5 shadow-glow backdrop-blur">
      <div className="mb-5">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-amber/80">Causal Board</p>
        <h2 className="mt-1 text-xl font-semibold text-paper">因果分析板</h2>
        <p className="mt-2 text-sm leading-6 text-white/58">选择你认为被证据支持的事故因素。错误因素会拉低最终评分。</p>
      </div>

      <div className="space-y-3">
        {accident.candidate_factors.map((factor, index) => {
          const selected = selectedSet.has(factor);
          return (
            <motion.button
              key={factor}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => onToggleFactor(factor)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                selected
                  ? 'border-radar/80 bg-radar/10 text-radar shadow-glow'
                  : 'border-white/10 bg-cockpit/75 text-white/72 hover:border-amber/60 hover:text-white'
              }`}
            >
              <span className={`h-3 w-3 rounded-full border ${selected ? 'border-radar bg-radar' : 'border-white/30'}`} />
              <span className="text-sm font-medium">{factor}</span>
            </motion.button>
          );
        })}
      </div>

      {notice && <p className="mt-4 rounded-2xl border border-amber/25 bg-amber/10 px-4 py-3 text-sm text-amber">{notice}</p>}
    </section>
  );
}
