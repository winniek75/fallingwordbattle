// useWordStats — Word mastery tracking, streak system, XP/rank progression (localStorage)
const STORAGE_KEY = 'fwb_word_stats';
const LEVEL_KEY = 'fwb_player_level';
const HIGH_SCORE_KEY = 'fwb_high_scores';
const WRONG_LOG_KEY = 'fwb_wrong_answers_log';
const STREAK_KEY = 'fwb_streak';
const MASTERY_KEY = 'fwb_word_mastery';

// ── Word Stats (correct/wrong counts) ──

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

  // Update mastery
  updateWordMastery(english, isCorrect);
}

// ── Word Mastery System ──
// Each word has a mastery level 0-5 (stars)
// Correct answer: +1 mastery (max 5)
// Wrong answer: -1 mastery (min 0)
// Mastery determines word selection priority

export function loadMastery() {
  try {
    return JSON.parse(localStorage.getItem(MASTERY_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveMastery(mastery) {
  localStorage.setItem(MASTERY_KEY, JSON.stringify(mastery));
}

export function updateWordMastery(english, isCorrect) {
  const mastery = loadMastery();
  if (!mastery[english]) {
    mastery[english] = { level: 0, streak: 0, lastCorrect: null };
  }
  const m = mastery[english];
  if (isCorrect) {
    m.streak = (m.streak || 0) + 1;
    // Need consecutive correct answers to level up
    // Level 1: 1 correct, Level 2: 2 consecutive, Level 3: 3 consecutive, etc.
    if (m.streak >= m.level + 1) {
      m.level = Math.min(5, m.level + 1);
      m.streak = 0;
    }
    m.lastCorrect = Date.now();
  } else {
    m.streak = 0;
    m.level = Math.max(0, m.level - 1);
  }
  mastery[english] = m;
  saveMastery(mastery);
  return m;
}

export function getWordMastery(english) {
  const mastery = loadMastery();
  return mastery[english]?.level || 0;
}

// Get mastery stats for a level
export function getLevelMastery(levelKey, wordPool) {
  const mastery = loadMastery();
  const stats = loadStats();
  let total = 0;
  let mastered = 0; // level >= 3
  let practiced = 0; // has been seen at least once
  let totalStars = 0;

  for (const w of wordPool) {
    total++;
    const m = mastery[w.english];
    const s = stats[w.english];
    if (s && (s.correctCount > 0 || s.wrongCount > 0)) practiced++;
    if (m && m.level >= 3) mastered++;
    totalStars += (m?.level || 0);
  }

  return {
    total,
    mastered,
    practiced,
    totalStars,
    maxStars: total * 5,
    masteryPct: total > 0 ? Math.round((totalStars / (total * 5)) * 100) : 0,
    masteredPct: total > 0 ? Math.round((mastered / total) * 100) : 0,
  };
}

// ── Daily Streak System ──

export function loadStreak() {
  try {
    const data = JSON.parse(localStorage.getItem(STREAK_KEY) || '{}');
    return {
      current: data.current || 0,
      best: data.best || 0,
      lastPlayDate: data.lastPlayDate || null,
      todayPlays: data.todayPlays || 0,
    };
  } catch {
    return { current: 0, best: 0, lastPlayDate: null, todayPlays: 0 };
  }
}

function saveStreak(streak) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
}

export function updateStreak() {
  const streak = loadStreak();
  const today = new Date().toDateString();
  const lastPlay = streak.lastPlayDate;

  if (lastPlay === today) {
    // Already played today, just increment plays
    streak.todayPlays += 1;
  } else {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastPlay === yesterday) {
      // Consecutive day!
      streak.current += 1;
    } else if (lastPlay !== null) {
      // Streak broken
      streak.current = 1;
    } else {
      // First ever play
      streak.current = 1;
    }
    streak.todayPlays = 1;
    streak.lastPlayDate = today;
  }

  if (streak.current > streak.best) {
    streak.best = streak.current;
  }

  saveStreak(streak);
  return streak;
}

// Streak multiplier for XP
export function getStreakMultiplier() {
  const streak = loadStreak();
  if (streak.current >= 30) return 2.0;
  if (streak.current >= 14) return 1.8;
  if (streak.current >= 7) return 1.5;
  if (streak.current >= 3) return 1.3;
  if (streak.current >= 2) return 1.1;
  return 1.0;
}

// ── Player Level & Storage ──

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

// ── XP / Rank System ──
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
  { rank: 'Rookie',     minXP: 0,     icon: '\uD83E\uDD5A', color: '#9CA3AF' },
  { rank: 'Bronze',     minXP: 300,   icon: '\uD83E\uDD49', color: '#B45309' },
  { rank: 'Silver',     minXP: 1000,  icon: '\uD83E\uDD48', color: '#6B7280' },
  { rank: 'Gold',       minXP: 2500,  icon: '\uD83E\uDD47', color: '#D97706' },
  { rank: 'Platinum',   minXP: 5000,  icon: '\uD83D\uDC8E', color: '#7C3AED' },
  { rank: 'Diamond',    minXP: 10000, icon: '\uD83D\uDC51', color: '#2563EB' },
  { rank: 'Master',     minXP: 20000, icon: '\u2B50',        color: '#DC2626' },
  { rank: 'Legend',     minXP: 40000, icon: '\uD83C\uDF1F',  color: '#F59E0B' },
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

// ── Improved XP Calculation ──
// Base: correct answers × mastery bonus
// Accuracy bonus: high accuracy = more XP
// Combo bonus: max combo contributes
// Streak bonus: daily streak multiplier
// New word bonus: first time seeing a word = extra XP

export function calculateXP({ score, correctCount, wrongCount, missCount, maxCombo, newWordsLearned = 0 }) {
  const total = correctCount + wrongCount + missCount;
  const accuracy = total > 0 ? correctCount / total : 0;

  // Base XP from score
  let xp = Math.floor(score * 0.3);

  // Accuracy bonus (exponential reward for high accuracy)
  if (accuracy >= 1.0) xp += 100;      // Perfect
  else if (accuracy >= 0.9) xp += 60;  // Excellent
  else if (accuracy >= 0.8) xp += 30;  // Good
  else if (accuracy >= 0.6) xp += 10;  // OK

  // Combo bonus
  xp += maxCombo * 5;

  // New words bonus (first encounter)
  xp += newWordsLearned * 15;

  // Streak multiplier
  const streakMult = getStreakMultiplier();
  xp = Math.floor(xp * streakMult);

  return { xp, streakMult, accuracy };
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
    return true;
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
