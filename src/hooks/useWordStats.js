// useWordStats — 苦手単語トラッキング (localStorage)
const STORAGE_KEY = 'fwb_word_stats';
const LEVEL_KEY = 'fwb_player_level';

export function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveStats(stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function recordResult(english, isCorrect) {
  const stats = loadStats();
  if (!stats[english]) {
    stats[english] = { correctCount: 0, wrongCount: 0, lastSeen: null };
  }
  if (isCorrect) {
    stats[english].correctCount += 1;
  } else {
    stats[english].wrongCount += 1;
  }
  stats[english].lastSeen = Date.now();
  saveStats(stats);
}

export function loadPlayerLevel() {
  try {
    return JSON.parse(localStorage.getItem(LEVEL_KEY) || 'null');
  } catch {
    return null;
  }
}

export function savePlayerLevel(levelKey) {
  localStorage.setItem(LEVEL_KEY, JSON.stringify(levelKey));
}

export function getWeakWordCount() {
  const stats = loadStats();
  return Object.values(stats).filter(s => s.wrongCount > 0).length;
}

// XP / ランクシステム（Phase 2実装用の土台）
const RANK_KEY = 'fwb_player_xp';

export function loadXP() {
  return parseInt(localStorage.getItem(RANK_KEY) || '0', 10);
}

export function addXP(amount) {
  const xp = loadXP() + amount;
  localStorage.setItem(RANK_KEY, String(xp));
  return xp;
}

export const XP_RANKS = [
  { rank: 'ルーキー', minXP: 0, icon: '🥚', color: '#9CA3AF' },
  { rank: 'ブロンズ', minXP: 500, icon: '🥉', color: '#B45309' },
  { rank: 'シルバー', minXP: 1500, icon: '🥈', color: '#6B7280' },
  { rank: 'ゴールド', minXP: 3000, icon: '🥇', color: '#D97706' },
  { rank: 'プラチナ', minXP: 6000, icon: '💎', color: '#7C3AED' },
  { rank: 'マスター', minXP: 12000, icon: '👑', color: '#DC2626' },
];

export function getCurrentRank(xp) {
  for (let i = XP_RANKS.length - 1; i >= 0; i--) {
    if (xp >= XP_RANKS[i].minXP) return XP_RANKS[i];
  }
  return XP_RANKS[0];
}

export function getNextRank(xp) {
  for (let i = 0; i < XP_RANKS.length; i++) {
    if (xp < XP_RANKS[i].minXP) return XP_RANKS[i];
  }
  return null;
}
