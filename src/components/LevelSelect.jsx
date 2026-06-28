import { useState } from 'react';
import { LEVEL_INFO, WORD_DB } from '../data/wordData';
import { getCurrentRank, getNextRank, getHighScore, getLevelMastery, loadStreak } from '../hooks/useWordStats';

const BG = 'linear-gradient(135deg, #FFF5F7 0%, #F5F0FF 35%, #F0F8FF 70%, #F0FFF4 100%)';

// Inject responsive styles once
function injectResponsiveStyles() {
  if (document.getElementById('fwb-responsive')) return;
  const style = document.createElement('style');
  style.id = 'fwb-responsive';
  style.textContent = `
    .fwb-stats-row { display: flex; gap: 12px; align-items: stretch; }
    .fwb-level-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .fwb-rules-row { display: flex; gap: 20px; justify-content: center; font-size: 12px; color: #bbb; }
    .fwb-main { max-width: 1200px; width: 100%; padding: 24px 40px; }
    .fwb-title { font-size: 36px; }
    .fwb-level-card { padding: 20px 18px 16px; }
    .fwb-level-icon { font-size: 32px; }
    .fwb-level-name { font-size: 18px; }
    .fwb-level-sub { font-size: 12px; }

    @media (max-width: 768px) {
      .fwb-stats-row { flex-direction: column; gap: 8px; }
      .fwb-level-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
      .fwb-rules-row { flex-direction: column; align-items: center; gap: 4px; font-size: 11px; }
      .fwb-main { padding: 16px 14px; }
      .fwb-title { font-size: 26px; }
      .fwb-level-card { padding: 12px 12px 10px; }
      .fwb-level-icon { font-size: 24px; }
      .fwb-level-name { font-size: 14px; }
      .fwb-level-sub { font-size: 10px; }
    }

    @media (max-width: 420px) {
      .fwb-level-grid { grid-template-columns: 1fr; }
      .fwb-main { padding: 12px 10px; }
      .fwb-title { font-size: 22px; }
    }
  `;
  document.head.appendChild(style);
}

export default function LevelSelect({ onSelect, xp, currentRank, weakCount, currentPlayer, onChangePlayer, useHiragana, setUseHiragana, gameMode, setGameMode }) {
  const [hoveredLevel, setHoveredLevel] = useState(null);
  injectResponsiveStyles();

  const streak = loadStreak();
  const xpForNext = getNextRank(xp);
  const progressPct = xpForNext
    ? Math.min(100, ((xp - currentRank.minXP) / (xpForNext.minXP - currentRank.minXP)) * 100)
    : 100;

  return (
    <div style={{
      width: '100%', height: '100%', background: BG,
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative bubbles */}
      {[
        { w: 100, bg: '#FF6B9D', l: '2%', t: '5%' },
        { w: 60, bg: '#45B7D1', l: '93%', t: '10%' },
        { w: 80, bg: '#A78BFA', l: '5%', t: '82%' },
        { w: 50, bg: '#4ECDC4', l: '90%', t: '78%' },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', width: b.w, height: b.w, borderRadius: '50%',
          background: b.bg, left: b.l, top: b.t, opacity: 0.13,
          animation: `float ${3 + i * 0.4}s ease-in-out infinite`,
          animationDelay: `${i * 0.5}s`, pointerEvents: 'none',
        }} />
      ))}

      {/* Full-screen centered layout */}
      <div style={{
        flex: 1, position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: 0,
      }}>
        <div className="fwb-main" style={{
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>

          {/* Header row: Title + Player */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div className="fwb-title" style={{
                fontFamily: 'Fredoka One',
                background: 'linear-gradient(90deg,#FF6B9D,#A78BFA,#45B7D1)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {'\u82F1\u5358\u8A9E\u30D0\u30C8\u30EB'} {'\u2694\uFE0F'}
              </div>
            </div>
            {currentPlayer && (
              <div
                onClick={onChangePlayer}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'rgba(255,255,255,0.95)', padding: '8px 16px',
                  borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  cursor: 'pointer', transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span style={{ fontSize: 26 }}>{currentPlayer.avatar?.icon || '\uD83D\uDE0A'}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#333' }}>{currentPlayer.name}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>{'\u5207\u308A\u66FF\u3048'} {'\u2192'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Stats row: XP + Streak + Mode/Settings */}
          <div className="fwb-stats-row">
            {/* XP / Rank */}
            <div style={{
              flex: 2, background: 'white', borderRadius: 16, padding: '14px 18px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              display: 'flex', gap: 12, alignItems: 'center',
            }}>
              <div style={{ fontSize: 36 }}>{currentRank.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: 16, color: currentRank.color }}>{currentRank.rank}</span>
                  <span style={{ fontSize: 13, color: '#999' }}>{xp.toLocaleString()} XP</span>
                </div>
                <div style={{ width: '100%', height: 8, background: '#F0F0F0', borderRadius: 8, marginTop: 6, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${progressPct}%`,
                    background: `linear-gradient(90deg, ${currentRank.color}, ${xpForNext?.color || currentRank.color})`,
                    borderRadius: 8, transition: 'width 0.5s ease',
                  }} />
                </div>
                {xpForNext && (
                  <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>
                    {xpForNext.icon} {xpForNext.rank} {'\u307E\u3067'} {(xpForNext.minXP - xp).toLocaleString()} XP
                  </div>
                )}
              </div>
            </div>

            {/* Streak */}
            <div style={{
              flex: 1,
              background: streak.current >= 1 ? 'linear-gradient(135deg, #FF8A5C, #FF6B9D)' : 'white',
              borderRadius: 16, padding: '14px 18px',
              boxShadow: streak.current >= 1 ? '0 4px 16px rgba(255,138,92,0.25)' : '0 2px 12px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', gap: 12,
              color: streak.current >= 1 ? 'white' : '#bbb',
            }}>
              <span style={{ fontSize: 30 }}>{'\uD83D\uDD25'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Fredoka One', fontSize: 20 }}>
                  {streak.current >= 1 ? `${streak.current}\u65E5\u9023\u7D9A` : '\u2014'}
                </div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>
                  {streak.current >= 7 ? 'XP 1.5x \u30DC\u30FC\u30CA\u30B9!' : streak.current >= 3 ? 'XP 1.3x \u30DC\u30FC\u30CA\u30B9!' : streak.current >= 2 ? 'XP 1.1x \u30DC\u30FC\u30CA\u30B9!' : streak.current >= 1 ? '\u660E\u65E5\u3082\u7D9A\u3051\u3088\u3046!' : '\u30D7\u30EC\u30A4\u3067\u958B\u59CB'}
                </div>
              </div>
            </div>

            {/* Mode + Settings */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                {[
                  { key: 'normal', icon: '\u23F1\uFE0F', label: '\u30CE\u30FC\u30DE\u30EB', sub: '30\u79D2', color: '#4ECDC4' },
                  { key: 'survival', icon: '\u2764\uFE0F', label: '\u30B5\u30D0\u30A4\u30D0\u30EB', sub: '3\u30E9\u30A4\u30D5', color: '#FF6B9D' },
                ].map(m => (
                  <button
                    key={m.key}
                    onClick={() => setGameMode(m.key)}
                    style={{
                      flex: 1, padding: '10px 8px', borderRadius: 14,
                      border: gameMode === m.key ? `2px solid ${m.color}` : '2px solid #E8E8E8',
                      background: gameMode === m.key ? `${m.color}10` : 'white',
                      cursor: 'pointer', textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 2 }}>{m.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 12, color: gameMode === m.key ? m.color : '#888' }}>{m.label}</div>
                    <div style={{ fontSize: 10, color: '#bbb' }}>{m.sub}</div>
                  </button>
                ))}
              </div>
              <div style={{
                background: 'white', borderRadius: 12, padding: '8px 14px',
                border: '1px solid #eee',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#888' }}>{'\uD83D\uDCDD'} {'\u8868\u793A\u30E2\u30FC\u30C9'}</span>
                <button
                  onClick={() => setUseHiragana(!useHiragana)}
                  style={{
                    padding: '4px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                    border: 'none', cursor: 'pointer', color: 'white',
                    background: useHiragana ? '#4ECDC4' : '#FF8A5C',
                  }}
                >
                  {useHiragana ? '\u3072\u3089\u304C\u306A' : '\u6F22\u5B57\u307E\u3058\u308A'}
                </button>
              </div>
            </div>
          </div>

          {/* Level selection */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#999', letterSpacing: 1, marginBottom: 10 }}>
              {'\uD83D\uDCDA'} {'\u30EC\u30D9\u30EB\u3092\u9078\u629E'}
            </div>
            <div className="fwb-level-grid">
              {Object.entries(LEVEL_INFO).map(([key, info]) => {
                const mastery = WORD_DB[key] ? getLevelMastery(key, WORD_DB[key]) : null;
                const hovered = hoveredLevel === key;
                return (
                  <button
                    key={key}
                    className="fwb-level-card"
                    onClick={() => onSelect(key)}
                    onMouseEnter={() => setHoveredLevel(key)}
                    onMouseLeave={() => setHoveredLevel(null)}
                    style={{
                      border: 'none', borderRadius: 16,
                      background: hovered ? info.color : 'white',
                      boxShadow: hovered ? `0 8px 24px ${info.color}40` : '0 2px 12px rgba(0,0,0,0.06)',
                      cursor: 'pointer',
                      transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
                      transition: 'all 0.18s ease', textAlign: 'left',
                      display: 'flex', flexDirection: 'column', gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="fwb-level-icon">{info.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="fwb-level-name" style={{ fontWeight: 800, color: hovered ? 'white' : '#333' }}>{info.name}</span>
                          {mastery && mastery.masteryPct > 0 && (
                            <span style={{
                              fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 8,
                              background: hovered ? 'rgba(255,255,255,0.25)' : `${info.color}15`,
                              color: hovered ? 'white' : (mastery.masteryPct >= 80 ? '#FFD700' : info.color),
                            }}>
                              {mastery.masteryPct}%
                            </span>
                          )}
                        </div>
                        <div className="fwb-level-sub" style={{
                          color: hovered ? 'rgba(255,255,255,0.75)' : '#aaa', marginTop: 2,
                        }}>
                          {info.level} {'\u00B7'} {info.wordCount}{'\u8A9E'}
                          {getHighScore(key) > 0 && (
                            <span style={{
                              marginLeft: 6, fontWeight: 700,
                              color: hovered ? 'rgba(255,255,255,0.9)' : '#FFD700',
                            }}>
                              Best: {getHighScore(key).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {mastery && mastery.practiced > 0 && (
                      <div style={{
                        width: '100%', height: 4, borderRadius: 4,
                        background: hovered ? 'rgba(255,255,255,0.25)' : '#F0F0F0',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', width: `${mastery.masteryPct}%`,
                          background: hovered ? 'rgba(255,255,255,0.8)' : info.color,
                          borderRadius: 4, transition: 'width 0.5s ease',
                        }} />
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Weak words */}
              <button
                className="fwb-level-card"
                onClick={() => weakCount > 0 && onSelect('weak')}
                onMouseEnter={() => setHoveredLevel('weak')}
                onMouseLeave={() => setHoveredLevel(null)}
                style={{
                  border: weakCount > 0 ? 'none' : '2px dashed #ddd',
                  borderRadius: 16,
                  background: hoveredLevel === 'weak' && weakCount > 0 ? '#FF6B6B' : weakCount > 0 ? 'white' : '#fafafa',
                  boxShadow: hoveredLevel === 'weak' && weakCount > 0 ? '0 8px 24px rgba(255,107,107,0.3)' : weakCount > 0 ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
                  cursor: weakCount > 0 ? 'pointer' : 'not-allowed',
                  transform: hoveredLevel === 'weak' && weakCount > 0 ? 'translateY(-3px)' : 'translateY(0)',
                  transition: 'all 0.18s ease', opacity: weakCount > 0 ? 1 : 0.5,
                  textAlign: 'left',
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="fwb-level-icon">{'\uD83D\uDD34'}</span>
                  <div style={{ flex: 1 }}>
                    <div className="fwb-level-name" style={{
                      fontWeight: 800,
                      color: hoveredLevel === 'weak' && weakCount > 0 ? 'white' : '#333',
                    }}>
                      {'\u82E6\u624B\u5358\u8A9E'}
                    </div>
                    <div className="fwb-level-sub" style={{
                      marginTop: 2,
                      color: hoveredLevel === 'weak' && weakCount > 0 ? 'rgba(255,255,255,0.8)' : '#aaa',
                    }}>
                      {weakCount > 0 ? `${weakCount}\u8A9E\u3092\u96C6\u4E2D\u7DF4\u7FD2` : '\u30D7\u30EC\u30A4\u5F8C\u306B\u89E3\u653E'}
                    </div>
                  </div>
                  {weakCount > 0 && (
                    <div style={{
                      background: hoveredLevel === 'weak' ? 'rgba(255,255,255,0.3)' : '#FF6B6B',
                      color: 'white', borderRadius: 10, padding: '3px 10px',
                      fontSize: 13, fontWeight: 800,
                    }}>
                      {weakCount}
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Rules hint */}
          <div className="fwb-rules-row">
            {[
              '\uD83D\uDC48\uD83D\uDC49 \u5DE6\u53F3\u30EC\u30FC\u30F3\u3067\u540C\u6642\u306B2\u554F',
              '\u2B07\uFE0F \u65E5\u672C\u8A9E\u8A33\u304C\u843D\u3061\u3066\u304F\u308B\u2014\u30BF\u30C3\u30D7\u3067\u56DE\u7B54',
              '\uD83D\uDD25 \u30B3\u30F3\u30DC\u3067\u30DC\u30FC\u30CA\u30B9XP',
            ].map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
