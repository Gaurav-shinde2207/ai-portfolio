import { useEffect, useRef, useState } from 'react';
import ConsentGate from './ConsentGate';
import { scoreAnswer } from '../../rag/score';
import evals from '../../data/evals.json';
import type { MainToWorker, WorkerToMain } from '../../rag/protocol';

type Phase = 'gate' | 'booting' | 'running' | 'done';
type EngineHint = 'webgpu' | 'wllama' | 'unknown' | 'none';

interface EvalCase {
  q: string;
  expectedKeywords: string[];
}

interface EvalRow extends EvalCase {
  answer: string;
  passed: boolean;
}

// Per-ask failure bound so one wedged generation cannot hang the run.
const ASK_TIMEOUT_MS = 180_000;

export default function SelfTest() {
  const [phase, setPhase] = useState<Phase>('gate');
  const [engineHint, setEngineHint] = useState<EngineHint>('unknown');
  const [engineDetail, setEngineDetail] = useState('');
  const [progress, setProgress] = useState({ pct: 0, detail: '' });
  const [rows, setRows] = useState<EvalRow[]>([]);
  const workerRef = useRef<Worker | null>(null);
  // Sequential runner state (refs so onmessage sees the live handles).
  const answerRef = useRef('');
  const settleRef = useRef<((r: { answer: string; error?: string }) => void) | null>(null);

  const pending = evals as EvalCase[];
  const passedCount = rows.filter((r) => r.passed).length;
  const passRate = rows.length > 0 ? Math.round((passedCount / rows.length) * 100) : null;

  const spawnWorker = () => {
    workerRef.current?.terminate();
    const w = new Worker(new URL('../../rag/assistant.worker.ts', import.meta.url), {
      type: 'module',
    });
    w.onmessage = (ev: MessageEvent<WorkerToMain>) => void handleWorker(ev.data);
    workerRef.current = w;
    return w;
  };

  function handleWorker(msg: WorkerToMain) {
    switch (msg.type) {
      case 'progress':
        setProgress({ pct: msg.pct, detail: msg.detail });
        break;
      case 'engine':
        setEngineHint(msg.engine);
        setEngineDetail(msg.detail);
        setPhase('running');
        void runAll();
        break;
      case 'token':
        answerRef.current += msg.t;
        break;
      case 'done':
        settleRef.current?.({ answer: answerRef.current });
        settleRef.current = null;
        break;
      case 'error':
        settleRef.current?.({ answer: answerRef.current, error: msg.detail });
        settleRef.current = null;
        break;
    }
  }

  useEffect(() => () => workerRef.current?.terminate(), []);

  const consent = () => {
    const raw = new URLSearchParams(window.location.search).get('engine');
    const force = raw === 'wllama' || raw === 'webgpu' || raw === 'none' ? raw : undefined;
    spawnWorker().postMessage({ type: 'init', force } as MainToWorker);
    setPhase('booting');
    setProgress({ pct: 0, detail: 'starting engine…' });
  };

  const cancelBoot = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setPhase('gate');
  };

  async function runAll() {
    const results: EvalRow[] = [];
    setRows([]);
    for (const ev of pending) {
      answerRef.current = '';
      const res = await new Promise<{ answer: string; error?: string }>((resolve) => {
        let settled = false;
        const once = (v: { answer: string; error?: string }) => {
          if (settled) return;
          settled = true;
          resolve(v);
        };
        settleRef.current = once;
        window.setTimeout(() => once({ answer: answerRef.current, error: 'timeout' }), ASK_TIMEOUT_MS);
        workerRef.current?.postMessage({ type: 'ask', q: ev.q } as MainToWorker);
      });
      const text = res.error ? `(engine error: ${res.error})` : res.answer;
      results.push({
        q: ev.q,
        expectedKeywords: ev.expectedKeywords,
        answer: text || '(empty answer)',
        passed: !res.error && scoreAnswer(res.answer, ev.expectedKeywords),
      });
      setRows([...results]);
    }
    setPhase('done');
    void workerRef.current?.postMessage({ type: 'cancel' } as MainToWorker);
  }

  if (phase === 'gate' || phase === 'booting') {
    return (
      <ConsentGate
        booting={phase === 'booting'}
        engineHint={engineHint}
        progressPct={progress.pct}
        progressDetail={progress.detail}
        onConsent={consent}
        onCancel={cancelBoot}
      />
    );
  }

  return (
    <div>
      <p className="muted engine-line">
        engine: <code>{engineDetail || engineHint}</code> · 20 live evals run through the real
        pipeline (embed → retrieve → route → generate), then each answer is scored against
        expected keywords.
      </p>
      {passRate !== null && (
        <p className="stats-line" data-testid="pass-rate">
          pass rate: {passedCount}/{rows.length} = {passRate}% (target ≥ 80%)
        </p>
      )}
      <table className="eval-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Question</th>
            <th>Expected</th>
            <th>Result</th>
            <th>Answer (truncated)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.q} className={r.passed ? 'eval-pass' : 'eval-fail'}>
              <td>{i + 1}</td>
              <td>{r.q}</td>
              <td>{r.expectedKeywords.join(', ')}</td>
              <td>{r.passed ? 'pass' : 'fail'}</td>
              <td>{r.answer.slice(0, 160)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {phase === 'done' && (
        <p className="muted">Run finished — {passedCount}/{rows.length} passed.</p>
      )}
    </div>
  );
}
