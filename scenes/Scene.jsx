// Scene.jsx — top-level composition: workspace, devices, cursor, text overlays.

const STAGE_W = 1920;
const STAGE_H = 1080;
const DURATION = 15;

// Composition coordinates (un-tilted, treat tilt as cosmetic)
const LAPTOP = {
  x: 460,
  y: 308,
  width: 1000,
};
LAPTOP.screenH = LAPTOP.width * 0.62; // 620
LAPTOP.inset = LAPTOP.width * 0.026;  // 26
LAPTOP.bezel = LAPTOP.width * 0.014;  // 14

// Inner screen rect in stage coords
LAPTOP.innerX = LAPTOP.x + LAPTOP.inset + LAPTOP.bezel;       // 500
LAPTOP.innerY = LAPTOP.y + LAPTOP.inset + LAPTOP.bezel;       // 348
LAPTOP.innerW = LAPTOP.width - 2 * (LAPTOP.inset + LAPTOP.bezel); // 920
LAPTOP.innerH = LAPTOP.screenH - 2 * (LAPTOP.inset + LAPTOP.bezel); // 540

// AppChrome layout inside laptop
const CHROME = {
  padX: 14,
  padTop: 36,
  padBottom: 14,
  sidebarW: 96,
  gap: 14,
};
// Body area
const bodyTop = LAPTOP.innerY + CHROME.padTop;                          // 384
const bodyH = LAPTOP.innerH - CHROME.padTop - CHROME.padBottom;         // 490
const canvasLeft = LAPTOP.innerX + CHROME.padX + CHROME.sidebarW + CHROME.gap; // 624
const canvasW = LAPTOP.innerW - 2 * CHROME.padX - CHROME.sidebarW - CHROME.gap; // 778
const gridSize = Math.min(bodyH, canvasW);                              // 490
const gridLeft = canvasLeft + (canvasW - gridSize) / 2;                 // 768
const gridTop = bodyTop + (bodyH - gridSize) / 2;                       // 384
const cellGap = 2;
const cell = (gridSize - (GRID_SIZE - 1) * cellGap) / GRID_SIZE;
const cellPitch = cell + cellGap;

function blockCenter(r, c) {
  return {
    x: gridLeft + c * cellPitch + cell / 2,
    y: gridTop + r * cellPitch + cell / 2,
  };
}

// Tablet position
const TABLET = {
  x: 1340,
  y: 470,
  width: 320,
  rotate: -7,
};

// ── Background workspace ────────────────────────────────────────────────────
function Workspace() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `
        radial-gradient(ellipse 95% 75% at 50% 55%, #FAFBF7 0%, ${PW_BG} 60%, #E8EBE3 100%)
      `,
      overflow: 'hidden',
    }}>
      {/* Subtle linen / paper texture using layered noise via SVG */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12, mixBlendMode: 'multiply' }}>
        <defs>
          <pattern id="weave" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="transparent"/>
            <line x1="0" y1="0" x2="6" y2="0" stroke="#8a8c80" strokeWidth="0.3" />
            <line x1="0" y1="3" x2="6" y2="3" stroke="#8a8c80" strokeWidth="0.2" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#8a8c80" strokeWidth="0.25" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#weave)" />
      </svg>
      {/* Soft vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,0,0,0) 60%, rgba(60,72,55,0.14) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

// ── Cursor keyframes (in stage coords) for the laptop screen interaction ───
// Cursor "places" blocks at specific moments — synced with the build animation.
function makeCursorKeyframes() {
  // Pattern reveals from center outward (sawtooth-star medallion).
  // Cursor visits five cells along the build, finishing safely off-grid.
  const targets = [
    { r: 3, c: 3, t: 3.0, click: true },  // center
    { r: 1, c: 4, t: 4.0, click: true },  // upper
    { r: 4, c: 6, t: 5.1, click: true },  // right
    { r: 6, c: 2, t: 6.3, click: true },  // lower-left
    { r: 0, c: 7, t: 7.3, click: true },  // top-right corner
  ];
  const kfs = [{ t: 1.8, x: gridLeft + gridSize + 80, y: gridTop + gridSize - 40, click: false }];
  targets.forEach(tg => {
    const p = blockCenter(tg.r, tg.c);
    kfs.push({ t: tg.t, x: p.x - 6, y: p.y - 6, click: tg.click });
  });
  kfs.push({ t: 8.6, x: gridLeft + gridSize + 60, y: gridTop + gridSize + 40, click: false });
  return kfs;
}

const CURSOR_KFS = makeCursorKeyframes();

// ── Top-level scene ─────────────────────────────────────────────────────────
function Scene() {
  const t = useTime();

  // Live screen-label for comment context
  React.useEffect(() => {
    const root = document.getElementById('scene-root');
    if (!root) return;
    root.setAttribute('data-screen-label', `t=${t.toFixed(1)}s`);
  }, [t]);

  // Devices fade + soft scale in 0..1s. Fade out 13.8..14.8s for loop seam.
  const devIn = clamp(Easing.easeOutCubic(t / 1.0), 0, 1);
  const devOut = clamp(Easing.easeInCubic((t - 13.6) / 1.2), 0, 1);
  const devOpacity = clamp(devIn - devOut, 0, 1);
  const devScale = 0.985 + 0.015 * devIn;

  // Screens light up at 1.0s
  const screenOn = clamp((t - 1.0) / 0.7, 0, 1);

  // Subtle camera drift (slow ken-burns)
  const camScale = 1 + 0.02 * Easing.easeInOutSine(clamp(t / DURATION, 0, 1));
  const camX = -8 * Easing.easeInOutSine(clamp(t / DURATION, 0, 1));
  const camY = -4 * Easing.easeInOutSine(clamp(t / DURATION, 0, 1));

  // Devices stay bright throughout — CTA lives in clear top space
  const sceneOpacity = devOpacity;

  return (
    <div id="scene-root" data-screen-label="t=0.0s" style={{ position: 'absolute', inset: 0 }}>
      <Workspace />

      {/* Soft prop hints — a barely-there fabric stack at the left */}
      <Sprite start={0.4} end={DURATION} keepMounted>
        {({ localTime }) => {
          const a = clamp(Easing.easeOutCubic(localTime / 1.2), 0, 1) * (1 - devOut);
          return (
            <div style={{
              position: 'absolute', left: 110, top: 720, width: 280, height: 180,
              opacity: a * 0.85,
              transform: 'rotate(-3deg)',
              pointerEvents: 'none',
            }}>
              {/* stacked folded fabrics: thin colored bands */}
              {[
                { c: PW_CLAY,        h: 22, y: 0   },
                { c: PW_SAND,        h: 26, y: 26  },
                { c: PW_GREEN_SOFT,  h: 20, y: 56  },
                { c: PW_CREAM,       h: 28, y: 80  },
                { c: PW_GREEN,       h: 22, y: 112 },
              ].map((f, i) => (
                <div key={i} style={{
                  position: 'absolute', left: 0, top: f.y,
                  width: 240 - i * 6, height: f.h,
                  background: f.c,
                  borderRadius: 3,
                  boxShadow: '0 6px 12px rgba(40,40,30,0.10), inset 0 -1px 0 rgba(0,0,0,0.06)',
                }} />
              ))}
            </div>
          );
        }}
      </Sprite>

      {/* Camera-drifted devices group */}
      <div style={{
        position: 'absolute', inset: 0,
        transform: `translate(${camX}px, ${camY}px) scale(${camScale * devScale})`,
        transformOrigin: '50% 55%',
        opacity: sceneOpacity,
        willChange: 'transform, opacity',
      }}>
        <Laptop
          x={LAPTOP.x} y={LAPTOP.y} width={LAPTOP.width}
          tilt={-3}
          screenChildren={
            <div style={{
              width: '100%', height: '100%',
              position: 'relative',
              opacity: screenOn,
              transition: 'opacity 0.3s',
            }}>
              <AppChrome
                width={LAPTOP.innerW}
                height={LAPTOP.innerH}
                t={t}
                buildStart={2.6}
                buildEnd={7.4}
                density={1}
              />
            </div>
          }
        />

        <Tablet
          x={TABLET.x} y={TABLET.y} width={TABLET.width}
          rotate={TABLET.rotate}
          screenChildren={
            <div style={{
              width: '100%', height: '100%', position: 'relative',
              opacity: screenOn,
            }}>
              <TabletApp
                width={TABLET.width - TABLET.width * 0.08}
                height={TABLET.width * 1.35 - TABLET.width * 0.08}
                t={t}
                buildStart={2.9}
                buildEnd={7.8}
              />
            </div>
          }
        />

        {/* Cursor lives on top of devices but inside the camera-drift group */}
        {t >= 1.8 && t <= 8.8 && (
          <div style={{ position: 'absolute', inset: 0, opacity: clamp((t - 1.8) / 0.4, 0, 1) * (1 - clamp((t - 8.4) / 0.4, 0, 1)) }}>
            <Cursor t={t} keyframes={CURSOR_KFS} size={26} color="#1c211b" />
          </div>
        )}
      </div>

      {/* Text overlays */}
      <Headline
        scene1Start={5.8}  scene1End={10.2}
        scene2Start={10.9} scene2End={14.6}
      />

      {/* Bottom-left brand mark, always present subtly */}
      <Sprite start={0.6} end={DURATION - 0.4} keepMounted>
        {({ localTime, duration }) => {
          const entry = clamp(Easing.easeOutCubic(localTime / 0.8), 0, 1);
          const exit = clamp(Easing.easeInCubic((localTime - (duration - 0.6)) / 0.6), 0, 1);
          const a = clamp(entry - exit, 0, 1);
          return (
            <div style={{
              position: 'absolute', left: 64, top: 56,
              opacity: a * 0.92,
              pointerEvents: 'none',
            }}>
              <PatchWorxLockup height={56} />
            </div>
          );
        }}
      </Sprite>
    </div>
  );
}

Object.assign(window, { Scene, DURATION, STAGE_W, STAGE_H });
