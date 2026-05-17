import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Timeline({ entries }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [revealCount, setRevealCount] = useState(Math.min(3, entries.length));

  const visibleEntries = entries.slice(0, revealCount);
  const hasMore = revealCount < entries.length;

  function handleRevealMore() {
    setRevealCount((prev) => Math.min(prev + 3, entries.length));
  }

  if (!entries.length) return null;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-panel/75 p-5 shadow-glow backdrop-blur">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-radar">Voice Timeline</p>
          <h2 className="mt-1 text-xl font-bold text-paper">语音时间线</h2>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] text-white/40">
          {entries.length} 条记录
        </span>
      </div>

      <div className="relative pl-6">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-radar/40 via-radar/20 to-transparent" />

        {visibleEntries.map((entry, index) => {
          const isKey = entry.is_key_moment === 1;
          const isExpanded = expandedIndex === index;

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative mb-3 last:mb-0"
            >
              <div className={`absolute -left-6 top-2 h-3 w-3 rounded-full border-2 ${
                isKey
                  ? 'border-amber bg-amber/60 shadow-[0_0_8px_rgba(255,180,84,0.5)]'
                  : 'border-white/25 bg-cockpit'
              }`} />

              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  isKey
                    ? 'border-amber/30 bg-amber/8 hover:border-amber/50'
                    : 'border-white/8 bg-cockpit/60 hover:border-white/20'
                } ${isExpanded ? 'border-radar/40' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-[11px] ${isKey ? 'text-amber' : 'text-white/40'}`}>
                    {entry.time}
                  </span>
                  <span className={`text-xs font-semibold ${isKey ? 'text-amber' : 'text-white/55'}`}>
                    {entry.speaker}
                  </span>
                  {isKey && (
                    <span className="ml-auto rounded-full bg-amber/15 px-2 py-0.5 font-mono text-[9px] text-amber">
                      关键时刻
                    </span>
                  )}
                </div>

                <p className={`mt-1.5 text-sm leading-6 ${
                  isKey ? 'text-white/85' : 'text-white/55'
                } ${isExpanded ? '' : 'line-clamp-2'}`}>
                  {entry.text}
                </p>
              </button>
            </motion.div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={handleRevealMore}
          className="mt-4 w-full rounded-xl border border-dashed border-white/15 bg-cockpit/50 px-4 py-2.5 text-xs text-white/45 transition hover:border-radar/30 hover:text-white/60"
        >
          继续展开后续记录 ({revealCount}/{entries.length})
        </button>
      )}
    </section>
  );
}
