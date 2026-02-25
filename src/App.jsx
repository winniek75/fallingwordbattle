import { useState, useEffect } from 'react';
import PlayerSelect from './PlayerSelect';
import LevelSelect from './components/LevelSelect';
import PreGame from './components/PreGame';
import FlashInput from './components/FlashInput';
import Game from './components/Game';
import Result from './components/Result';
import { LEVEL_INFO, buildSession, buildWeakSession } from './data/wordData';
import { loadPlayerLevel, savePlayerLevel, loadXP, getCurrentRank, getWeakWordCount, loadStats, setCurrentPlayer } from './hooks/useWordStats';

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
`;

function injectGlobalStyles() {
  if (document.getElementById('fwb-global-styles')) return;
  const style = document.createElement('style');
  style.id = 'fwb-global-styles';
  style.textContent = GLOBAL_STYLES;
  document.head.appendChild(style);
}

export default function App() {
  const [phase, setPhase] = useState('playerSelect');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [session, setSession] = useState([]);
  const [resultData, setResultData] = useState(null);
  const [xp, setXp] = useState(0);
  const [currentPlayer, setCurrentPlayerState] = useState(null);
  const [useHiragana, setUseHiragana] = useState(false);

  useEffect(() => {
    injectGlobalStyles();
    const savedPlayerId = localStorage.getItem('fwb_current_player');
    if (savedPlayerId) {
      const players = JSON.parse(localStorage.getItem('fwb_players') || '[]');
      const player = players.find(p => p.id === savedPlayerId);
      if (player) {
        setCurrentPlayerState(player);
        setCurrentPlayer(player.id);
        setXp(player.stats?.xp || 0);
        setPhase('levelSelect');
      }
    }
  }, []);

  const handleSelectPlayer = (player) => {
    setCurrentPlayerState(player);
    setCurrentPlayer(player.id);
    setXp(player.stats?.xp || 0);
  };

  const handleStartGame = (player) => {
    handleSelectPlayer(player);
    setPhase('levelSelect');
  };

  const handleChangePlayer = () => {
    setPhase('playerSelect');
  };

  const handleLevelSelect = (levelKey) => {
    const words = levelKey === 'weak'
      ? buildWeakSession(loadStats(), 12)
      : buildSession(levelKey, 12, useHiragana);
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
        />
      )}
      {phase === 'preGame' && (
        <PreGame
          words={session}
          levelInfo={levelInfo}
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
        />
      )}
      {phase === 'game' && (
        <Game
          session={session}
          levelKey={selectedLevel}
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
          xp={xp}
          rank={getCurrentRank(xp)}
        />
      )}
    </div>
  );
}
