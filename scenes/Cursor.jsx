// Cursor.jsx — A subtle pointer cursor that moves between keyframe positions
// and shows a small click ripple at each one.

function CursorArrow({ size = 24, color = '#222' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))' }}>
      <path
        d="M5 3 L5 17.5 L9 14 L11.5 19.5 L13.6 18.6 L11.2 13.4 L16.2 13.4 Z"
        fill={color}
        stroke="#fff"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Damped movement between keyframes. keyframes = [{t, x, y, click?:bool}]
// Returns {x, y, clickPulse:0..1} for current time t.
function cursorState(t, keyframes) {
  if (!keyframes.length) return { x: 0, y: 0, clickPulse: 0 };
  if (t <= keyframes[0].t) return { x: keyframes[0].x, y: keyframes[0].y, clickPulse: 0 };
  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i], b = keyframes[i + 1];
    if (t >= a.t && t <= b.t) {
      const span = b.t - a.t;
      const local = span === 0 ? 1 : (t - a.t) / span;
      const eased = Easing.easeInOutCubic(local);
      const x = a.x + (b.x - a.x) * eased;
      const y = a.y + (b.y - a.y) * eased;
      // click pulse: pulse over 0.4s after reaching b if b.click
      let clickPulse = 0;
      if (b.click) {
        const dt = t - b.t;
        if (dt >= -0.05 && dt < 0.45) {
          const u = clamp((dt + 0.05) / 0.5, 0, 1);
          clickPulse = Math.sin(u * Math.PI);
        }
      }
      return { x, y, clickPulse };
    }
  }
  const last = keyframes[keyframes.length - 1];
  // After last keyframe, hold; click pulse may still trigger
  let clickPulse = 0;
  if (last.click) {
    const dt = t - last.t;
    if (dt >= -0.05 && dt < 0.45) {
      const u = clamp((dt + 0.05) / 0.5, 0, 1);
      clickPulse = Math.sin(u * Math.PI);
    }
  }
  return { x: last.x, y: last.y, clickPulse };
}

function Cursor({ t, keyframes, size = 22, color = '#1a1a1a' }) {
  const { x, y, clickPulse } = cursorState(t, keyframes);
  return (
    <div style={{
      position: 'absolute', left: 0, top: 0,
      transform: `translate(${x}px, ${y}px)`,
      pointerEvents: 'none',
      willChange: 'transform',
    }}>
      {/* Click ripple */}
      {clickPulse > 0 && (
        <div style={{
          position: 'absolute',
          left: -4, top: -4,
          width: 16 + clickPulse * 26,
          height: 16 + clickPulse * 26,
          marginLeft: -(8 + clickPulse * 13) + 4,
          marginTop: -(8 + clickPulse * 13) + 4,
          borderRadius: '50%',
          border: `2px solid ${PW_GREEN}`,
          opacity: 0.6 * (1 - clickPulse * 0.7),
        }} />
      )}
      <CursorArrow size={size} color={color} />
    </div>
  );
}

Object.assign(window, { Cursor, cursorState, CursorArrow });
