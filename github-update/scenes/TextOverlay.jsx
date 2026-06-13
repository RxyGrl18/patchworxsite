// TextOverlay.jsx — headline, subtitle, CTA overlays for the teaser

function Headline({ t, scene1Start, scene1End, scene2Start, scene2End }) {
  // Headline appears in scene 1, then crossfades to CTA in scene 2.
  // scene1: "Patch Worx Beta is coming" + subtitle
  // scene2: CTA button + small subtitle
  return (
    <>
      <Sprite start={scene1Start} end={scene1End}>
        {({ localTime, duration }) => {
          const entry = clamp(Easing.easeOutCubic(localTime / 0.7), 0, 1);
          const exit = clamp(Easing.easeInCubic((localTime - (duration - 0.6)) / 0.6), 0, 1);
          const opacity = clamp(entry - exit, 0, 1);
          const ty = (1 - entry) * 18 - exit * 10;
          return (
            <div style={{
              position: 'absolute',
              left: 0, right: 0, top: 88,
              textAlign: 'center',
              opacity,
              transform: `translateY(${ty}px)`,
              fontFamily: '"Inter", system-ui, sans-serif',
              color: PW_INK,
              willChange: 'transform, opacity',
              pointerEvents: 'none',
            }}>
              <div style={{
                fontSize: 13,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                fontWeight: 600,
                color: PW_GREEN,
                marginBottom: 18,
                opacity: 0.9,
              }}>
                Beta · Coming Soon
              </div>
              <div style={{
                fontSize: 78,
                fontWeight: 600,
                letterSpacing: '-0.025em',
                lineHeight: 1.05,
                color: PW_GREEN_DEEP,
              }}>
                Patch Worx Beta is coming.
              </div>
              <div style={{
                marginTop: 22,
                fontSize: 24,
                color: PW_MUTED,
                fontWeight: 400,
                letterSpacing: '-0.005em',
              }}>
                Design grid-based quilt patterns right in your browser.
              </div>
            </div>
          );
        }}
      </Sprite>

      <Sprite start={scene2Start} end={scene2End}>
        {({ localTime, duration }) => {
          const entry = clamp(Easing.easeOutCubic(localTime / 0.7), 0, 1);
          const exit = clamp(Easing.easeInCubic((localTime - (duration - 0.6)) / 0.6), 0, 1);
          const opacity = clamp(entry - exit, 0, 1);
          const ty = (1 - entry) * 14 - exit * 8;
          const btnScale = 0.94 + 0.06 * Easing.easeOutBack(entry);
          return (
            <div style={{
              position: 'absolute',
              left: 0, right: 0, top: 110,
              textAlign: 'center',
              opacity,
              transform: `translateY(${ty}px)`,
              fontFamily: '"Inter", system-ui, sans-serif',
              willChange: 'transform, opacity',
              pointerEvents: 'none',
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 16,
                padding: '22px 44px',
                background: PW_GREEN,
                color: '#FBF7EE',
                borderRadius: 999,
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: '-0.005em',
                boxShadow: `0 14px 36px rgba(63,78,55,0.32), inset 0 1px 0 rgba(255,255,255,0.14)`,
                transform: `scale(${btnScale})`,
                transformOrigin: 'center',
              }}>
                <span>Join the beta waitlist</span>
                <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h11M9 4l5 5-5 5" stroke="#FBF7EE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          );
        }}
      </Sprite>
    </>
  );
}

Object.assign(window, { Headline });
