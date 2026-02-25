import { useState, useEffect } from 'react';
import { LEVEL_INFO } from './wordData';
import { getCurrentRank, getNextRank, loadXP, XP_RANKS } from './useWordStats';

const BG = 'linear-gradient(135deg, #FFF5F7 0%, #F5F0FF 35%, #F0F8FF 70%, #F0FFF4 100%)';

function FloatingBubble({ style }) {
  return (
    <div style={{
      position: 'absolute', borderRadius: '50%', opacity: 0.18,
      animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
      animationDelay: `${Math.random() * 2}s`,
      pointerEvents: 'none',
      ...style,
    }} />
  );
}

const BUBBLES = [
  { width: 80, height: 80, background: '#FF6B9D', left: '5%', top: '10%' },
  { width: 50, height: 50, background: '#45B7D1', left: '85%', top: '15%' },
  { width: 70, height: 70, background: '#A78BFA', left: '15%', top: '75%' },
  { width: 40, height: 40, background: '#4ECDC4', left: '80%', top: '70%' },
  { width: 60, height: 60, background: '#FFB347', left: '50%', top: '5%' },
  { width: 45, height: 45, background: '#FF8A5C', left: '60%', top: '85%' },
  { width: 55, height: 55, background: '#96E6A1', left: '30%', top: '85%' },
  { width: 35, height: 35, background: '#FFD700', left: '90%', top: '45%' },
];

const LEVEL_RULES = [
  { icon: '👈👉', text: '画面を左右2レーンに分割して同時に2問！' },
  { icon: '⬇️', text: '日本語訳が上から落ちてくる — タップで回答！' },
  { icon: '✅', text: '正解すると次の問題がすぐ出現' },
  { icon: '🔥', text: '連続正解でコンボボーナス獲得！' },
  { icon: '⏱️', text: '30秒間でどれだけ正解できるか？' },
];

export default function LevelSelect({ onSelect, xp, currentRank, weakCount, currentPlayer, onChangePlayer, useHiragana, setUseHiragana }) {
  const [hoveredLevel, setHoveredLevel] = useState(null);
  const [showRoadmap, setShowRoadmap] = useState(false);

  const xpForNext = getNextRank(xp);
  const progressPct = xpForNext
    ? Math.min(100, ((xp - currentRank.minXP) / (xpForNext.minXP - currentRank.minXP)) * 100)
    : 100;

  return (
    <div style={{ width: '100%', height: '100%', background: BG, display: 'flex', flexDirection: 'column', overflowY: 'auto', position: 'relative' }}>
      {BUBBLES.map((b, i) => <FloatingBubble key={i} style={b} />)}

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 40px', gap: 16, maxWidth: 480, margin: '0 auto', width: '100%' }}>

        {/* Player Badge */}
        {currentPlayer && (
          <div style={{
            position: 'absolute',
            top: 10,
            right: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.95)',
            padding: '8px 12px',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onClick={onChangePlayer}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
          >
            <div style={{ fontSize: 24 }}>{currentPlayer.avatar.icon}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>
                {currentPlayer.name}
              </div>
              <div style={{ fontSize: 10, color: '#666' }}>
                切り替え →
              </div>
            </div>
          </div>
        )}

        {/* Title */}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <div style={{ fontFamily: 'Fredoka One', fontSize: 32, background: 'linear-gradient(90deg,#FF6B9D,#A78BFA,#45B7D1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            英単語バトル ⚔️
          </div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>Falling Word Battle</div>
        </div>

        {/* XP / Rank card */}
        <div style={{ width: '100%', background: 'white', borderRadius: 18, padding: '14px 18px', boxShadow: '0 4px 18px rgba(0,0,0,0.08)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ fontSize: 32 }}>{currentRank.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: 15, color: currentRank.color }}>{currentRank.rank}</span>
              <span style={{ fontSize: 12, color: '#999' }}>{xp.toLocaleString()} XP</span>
            </div>
            <div style={{ width: '100%', height: 8, background: '#F0F0F0', borderRadius: 8, marginTop: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: `linear-gradient(90deg, ${currentRank.color}, ${xpForNext?.color || currentRank.color})`, borderRadius: 8, transition: 'width 0.5s ease' }} />
            </div>
            {xpForNext && (
              <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>
                次のランク: {xpForNext.icon} {xpForNext.rank} まで {(xpForNext.minXP - xp).toLocaleString()} XP
              </div>
            )}
          </div>
        </div>

        {/* Hiragana/Kanji Toggle */}
        <div style={{
          width: '100%',
          background: 'white',
          borderRadius: 16,
          padding: '12px 16px',
          boxShadow: '0 3px 12px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#555' }}>
            📝 表示モード（5級〜3級）
          </div>
          <button
            onClick={() => setUseHiragana(!useHiragana)}
            style={{
              padding: '8px 16px',
              background: useHiragana
                ? 'linear-gradient(135deg, #4ECDC4, #44A8C0)'
                : 'linear-gradient(135deg, #FF8A5C, #FF6B6B)',
              border: 'none',
              borderRadius: 10,
              color: 'white',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          >
            {useHiragana ? '🔤 ひらがな' : '📖 漢字まじり'}
          </button>
        </div>

        {/* Level selection */}
        <div style={{ width: '100%' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#999', letterSpacing: 1, marginBottom: 8 }}>📚 レベルを選択</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(LEVEL_INFO).map(([key, info]) => (
              <button
                key={key}
                onClick={() => onSelect(key)}
                onMouseEnter={() => setHoveredLevel(key)}
                onMouseLeave={() => setHoveredLevel(null)}
                style={{
                  width: '100%', border: 'none', borderRadius: 16, padding: '14px 18px',
                  background: hoveredLevel === key ? info.color : 'white',
                  boxShadow: hoveredLevel === key ? `0 6px 20px ${info.color}60` : '0 3px 12px rgba(0,0,0,0.08)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
                  transform: hoveredLevel === key ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.18s ease',
                }}
              >
                <div style={{ fontSize: 28 }}>{info.icon}</div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: hoveredLevel === key ? 'white' : '#333' }}>{info.name}</div>
                  <div style={{ fontSize: 12, color: hoveredLevel === key ? 'rgba(255,255,255,0.85)' : '#999' }}>
                    {info.level}  ·  CEFR {info.cefr}
                  </div>
                </div>
                <div style={{ fontSize: 18, color: hoveredLevel === key ? 'white' : '#ccc' }}>›</div>
              </button>
            ))}

            {/* Weak words mode */}
            <button
              onClick={() => weakCount > 0 && onSelect('weak')}
              onMouseEnter={() => setHoveredLevel('weak')}
              onMouseLeave={() => setHoveredLevel(null)}
              style={{
                width: '100%', border: weakCount > 0 ? 'none' : '2px dashed #ddd', borderRadius: 16, padding: '14px 18px',
                background: hoveredLevel === 'weak' && weakCount > 0 ? '#FF6B6B' : weakCount > 0 ? 'white' : '#fafafa',
                boxShadow: hoveredLevel === 'weak' && weakCount > 0 ? '0 6px 20px rgba(255,107,107,0.4)' : weakCount > 0 ? '0 3px 12px rgba(0,0,0,0.08)' : 'none',
                cursor: weakCount > 0 ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: 14,
                transform: hoveredLevel === 'weak' && weakCount > 0 ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.18s ease', opacity: weakCount > 0 ? 1 : 0.6,
              }}
            >
              <div style={{ fontSize: 28 }}>🔴</div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: hoveredLevel === 'weak' && weakCount > 0 ? 'white' : '#333' }}>
                  苦手単語モード
                </div>
                <div style={{ fontSize: 12, color: hoveredLevel === 'weak' && weakCount > 0 ? 'rgba(255,255,255,0.85)' : '#999' }}>
                  {weakCount > 0 ? `${weakCount}語の苦手単語を集中練習！` : 'プレイ後に解放されます'}
                </div>
              </div>
              {weakCount > 0 && (
                <div style={{ background: hoveredLevel === 'weak' ? 'rgba(255,255,255,0.3)' : '#FF6B6B', color: 'white', borderRadius: 12, padding: '3px 10px', fontSize: 13, fontWeight: 800,
                }}>
                  {weakCount}語
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Rules */}
        <div style={{ width: '100%', background: 'white', borderRadius: 18, padding: '14px 18px', boxShadow: '0 3px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#555', marginBottom: 10 }}>📖 ルール</div>
          {LEVEL_RULES.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6 }}>
              <span style={{ fontSize: 16 }}>{r.icon}</span>
              <span style={{ fontSize: 13, color: '#666', lineHeight: 1.4 }}>{r.text}</span>
            </div>
          ))}
        </div>

        {/* Roadmap button */}
        <button
          onClick={() => setShowRoadmap(!showRoadmap)}
          style={{ background: 'none', border: '2px solid #E5E7EB', borderRadius: 12, padding: '10px 20px', cursor: 'pointer', fontSize: 13, color: '#888', fontWeight: 700, width: '100%' }}
        >
          🗺️ 今後の機能ロードマップ {showRoadmap ? '▲' : '▼'}
        </button>

        {showRoadmap && <Roadmap />}
      </div>
    </div>
  );
}

function Roadmap() {
  const phases = [
    {
      phase: 'Phase 1 ✅ 現在',
      color: '#4ECDC4',
      items: ['レベル別出題（英検5〜2級）', '苦手単語モード', 'スコア・コンボシステム', 'XPランクシステム（土台）'],
    },
    {
      phase: 'Phase 2 🚧 近日実装',
      color: '#FFB347',
      items: ['XPでランクアップ表示', '間隔反復（SRS）アルゴリズム', '単語習得率トラッキング', 'ロードマップ進捗UI'],
    },
    {
      phase: 'Phase 3 🔮 予定',
      color: '#A78BFA',
      items: ['マルチプレイ対戦（WebSocket）', 'デイリー/ウィークリーランキング', 'バッジ・実績システム', 'フレンド機能'],
    },
  ];
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {phases.map((p) => (
        <div key={p.phase} style={{ background: 'white', borderRadius: 16, padding: '14px 16px', boxShadow: '0 3px 12px rgba(0,0,0,0.07)', borderLeft: `4px solid ${p.color}` }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: p.color, marginBottom: 8 }}>{p.phase}</div>
          {p.items.map((item, i) => (
            <div key={i} style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>・{item}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
