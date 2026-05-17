import { motion } from 'framer-motion';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export default function MissionSelect({ accidents, loading, error, onEnter }) {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo('.mission-title', { letterSpacing: '0.18em', opacity: 0, y: 28 }, { letterSpacing: '-0.03em', opacity: 1, y: 0, duration: 1, ease: 'expo.out' });
      gsap.fromTo('.mission-copy', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.25, ease: 'power3.out' });
      gsap.fromTo('.mission-card', { opacity: 0, x: 60, rotateY: -8 }, { opacity: 1, x: 0, rotateY: 0, duration: 0.8, stagger: 0.08, delay: 0.25, ease: 'power3.out' });
    }, rootRef);

    return () => context.revert();
  }, [accidents.length]);

  return (
    <motion.section ref={rootRef} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="mission-screen">
      <div className="mission-layout grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="mission-hero flex flex-col justify-between rounded-[2.5rem] border border-white/10 bg-white/[0.045] p-7 shadow-glow backdrop-blur md:p-10">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.55em] text-radar/80">Black Box Theater</p>
            <h1 className="mission-title mt-5 text-5xl font-black leading-tight tracking-tight text-paper md:text-7xl">黑匣子剧场</h1>
            <p className="mission-copy mt-6 max-w-2xl text-lg leading-9 text-white/65">
              你不是在浏览资料库，而是被派往一处封存事故现场。选择一个任务后，档案将锁定，直到你提交调查结论。
            </p>
          </div>

          <div className="mt-10 grid gap-3 text-sm text-white/62 md:grid-cols-3">
            <Status label="任务档案" value={loading ? '--' : accidents.length} />
            <Status label="调查阶段" value="04" />
            <Status label="目标" value="事故链" />
          </div>
        </div>

        <div className="mission-list-panel rounded-[2.5rem] border border-white/10 bg-panel/75 p-5 shadow-glow backdrop-blur md:p-7">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-amber">Mission Dispatch</p>
              <h2 className="mt-2 text-3xl font-bold text-paper">选择调查任务</h2>
            </div>
          </div>

          {error && <div className="mb-4 rounded-3xl border border-danger/40 bg-danger/10 p-4 text-danger">{error}</div>}

          {loading ? (
            <div className="grid min-h-96 place-items-center rounded-[2rem] border border-white/10 bg-cockpit/70">
              <p className="font-mono text-sm uppercase tracking-[0.3em] text-radar">Loading case files</p>
            </div>
          ) : (
            <div className="mission-list grid gap-4">
              {accidents.map((accident, index) => (
                <motion.button
                  key={accident.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  onClick={() => onEnter(accident.id)}
                  className="mission-card group overflow-hidden rounded-[2rem] border border-white/10 bg-cockpit/75 p-5 text-left transition hover:-translate-y-1 hover:border-radar/70 hover:bg-radar/10 hover:shadow-glow"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-radar/25 bg-radar/10 px-3 py-1 font-mono text-[11px] text-radar">CASE {String(accident.id).padStart(2, '0')}</span>
                        <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] text-white/45">{accident.year}</span>
                      </div>
                      <h3 className="mt-4 text-2xl font-bold text-paper">{accident.title}</h3>
                      <p className="mt-3 max-w-3xl leading-7 text-white/62">{accident.description}</p>
                    </div>
                    <div className="min-w-48 rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/58">
                      <p>{accident.aircraft}</p>
                      <p className="mt-2 text-amber">{accident.flight_phase}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-sm text-white/45">进入后将锁定单一事故现场</span>
                    <span className="rounded-full bg-radar px-4 py-2 text-sm font-semibold text-cockpit transition group-hover:brightness-110">进入调查</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}

function Status({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-cockpit/70 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/38">{label}</p>
      <p className="mt-2 text-2xl font-bold text-radar">{value}</p>
    </div>
  );
}
