// QuiltGrid.jsx — The animated quilt pattern builder UI
// Renders a grid of pieced blocks (solid squares + HSTs) that animate in,
// with a soft toolbar and palette swatches alongside.

const PW_GREEN = '#5F7355';
const PW_GREEN_DEEP = '#3F4E37';
const PW_GREEN_SOFT = '#8EA181';
const PW_GREEN_LIFT = '#6F8A61';   // hover/dark-mode variant from spec
const PW_INK_DARK  = '#243746';    // trust anchor (UI dark accents)
const PW_GOLD = '#F29F05';         // CTA accent
const PW_CREAM = '#F2EADA';
const PW_SAND  = '#E4D6BC';
const PW_CLAY  = '#C18A6E';
const PW_INK   = '#1F2923';        // primary text
const PW_MUTED = '#667066';        // muted text
const PW_BORDER = '#D9DED4';
const PW_SURFACE = '#FFFFFF';
const PW_BG    = '#F5F6F2';        // app background

// 8×8 sawtooth-star medallion pattern.
// Mixed solid blocks and HSTs forming a symmetric center-out design.

function makePattern() {
  const G = { k: 'solid', a: PW_GREEN };
  const S = { k: 'solid', a: PW_CREAM };
  const N = { k: 'solid', a: PW_SAND };
  const C = { k: 'solid', a: PW_CLAY };
  const D = { k: 'solid', a: PW_GREEN_DEEP };
  const h = (rot, a = PW_GREEN, b = PW_CREAM) => ({ k: 'hst', a, b, rot });

  const rows = [
    [h(0,PW_GREEN,PW_CREAM), N,                       h(0,PW_CLAY,PW_CREAM), S,                       S, h(1,PW_CLAY,PW_CREAM),    N, h(1,PW_GREEN,PW_CREAM)],
    [N,                       h(0),                   S,                     h(0,PW_GREEN_DEEP,PW_SAND), h(1,PW_GREEN_DEEP,PW_SAND), S, h(1),                       N],
    [h(3,PW_CLAY,PW_CREAM),   S,                       G,                     h(0,PW_CREAM,PW_GREEN),    h(1,PW_CREAM,PW_GREEN),    G, S,                          h(2,PW_CLAY,PW_CREAM)],
    [S,                       h(3,PW_GREEN_DEEP,PW_SAND), h(0,PW_CREAM,PW_GREEN), D,                      D,                          h(1,PW_CREAM,PW_GREEN), h(2,PW_GREEN_DEEP,PW_SAND), S],
    [S,                       h(3,PW_GREEN_DEEP,PW_SAND), h(3,PW_CREAM,PW_GREEN), D,                      D,                          h(2,PW_CREAM,PW_GREEN), h(2,PW_GREEN_DEEP,PW_SAND), S],
    [h(3,PW_CLAY,PW_CREAM),   S,                       G,                     h(3,PW_CREAM,PW_GREEN),    h(2,PW_CREAM,PW_GREEN),    G, S,                          h(2,PW_CLAY,PW_CREAM)],
    [N,                       h(3),                   S,                     h(3,PW_GREEN_DEEP,PW_SAND), h(2,PW_GREEN_DEEP,PW_SAND), S, h(2),                       N],
    [h(3,PW_GREEN,PW_CREAM), N,                       h(3,PW_CLAY,PW_CREAM), S,                       S, h(2,PW_CLAY,PW_CREAM),    N, h(2,PW_GREEN,PW_CREAM)],
  ];

  const Gsize = 8;
  const cells = [];
  for (let r = 0; r < Gsize; r++) {
    for (let c = 0; c < Gsize; c++) {
      const cr = 3.5, cc = 3.5;
      const ring = Math.max(Math.abs(r - cr), Math.abs(c - cc));
      cells.push({ r, c, block: rows[r][c], ring });
    }
  }
  cells.sort((a, b) => a.ring - b.ring || ((a.r * 17 + a.c * 31) % 13) - ((b.r * 17 + b.c * 31) % 13));
  cells.forEach((cell, i) => { cell.order = i; });
  return { cells, gridSize: Gsize };
}

const PATTERN_INFO = makePattern();
const PATTERN = PATTERN_INFO.cells;
const GRID_SIZE = PATTERN_INFO.gridSize;

// HST shape — two right triangles meeting on a diagonal. rot in {0,1,2,3}
// 0: top-left / bottom-right split, top-left = a
// 1: top-right / bottom-left split, top-right = a
// 2: bottom-right / top-left split, bottom-right = a
// 3: bottom-left / top-right split, bottom-left = a
function HSTSvg({ a, b, rot = 0, size = 100 }) {
  // We'll draw two triangles. Path A is the "a" colored triangle.
  // For rot 0: a = polygon (0,0)(size,0)(0,size); b = (size,0)(size,size)(0,size)
  // Rotate via SVG transform of 90deg per step around center.
  const cx = size / 2, cy = size / 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={{ display: 'block' }}>
      <g transform={`rotate(${rot * 90} ${cx} ${cy})`}>
        <polygon points={`0,0 ${size},0 0,${size}`} fill={a} />
        <polygon points={`${size},0 ${size},${size} 0,${size}`} fill={b} />
      </g>
    </svg>
  );
}

function Block({ block, revealT, justPlacedT, size }) {
  // revealT: 0..1 entry tween for this block
  // justPlacedT: 0..1 short emphasis pulse when first placed (drops to 0)
  const scale = 0.6 + 0.4 * revealT;
  const opacity = revealT;
  const pulse = justPlacedT > 0 ? 1 + 0.06 * Math.sin(justPlacedT * Math.PI) : 1;
  return (
    <div style={{
      width: size, height: size,
      transform: `scale(${scale * pulse})`,
      opacity,
      transformOrigin: 'center',
      willChange: 'transform, opacity',
      // a subtle stitched feel
      boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.04)',
    }}>
      {block.k === 'solid' ? (
        <div style={{ width: '100%', height: '100%', background: block.a }} />
      ) : (
        <HSTSvg a={block.a} b={block.b} rot={block.rot} />
      )}
    </div>
  );
}

// Build progress: cells appear gated by a per-cell start time.
// totalDuration is in seconds within the parent Sprite.
function QuiltGrid({
  width = 760,
  buildStart = 0,
  buildEnd = 4.5,
  gridGap = 2,
  cellPad = 0,
  // localTime within parent scene
  t = 0,
}) {
  const G = GRID_SIZE;
  const cell = (width - 2 * cellPad - (G - 1) * gridGap) / G;

  const N = PATTERN.length;
  const span = buildEnd - buildStart;
  const each = span / N * 1.6;

  // 2D matrix by r,c so spatial layout is correct
  const matrix = [];
  for (let r = 0; r < G; r++) {
    matrix.push([]);
    for (let c = 0; c < G; c++) matrix[r].push(null);
  }
  PATTERN.forEach((p) => {
    const startAt = buildStart + (p.order / N) * (span - each);
    const localT = (t - startAt) / each;
    const revealT = clamp(Easing.easeOutCubic(clamp(localT, 0, 1)), 0, 1);
    matrix[p.r][p.c] = { block: p.block, revealT };
  });

  return (
    <div style={{
      width, height: width,
      padding: cellPad,
      background: PW_SURFACE,
      borderRadius: 6,
      boxShadow: `inset 0 0 0 1px ${PW_BORDER}`,
      position: 'relative',
      boxSizing: 'border-box',
    }}>
      {/* Faint underlying grid */}
      <div style={{
        position: 'absolute', inset: cellPad,
        backgroundImage:
          `linear-gradient(to right, rgba(95,115,85,0.10) 1px, transparent 1px),` +
          `linear-gradient(to bottom, rgba(95,115,85,0.10) 1px, transparent 1px)`,
        backgroundSize: `${cell + gridGap}px ${cell + gridGap}px`,
        opacity: 0.7,
      }} />
      <div style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: `repeat(${G}, ${cell}px)`,
        gridTemplateRows: `repeat(${G}, ${cell}px)`,
        gap: gridGap,
      }}>
        {matrix.flatMap((row, r) => row.map((c, ci) => (
          <div key={`${r}-${ci}`} style={{ width: cell, height: cell }}>
            {c && c.revealT > 0 && (
              <Block block={c.block} revealT={c.revealT} justPlacedT={0} size={cell} />
            )}
          </div>
        )))}
      </div>
    </div>
  );
}

// Export
Object.assign(window, { QuiltGrid, HSTSvg, PATTERN, GRID_SIZE,
  PW_GREEN, PW_GREEN_DEEP, PW_GREEN_SOFT, PW_GREEN_LIFT,
  PW_INK_DARK, PW_GOLD,
  PW_CREAM, PW_SAND, PW_CLAY,
  PW_INK, PW_MUTED, PW_BORDER, PW_SURFACE, PW_BG,
});
