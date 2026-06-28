import { useState, useEffect } from 'react';
import { LEVEL_INFO, WORD_DB } from '../data/wordData';
import { getCurrentRank, getNextRank, getHighScore, loadMastery, getLevelMastery } from '../hooks/useWordStats';

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

function MasteryStars({ level }) {
  return (
    <span style={{ letterSpacing: 2 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ opacity: i < level ? 1 : 0.2, fontSize: 14 }}>
          {'\u2B50'}
        </span>
      ))}
    </span>
  );
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

  // Level mastery info
  const wordPool = levelKey !== 'weak' && WORD_DB[levelKey] ? WORD_DB[levelKey] : [];
  const levelMastery = wordPool.length > 0 ? getLevelMastery(levelKey, wordPool) : null;

  const [showStats, setShowStats] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [showMastery, setShowMastery] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowStats(true), 400);
    const t2 = setTimeout(() => setShowXP(true), 700);
    const t3 = setTimeout(() => setShowMastery(true), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
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
    { label: '\uD83D\uDD25 \u6700\u5927\u30B3\u30F3\u30DC', value: maxCombo + '\u9023', color: '#FF8A5C' },
  ];

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg, #FFF5F7, #F5F0FF, #F0F8FF, #F0FFF4)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflowY: 'auto', padding: '24px 20px 40px',
    }}>
      {/* Bubbles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'fixed',
          left: `${[10, 80, 20, 70, 45, 90][i]}%`,
          top: `${[15, 10, 70, 75, 5, 50][i]}%`,
          width: [60, 45, 70, 40, 55, 35][i], height: [60, 45, 70, 40, 55, 35][i],
          borderRadius: '50%',
          background: ['#FF6B9D', '#45B7D1', '#A78BFA', '#4ECDC4', '#FFB347', '#FF8A5C'][i],
          opacity: 0.12, pointerEvents: 'none',
          animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
          animationDelay: `${i * 0.3}s`,
        }} />
      ))}

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>

        {/* Level badge */}
        <div style={{ fontSize: 13, color: levelInfo.color, fontWeight: 700, background: 'white', borderRadius: 20, padding: '5px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          {levelInfo.icon} {levelInfo.name}
        </div>

        {/* Rank display */}
        <div style={{
          animation: 'rankBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'Fredoka One', fontSize: 80, color: gameRank.color, lineHeight: 1, textShadow: `0 4px 20px ${gameRank.color}60` }}>
            {gameRank.rank}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#555', marginTop: 4 }}>{gameRank.msg}</div>
        </div>

        {/* Score */}
        <div style={{ background: 'white', borderRadius: 20, padding: '16px 32px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center', width: '100%' }}>
          <div style={{ fontSize: 12, color: '#bbb', fontWeight: 700, letterSpacing: 1 }}>TOTAL SCORE</div>
          <div style={{ fontFamily: 'Fredoka One', fontSize: 44, color: '#333' }}>{score.toLocaleString()}</div>
          {isNewHighScore && (
            <div style={{ fontSize: 14, color: '#FFD700', fontWeight: 800, marginTop: 4, animation: 'popIn 0.4s ease' }}>
              NEW HIGH SCORE!
            </div>
          )}
          {highScore > 0 && !isNewHighScore && (
            <div style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>
              Best: {highScore.toLocaleString()}
            </div>
          )}
        </div>

        {/* Perfect / Near-miss feedback */}
        {isPerfect && (
          <div style={{
            fontFamily: 'Fredoka One', fontSize: 42, color: '#FFD700',
            textAlign: 'center',
            animation: 'perfectGlow 2s ease-in-out infinite, popIn 0.5s ease',
            textShadow: '0 0 20px #FFD700, 0 0 40px #FFD700, 0 0 60px #FFD700',
            padding: '8px 0',
          }}>
            PERFECT!
          </div>
        )}
        {isNearMiss && (
          <div style={{
            background: 'rgba(255,215,0,0.15)', borderRadius: 14,
            padding: '12px 16px', width: '100%', fontSize: 15,
            color: '#B8860B', fontWeight: 800, textAlign: 'center',
            animation: 'popIn 0.4s ease', border: '2px solid rgba(255,215,0,0.3)',
          }}>
            {'\uD83D\uDD25'} {'\u3042\u3068'}{wrongCount}{'\u554F\u3067\u30D1\u30FC\u30D5\u30A7\u30AF\u30C8\uFF01\u3082\u3046\u4E00\u56DE\uFF1F'}
          </div>
        )}

        {/* Survival mode badge */}
        {gameMode === 'survival' && (
          <div style={{
            background: 'linear-gradient(135deg, #FF6B9D, #FF8A5C)',
            borderRadius: 14, padding: '8px 16px', width: '100%',
            fontSize: 13, color: 'white', fontWeight: 800, textAlign: 'center',
          }}>
            {'\u2694\uFE0F'} SURVIVAL MODE COMPLETE
          </div>
        )}

        {/* Streak & XP Card */}
        {showXP && (
          <div style={{ background: 'linear-gradient(135deg, #667EEA, #764BA2)', borderRadius: 18, padding: '14px 18px', width: '100%', color: 'white', boxShadow: '0 4px 18px rgba(102,126,234,0.4)', animation: 'popIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 700 }}>{'\u7372\u5F97'}XP</div>
                <div style={{ fontFamily: 'Fredoka One', fontSize: 28 }}>+{earnedXP} XP</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24 }}>{rank.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.9 }}>{rank.rank}</div>
              </div>
            </div>

            {/* Streak multiplier */}
            {streak && streak.current >= 2 && (
              <div style={{
                background: 'rgba(255,255,255,0.15)', borderRadius: 10,
                padding: '6px 12px', marginBottom: 8,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 13 }}>
                  {'\uD83D\uDD25'} {streak.current}{'\u65E5\u9023\u7D9A'}!
                </span>
                {streakMult > 1 && (
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#FFD700' }}>
                    XP x{streakMult}
                  </span>
                )}
              </div>
            )}

            {/* New words learned */}
            {newWordsLearned > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.1)', borderRadius: 10,
                padding: '6px 12px', marginBottom: 8, fontSize: 13,
              }}>
                {'\uD83C\uDD95'} {'\u65B0\u3057\u3044\u5358\u8A9E'}: {newWordsLearned}{'\u8A9E\u5B66\u7FD2'}
              </div>
            )}

            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: 'white', borderRadius: 8, transition: 'width 1s ease' }} />
            </div>
            {nextRank ? (
              <div style={{ fontSize: 11, opacity: 0.75, marginTop: 5 }}>
                {rank.rank} {'\u2192'} {nextRank.icon} {nextRank.rank} {'\u307E\u3067'} {(nextRank.minXP - xp).toLocaleString()} XP
              </div>
            ) : (
              <div style={{ fontSize: 11, opacity: 0.75, marginTop: 5 }}>{'\uD83C\uDFC6'} {'\u6700\u9AD8\u30E9\u30F3\u30AF\u9054\u6210\uFF01'}</div>
            )}
          </div>
        )}

        {/* Level Mastery Progress */}
        {showMastery && levelMastery && (
          <div style={{
            background: 'white', borderRadius: 18, padding: '14px 18px', width: '100%',
            boxShadow: '0 4px 18px rgba(0,0,0,0.08)', animation: 'popIn 0.4s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#555' }}>
                {levelInfo.icon} {levelInfo.name} {'\u7FD2\u5F97\u5EA6'}
              </div>
              <div style={{ fontFamily: 'Fredoka One', fontSize: 20, color: levelInfo.color }}>
                {levelMastery.masteryPct}%
              </div>
            </div>

            {/* Stars progress bar */}
            <div style={{ width: '100%', height: 10, background: '#F0F0F0', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{
                height: '100%',
                width: `${levelMastery.masteryPct}%`,
                background: `linear-gradient(90deg, ${levelInfo.color}, ${levelInfo.color}cc)`,
                borderRadius: 10,
                transition: 'width 1s ease',
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999' }}>
              <span>{'\u2B50'} {levelMastery.totalStars}/{levelMastery.maxStars}</span>
              <span>{'\u2705'} {levelMastery.mastered}/{levelMastery.total}{'\u8A9E\u30DE\u30B9\u30BF\u30FC'}</span>
              <span>{'\uD83D\uDCDA'} {levelMastery.practiced}{'\u8A9E\u7DF4\u7FD2\u6E08'}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        {showStats && (
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{
                background: 'white', borderRadius: 16, padding: '12px 14px',
                boxShadow: '0 3px 12px rgba(0,0,0,0.07)',
                animation: `popIn 0.3s ease ${i * 0.05}s both`,
                borderLeft: `4px solid ${s.color}`,
              }}>
                <div style={{ fontSize: 12, color: '#aaa', fontWeight: 700 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'Fredoka One' }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Weak word notice */}
        {wrongCount > 0 && (
          <div style={{ background: 'rgba(255,107,107,0.1)', borderRadius: 14, padding: '10px 16px', width: '100%', fontSize: 13, color: '#FF6B6B', fontWeight: 700, textAlign: 'center' }}>
            {'\uD83D\uDD34'} {wrongCount}{'\u8A9E\u304C\u82E6\u624B\u5358\u8A9E\u306B\u767B\u9332\u3055\u308C\u307E\u3057\u305F\uFF01\u6B21\u56DE\u300C\u82E6\u624B\u5358\u8A9E\u30E2\u30FC\u30C9\u300D\u3067\u7DF4\u7FD2\u3057\u3088\u3046'}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onReFlash} style={{ flex: 1, padding: '13px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #0a0a0a, #1a2a28)', color: '#00d4aa', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              {'\u26A1'} {'\u518D\u5B66\u7FD2'}
            </button>
            <button onClick={onReLearn} style={{ flex: 1, padding: '13px', borderRadius: 16, border: '2px solid #E5E7EB', background: 'white', fontSize: 14, fontWeight: 800, color: '#555', cursor: 'pointer' }}>
              {'\uD83D\uDCCB'} {'\u5358\u8A9E\u78BA\u8A8D'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onMenu} style={{ flex: 1, padding: '13px', borderRadius: 16, border: '2px solid #E5E7EB', background: 'white', fontSize: 14, fontWeight: 800, color: '#888', cursor: 'pointer' }}>
              {'\uD83C\uDFE0'} {'\u30E1\u30CB\u30E5\u30FC'}
            </button>
            <button onClick={onRetry} style={{ flex: 1.5, padding: '13px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #FF6B9D, #A78BFA)', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,107,157,0.4)' }}>
              {'\uD83D\uDD04'} {'\u30EA\u30C8\u30E9\u30A4'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
