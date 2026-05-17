import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export default function ReasoningDesk({ accident, selectedFactors }) {
  const deskRef = useRef(null);
  const animatedRef = useRef(false);

  useLayoutEffect(() => {
    if (animatedRef.current && accident.id) return;
    animatedRef.current = true;

    const context = gsap.context(() => {
      gsap.fromTo('.desk-slip', { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.06, ease: 'power3.out' });
      gsap.fromTo('.thinking-pulse', { opacity: 0.25 }, { opacity: 0.75, duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }, deskRef);

    return () => context.revert();
  }, [accident.id]);

  const displayFactors = selectedFactors.length ? selectedFactors : ['等待固定第一条因素'];

  return (
    <section ref={deskRef} className="reasoning-desk">
      <div className="desk-header">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.36em] text-amber">Thinking Mode</p>
          <h2 className="mt-2 text-2xl font-bold text-paper">思索模式：整理线索</h2>
        </div>
        <div className="thinking-pulse rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-xs text-amber">正在推理</div>
      </div>

      <div className="desk-board">
        <div className="clue-cluster">
          {accident.clues.slice(0, 5).map((clue, index) => (
            <div key={clue.id} className="desk-slip">
              <span>{clue.type.toUpperCase()}</span>
              <strong>{clue.title}</strong>
              <small>{clue.related_factor || '待归类'}</small>
            </div>
          ))}
        </div>

        <div className="factor-stack">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-radar">Pinned Factors</p>
          {displayFactors.map((factor) => (
            <div key={factor} className="factor-note">
              {factor}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
