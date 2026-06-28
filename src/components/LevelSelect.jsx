import { useState } from 'react';
import { LEVEL_INFO, WORD_DB } from '../data/wordData';
import { getCurrentRank, getNextRank, getHighScore, getLevelMastery, loadStreak } from '../hooks/useWordStats';

const BG = 'linear-gradient(135deg, #FFF5F7 0%, #F5F0FF 35%, #F0F8FF 70%, #F0FFF4 100%)';

export default function LevelSelect({ onSelect, xp, currentRank, weakCount, currentPlayer, onChangePlayer, useHiragana, setUseHiragana, gameMode, setGameMode }) {
  const [hoveredLevel, setHoveredLevel] = useState(null);

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
        { w: 80, bg: '#FF6B9D', l: '3%', t: '8%' },
        { w: 50, bg: '#45B7D1', l: '92%', t: '12%' },
        { w: 60, bg: '#A78BFA', l: '8%', t: '80%' },
        { w: 40, bg: '#4ECDC4', l: '88%', t: '75%' },
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
        padding: '16px 24px',
        minHeight: 0,
      }}>
        <div style={{
          width: '100%', maxWidth: 820,
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>

          {/* Header row: Title + Player */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{
                fontFamily: 'Fredoka One', fontSize: 28,
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
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.95)', padding: '6px 12px',
                  borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  cursor: 'pointer', transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span style={{ fontSize: 22 }}>{currentPlayer.avatar?.icon || '\uD83D\uDE0A'}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>{currentPlayer.name}</div>
                  <div style={{ fontSize: 10, color: '#999' }}>{'\u5207\u308A\u66FF\u3048'} {'\u2192'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Top stats row: XP + Streak + Mode + Settings */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
            {/* XP / Rank */}
            <div style={{
              flex: 1, background: 'white', borderRadius: 14, padding: '10px 14px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              display: 'flex', gap: 10, alignItems: 'center',
            }}>
              <div style={{ fontSize: 28 }}>{currentRank.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: currentRank.color }}>{currentRank.rank}</span>
                  <span style={{ fontSize: 11, color: '#999' }}>{xp.toLocaleString()} XP</span>
                </div>
                <div style={{ width: '100%', height: 5, background: '#F0F0F0', borderRadius: 5, marginTop: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${progressPct}%`,
                    background: `linear-gradient(90deg, ${currentRank.color}, ${xpForNext?.color || currentRank.color})`,
                    borderRadius: 5, transition: 'width 0.5s ease',
                  }} />
                </div>
                {xpForNext && (
                  <div style={{ fontSize: 10, color: '#bbb', marginTop: 2 }}>
                    {xpForNext.icon} {xpForNext.rank} {'\u307E\u3067'} {(xpForNext.minXP - xp).toLocaleString()} XP
                  </div>
                )}
              </div>
            </div>

            {/* Streak */}
            <div style={{
              minWidth: 140,
              background: streak.current >= 1 ? 'linear-gradient(135deg, #FF8A5C, #FF6B9D)' : 'white',
              borderRadius: 14, padding: '10px 14px',
              boxShadow: streak.current >= 1 ? '0 3px 12px rgba(255,138,92,0.2)' : '0 2px 10px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', gap: 8,
              color: streak.current >= 1 ? 'white' : '#aaa',
            }}>
              <span style={{ fontSize: 22 }}>{'\uD83D\uDD25'}</span>
              <div>
                <div style={{ fontFamily: 'Fredoka One', fontSize: 15 }}>
                  {streak.current >= 1 ? `${streak.current}\u65E5\u9023\u7D9A` : '\u2014'}
                </div>
                <div style={{ fontSize: 10, opacity: 0.85 }}>
                  {streak.current >= 7 ? 'XP 1.5x' : streak.current >= 3 ? 'XP 1.3x' : streak.current >= 2 ? 'XP 1.1x' : streak.current >= 1 ? '\u660E\u65E5\u3082\u7D9A\u3051\u3088\u3046' : '\u30D7\u30EC\u30A4\u3067\u958B\u59CB'}
                </div>
              </div>
            </div>

            {/* Mode + Settings */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 6, minWidth: 180,
            }}>
              {/* Game mode toggle */}
              <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                {[
                  { key: 'normal', icon: '\u23F1\uFE0F', label: '\u30CE\u30FC\u30DE\u30EB', color: '#4ECDC4' },
                  { key: 'survival', icon: '\u2764\uFE0F', label: '\u30B5\u30D0\u30A4\u30D0\u30EB', color: '#FF6B9D' },
                ].map(m => (
                  <button
                    key={m.key}
                    onClick={() => setGameMode(m.key)}
                    style={{
                      flex: 1, padding: '6px 4px', borderRadius: 10,
                      border: gameMode === m.key ? `2px solid ${m.color}` : '2px solid #E8E8E8',
                      background: gameMode === m.key ? `${m.color}10` : 'white',
                      cursor: 'pointer', textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: 14 }}>{m.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 10, color: gameMode === m.key ? m.color : '#888' }}>{m.label}</div>
                  </button>
                ))}
              </div>
              {/* Hiragana toggle */}
              <div style={{
                background: 'white', borderRadius: 10, padding: '5px 10px',
                border: '1px solid #eee',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#888' }}>{'\uD83D\uDCDD'} {'\u8868\u793A'}</span>
                <button
                  onClick={() => setUseHiragana(!useHiragana)}
                  style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                    border: 'none', cursor: 'pointer', color: 'white',
                    background: useHiragana ? '#4ECDC4' : '#FF8A5C',
                  }}
                >
                  {useHiragana ? '\u3072\u3089\u304C\u306A' : '\u6F22\u5B57\u307E\u3058\u308A'}
                </button>
              </div>
            </div>
          </div>

          {/* Level selection grid */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#999', letterSpacing: 1, marginBottom: 8 }}>
              {'\uD83D\uDCDA'} {'\u30EC\u30D9\u30EB\u3092\u9078\u629E'}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
            }}>
              {Object.entries(LEVEL_INFO).map(([key, info]) => {
                const mastery = WORD_DB[key] ? getLevelMastery(key, WORD_DB[key]) : null;
                const hovered = hoveredLevel === key;
                return (
                  <button
                    key={key}
                    onClick={() => onSelect(key)}
                    onMouseEnter={() => setHoveredLevel(key)}
                    onMouseLeave={() => setHoveredLevel(null)}
                    style={{
                      border: 'none', borderRadius: 14, padding: '14px 14px 12px',
                      background: hovered ? info.color : 'white',
                      boxShadow: hovered ? `0 6px 20px ${info.color}40` : '0 2px 10px rgba(0,0,0,0.06)',
                      cursor: 'pointer',
                      transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
                      transition: 'all 0.18s ease', textAlign: 'left',
                      display: 'flex', flexDirection: 'column', gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 24 }}>{info.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 800, fontSize: 15, color: hovered ? 'white' : '#333' }}>{info.name}</span>
                          {mastery && mastery.masteryPct > 0 && (
                            <span style={{
                              fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 6,
                              background: hovered ? 'rgba(255,255,255,0.25)' : `${info.color}15`,
                              color: hovered ? 'white' : (mastery.masteryPct >= 80 ? '#FFD700' : info.color),
                            }}>
                              {mastery.masteryPct}%
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 10, color: hovered ? 'rgba(255,255,255,0.75)' : '#aaa', marginTop: 1 }}>
                          {info.level} {'\u00B7'} {info.wordCount}{'\u8A9E'}
                          {getHighScore(key) > 0 && (
                            <span style={{
                              marginLeft: 4, fontWeight: 700,
                              color: hovered ? 'rgba(255,255,255,0.9)' : '#FFD700',
                            }}>
                              Best:{getHighScore(key).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Mastery bar */}
                    {mastery && mastery.practiced > 0 && (
                      <div style={{
                        width: '100%', height: 3, borderRadius: 3,
                        background: hovered ? 'rgba(255,255,255,0.25)' : '#F0F0F0',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', width: `${mastery.masteryPct}%`,
                          background: hovered ? 'rgba(255,255,255,0.8)' : info.color,
                          borderRadius: 3, transition: 'width 0.5s ease',
                        }} />
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Weak words */}
              <button
                onClick={() => weakCount > 0 && onSelect('weak')}
                onMouseEnter={() => setHoveredLevel('weak')}
                onMouseLeave={() => setHoveredLevel(null)}
                style={{
                  border: weakCount > 0 ? 'none' : '2px dashed #ddd',
                  borderRadius: 14, padding: '14px 14px 12px',
                  background: hoveredLevel === 'weak' && weakCount > 0 ? '#FF6B6B' : weakCount > 0 ? 'white' : '#fafafa',
                  boxShadow: hoveredLevel === 'weak' && weakCount > 0 ? '0 6px 20px rgba(255,107,107,0.3)' : weakCount > 0 ? '0 2px 10px rgba(0,0,0,0.06)' : 'none',
                  cursor: weakCount > 0 ? 'pointer' : 'not-allowed',
                  transform: hoveredLevel === 'weak' && weakCount > 0 ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'all 0.18s ease', opacity: weakCount > 0 ? 1 : 0.5,
                  textAlign: 'left',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 24 }}>{'\uD83D\uDD34'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 800, fontSize: 15,
                      color: hoveredLevel === 'weak' && weakCount > 0 ? 'white' : '#333',
                    }}>
                      {'\u82E6\u624B\u5358\u8A9E'}
                    </div>
                    <div style={{
                      fontSize: 10, marginTop: 1,
                      color: hoveredLevel === 'weak' && weakCount > 0 ? 'rgba(255,255,255,0.8)' : '#aaa',
                    }}>
                      {weakCount > 0 ? `${weakCount}\u8A9E\u3092\u96C6\u4E2D\u7DF4\u7FD2` : '\u30D7\u30EC\u30A4\u5F8C\u306B\u89E3\u653E'}
                    </div>
                  </div>
                  {weakCount > 0 && (
                    <div style={{
                      background: hoveredLevel === 'weak' ? 'rgba(255,255,255,0.3)' : '#FF6B6B',
                      color: 'white', borderRadius: 8, padding: '2px 8px',
                      fontSize: 11, fontWeight: 800,
                    }}>
                      {weakCount}
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Bottom row: Rules */}
          <div style={{
            display: 'flex', gap: 16, justifyContent: 'center',
            fontSize: 11, color: '#bbb',
          }}>
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
