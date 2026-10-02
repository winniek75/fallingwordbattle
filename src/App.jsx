import { useState, useEffect } from 'react';
import PlayerSelect from './PlayerSelect';
import LevelSelect from './components/LevelSelect';
import PreGame from './components/PreGame';
import FlashInput from './components/FlashInput';
import Game from './components/Game';
import Result from './components/Result';
import MissReview from './components/MissReview';
import { LEVEL_INFO, buildSession, buildWeakSession } from './data/wordData';
import { loadPlayerLevel, savePlayerLevel, loadXP, getCurrentRank, getWeakWordCount, loadStats, updateStreak } from './hooks/useWordStats';

const GLOBAL_STYLES = `
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }
  @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
  @keyframes fadeUp { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-60px)} }
  @keyframes popIn { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
  @keyframes rankBounce { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
  @keyframes confetti0 { to{transform:translate(60px,-80px) rotate(400deg);opacity:0} }
  @keyframes confetti1 { to{transform:translate(-60px,-80px) rotate(-400deg);opacity:0} }
  @keyframes confetti2 { to{transform:translate(80px,40px) rotate(360deg);opacity:0} }
  @keyframes confetti3 { to{transform:translate(-80px,40px) rotate(-360deg);opacity:0} }
  @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
  @keyframes comboIn { 0%{opacity:0;transform:scale(0.6)} 60%{transform:scale(1.1)} 100%{opacity:1;transform:scale(1)} }
  @keyframes milestoneIn { 0%{opacity:0;transform:translate(-50%,-50%) scale(0)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.1)} 70%{transform:translate(-50%,-50%) scale(1)} 100%{opacity:0;transform:translate(-50%,-50%) scale(1)} }
  @keyframes perfectGlow { 0%,100%{text-shadow:0 0 20px #FFD700, 0 0 40px #FFD700, 0 0 60px #FFD700} 50%{text-shadow:0 0 30px #FFD700, 0 0 60px #FFD700, 0 0 90px #FFD700} }
`;

function injectGlobalStyles() {
  if (document.getElementById('fwb-global-styles')) return;
  const style = document.createElement('style');
  style.id = 'fwb-global-styles';
  style.textContent = GLOBAL_STYLES;
  document.head.appendChild(style);
}

// ── URLパラメータによる直接起動（ポータルの「今日の10分コース」などから） ──
//   ?grade=5|4|3|pre2|2|weak  級（level= でも可。eiken5 などの内部キーも可）
//   &mode=easy|normal|survival モード（easy = やさしい: 1レーン・ゆっくり・10語）
//   &count=5〜20               出題語数（省略時: easy は10語、ほかは12語）
//   &kana=1                    日本語をひらがな表示（5〜3級のみ有効）
//   &start=game                単語確認画面をとばしてすぐゲーム開始
const GRADE_ALIASES = {
  '5': 'eiken5', '4': 'eiken4', '3': 'eiken3', '2': 'eiken2',
  'pre2': 'eikenPre2', 'p2': 'eikenPre2', 'jun2': 'eikenPre2', '2.5': 'eikenPre2', '準2': 'eikenPre2',
  'weak': 'weak',
};
const MODE_ALIASES = {
  easy: 'easy', beginner: 'easy', practice: 'easy', yasashii: 'easy',
  normal: 'normal', battle: 'normal', survival: 'survival',
};

function readDeepLink() {
  try {
    const q = new URLSearchParams(window.location.search);
    const rawGrade = (q.get('grade') || q.get('level') || '').trim();
    const rawMode = (q.get('mode') || '').trim().toLowerCase();
    const rawCount = parseInt(q.get('count') || '', 10);
    let level = null;
    if (rawGrade) {
      const g = rawGrade.toLowerCase().replace(/^eiken/, '').replace(/級$/, '');
      level = GRADE_ALIASES[g] || (LEVEL_INFO[rawGrade] ? rawGrade : null);
    }
    return {
      level,
      mode: MODE_ALIASES[rawMode] || null,
      count: Number.isFinite(rawCount) ? Math.min(20, Math.max(5, rawCount)) : null,
      kana: ['1', 'true'].includes((q.get('kana') || '').toLowerCase()),
      startGame: (q.get('start') || '').toLowerCase() === 'game',
    };
  } catch {
    return { level: null, mode: null, count: null, kana: false, startGame: false };
  }
}

const defaultCount = (mode) => (mode === 'easy' ? 10 : 12);

export default function App() {
  const [phase, setPhase] = useState('playerSelect');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [session, setSession] = useState([]);
  const [resultData, setResultData] = useState(null);
  const [xp, setXp] = useState(0);
  const [currentPlayer, setCurrentPlayerState] = useState(null);
  const [useHiragana, setUseHiragana] = useState(false);
  const [gameMode, setGameMode] = useState('normal'); // 'normal' | 'survival' | 'easy'
  const [wordCount, setWordCount] = useState(null); // URLで指定された出題語数

  useEffect(() => {
    injectGlobalStyles();
    if (window.WiseXP) window.WiseXP.init('fallingwordbattle');
    // XP は端末共通の保存値（fwb_player_xp）が実際の値。player.stats.xp は更新されないので使わない。
    setXp(loadXP());
    let hasPlayer = false;
    try {
      const savedPlayerId = localStorage.getItem('fwb_current_player');
      if (savedPlayerId) {
        const players = JSON.parse(localStorage.getItem('fwb_players') || '[]');
        const player = players.find(p => p.id === savedPlayerId);
        if (player) {
          hasPlayer = true;
          setCurrentPlayerState(player);
          setPhase('levelSelect');
        }
      }
    } catch (e) {}

    // ディープリンク: プレイヤー未作成でもゲストとしてそのまま開く
    const link = readDeepLink();
    if (link.mode) setGameMode(link.mode);
    if (link.count) setWordCount(link.count);
    if (link.kana) setUseHiragana(true);
    if (link.level || link.mode) {
      setPhase('levelSelect');
      if (link.level) {
        const mode = link.mode || 'normal';
        const count = link.count || defaultCount(mode);
        const words = link.level === 'weak'
          ? buildWeakSession(loadStats(), count)
          : buildSession(link.level, count, link.kana);
        if (words.length) {
          setSelectedLevel(link.level);
          setSession(words);
          setPhase(link.startGame ? 'game' : 'preGame');
        }
      }
    }
  }, []);

  const handleSelectPlayer = (player) => {
    setCurrentPlayerState(player);
    localStorage.setItem('fwb_current_player', player.id);
    setXp(loadXP());
  };

  // ゲスト体験: プレイヤーを作らずにそのまま遊ぶ（currentPlayer = null）
  const handleGuestStart = () => {
    setCurrentPlayerState(null);
    setXp(loadXP());
    setPhase('levelSelect');
  };

  const handleStartGame = (player) => {
    handleSelectPlayer(player);
    setPhase('levelSelect');
  };

  const handleChangePlayer = () => {
    setPhase('playerSelect');
  };

  const handleLevelSelect = (levelKey) => {
    const count = wordCount || defaultCount(gameMode);
    const words = levelKey === 'weak'
      ? buildWeakSession(loadStats(), count)
      : buildSession(levelKey, count, useHiragana);
    if (!words.length) return;
    setSelectedLevel(levelKey);
    setSession(words);
    if (levelKey !== 'weak') savePlayerLevel(levelKey);
    setPhase('preGame');
  };

  const handleBackToMenu = () => {
    setXp(loadXP());
    setPhase('levelSelect');
  };

  const levelInfo = selectedLevel === 'weak'
    ? { key: 'weak', name: '苦手単語', icon: '🔴', color: '#FF6B6B' }
    : LEVEL_INFO[selectedLevel] || {};

  return (
    <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden', position: 'relative' }}>
      {phase === 'playerSelect' && (
        <PlayerSelect
          onSelectPlayer={handleSelectPlayer}
          onStartGame={handleStartGame}
          onGuest={handleGuestStart}
        />
      )}
      {phase === 'levelSelect' && (
        <LevelSelect
          onSelect={handleLevelSelect}
          xp={xp}
          currentRank={getCurrentRank(xp)}
          weakCount={getWeakWordCount()}
          currentPlayer={currentPlayer}
          onChangePlayer={handleChangePlayer}
          useHiragana={useHiragana}
          setUseHiragana={setUseHiragana}
          gameMode={gameMode}
          setGameMode={setGameMode}
        />
      )}
      {phase === 'preGame' && (
        <PreGame
          words={session}
          levelInfo={levelInfo}
          gameMode={gameMode}
          onStartFlash={() => setPhase('flashInput')}
          onStartBattle={() => setPhase('game')}
          onBack={() => setPhase('levelSelect')}
        />
      )}
      {phase === 'flashInput' && (
        <FlashInput
          words={session}
          onComplete={() => setPhase('game')}
          onSkip={() => setPhase('game')}
          onBack={() => setPhase('preGame')}
        />
      )}
      {phase === 'game' && (
        <Game
          session={session}
          levelKey={selectedLevel}
          gameMode={gameMode}
          onEnd={(data) => { setResultData(data); setXp(loadXP()); setPhase('result'); }}
          onBack={handleBackToMenu}
          currentPlayer={currentPlayer}
          useHiragana={useHiragana}
        />
      )}
      {phase === 'result' && (
        <Result
          data={resultData}
          levelKey={selectedLevel}
          levelInfo={levelInfo}
          onRetry={() => setPhase('game')}
          onReLearn={() => setPhase('preGame')}
          onReFlash={() => setPhase('flashInput')}
          onMenu={handleBackToMenu}
          onMissReview={() => setPhase('missReview')}
          xp={xp}
          rank={getCurrentRank(xp)}
        />
      )}
      {phase === 'missReview' && (
        <MissReview
          words={resultData?.missedWords || []}
          onDone={(summary) => { setResultData(d => ({ ...d, missReview: summary })); setPhase('result'); }}
        />
      )}
    </div>
  );
}
