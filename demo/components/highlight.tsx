import type { ReactNode } from 'react';

/**
 * A tiny TSX highlighter for the snippets on this site: comments, strings,
 * keywords, JSX tags and props, numbers and calls. Not a parser, but these
 * samples are short and regular, so a single pass is enough.
 */
const TOKEN = new RegExp(
  [
    String.raw`(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/)`,
    String.raw`(?<string>'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|` + '`(?:\\\\.|[^`\\\\])*`)',
    String.raw`(?<tag><\/?)(?<tagName>[A-Za-z][\w.]*)`,
    String.raw`(?<keyword>\b(?:import|from|export|default|function|const|let|var|return|if|else|true|false|null|undefined|new|async|await|type|interface)\b)`,
    String.raw`(?<attr>\b[A-Za-z][\w-]*)(?==[^=])`,
    String.raw`(?<number>\b\d+(?:\.\d+)?\b)`,
    String.raw`(?<call>\b[A-Za-z_]\w*)(?=\()`,
  ].join('|'),
  'g',
);

export function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of code.matchAll(TOKEN)) {
    const at = match.index ?? 0;
    if (at > last) out.push(code.slice(last, at));
    const g = match.groups ?? {};
    if (g.tag !== undefined) {
      out.push(g.tag, <span key={key++} className="tok-tag">{g.tagName}</span>);
    } else {
      const kind = (['comment', 'string', 'keyword', 'attr', 'number', 'call'] as const).find((name) => g[name] !== undefined);
      out.push(<span key={key++} className={`tok-${kind}`}>{match[0]}</span>);
    }
    last = at + match[0].length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}
