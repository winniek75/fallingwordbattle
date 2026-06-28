import { useState } from 'react';
import { LEVEL_INFO, WORD_DB } from '../data/wordData';
import { getCurrentRank, getNextRank, loadXP, XP_RANKS, getHighScore, getLevelMastery, loadStreak } from '../hooks/useWordStats';

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
        { w: 55, bg: '#FFB347', l: '50%', t: '3%' },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', width: b.w, height: b.w, borderRadius: '50%',
          background: b.bg, left: b.l, top: b.t, opacity: 0.15,
          animation: `float ${3 + i * 0.4}s ease-in-out infinite`,
          animationDelay: `${i * 0.5}s`, pointerEvents: 'none',
        }} />
      ))}

      {/* Top bar: Title + Player */}
      <div style={{
        flexShrink: 0, position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px 8px',
      }}>
        <div>
          <div style={{
            fontFamily: 'Fredoka One', fontSize: 'clamp(22px, 4vw, 30px)',
            background: 'linear-gradient(90deg,#FF6B9D,#A78BFA,#45B7D1)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {'\u82F1\u5358\u8A9E\u30D0\u30C8\u30EB'} {'\u2694\uFE0F'}
          </div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>Falling Word Battle</div>
        </div>
        {currentPlayer && (
          <div
            onClick={onChangePlayer}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.95)', padding: '6px 12px',
              borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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

      {/* Main content: 2 columns */}
      <div style={{
        flex: 1, position: 'relative', zIndex: 1, overflow: 'hidden',
        display: 'flex', gap: 16, padding: '8px 20px 16px',
        minHeight: 0,
      }}>
        {/* LEFT: Status panel */}
        <div style={{
          width: 'clamp(240px, 35%, 340px)', flexShrink: 0,
          display: 'flex', flexDirection: 'column', gap: 10,
          overflowY: 'auto', overflowX: 'hidden',
          paddingRight: 4, paddingBottom: 4,
        }}>
          {/* XP / Rank */}
          <div style={{
            background: 'white', borderRadius: 16, padding: '12px 14px',
            boxShadow: '0 3px 14px rgba(0,0,0,0.07)',
            display: 'flex', gap: 10, alignItems: 'center',
          }}>
            <div style={{ fontSize: 30 }}>{currentRank.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: currentRank.color }}>{currentRank.rank}</span>
                <span style={{ fontSize: 11, color: '#999' }}>{xp.toLocaleString()} XP</span>
              </div>
              <div style={{ width: '100%', height: 6, background: '#F0F0F0', borderRadius: 6, marginTop: 5, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${progressPct}%`,
                  background: `linear-gradient(90deg, ${currentRank.color}, ${xpForNext?.color || currentRank.color})`,
                  borderRadius: 6, transition: 'width 0.5s ease',
                }} />
              </div>
              {xpForNext && (
                <div style={{ fontSize: 10, color: '#bbb', marginTop: 3 }}>
                  {xpForNext.icon} {xpForNext.rank} {'\u307E\u3067'} {(xpForNext.minXP - xp).toLocaleString()} XP
                </div>
              )}
            </div>
          </div>

          {/* Streak */}
          {streak.current >= 1 && (
            <div style={{
              background: 'linear-gradient(135deg, #FF8A5C, #FF6B9D)',
              borderRadius: 14, padding: '10px 14px',
              boxShadow: '0 3px 12px rgba(255,138,92,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              color: 'white',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22 }}>{'\uD83D\uDD25'}</span>
                <div>
                  <div style={{ fontFamily: 'Fredoka One', fontSize: 16 }}>{streak.current}{'\u65E5\u9023\u7D9A'}</div>
                  <div style={{ fontSize: 10, opacity: 0.85 }}>
                    {streak.current >= 7 ? 'XP 1.5x' : streak.current >= 3 ? 'XP 1.3x' : streak.current >= 2 ? 'XP 1.1x' : ''} {'\u30DC\u30FC\u30CA\u30B9'}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 10, opacity: 0.75, textAlign: 'right' }}>
                {'\u4ECA\u65E5'} {streak.todayPlays}{'\u56DE'} | {'\u6700\u9AD8'} {streak.best}{'\u65E5'}
              </div>
            </div>
          )}

          {/* Game Mode */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { key: 'normal', icon: '\u23F1\uFE0F', label: '\u30CE\u30FC\u30DE\u30EB', sub: '30\u79D2', color: '#4ECDC4' },
              { key: 'survival', icon: '\u2764\uFE0F', label: '\u30B5\u30D0\u30A4\u30D0\u30EB', sub: '3\u30E9\u30A4\u30D5', color: '#FF6B9D' },
            ].map(m => (
              <button
                key={m.key}
                onClick={() => setGameMode(m.key)}
                style={{
                  flex: 1, padding: '10px 8px', borderRadius: 12,
                  border: gameMode === m.key ? `2px solid ${m.color}` : '2px solid #E5E7EB',
                  background: gameMode === m.key ? `${m.color}12` : 'white',
                  cursor: 'pointer', textAlign: 'center',
                  boxShadow: gameMode === m.key ? `0 3px 12px ${m.color}30` : '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 18, marginBottom: 2 }}>{m.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 12, color: gameMode === m.key ? m.color : '#555' }}>{m.label}</div>
                <div style={{ fontSize: 10, color: '#999' }}>{m.sub}</div>
              </button>
            ))}
          </div>

          {/* Hiragana toggle */}
          <div style={{
            background: 'white', borderRadius: 12, padding: '10px 14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#555' }}>
              {'\uD83D\uDCDD'} {'\u8868\u793A\u30E2\u30FC\u30C9'}
            </span>
            <button
              onClick={() => setUseHiragana(!useHiragana)}
              style={{
                padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                border: 'none', cursor: 'pointer', color: 'white',
                background: useHiragana
                  ? 'linear-gradient(135deg, #4ECDC4, #44A8C0)'
                  : 'linear-gradient(135deg, #FF8A5C, #FF6B6B)',
                transition: 'all 0.2s',
              }}
            >
              {useHiragana ? '\uD83D\uDD24 \u3072\u3089\u304C\u306A' : '\uD83D\uDCD6 \u6F22\u5B57\u307E\u3058\u308A'}
            </button>
          </div>

          {/* Rules (compact) */}
          <div style={{
            background: 'white', borderRadius: 14, padding: '10px 14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontWeight: 800, fontSize: 12, color: '#555', marginBottom: 6 }}>{'\uD83D\uDCD6'} {'\u30EB\u30FC\u30EB'}</div>
            {[
              '\uD83D\uDC48\uD83D\uDC49 \u5DE6\u53F3\u30EC\u30FC\u30F3\u3067\u540C\u6642\u306B2\u554F',
              '\u2B07\uFE0F \u65E5\u672C\u8A9E\u8A33\u304C\u843D\u3061\u3066\u304F\u308B\u2014\u30BF\u30C3\u30D7\u3067\u56DE\u7B54',
              '\uD83D\uDD25 \u30B3\u30F3\u30DC\u3067\u30DC\u30FC\u30CA\u30B9XP',
            ].map((t, i) => (
              <div key={i} style={{ fontSize: 11, color: '#777', marginBottom: 3, lineHeight: 1.3 }}>{t}</div>
            ))}
          </div>
        </div>

        {/* RIGHT: Level selection */}
        <div style={{
          flex: 1, minWidth: 0,
          display: 'flex', flexDirection: 'column', gap: 8,
          overflowY: 'auto', overflowX: 'hidden',
          paddingBottom: 4,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#999', letterSpacing: 1 }}>
            {'\uD83D\uDCDA'} {'\u30EC\u30D9\u30EB\u3092\u9078\u629E'}
          </div>

          {/* Level grid: 2 columns on wide, 1 on narrow */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
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
                    border: 'none', borderRadius: 14, padding: '12px 14px',
                    background: hovered ? info.color : 'white',
                    boxShadow: hovered ? `0 6px 20px ${info.color}50` : '0 2px 10px rgba(0,0,0,0.07)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                    transform: hovered ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.18s ease', textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: 26, flexShrink: 0 }}>{info.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: hovered ? 'white' : '#333' }}>{info.name}</span>
                      {mastery && mastery.masteryPct > 0 && (
                        <span style={{
                          fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 6,
                          background: hovered ? 'rgba(255,255,255,0.25)' : `${info.color}18`,
                          color: hovered ? 'white' : (mastery.masteryPct >= 80 ? '#FFD700' : info.color),
                        }}>
                          {mastery.masteryPct}%
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: hovered ? 'rgba(255,255,255,0.8)' : '#999', marginTop: 2 }}>
                      {info.level} {'\u00B7'} CEFR {info.cefr} {'\u00B7'} {info.wordCount}{'\u8A9E'}
                      {getHighScore(key) > 0 && (
                        <span style={{
                          marginLeft: 6, fontWeight: 700,
                          color: hovered ? 'rgba(255,255,255,0.9)' : '#FFD700',
                        }}>
                          Best: {getHighScore(key).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {mastery && mastery.practiced > 0 && (
                      <div style={{
                        width: '100%', height: 3, borderRadius: 3, marginTop: 5,
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
                  </div>
                  <div style={{ fontSize: 16, color: hovered ? 'white' : '#ccc', flexShrink: 0 }}>{'\u203A'}</div>
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
                borderRadius: 14, padding: '12px 14px',
                background: hoveredLevel === 'weak' && weakCount > 0 ? '#FF6B6B' : weakCount > 0 ? 'white' : '#fafafa',
                boxShadow: hoveredLevel === 'weak' && weakCount > 0 ? '0 6px 20px rgba(255,107,107,0.35)' : weakCount > 0 ? '0 2px 10px rgba(0,0,0,0.07)' : 'none',
                cursor: weakCount > 0 ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: 10,
                transform: hoveredLevel === 'weak' && weakCount > 0 ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.18s ease', opacity: weakCount > 0 ? 1 : 0.5,
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 26, flexShrink: 0 }}>{'\uD83D\uDD34'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 800, fontSize: 14,
                  color: hoveredLevel === 'weak' && weakCount > 0 ? 'white' : '#333',
                }}>
                  {'\u82E6\u624B\u5358\u8A9E\u30E2\u30FC\u30C9'}
                </div>
                <div style={{
                  fontSize: 11, marginTop: 2,
                  color: hoveredLevel === 'weak' && weakCount > 0 ? 'rgba(255,255,255,0.8)' : '#999',
                }}>
                  {weakCount > 0 ? `${weakCount}\u8A9E\u306E\u82E6\u624B\u5358\u8A9E\u3092\u96C6\u4E2D\u7DF4\u7FD2` : '\u30D7\u30EC\u30A4\u5F8C\u306B\u89E3\u653E'}
                </div>
              </div>
              {weakCount > 0 && (
                <div style={{
                  background: hoveredLevel === 'weak' ? 'rgba(255,255,255,0.3)' : '#FF6B6B',
                  color: 'white', borderRadius: 10, padding: '2px 8px',
                  fontSize: 12, fontWeight: 800, flexShrink: 0,
                }}>
                  {weakCount}{'\u8A9E'}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
