// TabletApp.jsx — portrait compact variant of Patch Worx for tablet.

function TabletApp({ width, height, t, buildStart, buildEnd }) {
  const padX = 10;
  const topBarH = 32;
  const bottomBarH = 40;
  const gridArea = height - topBarH - bottomBarH - 16;
  const gridW = Math.min(width - 2 * padX, gridArea);

  const swatches = [
    { k: 'solid', a: PW_CREAM },
    { k: 'solid', a: PW_GREEN },
    { k: 'hst', a: PW_GREEN, b: PW_CREAM, rot: 0 },
    { k: 'hst', a: PW_CLAY,  b: PW_CREAM, rot: 0 },
    { k: 'solid', a: PW_SAND },
    { k: 'hst', a: PW_GREEN_DEEP, b: PW_SAND, rot: 0 },
  ];

  return (
    <div style={{
      width, height,
      background: PW_BG,
      fontFamily: '"Inter", system-ui, sans-serif',
      color: PW_INK,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{
        height: topBarH,
        display: 'flex', alignItems: 'center',
        padding: `0 ${padX}px`,
        gap: 6,
        background: PW_SURFACE,
        borderBottom: `1px solid ${PW_BORDER}`,
        boxSizing: 'border-box',
      }}>
        <img src="assets/patchworx-icon.png" alt="" style={{ width: 16, height: 16, display: 'block', flexShrink: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginLeft: 4 }}>
          <span style={{ fontSize: 9, color: PW_MUTED, padding: '3px 6px', borderRadius: 3, whiteSpace: 'nowrap' }}>Block</span>
          <span style={{
            fontSize: 9, color: PW_INK_DARK, padding: '3px 6px', borderRadius: 3, fontWeight: 600,
            background: 'rgba(95,115,85,0.10)', whiteSpace: 'nowrap',
          }}>Quilt</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 8, color: PW_MUTED, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>8 × 8</div>
      </div>

      {/* Grid */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 6,
      }}>
        <QuiltGrid width={gridW} buildStart={buildStart} buildEnd={buildEnd} t={t} gridGap={1.5} />
      </div>

      {/* Bottom swatch bar */}
      <div style={{
        height: bottomBarH,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 6,
        padding: `0 ${padX}px`,
        background: PW_SURFACE,
        borderTop: `1px solid ${PW_BORDER}`,
      }}>
        {swatches.map((s, i) => (
          <MiniBlockSwatch key={i} block={s} selected={i === 2} size={22} />
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { TabletApp });
