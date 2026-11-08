interface ConsentGateProps {
  booting: boolean;
  engineHint: 'webgpu' | 'wllama' | 'unknown' | 'none';
  progressPct: number;
  progressDetail: string;
  onConsent: () => void;
  onCancel: () => void;
}

export default function ConsentGate({
  booting,
  engineHint,
  progressPct,
  progressDetail,
  onConsent,
  onCancel,
}: ConsentGateProps) {
  const downloadSize =
    engineHint === 'wllama' ? '~30 MB WASM model' : '~800 MB model, cached forever';
  return (
    <div className="consent-gate" data-testid="consent-gate">
      <h2>Run the local model.</h2>
      <p>
        This site runs a real language model entirely in your browser using WebGPU (with a smaller
        WASM fallback for unsupported browsers). Nothing is sent to a server and no API keys exist;
        answers are generated locally, and the model is cached after the first run.
      </p>
      <p className="muted">Download: {downloadSize}.</p>
      {!booting && (
        <button type="button" className="consent-button" onClick={onConsent}>
          Download &amp; run
        </button>
      )}
      {booting && (
        <div className="boot-box">
          <div
            className="progress-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPct * 100)}
          >
            <div className="progress-fill" style={{ width: `${Math.min(100, Math.round(progressPct * 100))}%` }} />
          </div>
          <p className="muted progress-detail">{Math.round(progressPct * 100)}% · {progressDetail}</p>
          <button type="button" className="consent-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
