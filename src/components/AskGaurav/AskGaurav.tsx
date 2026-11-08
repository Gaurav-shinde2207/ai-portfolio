import { useEffect, useRef, useState } from 'react';
import RecommendationGate from './ConsentGate';
import Chat, { type ChatMessage } from './Chat';
import type { MainToWorker, WorkerToMain } from '../../rag/protocol';
import canned from '../../data/canned.json';

type Phase = 'gate' | 'booting' | 'ready' | 'failed';

interface Canned {
  match: string;
  answer: string;
}

function pickCanned(q: string): ChatMessage {
  const lower = q.toLowerCase();
  const list = canned as Canned[];
  const hit =
    list.find((c) => c.match !== '' && lower.includes(c.match)) ?? list.find((c) => c.match === '');
  return {
    role: 'assistant',
    text: hit?.answer ?? list[list.length - 1].answer,
    canned: true,
  };
}

export default function AskGaurav() {
  const [phase, setPhase] = useState<Phase>('gate');
  const [engineHint, setEngineHint] = useState<'webgpu' | 'wllama' | 'unknown' | 'none'>('unknown');
  const [engineDetail, setEngineDetail] = useState('');
  const [progress, setProgress] = useState({ pct: 0, detail: '' });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const askTimeoutRef = useRef<number | null>(null);

  const clearAskTimeout = () => {
    if (askTimeoutRef.current !== null) {
      clearTimeout(askTimeoutRef.current);
      askTimeoutRef.current = null;
    }
  };

  // A wedged generation must never lock the chat: on per-ask timeout, kill the
  // worker (clears its ack guard), unblock the form, and surface a reset path.
  const askTimedOut = () => {
    const w = workerRef.current;
    w?.postMessage({ type: 'cancel' } as MainToWorker);
    w?.terminate();
    workerRef.current = null;
    askTimeoutRef.current = null;
    setBusy(false);
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', text: '', error: 'the engine got stuck — reset it to continue' },
    ]);
  };

  const spawnWorker = () => {
    workerRef.current?.terminate();
    const w = new Worker(new URL('../../rag/assistant.worker.ts', import.meta.url), { type: 'module' });
    w.onmessage = (ev: MessageEvent<WorkerToMain>) => void handleWorker(ev.data);
    workerRef.current = w;
    return w;
  };

  async function handleWorker(msg: WorkerToMain) {
    switch (msg.type) {
      case 'progress':
        setProgress({ pct: msg.pct, detail: msg.detail });
        break;
      case 'engine':
        setEngineHint(msg.engine);
        setEngineDetail(msg.detail);
        if (msg.engine === 'none') {
          setPhase('ready'); // chat still usable via canned answers
        } else {
          setPhase('ready');
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              text:
                msg.engine === 'webgpu'
                  ? 'Model loaded. Ask me anything about Gaurav, or a general AI question.'
                  : 'No WebGPU here — running the smaller WASM model. Ask away.',
            },
          ]);
        }
        break;
      case 'token':
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant' && !last.stats && !last.error && !last.canned) {
            const copy = prev.slice(0, -1);
            copy.push({ ...last, text: last.text + msg.t });
            return copy;
          }
          return [...prev, { role: 'assistant', text: msg.t }];
        });
        break;
      case 'done':
        clearAskTimeout();
        setMessages((prev) => {
          if (prev.length === 0) return [{ role: 'assistant', text: '', cited: msg.cited, stats: msg.stats }];
          const copy = prev.slice();
          const last = copy[copy.length - 1];
          if (last.role === 'assistant') {
            copy[copy.length - 1] = {
              ...last,
              cited: [...(last.cited ?? []), ...msg.cited],
              stats: msg.stats,
            };
          } else {
            copy.push({ role: 'assistant', text: '', cited: msg.cited, stats: msg.stats });
          }
          return copy;
        });
        setBusy(false);
        break;
      case 'error':
        clearAskTimeout();
        setMessages((prev) => [...prev, { role: 'assistant', text: '', error: msg.detail }]);
        setBusy(false);
        break;
    }
  }

  useEffect(
    () => () => {
      workerRef.current?.terminate();
      clearAskTimeout();
    },
    []
  );

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

  const ask = (q: string) => {
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setBusy(true);
    if (
      phase !== 'failed' &&
      engineHint !== 'none' &&
      workerRef.current
    ) {
      const raw = Number(new URLSearchParams(window.location.search).get('timeoutMs') ?? '');
      const limit = Number.isFinite(raw) && raw > 0 ? raw : 120_000;
      clearAskTimeout();
      askTimeoutRef.current = window.setTimeout(askTimedOut, limit);
      workerRef.current.postMessage({ type: 'ask', q } as MainToWorker);
    } else {
      // engine unavailable: honest canned fallback without a model
      setMessages((prev) => [...prev, pickCanned(q)]);
      setBusy(false);
    }
  };

  const reset = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setPhase('gate');
    setEngineHint('unknown');
    setMessages([]);
  };

  if (phase === 'gate' || phase === 'booting') {
    return (
      <RecommendationGate
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
        engine: <code>{engineDetail || engineHint}</code> · runs locally in your browser
      </p>
      <Chat engineDetail={engineDetail} messages={messages} busy={busy} onAsk={ask} onReset={reset} />
    </div>
  );
}
