// ゲーム結果のランク（S〜D）。Game（WiseXP送信）と Result（表示）で同じ基準を使う。
// ・ノーマル / サバイバル: スコア基準（従来どおり）
// ・やさしい（1レーン・10語）: スコアが伸びにくいので「正しく選べた割合」で決める
export const GRADE_RANKS = [
  { rank: 'S', minScore: 3000, minRate: 1.0, msg: '👑 天才！！', color: '#FFD700' },
  { rank: 'A', minScore: 2000, minRate: 0.8, msg: '🌟 すごい！', color: '#FF8A5C' },
  { rank: 'B', minScore: 1200, minRate: 0.6, msg: '✨ いい感じ！', color: '#4ECDC4' },
  { rank: 'C', minScore: 600, minRate: 0.4, msg: '💪 まだまだ！', color: '#A78BFA' },
  { rank: 'D', minScore: 0, minRate: 0, msg: '📚 がんばろう！', color: '#9CA3AF' },
];

export function getGrade({ score = 0, gameMode = 'normal', correctCount = 0, wrongCount = 0, missCount = 0 }) {
  const last = GRADE_RANKS[GRADE_RANKS.length - 1];
  if (gameMode === 'easy') {
    const total = correctCount + wrongCount + missCount;
    const rate = total > 0 ? correctCount / total : 0;
    return GRADE_RANKS.find(r => rate >= r.minRate) || last;
  }
  return GRADE_RANKS.find(r => score >= r.minScore) || last;
}

export const PORTAL_URL = 'https://wise-english-portal.vercel.app';
