import { useState, useEffect } from 'react';
import PlayerSelect from './PlayerSelect';
import LevelSelect from './LevelSelect';
import Game from './Game';
import Result from './Result';
import { LEVEL_INFO } from './wordData';
import { loadPlayerLevel, savePlayerLevel, loadXP, getCurrentRank, getWeakWordCount, setCurrentPlayer } from './useWordStats';

// CSS keyframes injected globally
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
  @keyframes missAnim { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-30px)} }
  @keyframes timerFlash { 0%,100%{background:rgba(255,107,107,0.3)} 50%{background:rgba(255,107,107,0.7)} }
`;

function injectGlobalStyles() {
  if (document.getElementById('fwb-global-styles')) return;
  const style = document.createElement('style');
  style.id = 'fwb-global-styles';
  style.textContent = GLOBAL_STYLES;
  document.head.appendChild(style);
}

export default function App() {
  const [phase, setPhase] = useState('playerSelect'); // playerSelect | levelSelect | playing | result
  const [selectedLevel, setSelectedLevel] = useState(null); // levelKey or 'weak'
  const [resultData, setResultData] = useState(null);
  const [currentPlayer, setCurrentPlayerState] = useState(null);
  const [xp, setXp] = useState(0);
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

  const handleLevelSelect = (levelKey) => {
    setSelectedLevel(levelKey);
    if (levelKey !== 'weak') savePlayerLevel(levelKey);
    setPhase('playing');
  };

  const handleGameEnd = (data) => {
    setResultData(data);
    setXp(loadXP());
    setPhase('result');
  };

  const handleRetry = () => {
    setPhase('playing');
  };

  const handleBackToMenu = () => {
    setXp(loadXP());
    setPhase('levelSelect');
  };

  const handleChangePlayer = () => {
    setPhase('playerSelect');
  };

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
      {phase === 'playing' && (
        <Game
          levelKey={selectedLevel}
          onEnd={handleGameEnd}
          onBack={handleBackToMenu}
          currentPlayer={currentPlayer}
          useHiragana={useHiragana}
        />
      )}
      {phase === 'result' && (
        <Result
          data={resultData}
          levelKey={selectedLevel}
          onRetry={handleRetry}
          onMenu={handleBackToMenu}
          xp={xp}
          rank={getCurrentRank(xp)}
          currentPlayer={currentPlayer}
        />
      )}
    </div>
  );
}
