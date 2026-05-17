import { motion } from 'framer-motion';
import { useState } from 'react';

const TYPE_LABEL = {
  text: '文字记录',
  image: '图像证据',
  audio: '音频证据',
};

export default function ClueCard({ clue, index, active, onClick }) {
  const [mediaFailed, setMediaFailed] = useState(false);
  const mediaPath = clue.content.startsWith('placeholder/') ? `/media/${clue.content.replace('placeholder/', '')}` : clue.content;
  const canShowMedia = clue.type !== 'text' && !mediaFailed;

  return (
    <motion.button
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onClick(clue)}
      className={`clue-card group rounded-[1.5rem] border p-4 text-left transition ${
        active
          ? 'border-amber/80 bg-amber/10 shadow-amber'
          : 'border-white/10 bg-white/[0.045] hover:-translate-y-1 hover:border-radar/60 hover:bg-radar/10'
      }`}
    >
      <div className="clue-card-meta flex items-center justify-between gap-3">
        <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-radar">
          {TYPE_LABEL[clue.type] || clue.type}
        </span>
        <span className="text-xs text-white/45">可信度 {clue.reliability}</span>
      </div>

      <div className="clue-card-body">
        <h3 className="text-lg font-semibold text-white">{clue.title}</h3>
        <p className="mt-3 text-sm leading-6 text-white/65">{clue.content}</p>
      </div>

      {clue.type === 'image' && canShowMedia && (
        <img
          src={mediaPath}
          alt={clue.title}
          onError={() => setMediaFailed(true)}
          className="clue-card-media h-36 w-full rounded-2xl border border-white/10 object-cover grayscale-[20%] sepia-[18%]"
        />
      )}

      {clue.type === 'audio' && canShowMedia && (
        <audio src={mediaPath} controls onError={() => setMediaFailed(true)} className="clue-card-media w-full" />
      )}

      {clue.type !== 'text' && mediaFailed && (
        <div className="clue-card-media rounded-2xl border border-dashed border-white/15 bg-cockpit/80 px-3 py-4 font-mono text-xs text-white/45">
          素材待放入：{mediaPath}
        </div>
      )}
    </motion.button>
  );
}
