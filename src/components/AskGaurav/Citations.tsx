import type { Citation } from '../../rag/protocol';

export default function Citations({ cited }: { cited: Citation[] }) {
  if (cited.length === 0) return null;
  return (
    <div className="citations">
      {cited.map((c) => (
        <a key={`${c.path}#${c.anchor}`} className="citation" href={`${c.path}#${c.anchor}`}>
          [{c.path}#{c.anchor}]
        </a>
      ))}
    </div>
  );
}
