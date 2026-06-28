import { useState, useEffect } from 'react';
import { LEVEL_INFO, WORD_DB } from '../data/wordData';
import { getCurrentRank, getNextRank, getHighScore, getLevelMastery } from '../hooks/useWordStats';

const RANKS = [
  { rank: 'S', minScore: 3000, msg: '\uD83D\uDC51 \u5929\u624D\uFF01\uFF01', color: '#FFD700' },
  { rank: 'A', minScore: 2000, msg: '\uD83C\uDF1F \u3059\u3054\u3044\uFF01', color: '#FF8A5C' },
  { rank: 'B', minScore: 1200, msg: '\u2728 \u3044\u3044\u611F\u3058\uFF01', color: '#4ECDC4' },
  { rank: 'C', minScore: 600, msg: '\uD83D\uDCAA \u307E\u3060\u307E\u3060\uFF01', color: '#A78BFA' },
  { rank: 'D', minScore: 0, msg: '\uD83D\uDCDA \u304C\u3093\u3070\u308D\u3046\uFF01', color: '#9CA3AF' },
];

function getRank(score) {
  return RANKS.find(r => score >= r.minScore) || RANKS[RANKS.length - 1];
}

export default function Result({ data, levelKey, levelInfo, onRetry, onReLearn, onReFlash, onMenu, xp, rank }) {
  const { score, maxCombo, correctCount, wrongCount, missCount, earnedXP, isNewHighScore, gameMode, streak, streakMult, newWordsLearned } = data;
  const gameRank = getRank(score);
  const highScore = getHighScore(levelKey);
  const total = correctCount + wrongCount + missCount;
  const accuracy = correctCount + wrongCount > 0
    ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
    : 0;

  const isPerfect = accuracy === 100 && correctCount > 0;
  const isNearMiss = accuracy >= 80 && accuracy < 100;

  const wordPool = levelKey !== 'weak' && WORD_DB[levelKey] ? WORD_DB[levelKey] : [];
  const levelMastery = wordPool.length > 0 ? getLevelMastery(levelKey, wordPool) : null;

  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, []);

  const nextRank = getNextRank(xp);
  const progressPct = nextRank
    ? Math.min(100, ((xp - rank.minXP) / (nextRank.minXP - rank.minXP)) * 100)
    : 100;

  const stats = [
    { label: '\u2705 \u6B63\u89E3', value: correctCount + '\u554F', color: '#4ECDC4' },
    { label: '\u274C \u4E0D\u6B63\u89E3', value: wrongCount + '\u554F', color: '#FF6B6B' },
    { label: '\uD83D\uDCA8 \u30DF\u30B9', value: missCount + '\u554F', color: '#FFB347' },
    { label: '\uD83C\uDFAF \u6B63\u7B54\u7387', value: accuracy + '%', color: '#A78BFA' },
    { label: '\uD83D\uDD25 \u30B3\u30F3\u30DC', value: maxCombo + '\u9023', color: '#FF8A5C' },
  ];

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg, #FFF5F7, #F5F0FF, #F0F8FF, #F0FFF4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Bubbles */}
      {[
        { w: 60, bg: '#FF6B9D', l: '5%', t: '10%' },
        { w: 45, bg: '#45B7D1', l: '90%', t: '8%' },
        { w: 70, bg: '#A78BFA', l: '10%', t: '78%' },
        { w: 35, bg: '#4ECDC4', l: '85%', t: '80%' },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', width: b.w, height: b.w, borderRadius: '50%',
          background: b.bg, left: b.l, top: b.t, opacity: 0.12,
          animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Main container: horizontal layout */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', gap: 20, alignItems: 'stretch',
        padding: '16px 24px',
        maxWidth: 900, width: '100%',
        maxHeight: '100%',
      }}>

        {/* LEFT: Rank + Score */}
        <div style={{
          width: 'clamp(200px, 32%, 280px)', flexShrink: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 12,
        }}>
          {/* Level badge */}
          <div style={{
            fontSize: 12, color: levelInfo.color, fontWeight: 700,
            background: 'white', borderRadius: 16, padding: '4px 12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          }}>
            {levelInfo.icon} {levelInfo.name}
            {gameMode === 'survival' && <span style={{ marginLeft: 4, color: '#FF8A5C' }}>SURVIVAL</span>}
          </div>

          {/* Grade */}
          <div style={{ animation: 'rankBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)', textAlign: 'center' }}>
            <div style={{
              fontFamily: 'Fredoka One', fontSize: 'clamp(60px, 12vw, 90px)',
              color: gameRank.color, lineHeight: 1,
              textShadow: `0 4px 20px ${gameRank.color}50`,
            }}>
              {gameRank.rank}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#555', marginTop: 2 }}>{gameRank.msg}</div>
          </div>

          {/* Score card */}
          <div style={{
            background: 'white', borderRadius: 18, padding: '14px 24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)', textAlign: 'center',
            width: '100%',
          }}>
            <div style={{ fontSize: 10, color: '#bbb', fontWeight: 700, letterSpacing: 1 }}>TOTAL SCORE</div>
            <div style={{ fontFamily: 'Fredoka One', fontSize: 36, color: '#333' }}>{score.toLocaleString()}</div>
            {isNewHighScore && (
              <div style={{ fontSize: 12, color: '#FFD700', fontWeight: 800, animation: 'popIn 0.4s ease' }}>
                NEW HIGH SCORE!
              </div>
            )}
            {highScore > 0 && !isNewHighScore && (
              <div style={{ fontSize: 11, color: '#bbb' }}>Best: {highScore.toLocaleString()}</div>
            )}
          </div>

          {/* Perfect / Near miss */}
          {isPerfect && (
            <div style={{
              fontFamily: 'Fredoka One', fontSize: 32, color: '#FFD700',
              animation: 'perfectGlow 2s ease-in-out infinite, popIn 0.5s ease',
              textShadow: '0 0 20px #FFD700, 0 0 40px #FFD700',
            }}>
              PERFECT!
            </div>
          )}
          {isNearMiss && (
            <div style={{
              background: 'rgba(255,215,0,0.15)', borderRadius: 12,
              padding: '8px 12px', width: '100%', fontSize: 13,
              color: '#B8860B', fontWeight: 800, textAlign: 'center',
              border: '2px solid rgba(255,215,0,0.3)',
            }}>
              {'\uD83D\uDD25'} {'\u3042\u3068'}{wrongCount}{'\u554F\u3067PERFECT!'}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', marginTop: 4 }}>
            <button onClick={onRetry} style={{
              padding: '12px', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #FF6B9D, #A78BFA)',
              color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255,107,157,0.35)',
            }}>
              {'\uD83D\uDD04'} {'\u30EA\u30C8\u30E9\u30A4'}
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={onReFlash} style={{
                flex: 1, padding: '10px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #0a0a0a, #1a2a28)',
                color: '#00d4aa', fontSize: 12, fontWeight: 800, cursor: 'pointer',
              }}>
                {'\u26A1'} {'\u518D\u5B66\u7FD2'}
              </button>
              <button onClick={onReLearn} style={{
                flex: 1, padding: '10px', borderRadius: 12,
                border: '2px solid #E5E7EB', background: 'white',
                fontSize: 12, fontWeight: 800, color: '#555', cursor: 'pointer',
              }}>
                {'\uD83D\uDCCB'} {'\u78BA\u8A8D'}
              </button>
            </div>
            <button onClick={onMenu} style={{
              padding: '10px', borderRadius: 12,
              border: '2px solid #E5E7EB', background: 'white',
              fontSize: 12, fontWeight: 800, color: '#888', cursor: 'pointer',
            }}>
              {'\uD83C\uDFE0'} {'\u30E1\u30CB\u30E5\u30FC'}
            </button>
          </div>
        </div>

        {/* RIGHT: Stats + XP + Mastery */}
        {show && (
          <div style={{
            flex: 1, minWidth: 0,
            display: 'flex', flexDirection: 'column', gap: 10,
            justifyContent: 'center',
            animation: 'popIn 0.4s ease',
          }}>
            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
              {stats.map((s) => (
                <div key={s.label} style={{
                  background: 'white', borderRadius: 14, padding: '10px 12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  borderLeft: `3px solid ${s.color}`,
                }}>
                  <div style={{ fontSize: 11, color: '#aaa', fontWeight: 700 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: 'Fredoka One' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* XP Card */}
            <div style={{
              background: 'linear-gradient(135deg, #667EEA, #764BA2)',
              borderRadius: 16, padding: '12px 16px', color: 'white',
              boxShadow: '0 4px 16px rgba(102,126,234,0.3)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 700 }}>{'\u7372\u5F97'}XP</div>
                  <div style={{ fontFamily: 'Fredoka One', fontSize: 24 }}>+{earnedXP} XP</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {streak && streak.current >= 2 && (
                    <span style={{
                      background: 'rgba(255,255,255,0.15)', borderRadius: 8,
                      padding: '4px 8px', fontSize: 11,
                    }}>
                      {'\uD83D\uDD25'} {streak.current}{'\u65E5'} {streakMult > 1 ? `x${streakMult}` : ''}
                    </span>
                  )}
                  {newWordsLearned > 0 && (
                    <span style={{
                      background: 'rgba(255,255,255,0.1)', borderRadius: 8,
                      padding: '4px 8px', fontSize: 11,
                    }}>
                      {'\uD83C\uDD95'} +{newWordsLearned}{'\u8A9E'}
                    </span>
                  )}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20 }}>{rank.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.9 }}>{rank.rank}</div>
                  </div>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progressPct}%`, background: 'white', borderRadius: 6, transition: 'width 1s ease' }} />
              </div>
              {nextRank ? (
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>
                  {'\u2192'} {nextRank.icon} {nextRank.rank} {'\u307E\u3067'} {(nextRank.minXP - xp).toLocaleString()} XP
                </div>
              ) : (
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>{'\uD83C\uDFC6'} {'\u6700\u9AD8\u30E9\u30F3\u30AF\u9054\u6210\uFF01'}</div>
              )}
            </div>

            {/* Level Mastery */}
            {levelMastery && (
              <div style={{
                background: 'white', borderRadius: 16, padding: '12px 16px',
                boxShadow: '0 3px 12px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: '#555' }}>
                    {levelInfo.icon} {levelInfo.name} {'\u7FD2\u5F97\u5EA6'}
                  </span>
                  <span style={{ fontFamily: 'Fredoka One', fontSize: 18, color: levelInfo.color }}>
                    {levelMastery.masteryPct}%
                  </span>
                </div>
                <div style={{ width: '100%', height: 8, background: '#F0F0F0', borderRadius: 8, overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{
                    height: '100%', width: `${levelMastery.masteryPct}%`,
                    background: `linear-gradient(90deg, ${levelInfo.color}, ${levelInfo.color}cc)`,
                    borderRadius: 8, transition: 'width 1s ease',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#999' }}>
                  <span>{'\u2B50'} {levelMastery.totalStars}/{levelMastery.maxStars}</span>
                  <span>{'\u2705'} {levelMastery.mastered}/{levelMastery.total}{'\u8A9E\u30DE\u30B9\u30BF\u30FC'}</span>
                  <span>{'\uD83D\uDCDA'} {levelMastery.practiced}{'\u8A9E\u7DF4\u7FD2\u6E08'}</span>
                </div>
              </div>
            )}

            {/* Weak word notice */}
            {wrongCount > 0 && (
              <div style={{
                background: 'rgba(255,107,107,0.08)', borderRadius: 12,
                padding: '8px 14px', fontSize: 12, color: '#FF6B6B',
                fontWeight: 700, textAlign: 'center',
              }}>
                {'\uD83D\uDD34'} {wrongCount}{'\u8A9E\u304C\u82E6\u624B\u5358\u8A9E\u306B\u767B\u9332\u3055\u308C\u307E\u3057\u305F'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
