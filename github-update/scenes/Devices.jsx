// Devices.jsx — Laptop and Tablet device frames, 3/4 angle composition.

// Laptop — viewed head-on but with a slight tilt. We use CSS 3D transforms
// to give it depth. The screen is rendered as a child.
function Laptop({
  x, y, width, // width of base (screen-space)
  screenChildren,
  tilt = -4,       // degrees rotateX (slightly tipped back)
  rotateY = 0,
  scale = 1,
  shadow = true,
}) {
  // Geometry
  const screenH = width * 0.62;   // 16:10ish
  const baseH = width * 0.038;
  const screenInset = width * 0.026;
  const bezel = width * 0.014;
  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width, height: screenH + baseH,
      transform: `scale(${scale})`,
      transformOrigin: 'center bottom',
      pointerEvents: 'none',
    }}>
      {/* Shadow */}
      {shadow && <div style={{
        position: 'absolute',
        left: width * 0.04, top: screenH + baseH - 6,
        width: width * 0.92, height: 22,
        background: 'radial-gradient(ellipse at center, rgba(40,40,30,0.30), rgba(40,40,30,0) 70%)',
        filter: 'blur(8px)',
      }} />}

      {/* Lid (screen) */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0,
        width, height: screenH,
        background: 'linear-gradient(180deg, #d8d4c8 0%, #c2bdb0 100%)',
        borderRadius: `${width * 0.022}px ${width * 0.022}px 4px 4px`,
        boxShadow: '0 18px 50px rgba(40,40,30,0.25), inset 0 1px 0 rgba(255,255,255,0.5)',
        boxSizing: 'border-box',
        padding: screenInset,
      }}>
        {/* Bezel + screen, merged */}
        <div style={{
          width: '100%', height: '100%',
          background: '#1a1a1a',
          borderRadius: 4,
          boxSizing: 'border-box',
          padding: bezel,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Camera dot */}
          <div style={{
            position: 'absolute', top: bezel * 0.32, left: '50%',
            width: 4, height: 4, marginLeft: -2,
            background: '#3a3a3a', borderRadius: '50%',
          }} />
          {/* The screen content directly */}
          {screenChildren}
        </div>
      </div>

      {/* Base */}
      <div style={{
        position: 'absolute',
        left: -width * 0.018, top: screenH - 1,
        width: width * 1.036, height: baseH,
        background: 'linear-gradient(180deg, #d8d4c8 0%, #b8b3a4 60%, #9c988a 100%)',
        borderRadius: `4px 4px ${baseH * 0.4}px ${baseH * 0.4}px`,
        boxShadow: '0 12px 24px rgba(40,40,30,0.18)',
      }}>
        {/* Trackpad cutout hint */}
        <div style={{
          position: 'absolute', top: baseH * 0.18, left: '50%',
          width: width * 0.18, height: baseH * 0.12, marginLeft: -(width * 0.09),
          background: 'rgba(0,0,0,0.08)', borderRadius: 2,
        }} />
      </div>
    </div>
  );
}

// Tablet — rotated slightly, in front of laptop
function Tablet({
  x, y, width,
  screenChildren,
  rotate = -8,
  scale = 1,
}) {
  const height = width * 1.35;
  const bezel = width * 0.04;
  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width, height,
      transform: `rotate(${rotate}deg) scale(${scale})`,
      transformOrigin: 'center center',
      pointerEvents: 'none',
    }}>
      {/* Shadow */}
      <div style={{
        position: 'absolute',
        left: -width * 0.04, top: height - 8,
        width: width * 1.08, height: 28,
        background: 'radial-gradient(ellipse at center, rgba(40,40,30,0.32), rgba(40,40,30,0) 70%)',
        filter: 'blur(10px)',
      }} />
      {/* Body */}
      <div style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(180deg, #2a2a26 0%, #161614 100%)',
        borderRadius: width * 0.06,
        padding: bezel,
        boxSizing: 'border-box',
        boxShadow: '0 28px 60px rgba(30,30,20,0.30), inset 0 0 0 1px rgba(255,255,255,0.04)',
      }}>
        <div style={{
          width: '100%', height: '100%',
          borderRadius: width * 0.03,
          overflow: 'hidden',
          background: '#FBF7EE',
          position: 'relative',
        }}>
          {screenChildren}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Laptop, Tablet });
