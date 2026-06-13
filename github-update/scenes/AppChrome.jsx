// AppChrome.jsx — Patch Worx app shell matching the real header structure
// Header: logo · undo/redo · tabs (Block / Quilt / Cutting list) · projects + theme

function ToolbarTab({ active, children }) {
  return (
    <div style={{
      position: 'relative',
      padding: '6px 12px',
      fontSize: 11.5,
      fontWeight: active ? 600 : 500,
      letterSpacing: '0.005em',
      color: active ? PW_INK_DARK : PW_MUTED,
      whiteSpace: 'nowrap',
      cursor: 'default',
    }}>
      {children}
      {active && (
        <div style={{
          position: 'absolute',
          left: 12, right: 12, bottom: -1,
          height: 2,
          background: PW_GREEN,
          borderRadius: 2,
        }} />
      )}
    </div>
  );
}

function IconBtn({ children, title, density = 1 }) {
  return (
    <div title={title} style={{
      width: 26 * density, height: 26 * density,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 5,
      color: PW_MUTED,
      flexShrink: 0,
    }}>
      {children}
    </div>
  );
}

const UndoIcon = ({ size = 14, color }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M3.5 7h7a3 3 0 0 1 0 6H7" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 4.5 3.5 7 6 9.5" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const RedoIcon = ({ size = 14, color }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M12.5 7h-7a3 3 0 0 0 0 6H9" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 4.5 12.5 7 10 9.5" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const SunIcon = ({ size = 14, color }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="2.5" stroke={color || 'currentColor'} strokeWidth="1.5"/>
    {[0,1,2,3,4,5,6,7].map(i => {
      const a = (i * Math.PI) / 4;
      const x1 = 8 + Math.cos(a) * 4.5, y1 = 8 + Math.sin(a) * 4.5;
      const x2 = 8 + Math.cos(a) * 6.2, y2 = 8 + Math.sin(a) * 6.2;
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round"/>;
    })}
  </svg>
);

// Real Patch Worx logo (icon-only) — loads from the project assets.
function PatchWorxMark({ size = 26 }) {
  return (
    <img
      src="assets/patchworx-icon.png"
      alt="Patch Worx"
      style={{ width: size, height: size, display: 'block', flexShrink: 0 }}
    />
  );
}

// Full lockup (icon + script wordmark) — used for the corner brand mark.
function PatchWorxLockup({ height = 36 }) {
  return (
    <img
      src="assets/patchworx-lockup.png"
      alt="Patch Worx"
      style={{ height, width: 'auto', display: 'block' }}
    />
  );
}

function MiniBlockSwatch({ block, selected, size = 30 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: 4,
      overflow: 'hidden',
      boxShadow: selected
        ? `0 0 0 2px ${PW_GREEN}, 0 0 0 4px rgba(95,115,85,0.18)`
        : `inset 0 0 0 1px ${PW_BORDER}`,
      background: PW_SURFACE,
      transition: 'box-shadow 200ms',
    }}>
      {block.k === 'solid'
        ? <div style={{ width: '100%', height: '100%', background: block.a }} />
        : <HSTSvg a={block.a} b={block.b} rot={block.rot} size={40} />}
    </div>
  );
}

// The full app chrome. width is the screen width in screen-space pixels.
function AppChrome({
  width, height,
  t = 0,
  buildStart = 0, buildEnd = 4.5,
  selectedSwatch = 2,
  density = 1,
}) {
  const padX = 16 * density;
  const padTop = 44 * density;          // taller header for real layout
  const padBottom = 14 * density;

  const sidebarW = 104 * density;
  const innerH = height - padTop - padBottom;
  const gridSize = Math.min(innerH, width - 2 * padX - sidebarW - 16 * density);

  const swatches = [
    { k: 'solid', a: PW_CREAM },
    { k: 'solid', a: PW_GREEN },
    { k: 'hst', a: PW_GREEN, b: PW_CREAM, rot: 0 },
    { k: 'hst', a: PW_CLAY,  b: PW_CREAM, rot: 0 },
    { k: 'solid', a: PW_SAND },
    { k: 'hst', a: PW_GREEN_DEEP, b: PW_SAND, rot: 0 },
    { k: 'solid', a: PW_CLAY },
    { k: 'hst', a: PW_CREAM, b: PW_GREEN, rot: 0 },
  ];

  return (
    <div style={{
      width, height,
      background: PW_BG,
      position: 'relative',
      fontFamily: '"Inter", system-ui, sans-serif',
      color: PW_INK,
      overflow: 'hidden',
    }}>
      {/* Top header bar */}
      <div style={{
        height: padTop, width: '100%',
        background: PW_SURFACE,
        borderBottom: `1px solid ${PW_BORDER}`,
        display: 'flex', alignItems: 'center',
        padding: `0 ${padX}px`,
        gap: 12 * density,
        boxSizing: 'border-box',
      }}>
        {/* Logo / lockup at left */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <PatchWorxLockup height={padTop * 0.55} />
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20 * density, background: PW_BORDER, flexShrink: 0 }} />

        {/* Undo / Redo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconBtn title="Undo" density={density}><UndoIcon size={14 * density} /></IconBtn>
          <IconBtn title="Redo" density={density}><RedoIcon size={14 * density} /></IconBtn>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20 * density, background: PW_BORDER, flexShrink: 0 }} />

        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ToolbarTab>Block</ToolbarTab>
          <ToolbarTab active>Quilt</ToolbarTab>
          <ToolbarTab>Cutting list</ToolbarTab>
        </div>

        <div style={{ flex: 1 }} />

        {/* Projects */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: `${5 * density}px ${10 * density}px`,
          fontSize: 11 * density,
          color: PW_INK_DARK,
          fontWeight: 500,
          border: `1px solid ${PW_BORDER}`,
          borderRadius: 6,
          background: PW_SURFACE,
          whiteSpace: 'nowrap',
        }}>
          <svg width={11 * density} height={11 * density} viewBox="0 0 12 12" fill="none">
            <path d="M1.5 3.5h3l1 1H10.5v5h-9v-6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"/>
          </svg>
          <span>Projects</span>
        </div>

        {/* Theme toggle */}
        <IconBtn title="Toggle theme" density={density}><SunIcon size={14 * density} color={PW_MUTED} /></IconBtn>
      </div>

      {/* Body */}
      <div style={{
        display: 'flex',
        gap: 16 * density,
        padding: `${12 * density}px ${padX}px ${padBottom}px`,
        height: `calc(100% - ${padTop}px)`,
        boxSizing: 'border-box',
      }}>
        {/* Sidebar — block library */}
        <div style={{
          width: sidebarW,
          display: 'flex', flexDirection: 'column', gap: 10 * density,
        }}>
          <div style={{
            fontSize: 9 * density, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: PW_MUTED, fontWeight: 600,
          }}>Blocks</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(2, 1fr)`,
            gap: 6 * density,
          }}>
            {swatches.map((s, i) => (
              <MiniBlockSwatch key={i} block={s} selected={i === selectedSwatch} size={32 * density} />
            ))}
          </div>
          <div style={{ height: 1, background: PW_BORDER, margin: `${4 * density}px 0` }} />
          <div style={{
            fontSize: 9 * density, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: PW_MUTED, fontWeight: 600,
          }}>Palette</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 * density }}>
            {[PW_CREAM, PW_SAND, PW_GREEN_SOFT, PW_GREEN, PW_GREEN_DEEP, PW_CLAY].map((c, i) => (
              <div key={i} style={{
                width: 19 * density, height: 19 * density,
                background: c, borderRadius: 4,
                boxShadow: `inset 0 0 0 1px ${PW_BORDER}`,
              }} />
            ))}
          </div>

          <div style={{ height: 1, background: PW_BORDER, margin: `${4 * density}px 0` }} />
          <div style={{
            fontSize: 9 * density, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: PW_MUTED, fontWeight: 600,
          }}>Transform</div>
          <div style={{ display: 'flex', gap: 5 * density }}>
            {/* Rotate */}
            <div style={{
              flex: 1, height: 26 * density,
              border: `1px solid ${PW_BORDER}`, borderRadius: 5,
              background: PW_SURFACE,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: PW_MUTED,
            }}>
              <svg width={12 * density} height={12 * density} viewBox="0 0 14 14" fill="none">
                <path d="M11 4.5A4.5 4.5 0 1 0 12.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11 2v3h-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Mirror */}
            <div style={{
              flex: 1, height: 26 * density,
              border: `1px solid ${PW_BORDER}`, borderRadius: 5,
              background: PW_SURFACE,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: PW_MUTED,
            }}>
              <svg width={12 * density} height={12 * density} viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5v11M3 4 1 7l2 3M11 4l2 3-2 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Canvas with quilt grid centered */}
        <div style={{
          flex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <QuiltGrid width={gridSize} buildStart={buildStart} buildEnd={buildEnd} t={t} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AppChrome, PatchWorxMark, PatchWorxLockup });
