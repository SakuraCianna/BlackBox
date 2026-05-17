import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';

export default function AnalysisBoard({ accident, selectedFactors, chainOrder, onAddFactor, onRemoveFactor, onReorder, notice }) {
  const [dragIndex, setDragIndex] = useState(null);
  const dragOverIndex = useRef(null);

  const availableFactors = accident.candidate_factors.filter((f) => !chainOrder.includes(f));

  function handleDragStart(index) {
    setDragIndex(index);
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    dragOverIndex.current = index;
  }

  function handleDrop() {
    if (dragIndex !== null && dragOverIndex.current !== null && dragIndex !== dragOverIndex.current) {
      onReorder(dragIndex, dragOverIndex.current);
    }
    setDragIndex(null);
    dragOverIndex.current = null;
  }

  function handleDragEnd() {
    setDragIndex(null);
    dragOverIndex.current = null;
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-panel/80 p-5 shadow-glow backdrop-blur">
      <div className="mb-4">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-amber/80">Causal Chain Builder</p>
        <h2 className="mt-1 text-xl font-semibold text-paper">构建因果链</h2>
        <p className="mt-2 text-sm leading-6 text-white/58">
          从候选因素中选取事故原因，然后拖拽排列正确的因果顺序：直接原因 → 促成因素 → 根本原因。
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* 可选因素 */}
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">候选因素</p>
          <div className="space-y-2">
            {availableFactors.map((factor, index) => {
              const isReal = accident.causal_chain.some((c) => c.factor === factor);
              return (
                <motion.button
                  key={factor}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => onAddFactor(factor)}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-cockpit/75 px-4 py-2.5 text-left text-sm text-white/72 transition hover:border-amber/50 hover:text-white"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/20 text-[10px] text-white/40">+</span>
                  <span className="truncate">{factor}</span>
                </motion.button>
              );
            })}
            {!availableFactors.length && (
              <p className="rounded-xl border border-dashed border-white/10 bg-cockpit/50 px-4 py-3 text-center text-xs text-white/35">所有因素已加入链条</p>
            )}
          </div>
        </div>

        {/* 因果链排序 */}
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-radar/70">
            因果链排序 ({chainOrder.length}/{accident.causal_chain.length})
          </p>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {chainOrder.map((factor, index) => {
                const isDragging = dragIndex === index;
                return (
                  <motion.div
                    key={factor}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, x: 30 }}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    onClick={() => onRemoveFactor(factor)}
                    className={`flex cursor-grab items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition active:cursor-grabbing ${
                      isDragging
                        ? 'border-amber/60 bg-amber/15 opacity-60'
                        : 'border-radar/25 bg-radar/10 text-radar hover:border-danger/50 hover:bg-danger/10'
                    }`}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-radar/20 font-mono text-[11px] font-bold text-radar">
                      {index + 1}
                    </span>
                    <span className="truncate font-medium">{factor}</span>
                    {index < chainOrder.length - 1 && (
                      <span className="ml-auto text-[10px] text-white/30">↓</span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {!chainOrder.length && (
              <div className="rounded-xl border border-dashed border-radar/20 bg-cockpit/50 px-4 py-6 text-center text-xs text-white/35">
                点击左侧因素添加到因果链
              </div>
            )}
          </div>
        </div>
      </div>

      {notice && <p className="mt-4 rounded-2xl border border-amber/25 bg-amber/10 px-4 py-3 text-sm text-amber">{notice}</p>}
    </section>
  );
}
