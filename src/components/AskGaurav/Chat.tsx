import type { Stats, Citation } from '../../rag/protocol';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  cited?: Citation[];
  stats?: Stats;
  canned?: boolean;
  error?: string;
}

interface ChatProps {
  engineDetail: string;
  messages: ChatMessage[];
  busy: boolean;
  onAsk: (q: string) => void;
  onReset: () => void;
}

export default function Chat({ engineDetail, messages, busy, onAsk, onReset }: ChatProps) {
  let input = '';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.currentTarget.querySelector('input[data-chat-input]') as HTMLInputElement | null;
    const q = target?.value.trim() ?? '';
    if (!q || busy) return;
    if (target) target.value = '';
    onAsk(q);
  };

  return (
    <div className="chat" data-testid="ask-chat">
      <form onSubmit={submit} className="chat-form">
        <input
          data-chat-input
          type="text"
          placeholder={busy ? 'Generating…' : 'Ask about Gaurav, or any AI question…'}
          aria-label="Ask the in-browser assistant"
          disabled={busy}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const target = e.currentTarget as HTMLInputElement;
              const q = target.value.trim();
              if (!q || busy) return;
              target.value = '';
              onAsk(q);
            }
          }}
        />
        <button type="submit" disabled={busy}>
          Send
        </button>
      </form>

      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="muted">
            Try “What did Gaurav build with metrics?” or a general question like “Explain attention in transformers”.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`bubble bubble-${m.role}`}>
            <p className="bubble-text">{m.text}</p>
            {m.cited && m.cited.length > 0 && (
              <div className="citations">
                {m.cited.map((c) => (
                  <a key={`${c.path}#${c.anchor}`} className="citation" href={`${c.path}#${c.anchor}`}>
                    [{c.path}#{c.anchor}]
                  </a>
                ))}
              </div>
            )}
            {m.stats && (
              <div className="stats-line">
                model: <code>{m.stats.model}</code> · {m.stats.tps.toFixed(1)} tok/s · prompt tokens ~{m.stats.prompt_tokens}
              </div>
            )}
            {(m.canned || m.error) && (
              <div className="stats-line">
                {m.canned && 'canned fallback (engine offline)'}
                {m.error && `engine error: ${m.error}`}
                {' · '}
                <button type="button" className="link-button" onClick={onReset}>
                  reset engine
                </button>
              </div>
            )}
          </div>
        ))}
        {busy && <div className="bubble bubble-assistant bubble-busy">▌</div>}
      </div>
    </div>
  );
}
