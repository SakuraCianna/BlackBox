import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import AnalysisBoard from './components/AnalysisBoard.jsx';
import ClueCard from './components/ClueCard.jsx';
import CrashScene from './components/CrashScene.jsx';
import HistoricalModal from './components/HistoricalModal.jsx';
import MissionSelect from './components/MissionSelect.jsx';
import ReasoningDesk from './components/ReasoningDesk.jsx';
import ReportPanel from './components/ReportPanel.jsx';
import ScorePanel from './components/ScorePanel.jsx';
import Timeline from './components/Timeline.jsx';
import { fetchAccident, fetchAccidents, submitReport } from './services/api.js';

const STAGES = [
  { id: 'briefing', label: '任务简报' },
  { id: 'evidence', label: '现场取证' },
  { id: 'analysis', label: '因果推理' },
  { id: 'report', label: '结论提交' },
];

const stageMotion = {
  initial: { opacity: 0, y: 18, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -12, filter: 'blur(4px)' },
  transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
};

export default function App() {
  const [accidents, setAccidents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [accident, setAccident] = useState(null);
  const [stage, setStage] = useState('briefing');
  const [activeClue, setActiveClue] = useState(null);
  const [selectedFactors, setSelectedFactors] = useState([]);
  const [chainOrder, setChainOrder] = useState([]);
  const [historicalCase, setHistoricalCase] = useState(null);
  const [notice, setNotice] = useState('');
  const [reportText, setReportText] = useState('');
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccidents()
      .then(setAccidents)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    setLoading(true);
    setError('');
    fetchAccident(selectedId)
      .then((item) => {
        setAccident(item);
        setStage('briefing');
        setActiveClue(null);
        setSelectedFactors([]);
        setChainOrder([]);
        setHistoricalCase(null);
        setNotice('');
        setReportText('');
        setScore(null);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const realFactorSet = useMemo(() => new Set(accident?.causal_chain.map((item) => item.factor) || []), [accident]);

  function enterMission(id) {
    setSelectedId(id);
  }

  function exitMission() {
    setSelectedId(null);
    setAccident(null);
    setStage('briefing');
    setError('');
  }

  function handleSelectClue(clue) {
    setActiveClue(clue);
    setNotice(clue.related_factor ? `线索可能指向：${clue.related_factor}` : '这条线索暂时无法直接指向单一因素。');
  }

  function handleAddFactor(factor) {
    if (chainOrder.includes(factor)) return;

    setSelectedFactors((current) => current.includes(factor) ? current : [...current, factor]);
    setChainOrder((current) => [...current, factor]);

    if (!realFactorSet.has(factor)) {
      setNotice('这项推断目前缺少证据支撑，可能是干扰项。');
      return;
    }

    const matchedCase = accident.historical_cases.find((item) => item.trigger_factor === factor);
    setNotice(`已加入因果链：${factor}`);
    if (matchedCase) setHistoricalCase(matchedCase);
  }

  function handleRemoveFactor(factor) {
    setChainOrder((current) => current.filter((item) => item !== factor));
    setSelectedFactors((current) => current.filter((item) => item !== factor));
    setNotice(`已移除：${factor}`);
  }

  function handleReorder(fromIndex, toIndex) {
    setChainOrder((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  async function handleSubmitReport() {
    if (!accident) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await submitReport({
        accident_id: accident.id,
        selected_factors: selectedFactors,
        chain_order: chainOrder,
        report_text: reportText,
      });
      setScore(result);
      if (result.unlocked_cases?.length) setHistoricalCase(result.unlocked_cases[0]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell bg-cockpit text-white">
      <div className="fixed inset-0 radar-grid opacity-70" />
      <div className="fixed inset-0 scanline opacity-35" />
      <main className="app-main relative mx-auto max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {!selectedId ? (
            <MissionSelect key="mission-select" accidents={accidents} loading={loading} error={error} onEnter={enterMission} />
          ) : (
            <InvestigationShell
              key="investigation-shell"
              accident={accident}
              loading={loading}
              error={error}
              stage={stage}
              setStage={setStage}
              activeClue={activeClue}
              selectedFactors={selectedFactors}
              chainOrder={chainOrder}
              notice={notice}
              reportText={reportText}
              score={score}
              submitting={submitting}
              onExit={exitMission}
              onSelectClue={handleSelectClue}
              onAddFactor={handleAddFactor}
              onRemoveFactor={handleRemoveFactor}
              onReorder={handleReorder}
              onReportTextChange={setReportText}
              onSubmitReport={handleSubmitReport}
            />
          )}
        </AnimatePresence>
      </main>
      <HistoricalModal historicalCase={historicalCase} onClose={() => setHistoricalCase(null)} />
    </div>
  );
}

function InvestigationShell({
  accident,
  loading,
  error,
  stage,
  setStage,
  activeClue,
  selectedFactors,
  chainOrder,
  notice,
  reportText,
  score,
  submitting,
  onExit,
  onSelectClue,
  onAddFactor,
  onRemoveFactor,
  onReorder,
  onReportTextChange,
  onSubmitReport,
}) {
  if (loading || !accident) {
    return <LoadingState />;
  }

  return (
    <motion.div className="investigation-shell" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
      <header className="investigation-header rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-glow backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.45em] text-radar/80">Investigation Session</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-paper md:text-5xl">{accident.title}</h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-white/62">
              {accident.aircraft} / {accident.location} / {accident.flight_phase}
            </p>
          </div>
          <button onClick={onExit} className="rounded-2xl border border-white/10 bg-cockpit/80 px-4 py-3 text-sm text-white/70 transition hover:border-amber/60 hover:text-amber">
            退出事故现场
          </button>
        </div>
      </header>

      {error && <div className="mb-5 rounded-3xl border border-danger/40 bg-danger/10 p-4 text-danger">{error}</div>}

      <StageNav stage={stage} setStage={setStage} />

      <div className="stage-viewport">
      <AnimatePresence mode="wait">
        {stage === 'briefing' && <BriefingStage key="briefing" accident={accident} onNext={() => setStage('evidence')} />}
        {stage === 'evidence' && (
          <EvidenceStage key="evidence" accident={accident} activeClue={activeClue} onSelectClue={onSelectClue} onNext={() => setStage('analysis')} />
        )}
        {stage === 'analysis' && (
          <AnalysisStage
            key="analysis"
            accident={accident}
            selectedFactors={selectedFactors}
            chainOrder={chainOrder}
            onAddFactor={onAddFactor}
            onRemoveFactor={onRemoveFactor}
            onReorder={onReorder}
            notice={notice}
            onNext={() => setStage('report')}
          />
        )}
        {stage === 'report' && (
          <ReportStage
            key="report"
            accident={accident}
            reportText={reportText}
            selectedFactors={selectedFactors}
            score={score}
            submitting={submitting}
            onReportTextChange={onReportTextChange}
            onSubmitReport={onSubmitReport}
          />
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  );
}

function StageNav({ stage, setStage }) {
  return (
    <nav className="stage-nav grid gap-3 rounded-[2rem] border border-white/10 bg-panel/70 p-3 shadow-glow backdrop-blur md:grid-cols-4">
      {STAGES.map((item, index) => {
        const active = item.id === stage;
        return (
          <button
            key={item.id}
            onClick={() => setStage(item.id)}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              active ? 'border-radar/70 bg-radar/10 text-radar shadow-glow' : 'border-white/10 bg-cockpit/70 text-white/58 hover:border-amber/50 hover:text-white'
            }`}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.25em]">0{index + 1}</span>
            <span className="ml-3 text-sm font-semibold">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function BriefingStage({ accident, onNext }) {
  return (
    <motion.section {...stageMotion} className="stage-grid xl:grid-cols-[1.25fr_0.75fr]">
      <div className="stage-card rounded-[2rem] border border-white/10 bg-panel/75 p-4 shadow-glow backdrop-blur">
        <CrashScene accident={accident} />
      </div>
      <div className="stage-card rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-glow backdrop-blur">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-amber">Mission Briefing</p>
        <h2 className="mt-4 text-3xl font-bold text-paper">封存事故现场</h2>
        <p className="mt-5 leading-8 text-white/68">{accident.dossier}</p>
        <div className="mt-6 grid gap-3 text-sm text-white/62">
          <BriefingLine label="机型" value={accident.aircraft} />
          <BriefingLine label="地点" value={accident.location} />
          <BriefingLine label="阶段" value={accident.flight_phase} />
          <BriefingLine label="任务" value="通过证据链找出直接原因、促成因素和根本原因" />
        </div>
        <button onClick={onNext} className="mt-7 w-full rounded-2xl bg-radar px-5 py-4 font-semibold text-cockpit transition hover:brightness-110">
          进入现场取证
        </button>
      </div>
    </motion.section>
  );
}

function EvidenceStage({ accident, activeClue, onSelectClue, onNext }) {
  return (
    <motion.section {...stageMotion} className="stage-grid xl:grid-cols-[0.9fr_1.1fr]">
      <div className="stage-stack">
        <div className="stage-card rounded-[2rem] border border-white/10 bg-panel/75 p-4 shadow-glow backdrop-blur">
          <CrashScene accident={accident} compact />
        </div>
        <div className="stage-card evidence-detail rounded-[2rem] border border-amber/25 bg-amber/10 p-5">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-amber">Evidence Detail</p>
          {activeClue ? (
            <>
              <h3 className="mt-3 text-xl font-semibold text-paper">{activeClue.title}</h3>
              <p className="mt-3 leading-8 text-white/70">{activeClue.detail}</p>
            </>
          ) : (
            <p className="mt-3 leading-8 text-white/58">点击右侧证据卡，查看它在事故链中的可能指向。</p>
          )}
        </div>
      </div>

      <div className="stage-stack">
        <div className="stage-card rounded-[2rem] border border-white/10 bg-panel/75 p-5 shadow-glow backdrop-blur">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-radar">Evidence Wall</p>
              <h2 className="mt-2 text-2xl font-bold text-paper">现场证据墙</h2>
            </div>
            <button onClick={onNext} className="rounded-2xl border border-radar/40 px-4 py-2 text-sm text-radar transition hover:bg-radar/10">
              前往因果推理
            </button>
          </div>
          <div className="evidence-scroll grid gap-4 md:grid-cols-2">
            {accident.clues.map((clue, index) => (
              <ClueCard key={clue.id} clue={clue} index={index} active={activeClue?.id === clue.id} onClick={onSelectClue} />
            ))}
          </div>
        </div>
        <Timeline entries={accident.timeline || []} />
      </div>
    </motion.section>
  );
}

function AnalysisStage({ accident, selectedFactors, chainOrder, onAddFactor, onRemoveFactor, onReorder, notice, onNext }) {
  return (
    <motion.section {...stageMotion} className="stage-grid xl:grid-cols-[1.28fr_0.72fr]">
      <div className="stage-card rounded-[2rem] border border-white/10 bg-panel/75 p-4 shadow-glow backdrop-blur">
        <ReasoningDesk accident={accident} selectedFactors={chainOrder} />
        <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-cockpit/70 p-5">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-radar">Chain Order</p>
          <div className="mt-4 space-y-1.5">
            {chainOrder.length ? (
              chainOrder.map((factor, index) => (
                <div key={factor} className="flex items-center gap-2 text-xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-radar/20 font-mono text-[10px] text-radar">{index + 1}</span>
                  <span className="truncate text-white/70">{factor}</span>
                  {index < chainOrder.length - 1 && <span className="ml-auto text-[10px] text-white/20">→</span>}
                </div>
              ))
            ) : (
              <span className="text-sm text-white/45">尚未构建因果链</span>
            )}
          </div>
        </div>
      </div>

      <div className="stage-stack">
        <AnalysisBoard
          accident={accident}
          selectedFactors={selectedFactors}
          chainOrder={chainOrder}
          onAddFactor={onAddFactor}
          onRemoveFactor={onRemoveFactor}
          onReorder={onReorder}
          notice={notice}
        />
        <button onClick={onNext} className="w-full rounded-2xl bg-radar px-5 py-4 font-semibold text-cockpit transition hover:brightness-110">
          撰写最终调查报告
        </button>
      </div>
    </motion.section>
  );
}

function ReportStage({ accident, reportText, selectedFactors, score, submitting, onReportTextChange, onSubmitReport }) {
  return (
    <motion.section {...stageMotion} className="stage-grid xl:grid-cols-[0.95fr_1.05fr]">
      <div className="stage-stack stage-scroll">
        <ReportPanel
          reportText={reportText}
          onReportTextChange={onReportTextChange}
          selectedFactors={selectedFactors}
          onSubmit={onSubmitReport}
          loading={submitting}
        />
        <ScorePanel score={score} />
      </div>

      <div className="stage-card stage-scroll rounded-[2rem] border border-white/10 bg-panel/75 p-5 shadow-glow backdrop-blur">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-amber">Accident Chain</p>
        <h2 className="mt-2 text-2xl font-bold text-paper">调查复盘</h2>
        <p className="mt-3 leading-7 text-white/58">提交报告后，可对照系统调查链条检查你的结论是否完整。</p>
        <div className="mt-5 space-y-4">
          {(score ? accident.causal_chain : []).map((item, index) => (
            <div key={item.id} className="rounded-3xl border border-radar/20 bg-radar/10 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-radar">Step 0{index + 1}</p>
              <h3 className="mt-2 text-lg font-semibold text-paper">{item.factor}</h3>
              <p className="mt-2 text-sm leading-7 text-white/68">
                {item.impact} → {item.result}
              </p>
              <p className="mt-2 text-sm leading-7 text-white/52">{item.explanation}</p>
            </div>
          ))}
          {!score && <div className="rounded-3xl border border-dashed border-white/15 bg-cockpit/70 p-6 text-white/45">事故链仍处于封存状态。</div>}
        </div>
      </div>
    </motion.section>
  );
}

function BriefingLine({ label, value }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-cockpit/70 px-4 py-3">
      <span className="min-w-14 text-white/38">{label}</span>
      <span className="text-paper">{value}</span>
    </div>
  );
}

function LoadingState() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid min-h-[82vh] place-items-center rounded-[2rem] border border-white/10 bg-panel/70 shadow-glow backdrop-blur">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-radar/20 border-t-radar" />
        <p className="mt-4 font-mono text-sm uppercase tracking-[0.3em] text-radar/80">Loading mission</p>
      </div>
    </motion.div>
  );
}
