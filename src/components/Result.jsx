import { useState, useEffect } from 'react';
import { LEVEL_INFO } from '../data/wordData';
import { getCurrentRank, getNextRank, getHighScore } from '../hooks/useWordStats';

const RANKS = [
  { rank: 'S', minScore: 3000, msg: '👑 天才！！', color: '#FFD700' },
  { rank: 'A', minScore: 2000, msg: '🌟 すごい！', color: '#FF8A5C' },
  { rank: 'B', minScore: 1200, msg: '✨ いい感じ！', color: '#4ECDC4' },
  { rank: 'C', minScore: 600, msg: '💪 まだまだ！', color: '#A78BFA' },
  { rank: 'D', minScore: 0, msg: '📚 がんばろう！', color: '#9CA3AF' },
];

function getRank(score) {
  return RANKS.find(r => score >= r.minScore) || RANKS[RANKS.length - 1];
}

export default function Result({ data, levelKey, levelInfo, onRetry, onReLearn, onReFlash, onMenu, xp, rank }) {
  const { score, maxCombo, correctCount, wrongCount, missCount, earnedXP, isNewHighScore } = data;
  const gameRank = getRank(score);
  const highScore = getHighScore(levelKey);
  const accuracy = correctCount + wrongCount > 0
    ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
    : 0;

  // levelInfo passed as prop

  const [showStats, setShowStats] = useState(false);
  const [showXP, setShowXP] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowStats(true), 400);
    const t2 = setTimeout(() => setShowXP(true), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const nextRank = getNextRank(xp);
  const progressPct = nextRank
    ? Math.min(100, ((xp - rank.minXP) / (nextRank.minXP - rank.minXP)) * 100)
    : 100;

  const stats = [
    { label: '✅ 正解', value: correctCount + '問', color: '#4ECDC4' },
    { label: '❌ 不正解', value: wrongCount + '問', color: '#FF6B6B' },
    { label: '💨 ミス', value: missCount + '問', color: '#FFB347' },
    { label: '🎯 正答率', value: accuracy + '%', color: '#A78BFA' },
    { label: '🔥 最大コンボ', value: maxCombo + '連', color: '#FF8A5C' },
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
          {highScore > 0 && (
            <div style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>
              Best: {highScore.toLocaleString()}
            </div>
          )}
        </div>

        {/* XP Earned */}
        {showXP && (
          <div style={{ background: 'linear-gradient(135deg, #667EEA, #764BA2)', borderRadius: 18, padding: '14px 18px', width: '100%', color: 'white', boxShadow: '0 4px 18px rgba(102,126,234,0.4)', animation: 'popIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 700 }}>獲得XP</div>
                <div style={{ fontFamily: 'Fredoka One', fontSize: 28 }}>+{earnedXP} XP</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24 }}>{rank.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.9 }}>{rank.rank}</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: 'white', borderRadius: 8, transition: 'width 1s ease' }} />
            </div>
            {nextRank ? (
              <div style={{ fontSize: 11, opacity: 0.75, marginTop: 5 }}>
                {rank.rank} → {nextRank.icon} {nextRank.rank} まで {(nextRank.minXP - xp).toLocaleString()} XP
              </div>
            ) : (
              <div style={{ fontSize: 11, opacity: 0.75, marginTop: 5 }}>🏆 最高ランク達成！</div>
            )}
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
            🔴 {wrongCount}語が苦手単語に登録されました！次回「苦手単語モード」で練習しよう
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onReFlash} style={{ flex: 1, padding: '13px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #0a0a0a, #1a2a28)', color: '#00d4aa', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              ⚡ 再学習
            </button>
            <button onClick={onReLearn} style={{ flex: 1, padding: '13px', borderRadius: 16, border: '2px solid #E5E7EB', background: 'white', fontSize: 14, fontWeight: 800, color: '#555', cursor: 'pointer' }}>
              📋 単語確認
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onMenu} style={{ flex: 1, padding: '13px', borderRadius: 16, border: '2px solid #E5E7EB', background: 'white', fontSize: 14, fontWeight: 800, color: '#888', cursor: 'pointer' }}>
              🏠 メニュー
            </button>
            <button onClick={onRetry} style={{ flex: 1.5, padding: '13px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #FF6B9D, #A78BFA)', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,107,157,0.4)' }}>
              🔄 リトライ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
