// Audio.jsx — procedural sound design for the teaser.
//
// Three layers:
//   1) Ambient pad — slow evolving chord (E major-ish drone) on a low-pass filter
//   2) Click clacks — soft wood/pluck blips synced to cursor "place" moments
//   3) Reveal chime — gentle bell-ish swell on headline + CTA entry
//
// Browsers block autoplay, so we start suspended and surface a small sound-toggle
// pill in the top-right corner. State is persisted to localStorage.

const PW_AUDIO_KEY = 'patchworx-audio-on';

// Cursor click times (must match Scene.jsx makeCursorKeyframes targets)
const CLICK_TIMES = [3.0, 4.0, 5.1, 6.3, 7.3];
// Headline reveals (must match Scene.jsx <Headline> scene1Start/scene2Start)
const REVEAL_TIMES = [5.8, 10.9];

function createAudioGraph(ctx) {
  // Master bus
  const master = ctx.createGain();
  master.gain.value = 0; // ramp up on first start
  master.connect(ctx.destination);

  // --- Ambient pad ---------------------------------------------------------
  // A gentle 5-voice drone, low-passed, with slow stereo widening.
  // Pitches: E2 (82.4), B2 (123.5), E3 (164.8), G#3 (207.7), B3 (246.9)
  const padBus = ctx.createGain();
  padBus.gain.value = 0.22;

  const padFilter = ctx.createBiquadFilter();
  padFilter.type = 'lowpass';
  padFilter.frequency.value = 1200;
  padFilter.Q.value = 0.6;

  padBus.connect(padFilter).connect(master);

  // Slow filter LFO so the pad breathes
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 280;
  lfo.connect(lfoGain).connect(padFilter.frequency);
  lfo.start();

  const padVoices = [];
  const freqs = [82.4, 123.5, 164.8, 207.65, 246.9];
  const detunes = [-3, 2, -1, 4, -2];
  freqs.forEach((f, i) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.value = f;
    osc2.frequency.value = f;
    osc2.detune.value = detunes[i];
    const vGain = ctx.createGain();
    // top voices quieter so it doesn't sound shrill
    vGain.gain.value = 0.18 / (1 + i * 0.35);
    osc1.connect(vGain);
    osc2.connect(vGain);
    vGain.connect(padBus);
    osc1.start();
    osc2.start();
    padVoices.push({ osc1, osc2, vGain });
  });

  // --- One-shot scheduling -----------------------------------------------
  function playClick(time = ctx.currentTime, gain = 0.18) {
    // Soft wood-block / pluck: short sine + filtered noise burst
    const t = time;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(gain, t + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(720, t);
    osc.frequency.exponentialRampToValueAtTime(380, t + 0.16);
    osc.connect(env);

    // noise burst for tactility
    const noiseDur = 0.05;
    const buf = ctx.createBuffer(1, ctx.sampleRate * noiseDur, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length);
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const nFilt = ctx.createBiquadFilter();
    nFilt.type = 'bandpass';
    nFilt.frequency.value = 1800;
    nFilt.Q.value = 2;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0, t);
    nGain.gain.linearRampToValueAtTime(gain * 0.4, t + 0.003);
    nGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    noise.connect(nFilt).connect(nGain);

    env.connect(master);
    nGain.connect(master);
    osc.start(t);
    osc.stop(t + 0.2);
    noise.start(t);
    noise.stop(t + 0.08);
  }

  function playChime(time = ctx.currentTime, gain = 0.22) {
    // Gentle bell — 3 sine partials, exponential decay
    const t = time;
    const partials = [
      { f: 523.25, g: 1.0,  d: 1.6 }, // C5
      { f: 783.99, g: 0.55, d: 1.2 }, // G5
      { f: 1046.5, g: 0.32, d: 0.9 }, // C6
    ];
    partials.forEach(p => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = p.f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gain * p.g, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + p.d);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + p.d + 0.05);
    });
  }

  return { master, padFilter, playClick, playChime };
}

function SoundLayer() {
  const t = window.useTime();
  const { duration } = window.useTimeline();
  const [enabled, setEnabled] = React.useState(() => {
    try { return localStorage.getItem(PW_AUDIO_KEY) === '1'; } catch { return false; }
  });
  const [hover, setHover] = React.useState(false);

  const ctxRef = React.useRef(null);
  const graphRef = React.useRef(null);
  const prevTRef = React.useRef(0);
  const seekJumpRef = React.useRef(false);

  // Initialize / teardown audio context on enable toggle
  React.useEffect(() => {
    if (!enabled) {
      if (ctxRef.current) {
        try {
          graphRef.current.master.gain.cancelScheduledValues(ctxRef.current.currentTime);
          graphRef.current.master.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.2);
          setTimeout(() => { ctxRef.current && ctxRef.current.suspend(); }, 250);
        } catch {}
      }
      return;
    }
    if (!ctxRef.current) {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        ctxRef.current = new Ctx();
        graphRef.current = createAudioGraph(ctxRef.current);
      } catch (e) {
        console.warn('Audio init failed', e);
        setEnabled(false);
        return;
      }
    }
    const c = ctxRef.current, g = graphRef.current;
    if (c.state === 'suspended') c.resume();
    g.master.gain.cancelScheduledValues(c.currentTime);
    g.master.gain.linearRampToValueAtTime(0.85, c.currentTime + 0.4);
  }, [enabled]);

  // Persist preference
  React.useEffect(() => {
    try { localStorage.setItem(PW_AUDIO_KEY, enabled ? '1' : '0'); } catch {}
  }, [enabled]);

  // Schedule one-shots when timeline crosses trigger points
  React.useEffect(() => {
    if (!enabled || !graphRef.current) return;
    const prev = prevTRef.current;
    const curr = t;
    // Detect a big jump (seek or loop wrap) → don't fire missed events
    const jumped = Math.abs(curr - prev) > 0.4 || curr < prev;
    prevTRef.current = curr;
    if (jumped) return;

    const { playClick, playChime } = graphRef.current;
    CLICK_TIMES.forEach(ct => {
      if (prev < ct && curr >= ct) playClick();
    });
    REVEAL_TIMES.forEach(rt => {
      if (prev < rt && curr >= rt) playChime();
    });
  }, [t, enabled]);

  // Suspend context when tab is hidden to save resources
  React.useEffect(() => {
    const onVis = () => {
      if (!ctxRef.current || !enabled) return;
      if (document.hidden) ctxRef.current.suspend();
      else ctxRef.current.resume();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [enabled]);

  // The toggle pill — top-right corner
  return (
    <div
      onClick={() => setEnabled(e => !e)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'absolute',
        right: 64, top: 64,
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: '12px 18px',
        background: enabled ? PW_GREEN : 'rgba(31,41,35,0.06)',
        color: enabled ? '#FBF7EE' : PW_INK,
        borderRadius: 999,
        fontFamily: '"Inter", system-ui, sans-serif',
        fontSize: 14, fontWeight: 600,
        letterSpacing: '0.01em',
        cursor: 'pointer',
        userSelect: 'none',
        border: enabled ? 'none' : `1px solid ${PW_BORDER}`,
        boxShadow: hover ? '0 6px 18px rgba(31,41,35,0.18)' : '0 2px 8px rgba(31,41,35,0.06)',
        transition: 'background 200ms, box-shadow 200ms, color 200ms',
        zIndex: 100,
      }}
    >
      {enabled ? (
        // Speaker w/ waves
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 6h2l3-3v10l-3-3H3V6z" fill="currentColor"/>
          <path d="M10 5.5a3 3 0 0 1 0 5M12 3.5a6 6 0 0 1 0 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
        </svg>
      ) : (
        // Speaker muted
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 6h2l3-3v10l-3-3H3V6z" fill="currentColor"/>
          <path d="M11 6l3 4M14 6l-3 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      )}
      <span>{enabled ? 'Sound on' : 'Enable sound'}</span>
    </div>
  );
}

Object.assign(window, { SoundLayer });
