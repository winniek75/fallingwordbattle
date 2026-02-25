import { useState } from 'react';

// Quick swipe-through word card preview before the battle
export default function PreGame({ words, levelInfo, onStartFlash, onStartBattle, onBack }) {
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [allSeen, setAllSeen] = useState(false);

  const word = words[cardIdx];
  const isLast = cardIdx === words.length - 1;

  const next = () => {
    setFlipped(false);
    if (isLast) {
      setAllSeen(true);
    } else {
      setCardIdx(i => i + 1);
    }
  };
  const prev = () => {
    setFlipped(false);
    setCardIdx(i => Math.max(0, i - 1));
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg, #FFF5F7, #F5F0FF, #F0F8FF, #F0FFF4)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 16px', gap: 0, overflowY: 'auto',
      fontFamily: 'Nunito, sans-serif',
    }}>

      {/* Header */}
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 4 }}>‹</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#333' }}>
            {levelInfo.icon} {levelInfo.name} — 今回の単語
          </div>
          <div style={{ fontSize: 12, color: '#999' }}>タップで意味を確認 · {words.length}語</div>
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 420 }}>
        {words.map((_, i) => (
          <div key={i} onClick={() => { setCardIdx(i); setFlipped(false); }} style={{
            width: 10, height: 10, borderRadius: '50%', cursor: 'pointer',
            background: i < cardIdx ? (levelInfo.color || '#4ECDC4') : i === cardIdx ? '#333' : '#ddd',
            transform: i === cardIdx ? 'scale(1.3)' : 'scale(1)',
            transition: 'all 0.2s',
          }} />
        ))}
      </div>

      {/* Card */}
      <div
        onClick={() => setFlipped(f => !f)}
        style={{
          width: '100%', maxWidth: 420, borderRadius: 24,
          minHeight: 260,
          background: flipped ? (levelInfo.color || '#4ECDC4') : 'white',
          boxShadow: flipped
            ? `0 8px 32px ${(levelInfo.color || '#4ECDC4')}50`
            : '0 6px 24px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 28, cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative', overflow: 'hidden',
          marginBottom: 16,
        }}
      >
        {/* Background image faint */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${word.img})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: flipped ? 0.12 : 0.08,
          transition: 'opacity 0.3s',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {!flipped ? (
            <>
              <div style={{ fontSize: 10, color: '#aaa', fontFamily: 'monospace', letterSpacing: 3, marginBottom: 14 }}>
                {word.pos} · {word.category}
              </div>
              <div style={{ fontSize: 'clamp(32px, 9vw, 52px)', fontWeight: 900, color: '#1a1a1a', letterSpacing: -1, marginBottom: 10 }}>
                {word.english}
              </div>
              <div style={{ fontSize: 14, color: '#999', fontFamily: 'monospace' }}>/{word.phonetic}/</div>
              <div style={{ fontSize: 12, color: '#ccc', marginTop: 20 }}>タップして意味を確認 👆</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 'clamp(28px, 8vw, 44px)', fontWeight: 900, color: 'white', marginBottom: 12 }}>
                {word.japanese}
              </div>
              <div style={{ width: 40, height: 2, background: 'rgba(255,255,255,0.3)', margin: '0 auto 14px' }} />
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 600, lineHeight: 1.5, maxWidth: 320 }}>
                {word.sentence.split(word.english).map((p, i, arr) => (
                  <span key={i}>
                    {p}
                    {i < arr.length - 1 && <span style={{ fontWeight: 900, textDecoration: 'underline' }}>{word.english}</span>}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Nav buttons */}
      <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 420, marginBottom: 20 }}>
        <button onClick={prev} disabled={cardIdx === 0} style={{
          flex: 1, padding: '14px', borderRadius: 16, border: '2px solid #E5E7EB',
          background: 'white', fontSize: 20, cursor: cardIdx === 0 ? 'not-allowed' : 'pointer',
          opacity: cardIdx === 0 ? 0.3 : 1, fontWeight: 700,
        }}>‹</button>
        <button onClick={next} style={{
          flex: 2.5, padding: '14px', borderRadius: 16, border: 'none',
          background: isLast
            ? 'linear-gradient(135deg, #4ECDC4, #45B7D1)'
            : (levelInfo.color ? `linear-gradient(135deg, ${levelInfo.color}, ${levelInfo.color}cc)` : '#4ECDC4'),
          color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer',
          boxShadow: `0 4px 16px ${(levelInfo.color || '#4ECDC4')}50`,
        }}>
          {isLast ? '✓ 全部見た！' : '次の単語 ›'}
        </button>
      </div>

      {/* Word list (mini) */}
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#bbb', letterSpacing: 1, marginBottom: 10 }}>今回の出題単語 ({words.length}語)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {words.map((w, i) => (
            <div key={i} onClick={() => { setCardIdx(i); setFlipped(false); window.scrollTo(0,0); }} style={{
              background: 'white', borderRadius: 12, padding: '10px 12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)', cursor: 'pointer',
              display: 'flex', gap: 8, alignItems: 'center',
              border: i === cardIdx ? `2px solid ${levelInfo.color || '#4ECDC4'}` : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                backgroundImage: `url(${w.img})`, backgroundSize: 'cover', backgroundPosition: 'center',
              }} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#333', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{w.english}</div>
                <div style={{ fontSize: 11, color: '#999' }}>{w.japanese}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons - always visible */}
      <div style={{ width: '100%', maxWidth: 420, marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={onStartFlash} style={{
          width: '100%', padding: '16px', borderRadius: 18, border: 'none',
          background: 'linear-gradient(135deg, #0a0a0a, #1a2a28)',
          color: '#00d4aa', fontSize: 16, fontWeight: 800, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,212,170,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          FlashInput で記憶に焼き付ける
          <span style={{ fontSize: 12, opacity: 0.7, fontFamily: 'monospace' }}>5-phase</span>
        </button>
        <button onClick={onStartBattle} style={{
          width: '100%', padding: '16px', borderRadius: 18, border: 'none',
          background: 'linear-gradient(135deg, #FF6B9D, #A78BFA)',
          color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(255,107,157,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>⚔️</span>
          そのままバトルへ！
        </button>
      </div>

      <div style={{ height: 32 }} />
    </div>
  );
}
