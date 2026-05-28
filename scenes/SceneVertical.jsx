// SceneVertical.jsx — 9:16 (1080×1920) composition for stories format.
// One tablet held HUGE in the center; small laptop tilted behind for context.

const V_STAGE_W = 1080;
const V_STAGE_H = 1920;
const V_DURATION = 15;

// ── Tablet (hero device) ───────────────────────────────────────────────────
// Tablet aspect: width × 1.35 height. We want the tablet to fill the middle
// vertical strip with room above and below for text and CTA.
const V_TABLET = {
  width: 720,
  rotate: 0,           // straight on, hero device
};
V_TABLET.height = V_TABLET.width * 1.35;            // 972
V_TABLET.x = (V_STAGE_W - V_TABLET.width) / 2;      // 180
V_TABLET.y = (V_STAGE_H - V_TABLET.height) / 2 - 30; // ~460 (slight upward bias)

// Inner screen of tablet (after bezel)
const V_BEZEL_RATIO = 0.04;
const V_TABLET_BEZEL = V_TABLET.width * V_BEZEL_RATIO;
const V_TABLET_INNER_W = V_TABLET.width - 2 * V_TABLET_BEZEL;
const V_TABLET_INNER_H = V_TABLET.height - 2 * V_TABLET_BEZEL;
const V_TABLET_INNER_X = V_TABLET.x + V_TABLET_BEZEL;
const V_TABLET_INNER_Y = V_TABLET.y + V_TABLET_BEZEL;

// Inside the TabletApp: padding & grid (mirror TabletApp.jsx math)
// Use a scale factor so the tablet UI elements grow proportionally.
const V_TABLET_SCALE = V_TABLET_INNER_W / 248;  // base width in TabletApp was ~248
// We'll render TabletApp at inner size; grid is centered.
const V_TAB_PAD_X = 10 * V_TABLET_SCALE;
const V_TAB_TOPBAR = 32 * V_TABLET_SCALE;
const V_TAB_BOTBAR = 40 * V_TABLET_SCALE;
const V_TAB_GRID_AREA_H = V_TABLET_INNER_H - V_TAB_TOPBAR - V_TAB_BOTBAR - 16 * V_TABLET_SCALE;
const V_TAB_GRID_W = Math.min(V_TABLET_INNER_W - 2 * V_TAB_PAD_X, V_TAB_GRID_AREA_H);

// Grid origin in stage coords
const V_GRID_LEFT = V_TABLET_INNER_X + (V_TABLET_INNER_W - V_TAB_GRID_W) / 2;
const V_GRID_TOP  = V_TABLET_INNER_Y + V_TAB_TOPBAR + 6 * V_TABLET_SCALE
                    + (V_TAB_GRID_AREA_H - V_TAB_GRID_W) / 2;
const V_CELL_GAP = 1.5;
const V_CELL = (V_TAB_GRID_W - (GRID_SIZE - 1) * V_CELL_GAP) / GRID_SIZE;
const V_CELL_PITCH = V_CELL + V_CELL_GAP;

function vBlockCenter(r, c) {
  return {
    x: V_GRID_LEFT + c * V_CELL_PITCH + V_CELL / 2,
    y: V_GRID_TOP + r * V_CELL_PITCH + V_CELL / 2,
  };
}

// ── Background workspace (tinted for vertical) ──────────────────────────────
function VerticalWorkspace() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `
        radial-gradient(ellipse 100% 60% at 50% 50%, #FAFBF7 0%, ${PW_BG} 55%, #E0E4DA 100%)
      `,
      overflow: 'hidden',
    }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.10, mixBlendMode: 'multiply' }}>
        <defs>
          <pattern id="weaveV" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="transparent"/>
            <line x1="0" y1="0" x2="6" y2="0" stroke="#8a8c80" strokeWidth="0.3" />
            <line x1="0" y1="3" x2="6" y2="3" stroke="#8a8c80" strokeWidth="0.2" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#8a8c80" strokeWidth="0.25" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#weaveV)" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 90% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(60,72,55,0.18) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

// ── Cursor keyframes (in stage coords) ──────────────────────────────────────
function vMakeCursorKeyframes() {
  const targets = [
    { r: 3, c: 3, t: 3.0, click: true },
    { r: 1, c: 4, t: 4.0, click: true },
    { r: 4, c: 6, t: 5.1, click: true },
    { r: 6, c: 2, t: 6.3, click: true },
    { r: 0, c: 7, t: 7.3, click: true },
  ];
  const kfs = [{ t: 1.8, x: V_GRID_LEFT + V_TAB_GRID_W + 60, y: V_GRID_TOP + V_TAB_GRID_W - 30, click: false }];
  targets.forEach(tg => {
    const p = vBlockCenter(tg.r, tg.c);
    kfs.push({ t: tg.t, x: p.x - 6, y: p.y - 6, click: tg.click });
  });
  kfs.push({ t: 8.6, x: V_GRID_LEFT + V_TAB_GRID_W + 60, y: V_GRID_TOP + V_TAB_GRID_W + 60, click: false });
  return kfs;
}

const V_CURSOR_KFS = vMakeCursorKeyframes();

// ── Vertical text overlays ──────────────────────────────────────────────────
function VerticalHeadline({ t }) {
  // Block 1: 5.8 → 10.2  (headline + subtitle, ABOVE tablet)
  // Block 2: 10.9 → 14.6 (CTA pill, BELOW tablet, replacing subtitle)
  const inS1 = t >= 5.8 && t <= 10.2;
  const inS2 = t >= 10.9 && t <= 14.6;

  const s1Local = t - 5.8;
  const s1Dur = 4.4;
  const s1Entry = clamp(Easing.easeOutCubic(s1Local / 0.7), 0, 1);
  const s1Exit = clamp(Easing.easeInCubic((s1Local - (s1Dur - 0.6)) / 0.6), 0, 1);
  const s1Opacity = clamp(s1Entry - s1Exit, 0, 1);
  const s1Ty = (1 - s1Entry) * 24 - s1Exit * 14;

  const s2Local = t - 10.9;
  const s2Dur = 3.7;
  const s2Entry = clamp(Easing.easeOutCubic(s2Local / 0.7), 0, 1);
  const s2Exit = clamp(Easing.easeInCubic((s2Local - (s2Dur - 0.6)) / 0.6), 0, 1);
  const s2Opacity = clamp(s2Entry - s2Exit, 0, 1);
  const s2Ty = (1 - s2Entry) * 20 - s2Exit * 12;
  const s2BtnScale = 0.94 + 0.06 * Easing.easeOutBack(s2Entry);

  return (
    <>
      {inS1 && (
        <div style={{
          position: 'absolute',
          left: 60, right: 60, top: 160,
          textAlign: 'center',
          opacity: s1Opacity,
          transform: `translateY(${s1Ty}px)`,
          fontFamily: '"Inter", system-ui, sans-serif',
          willChange: 'transform, opacity',
          pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: 22,
            letterSpacing: '0.34em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: PW_GREEN,
            marginBottom: 22,
            opacity: 0.9,
          }}>
            Beta · Coming Soon
          </div>
          <div style={{
            fontSize: 76,
            fontWeight: 600,
            letterSpacing: '-0.022em',
            lineHeight: 1.02,
            color: PW_GREEN_DEEP,
          }}>
            Patch Worx Beta is coming.
          </div>
        </div>
      )}

      {/* Subtitle under tablet during scene 1 */}
      {inS1 && (
        <div style={{
          position: 'absolute',
          left: 80, right: 80, bottom: 250,
          textAlign: 'center',
          opacity: s1Opacity,
          transform: `translateY(${s1Ty * 0.5}px)`,
          fontFamily: '"Inter", system-ui, sans-serif',
          color: PW_MUTED,
          fontSize: 32,
          fontWeight: 400,
          letterSpacing: '-0.005em',
          lineHeight: 1.3,
          willChange: 'transform, opacity',
          pointerEvents: 'none',
        }}>
          Design grid-based quilt patterns<br/>right in your browser.
        </div>
      )}

      {/* CTA below tablet during scene 2 */}
      {inS2 && (
        <div style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 200,
          textAlign: 'center',
          opacity: s2Opacity,
          transform: `translateY(${s2Ty}px)`,
          fontFamily: '"Inter", system-ui, sans-serif',
          willChange: 'transform, opacity',
          pointerEvents: 'none',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 18,
            padding: '28px 56px',
            background: PW_GREEN,
            color: '#FBF7EE',
            borderRadius: 999,
            fontSize: 38,
            fontWeight: 600,
            letterSpacing: '-0.005em',
            boxShadow: `0 18px 44px rgba(63,78,55,0.35), inset 0 1px 0 rgba(255,255,255,0.14)`,
            transform: `scale(${s2BtnScale})`,
            transformOrigin: 'center',
          }}>
            <span>Join the beta waitlist</span>
            <svg width="30" height="30" viewBox="0 0 18 18" fill="none">
              <path d="M3 9h11M9 4l5 5-5 5" stroke="#FBF7EE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      )}

      {/* Big headline above tablet during scene 2 (anchor brand) */}
      {inS2 && (
        <div style={{
          position: 'absolute',
          left: 60, right: 60, top: 220,
          textAlign: 'center',
          opacity: s2Opacity,
          transform: `translateY(${s2Ty * 0.4}px)`,
          fontFamily: '"Inter", system-ui, sans-serif',
          color: PW_GREEN_DEEP,
          willChange: 'transform, opacity',
          pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: 22,
            letterSpacing: '0.34em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: PW_GREEN,
            marginBottom: 22,
            opacity: 0.9,
          }}>
            Get early access
          </div>
          <div style={{
            fontSize: 76,
            fontWeight: 600,
            letterSpacing: '-0.022em',
            lineHeight: 1.02,
          }}>
            Be one of the first.
          </div>
        </div>
      )}
    </>
  );
}

// ── Top-level vertical scene ────────────────────────────────────────────────
function VerticalScene() {
  const t = useTime();

  React.useEffect(() => {
    const root = document.getElementById('scene-root-v');
    if (!root) return;
    root.setAttribute('data-screen-label', `t=${t.toFixed(1)}s`);
  }, [t]);

  const devIn = clamp(Easing.easeOutCubic(t / 1.0), 0, 1);
  const devOut = clamp(Easing.easeInCubic((t - 13.6) / 1.2), 0, 1);
  const devOpacity = clamp(devIn - devOut, 0, 1);
  const devScale = 0.985 + 0.015 * devIn;

  const screenOn = clamp((t - 1.0) / 0.7, 0, 1);

  // Gentle camera drift
  const camScale = 1 + 0.015 * Easing.easeInOutSine(clamp(t / V_DURATION, 0, 1));
  const camY = -10 * Easing.easeInOutSine(clamp(t / V_DURATION, 0, 1));

  return (
    <div id="scene-root-v" data-screen-label="t=0.0s" style={{ position: 'absolute', inset: 0 }}>
      <VerticalWorkspace />

      {/* Brand lockup, top — only show when text overlays aren't taking over */}
      <Sprite start={0.4} end={V_DURATION - 0.4} keepMounted>
        {({ localTime, duration }) => {
          const entry = clamp(Easing.easeOutCubic(localTime / 0.8), 0, 1);
          const exit = clamp(Easing.easeInCubic((localTime - (duration - 0.6)) / 0.6), 0, 1);
          const baseA = clamp(entry - exit, 0, 1);
          // Fade out during text scenes (5.6-10.4 and 10.7-14.6)
          const textHide =
            clamp((t - 5.4) / 0.4, 0, 1) * (1 - clamp((t - 10.2) / 0.4, 0, 1)) * 0.8 +
            clamp((t - 10.7) / 0.4, 0, 1) * (1 - clamp((t - 14.4) / 0.4, 0, 1)) * 0.8;
          const a = baseA * (1 - textHide);
          return (
            <div style={{
              position: 'absolute', left: 0, right: 0, top: 130,
              textAlign: 'center',
              opacity: a,
              pointerEvents: 'none',
            }}>
              <img
                src="assets/patchworx-lockup.png"
                alt="Patch Worx"
                style={{ height: 90, width: 'auto', display: 'inline-block' }}
              />
            </div>
          );
        }}
      </Sprite>

      {/* Camera-drifted device group */}
      <div style={{
        position: 'absolute', inset: 0,
        transform: `translateY(${camY}px) scale(${camScale * devScale})`,
        transformOrigin: '50% 50%',
        opacity: devOpacity,
        willChange: 'transform, opacity',
      }}>
        <Tablet
          x={V_TABLET.x} y={V_TABLET.y} width={V_TABLET.width}
          rotate={V_TABLET.rotate}
          screenChildren={
            <div style={{
              width: '100%', height: '100%', position: 'relative',
              opacity: screenOn,
            }}>
              <TabletApp
                width={V_TABLET_INNER_W}
                height={V_TABLET_INNER_H}
                t={t}
                buildStart={2.8}
                buildEnd={7.6}
              />
            </div>
          }
        />

        {/* Cursor */}
        {t >= 1.8 && t <= 8.8 && (
          <div style={{
            position: 'absolute', inset: 0,
            opacity: clamp((t - 1.8) / 0.4, 0, 1) * (1 - clamp((t - 8.4) / 0.4, 0, 1)),
          }}>
            <Cursor t={t} keyframes={V_CURSOR_KFS} size={32} color="#1c211b" />
          </div>
        )}
      </div>

      {/* Text overlays */}
      <VerticalHeadline t={t} />
    </div>
  );
}

Object.assign(window, { VerticalScene, V_STAGE_W, V_STAGE_H, V_DURATION });
