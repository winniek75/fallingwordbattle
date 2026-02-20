// useWordStats — 苦手単語トラッキング (localStorage) with multi-player support
let currentPlayerId = null;

export function setCurrentPlayer(playerId) {
  currentPlayerId = playerId;
}

export function getCurrentPlayer() {
  if (!currentPlayerId) {
    currentPlayerId = localStorage.getItem('fwb_current_player');
  }
  return currentPlayerId;
}

function getPlayerData() {
  const playerId = getCurrentPlayer();
  if (!playerId) return null;

  const players = JSON.parse(localStorage.getItem('fwb_players') || '[]');
  return players.find(p => p.id === playerId);
}

function updatePlayerData(updates) {
  const playerId = getCurrentPlayer();
  if (!playerId) return;

  const players = JSON.parse(localStorage.getItem('fwb_players') || '[]');
  const playerIndex = players.findIndex(p => p.id === playerId);

  if (playerIndex !== -1) {
    players[playerIndex] = { ...players[playerIndex], ...updates };
    localStorage.setItem('fwb_players', JSON.stringify(players));
  }
}

export function loadStats() {
  const player = getPlayerData();
  return player?.stats?.wordStats || {};
}

export function saveStats(stats) {
  const player = getPlayerData();
  if (player) {
    updatePlayerData({
      stats: { ...player.stats, wordStats: stats }
    });
  }
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
  const player = getPlayerData();
  return player?.stats?.playerLevel || null;
}

export function savePlayerLevel(levelKey) {
  const player = getPlayerData();
  if (player) {
    updatePlayerData({
      stats: { ...player.stats, playerLevel: levelKey }
    });
  }
}

export function getWeakWordCount() {
  const stats = loadStats();
  return Object.values(stats).filter(s => s.wrongCount > 0).length;
}

// XP / ランクシステム（Phase 2実装用の土台）
export function loadXP() {
  const player = getPlayerData();
  return player?.stats?.xp || 0;
}

export function addXP(amount) {
  const player = getPlayerData();
  if (player) {
    const newXP = (player.stats?.xp || 0) + amount;
    updatePlayerData({
      stats: { ...player.stats, xp: newXP }
    });
    return newXP;
  }
  return 0;
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
