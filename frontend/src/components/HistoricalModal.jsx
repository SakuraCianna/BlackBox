import { AnimatePresence, motion } from 'framer-motion';

export default function HistoricalModal({ historicalCase, onClose }) {
  return (
    <AnimatePresence>
      {historicalCase && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[86vh] max-w-2xl overflow-auto rounded-[2rem] border border-radar/30 bg-[#0b1717] p-6 shadow-glow"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.35em] text-radar">Historical Echo</p>
                <h2 className="mt-2 text-2xl font-semibold text-paper">{historicalCase.title}</h2>
              </div>
              <button onClick={onClose} className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/70 hover:border-radar hover:text-radar">
                关闭
              </button>
            </div>
            <p className="mt-5 text-base leading-8 text-white/72">{historicalCase.content}</p>
            <div className="mt-5 rounded-3xl border border-amber/25 bg-amber/10 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-amber">真实反馈</p>
              <p className="mt-2 leading-7 text-paper">{historicalCase.lesson}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
