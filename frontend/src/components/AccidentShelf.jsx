import { motion } from 'framer-motion';

export default function AccidentShelf({ accidents, selectedId, onSelect }) {
  return (
    <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-glow backdrop-blur">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-radar/70">Case Files</p>
          <h2 className="mt-1 text-xl font-semibold text-paper">事故档案</h2>
        </div>
        <div className="h-3 w-3 rounded-full bg-radar shadow-[0_0_18px_#74f2c6]" />
      </div>

      <div className="space-y-3">
        {accidents.map((accident, index) => {
          const active = accident.id === selectedId;
          return (
            <motion.button
              key={accident.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(accident.id)}
              className={`w-full rounded-3xl border p-4 text-left transition ${
                active
                  ? 'border-radar/70 bg-radar/10 shadow-glow'
                  : 'border-white/10 bg-cockpit/70 hover:border-amber/60 hover:bg-amber/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold leading-snug text-white">{accident.title}</h3>
                <span className="rounded-full border border-white/10 px-2 py-1 font-mono text-[10px] text-radar">
                  {accident.year}
                </span>
              </div>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/62">{accident.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/55">
                <span className="rounded-2xl bg-white/[0.05] px-3 py-2">{accident.aircraft}</span>
                <span className="rounded-2xl bg-white/[0.05] px-3 py-2">{accident.flight_phase}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
}
