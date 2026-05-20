// useWordStats — 苦手単語トラッキング & ハイスコア永続化 (localStorage)
const STORAGE_KEY = 'fwb_word_stats';
const LEVEL_KEY = 'fwb_player_level';
const HIGH_SCORE_KEY = 'fwb_high_scores';
const WRONG_LOG_KEY = 'fwb_wrong_answers_log';

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

// ── High Score Persistence ──

export function loadHighScores() {
  try {
    return JSON.parse(localStorage.getItem(HIGH_SCORE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveHighScore(levelKey, score) {
  const scores = loadHighScores();
  if (!scores[levelKey] || score > scores[levelKey]) {
    scores[levelKey] = score;
    localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(scores));
    return true; // new high score
  }
  return false;
}

export function getHighScore(levelKey) {
  const scores = loadHighScores();
  return scores[levelKey] || 0;
}

// ── Wrong Answer Log for Review Mode ──

export function loadWrongAnswerLog() {
  try {
    return JSON.parse(localStorage.getItem(WRONG_LOG_KEY) || '[]');
  } catch {
    return [];
  }
}

export function logWrongAnswer(word) {
  const log = loadWrongAnswerLog();
  log.push({
    english: word.english,
    japanese: word.correct || word.japanese,
    timestamp: Date.now(),
    levelKey: word.levelKey || null,
  });
  // Keep only the latest 500 entries to avoid localStorage bloat
  const trimmed = log.slice(-500);
  localStorage.setItem(WRONG_LOG_KEY, JSON.stringify(trimmed));
}

export function getWrongAnswerSummary() {
  const log = loadWrongAnswerLog();
  const summary = {};
  for (const entry of log) {
    if (!summary[entry.english]) {
      summary[entry.english] = { english: entry.english, japanese: entry.japanese, count: 0, lastWrong: 0 };
    }
    summary[entry.english].count += 1;
    if (entry.timestamp > summary[entry.english].lastWrong) {
      summary[entry.english].lastWrong = entry.timestamp;
    }
  }
  return Object.values(summary).sort((a, b) => b.count - a.count);
}
