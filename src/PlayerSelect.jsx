import { useState, useEffect } from 'react';

const PLAYER_AVATARS = [
  { id: 'cat', icon: '🐱', name: 'ネコ', color: '#FF6B9D' },
  { id: 'dog', icon: '🐶', name: 'イヌ', color: '#4ECDC4' },
  { id: 'rabbit', icon: '🐰', name: 'ウサギ', color: '#95E1D3' },
  { id: 'bear', icon: '🐻', name: 'クマ', color: '#FFA07A' },
  { id: 'panda', icon: '🐼', name: 'パンダ', color: '#7C7C7C' },
  { id: 'fox', icon: '🦊', name: 'キツネ', color: '#FF8C42' },
  { id: 'lion', icon: '🦁', name: 'ライオン', color: '#FFD700' },
  { id: 'tiger', icon: '🐯', name: 'トラ', color: '#FF6347' },
  { id: 'monkey', icon: '🐵', name: 'サル', color: '#CD853F' },
  { id: 'penguin', icon: '🐧', name: 'ペンギン', color: '#87CEEB' },
  { id: 'chick', icon: '🐥', name: 'ヒヨコ', color: '#FFE135' },
  { id: 'pig', icon: '🐷', name: 'ブタ', color: '#FFB6C1' },
];

function loadPlayers() {
  const stored = localStorage.getItem('fwb_players');
  return stored ? JSON.parse(stored) : [];
}

function savePlayers(players) {
  localStorage.setItem('fwb_players', JSON.stringify(players));
}

function loadCurrentPlayer() {
  return localStorage.getItem('fwb_current_player') || null;
}

function saveCurrentPlayer(playerId) {
  localStorage.setItem('fwb_current_player', playerId);
}

export default function PlayerSelect({ onSelectPlayer, onStartGame }) {
  const [players, setPlayers] = useState([]);
  const [showNewPlayer, setShowNewPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PLAYER_AVATARS[0]);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);

  useEffect(() => {
    const loadedPlayers = loadPlayers();
    setPlayers(loadedPlayers);
    const currentId = loadCurrentPlayer();
    setCurrentPlayerId(currentId);
  }, []);

  const createPlayer = () => {
    if (!newPlayerName.trim()) return;

    const newPlayer = {
      id: Date.now().toString(),
      name: newPlayerName.trim(),
      avatar: selectedAvatar,
      createdAt: Date.now(),
      stats: {
        playerLevel: 1,
        xp: 0,
        wordStats: {}
      }
    };

    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    savePlayers(updatedPlayers);
    setNewPlayerName('');
    setShowNewPlayer(false);
    selectPlayer(newPlayer);
  };

  const selectPlayer = (player) => {
    setCurrentPlayerId(player.id);
    saveCurrentPlayer(player.id);
    onSelectPlayer(player);
  };

  const deletePlayer = (playerId) => {
    const updatedPlayers = players.filter(p => p.id !== playerId);
    setPlayers(updatedPlayers);
    savePlayers(updatedPlayers);
    if (currentPlayerId === playerId) {
      setCurrentPlayerId(null);
      saveCurrentPlayer(null);
    }
  };

  const currentPlayer = players.find(p => p.id === currentPlayerId);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      overflow: 'auto'
    }}>
      <h1 style={{
        fontSize: 32,
        fontWeight: 800,
        color: 'white',
        marginBottom: 20,
        textShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        プレイヤーを選ぶ
      </h1>

      {/* Current Player Display */}
      {currentPlayer && (
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 20,
          padding: '16px 24px',
          marginBottom: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 15
        }}>
          <div style={{ fontSize: 40 }}>{currentPlayer.avatar.icon}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#333' }}>
              {currentPlayer.name}
            </div>
            <div style={{ fontSize: 13, color: '#666' }}>
              レベル {currentPlayer.stats.playerLevel} | {currentPlayer.stats.xp} XP
            </div>
          </div>
          <button
            onClick={() => onStartGame(currentPlayer)}
            style={{
              marginLeft: 20,
              padding: '12px 24px',
              background: `linear-gradient(135deg, ${currentPlayer.avatar.color}, ${currentPlayer.avatar.color}dd)`,
              border: 'none',
              borderRadius: 12,
              color: 'white',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          >
            ゲームを始める →
          </button>
        </div>
      )}

      {/* Player List */}
      <div style={{
        width: '100%',
        maxWidth: 600,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 20,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 15
        }}>
          <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>
            プレイヤー一覧
          </h2>
          <button
            onClick={() => setShowNewPlayer(true)}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #FF6B9D, #FFA07A)',
              border: 'none',
              borderRadius: 12,
              color: 'white',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            + 新しいプレイヤー
          </button>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {players.map(player => (
            <div
              key={player.id}
              style={{
                background: player.id === currentPlayerId
                  ? 'rgba(255,255,255,0.95)'
                  : 'rgba(255,255,255,0.85)',
                borderRadius: 16,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: player.id === currentPlayerId
                  ? `3px solid ${player.avatar.color}`
                  : '3px solid transparent'
              }}
              onClick={() => selectPlayer(player)}
              onMouseEnter={e => {
                if (player.id !== currentPlayerId) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
                }
              }}
              onMouseLeave={e => {
                if (player.id !== currentPlayerId) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.85)';
                }
              }}
            >
              <div style={{ fontSize: 32 }}>{player.avatar.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>
                  {player.name}
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  レベル {player.stats.playerLevel} | {player.stats.xp} XP
                </div>
              </div>
              {player.id === currentPlayerId && (
                <div style={{
                  background: player.avatar.color,
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  選択中
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`${player.name}を削除しますか？`)) {
                    deletePlayer(player.id);
                  }
                }}
                style={{
                  padding: '6px 10px',
                  background: '#FF6B6B',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: 0.8,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.target.style.opacity = '1'}
                onMouseLeave={e => e.target.style.opacity = '0.8'}
              >
                削除
              </button>
            </div>
          ))}
        </div>

        {players.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 40,
            color: 'rgba(255,255,255,0.7)',
            fontSize: 14
          }}>
            まだプレイヤーがいません
          </div>
        )}
      </div>

      {/* New Player Modal */}
      {showNewPlayer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 24,
            padding: 30,
            width: '90%',
            maxWidth: 400,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#333',
              marginBottom: 20,
              textAlign: 'center'
            }}>
              新しいプレイヤー
            </h3>

            <input
              type="text"
              value={newPlayerName}
              onChange={e => setNewPlayerName(e.target.value)}
              placeholder="名前を入力"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 16,
                border: '2px solid #E5E7EB',
                borderRadius: 12,
                marginBottom: 20,
                outline: 'none'
              }}
              autoFocus
              onKeyPress={e => e.key === 'Enter' && createPlayer()}
            />

            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#666',
                marginBottom: 10
              }}>
                キャラクターを選ぶ
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: 8
              }}>
                {PLAYER_AVATARS.map(avatar => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar)}
                    style={{
                      padding: 8,
                      background: selectedAvatar.id === avatar.id
                        ? avatar.color
                        : 'white',
                      border: `2px solid ${avatar.color}`,
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: 24
                    }}
                    onMouseEnter={e => {
                      if (selectedAvatar.id !== avatar.id) {
                        e.target.style.background = `${avatar.color}22`;
                      }
                    }}
                    onMouseLeave={e => {
                      if (selectedAvatar.id !== avatar.id) {
                        e.target.style.background = 'white';
                      }
                    }}
                  >
                    {avatar.icon}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: 10
            }}>
              <button
                onClick={() => {
                  setShowNewPlayer(false);
                  setNewPlayerName('');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#E5E7EB',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#666',
                  cursor: 'pointer'
                }}
              >
                キャンセル
              </button>
              <button
                onClick={createPlayer}
                disabled={!newPlayerName.trim()}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: newPlayerName.trim()
                    ? `linear-gradient(135deg, ${selectedAvatar.color}, ${selectedAvatar.color}dd)`
                    : '#ccc',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'white',
                  cursor: newPlayerName.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: newPlayerName.trim()
                    ? '0 4px 12px rgba(0,0,0,0.2)'
                    : 'none'
                }}
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}