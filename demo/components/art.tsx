/** Generated cover art so every glass surface has something rich to bend. */

export const COVERS = [
  { title: 'Afterglow', by: 'Nova Lane', a: '#ff5f6d', b: '#ffc371', c: '#8e2de2' },
  { title: 'Tidal', by: 'The Shallows', a: '#00c6ff', b: '#0072ff', c: '#7cffcb' },
  { title: 'Bloom', by: 'Iris Vale', a: '#f953c6', b: '#b91d73', c: '#ffd86f' },
  { title: 'Static Sun', by: 'Ojai', a: '#f7971e', b: '#ffd200', c: '#ff4e50' },
  { title: 'Midnight Oil', by: 'Kites', a: '#141e30', b: '#243b55', c: '#6a82fb' },
  { title: 'Verdant', by: 'Moss & Co', a: '#11998e', b: '#38ef7d', c: '#d4fc79' },
  { title: 'Paper Planes', by: 'Lumen', a: '#4776e6', b: '#8e54e9', c: '#ff8ae2' },
  { title: 'Coral', by: 'Seaside', a: '#ff9a8b', b: '#ff6a88', c: '#ff99ac' },
  { title: 'Ultraviolet', by: 'Pulse', a: '#7f00ff', b: '#e100ff', c: '#00e0ff' },
  { title: 'Desert Rose', by: 'Amber', a: '#e65c00', b: '#f9d423', c: '#c0392b' },
  { title: 'Glacier', by: 'North', a: '#83a4d4', b: '#b6fbff', c: '#4a69bd' },
  { title: 'Neon Rain', by: 'Arcade', a: '#fc466b', b: '#3f5efb', c: '#00f5a0' },
];

export function Cover({ index, className }: { index: number; className?: string }) {
  const c = COVERS[index % COVERS.length];
  return (
    <div
      className={['cover', className].filter(Boolean).join(' ')}
      style={{
        background: `radial-gradient(120% 90% at 15% 10%, ${c.c} 0%, transparent 55%), radial-gradient(90% 90% at 90% 90%, ${c.b} 0%, transparent 60%), linear-gradient(135deg, ${c.a}, ${c.b})`,
      }}
    >
      <span className="cover__title">{c.title}</span>
    </div>
  );
}
