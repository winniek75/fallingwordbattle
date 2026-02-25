import { useState, useEffect, useCallback, useRef } from 'react';

const PHASES = [
  { id: 'image',   duration: 2800, label: 'IMAGE',   labelJa: '見る' },
  { id: 'word',    duration: 3200, label: 'WORD',    labelJa: '読む' },
  { id: 'meaning', duration: 2800, label: 'MEANING', labelJa: '統合' },
  { id: 'context', duration: 3500, label: 'CONTEXT', labelJa: '文脈' },
  { id: 'recall',  duration: 4500, label: 'RECALL',  labelJa: '想起' },
];

function speak(text, rate = 0.85) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

export default function FlashInput({ words, onComplete, onSkip }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const startTimeRef = useRef(null);

  const word = words[wordIdx];
  const phase = PHASES[phaseIdx];
  const totalWords = words.length;

  // Preload images
  useEffect(() => {
    words.forEach(w => { const img = new Image(); img.src = w.img; });
  }, []);

  const advance = useCallback(() => {
    setTransitioning(true);
    window.speechSynthesis?.cancel();
    setTimeout(() => {
      setReveal(false);
      setTransitioning(false);
      setProgress(0);
      if (phaseIdx < PHASES.length - 1) {
        setPhaseIdx(p => p + 1);
      } else if (wordIdx < words.length - 1) {
        setWordIdx(w => w + 1);
        setPhaseIdx(0);
      } else {
        onComplete();
      }
    }, 200);
  }, [phaseIdx, wordIdx, words.length, onComplete]);

  useEffect(() => {
    if (paused) return;
    const dur = phase.duration / speed;
    startTimeRef.current = Date.now();

    if (phase.id === 'word') {
      setTimeout(() => speak(word.word || word.english), 250);
    }
    if (phase.id === 'context') {
      setTimeout(() => speak(word.sentence, 0.8), 250);
    }
    if (phase.id === 'recall') {
      setTimeout(() => {
        setReveal(true);
        speak(word.english);
      }, dur * 0.55);
    }

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min(elapsed / dur, 1));
    }, 30);
    timerRef.current = setTimeout(advance, dur);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
    };
  }, [wordIdx, phaseIdx, paused, speed]);

  const togglePause = (e) => {
    e.stopPropagation();
    setPaused(p => !p);
  };

  const overallPct = ((wordIdx * PHASES.length + phaseIdx + progress) / (totalWords * PHASES.length)) * 100;

  const bgStyle = (() => {
    if (phase.id === 'image') return { opacity: 0.58, filter: 'none' };
    if (phase.id === 'recall' && !reveal) return { opacity: 0.6, filter: 'blur(28px) brightness(0.65)' };
    return { opacity: 0.18, filter: 'blur(6px) brightness(0.55)' };
  })();

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#0a0a0a',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      position: 'relative', overflow: 'hidden',
      userSelect: 'none',
    }} onClick={togglePause}>

      {/* Full-screen BG image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${word.img})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        transition: 'all 0.6s ease',
        ...bgStyle,
      }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, padding: '12px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: '#00d4aa', fontFamily: 'monospace', letterSpacing: 3 }}>FLASH INPUT</div>
          <div style={{ fontSize: 12, color: '#555', fontFamily: 'monospace', marginTop: 1 }}>
            {wordIdx + 1} / {totalWords} words
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {/* Speed buttons */}
          {[0.8, 1, 1.5].map(s => (
            <button key={s} onClick={e => { e.stopPropagation(); setSpeed(s); }} style={{
              padding: '3px 9px', borderRadius: 6, fontSize: 11,
              border: speed === s ? '1px solid #00d4aa' : '1px solid #333',
              background: speed === s ? '#00d4aa20' : 'transparent',
              color: speed === s ? '#00d4aa' : '#555',
              cursor: 'pointer', fontFamily: 'monospace',
            }}>×{s}</button>
          ))}
          <button onClick={e => { e.stopPropagation(); onSkip(); }} style={{
            marginLeft: 8, padding: '4px 12px', borderRadius: 8, fontSize: 12,
            border: '1px solid #333', background: 'transparent', color: '#666',
            cursor: 'pointer',
          }}>
            スキップ →
          </button>
        </div>
      </div>

      {/* Word progress dots */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', gap: 5, padding: '10px 16px 4px', justifyContent: 'center' }}>
        {words.map((_, i) => (
          <div key={i} style={{
            height: 3, flex: 1, maxWidth: 40, borderRadius: 2,
            background: i < wordIdx ? '#00d4aa' : i === wordIdx ? '#222' : '#111',
            overflow: 'hidden', position: 'relative',
          }}>
            {i === wordIdx && (
              <div style={{
                position: 'absolute', inset: 0, width: `${((phaseIdx + progress) / PHASES.length) * 100}%`,
                background: '#00d4aa', transition: 'width 0.08s linear',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Phase tabs */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', gap: 3, padding: '4px 16px 8px', justifyContent: 'center' }}>
        {PHASES.map((p, i) => (
          <div key={i} style={{
            fontSize: 9, fontFamily: 'monospace', letterSpacing: 1.5,
            color: i === phaseIdx ? '#00d4aa' : i < phaseIdx ? '#2a4a44' : '#1a1a1a',
            padding: '2px 7px', borderRadius: 4,
            background: i === phaseIdx ? '#00d4aa10' : 'transparent',
            border: i === phaseIdx ? '1px solid #00d4aa30' : '1px solid transparent',
            transition: 'all 0.25s',
          }}>
            {p.label}
          </div>
        ))}
      </div>

      {/* Main content area */}
      <div style={{
        flex: 1, position: 'relative', zIndex: 5,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '0 20px 20px',
        opacity: transitioning ? 0 : 1,
        transform: transitioning ? 'translateY(10px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
      }}>

        {/* IMAGE phase */}
        {phase.id === 'image' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 'min(80vw, 380px)', aspectRatio: '16/10',
              borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)', marginBottom: 20,
            }}>
              <img src={word.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ fontSize: 11, color: '#555', fontFamily: 'monospace', letterSpacing: 3 }}>
              WHAT IS THIS IN ENGLISH?
            </div>
          </div>
        )}

        {/* WORD phase */}
        {phase.id === 'word' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 'clamp(44px, 13vw, 80px)', fontWeight: 900,
              color: '#fff', letterSpacing: -2, lineHeight: 1, marginBottom: 10,
            }}>
              {word.english}
            </div>
            <div style={{ fontSize: 15, color: '#00d4aa', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 10 }}>
              /{word.phonetic}/
            </div>
            <div style={{ width: 36, height: 2, background: '#2a2a2a', margin: '14px auto' }} />
            <div style={{ fontSize: 22, color: '#888', fontWeight: 600 }}>{word.japanese}</div>
            <div style={{ fontSize: 11, color: '#444', fontFamily: 'monospace', letterSpacing: 2, marginTop: 8 }}>
              {word.pos} · {word.category}
            </div>
          </div>
        )}

        {/* MEANING phase */}
        {phase.id === 'meaning' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 'min(68vw, 300px)', aspectRatio: '4/3',
              borderRadius: 14, overflow: 'hidden', marginBottom: 16,
              position: 'relative', boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
            }}>
              <img src={word.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '28px 14px 14px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.88))',
              }}>
                <div style={{ fontSize: 'clamp(26px, 7vw, 40px)', fontWeight: 900, color: '#fff', letterSpacing: -1 }}>
                  {word.english}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#555', fontFamily: 'monospace', letterSpacing: 3 }}>
              IMAGE + WORD = MEMORY
            </div>
          </div>
        )}

        {/* CONTEXT phase */}
        {phase.id === 'context' && (
          <div style={{ textAlign: 'center', maxWidth: 420, padding: '0 10px' }}>
            <div style={{ fontSize: 'clamp(18px, 5vw, 28px)', color: '#ccc', fontWeight: 300, lineHeight: 1.6, marginBottom: 18 }}>
              {word.sentence.split(word.english).map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span style={{ color: '#00d4aa', fontWeight: 800 }}>{word.english}</span>
                  )}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#444', fontFamily: 'monospace', letterSpacing: 3 }}>
              LISTEN & REPEAT
            </div>
          </div>
        )}

        {/* RECALL phase */}
        {phase.id === 'recall' && (
          <div style={{ textAlign: 'center' }}>
            {!reveal ? (
              <>
                <div style={{ fontSize: 'clamp(40px, 12vw, 72px)', fontWeight: 900, color: '#2a2a2a', letterSpacing: 6, fontFamily: 'monospace', marginBottom: 10 }}>
                  {'?'.repeat(word.english.length)}
                </div>
                <div style={{ fontSize: 22, color: '#666', fontWeight: 600 }}>{word.japanese}</div>
                <div style={{ fontSize: 10, color: '#444', fontFamily: 'monospace', letterSpacing: 3, marginTop: 14 }}>RECALL THE WORD...</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 'clamp(44px, 13vw, 80px)', fontWeight: 900, color: '#00d4aa', letterSpacing: -2, lineHeight: 1 }}>
                  {word.english}
                </div>
                <div style={{ fontSize: 11, color: '#555', fontFamily: 'monospace', letterSpacing: 3, marginTop: 10 }}>✓ SAY IT ALOUD</div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Timer bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 3, background: '#0a0a0a', zIndex: 20 }}>
        <div style={{
          height: '100%', width: `${progress * 100}%`,
          background: '#00d4aa', transition: 'width 0.08s linear',
          borderRadius: '0 2px 2px 0',
        }} />
      </div>

      {/* Overall progress bar */}
      <div style={{ position: 'fixed', bottom: 3, left: 0, right: 0, height: 2, background: '#111', zIndex: 19 }}>
        <div style={{ height: '100%', width: `${overallPct}%`, background: '#00d4aa30', transition: 'width 0.3s' }} />
      </div>

      {/* Pause overlay */}
      {paused && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.88)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 50,
        }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#555', letterSpacing: 4, marginBottom: 12 }}>PAUSED</div>
          <div style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff' }}>▶</div>
          <div style={{ fontSize: 12, color: '#444', marginTop: 14 }}>Tap anywhere to resume</div>
        </div>
      )}
    </div>
  );
}
