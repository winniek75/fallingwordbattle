import { useState, useEffect, useRef, useCallback } from 'react';
import { LEVEL_INFO } from '../data/wordData';
import { recordResult, addXP, saveHighScore, logWrongAnswer, calculateXP, updateStreak, loadMastery, getWordMastery } from '../hooks/useWordStats';
import { playCorrectSound, playWrongSound } from '../utils/sound';
import { speak } from '../utils/speak';

const GAME_DURATION = 30;
const FALL_SPEED = 1.1;
const CHOICE_GAP = 70;
const DANGER_Y = 0.82; // fraction of area height

const LANE_COLORS = [
  ['#FF6B9D', '#FF8A5C', '#FFB347', '#FF6B6B'],
  ['#4ECDC4', '#45B7D1', '#A78BFA', '#7C83FF'],
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CONFETTI_COLORS = ['#FF6B9D', '#FFE66D', '#4ECDC4', '#A78BFA', '#FF8A5C', '#45B7D1'];

// Combo milestone config
const COMBO_MILESTONES = {
  3: { text: 'NICE!', emoji: '\u{1F44D}' },
  5: { text: 'GREAT!', emoji: '\u{1F525}' },
  7: { text: 'AMAZING!', emoji: '\u{1F31F}' },
  10: { text: 'UNSTOPPABLE!', emoji: '\u{1F680}' },
};

export default function Game({ session, levelKey, gameMode = 'normal', onEnd }) {
  const [phase, setPhase] = useState('playing');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [lanes, setLanes] = useState([null, null]);
  const [choices, setChoices] = useState([]);
  const [effects, setEffects] = useState([]);
  const [confettis, setConfettis] = useState([]);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [milestone, setMilestone] = useState(null);
  const [lives, setLives] = useState(3);

  const choiceIdC = useRef(0);
  const animRef = useRef(null);
  const lastTs = useRef(null);
  const timerRef = useRef(null);
  const areaRef = useRef(null);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const missRef = useRef(0);
  const maxComboRef = useRef(0);
  const phaseRef = useRef('playing');
  const livesRef = useRef(3);
  const gameModeRef = useRef(gameMode);
  const lanesRef = useRef([null, null]);
  const newWordsRef = useRef(0);

  // Adaptive difficulty: track recent 5 answers
  const recentAnswersRef = useRef([]); // array of booleans (true=correct, false=wrong/miss)
  const adaptiveMultiplierRef = useRef(1.0);

  // Word pool
  const poolRef = useRef([]);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { comboRef.current = combo; }, [combo]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { lanesRef.current = lanes; }, [lanes]);

  // Adaptive difficulty calculation
  const updateAdaptiveDifficulty = useCallback((isCorrect) => {
    const recent = recentAnswersRef.current;
    recent.push(isCorrect);
    if (recent.length > 5) recent.shift();

    if (recent.length >= 5) {
      const correctCount5 = recent.filter(Boolean).length;
      const accuracy5 = correctCount5 / recent.length;
      if (accuracy5 < 0.4) {
        // Struggling: slow down by 20%
        adaptiveMultiplierRef.current = 0.8;
      } else if (accuracy5 > 0.8) {
        // Doing great: speed up by 15%
        adaptiveMultiplierRef.current = 1.15;
      } else {
        adaptiveMultiplierRef.current = 1.0;
      }
    }
  }, []);

  const getNextWord = useCallback((excludeEnglish = null) => {
    if (!poolRef.current.length) {
      poolRef.current = shuffle([...session]);
    }
    let attempts = 0;
    while (attempts < poolRef.current.length) {
      if (!poolRef.current.length) break;
      const word = poolRef.current.shift();
      if (word.english !== excludeEnglish) return word;
      poolRef.current.push(word);
      attempts++;
    }
    return poolRef.current.shift() || session[0];
  }, [session]);

  const spawnLane = useCallback((laneIndex, excludeEnglish = null) => {
    const word = getNextWord(excludeEnglish);
    if (!word) return;

    const allChoices = shuffle([
      { text: word.correct, isCorrect: true },
      ...word.wrongs.map(w => ({ text: w, isCorrect: false })),
    ]);

    setLanes(prev => {
      const next = [...prev];
      next[laneIndex] = { english: word.english, word };
      return next;
    });

    const startY = -50;
    setChoices(prev => [
      ...prev.filter(c => c.laneIndex !== laneIndex),
      ...allChoices.map((c, i) => ({
        id: ++choiceIdC.current,
        laneIndex,
        text: c.text,
        isCorrect: c.isCorrect,
        y: startY - i * CHOICE_GAP,
        fadingOut: false,
        opacity: 1,
        word,
      })),
    ]);
  }, [getNextWord]);

  // Init
  useEffect(() => {
    poolRef.current = shuffle([...session]);
    spawnLane(0, null);
    setTimeout(() => spawnLane(1, null), 200);

    // Timer - only for normal mode
    if (gameModeRef.current === 'normal') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            endGame();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  const endGame = useCallback(() => {
    if (phaseRef.current === 'ended') return;
    phaseRef.current = 'ended';
    cancelAnimationFrame(animRef.current);
    clearInterval(timerRef.current);

    // Update daily streak
    const streak = updateStreak();

    // Calculate XP with new system
    const xpResult = calculateXP({
      score: scoreRef.current,
      correctCount: correctRef.current,
      wrongCount: wrongRef.current,
      missCount: missRef.current,
      maxCombo: maxComboRef.current,
      newWordsLearned: newWordsRef.current,
    });
    const earnedXP = xpResult.xp;
    const totalXP = addXP(earnedXP);

    // Save high score to localStorage
    const isNewHighScore = saveHighScore(levelKey, scoreRef.current);

    // Report game results to WiseXP
    const total = correctRef.current + wrongRef.current + missRef.current;
    const gradeRanks = [
      { rank: 'S', minScore: 3000 },
      { rank: 'A', minScore: 2000 },
      { rank: 'B', minScore: 1200 },
      { rank: 'C', minScore: 600 },
      { rank: 'D', minScore: 0 },
    ];
    const grade = (gradeRanks.find(r => scoreRef.current >= r.minScore) || { rank: 'D' }).rank;
    if (window.WiseXP) window.WiseXP.reportGame({ score: scoreRef.current, correct: correctRef.current, total, maxCombo: maxComboRef.current, grade });

    setTimeout(() => {
      onEnd({
        score: scoreRef.current,
        combo: comboRef.current,
        maxCombo: maxComboRef.current,
        correctCount: correctRef.current,
        wrongCount: wrongRef.current,
        missCount: missRef.current,
        earnedXP,
        totalXP,
        isNewHighScore,
        gameMode: gameModeRef.current,
        streak,
        streakMult: xpResult.streakMult,
        accuracy: xpResult.accuracy,
        newWordsLearned: newWordsRef.current,
      });
    }, 200);
  }, [onEnd, levelKey]);

  // Handle survival mode life loss
  const loseSurvivalLife = useCallback(() => {
    if (gameModeRef.current !== 'survival') return;
    const newLives = livesRef.current - 1;
    livesRef.current = newLives;
    setLives(newLives);
    if (newLives <= 0) {
      endGame();
    }
  }, [endGame]);

  // Game loop
  useEffect(() => {
    const loop = (ts) => {
      if (phaseRef.current === 'ended') return;
      if (!lastTs.current) lastTs.current = ts;
      const delta = Math.min(ts - lastTs.current, 50);
      lastTs.current = ts;

      // Adaptive difficulty applied to fall speed
      const baseSpeed = FALL_SPEED + scoreRef.current * 0.0003;
      const speed = baseSpeed * adaptiveMultiplierRef.current;
      const dy = speed * (delta / 16.67);

      const areaH = areaRef.current?.clientHeight || 500;
      const dangerY = areaH * DANGER_Y;

      setChoices(prev => {
        let next = prev.map(c => {
          if (c.fadingOut) {
            return { ...c, opacity: Math.max(0, c.opacity - 0.06) };
          }
          return { ...c, y: c.y + dy };
        });

        // Remove fully faded
        next = next.filter(c => !(c.fadingOut && c.opacity <= 0));

        // Check MISS: correct choice fell past danger zone
        const toMiss = [];
        for (const c of next) {
          if (!c.fadingOut && c.isCorrect && c.y > dangerY) {
            toMiss.push(c.laneIndex);
          }
        }

        for (const laneIdx of [...new Set(toMiss)]) {
          // fade out all in lane
          next = next.map(c => c.laneIndex === laneIdx ? { ...c, fadingOut: true, opacity: 0.8 } : c);
          // miss stat
          missRef.current += 1;
          setMissCount(m => m + 1);
          comboRef.current = 0;
          setCombo(0);
          shake();
          showEffect(`MISS!`, 'miss', laneIdx);

          // Adaptive: miss counts as wrong
          updateAdaptiveDifficulty(false);

          // Survival mode: lose a life on miss
          loseSurvivalLife();

          setTimeout(() => {
            if (phaseRef.current !== 'ended') {
              const other = lanesRef.current[1 - laneIdx];
              spawnLane(laneIdx, other?.english);
            }
          }, 500);
        }

        return next;
      });

      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [spawnLane, updateAdaptiveDifficulty, loseSurvivalLife]);

  const shake = () => {
    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 300);
  };

  const showEffect = (text, type, laneIndex) => {
    const id = Date.now() + Math.random();
    setEffects(prev => [...prev, { id, text, type, laneIndex }]);
    setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), 900);
  };

  // Show combo milestone overlay
  const showMilestone = useCallback((comboCount) => {
    const ms = COMBO_MILESTONES[comboCount];
    if (!ms) return;
    setMilestone(ms);
    setTimeout(() => setMilestone(null), 1500);
  }, []);

  const handleChoiceClick = useCallback((choice) => {
    if (choice.fadingOut) return;

    const { laneIndex, isCorrect, y, word } = choice;

    if (isCorrect) {
      // Track new words (first time correct)
      const prevMastery = getWordMastery(word.english);
      if (prevMastery === 0) newWordsRef.current += 1;

      // Record
      recordResult(word.english, true);

      // Sound effect + TTS pronunciation
      playCorrectSound();
      setTimeout(() => speak(word.english), 350);

      const areaH = areaRef.current?.clientHeight || 500;
      const speedBonus = Math.max(0, Math.floor((1 - y / areaH) * 80));
      const newCombo = comboRef.current + 1;
      const comboBonus = newCombo >= 10 ? 60 : newCombo >= 7 ? 40 : newCombo >= 5 ? 25 : newCombo >= 3 ? 10 : 0;
      // Mastery bonus: lower mastery words are worth more (encourages practicing weak words)
      const masteryLevel = getWordMastery(word.english);
      const masteryBonus = masteryLevel <= 1 ? 30 : masteryLevel <= 3 ? 10 : 0;
      const gained = 100 + speedBonus + comboBonus + masteryBonus;

      comboRef.current = newCombo;
      setCombo(newCombo);
      if (newCombo > maxComboRef.current) {
        maxComboRef.current = newCombo;
        setMaxCombo(newCombo);
      }
      scoreRef.current += gained;
      setScore(s => s + gained);
      correctRef.current += 1;
      setCorrectCount(c => c + 1);

      // Adaptive difficulty
      updateAdaptiveDifficulty(true);

      // Combo milestone check
      if (COMBO_MILESTONES[newCombo]) {
        showMilestone(newCombo);
      }

      showEffect(`+${gained}`, 'correct', laneIndex);

      // Confetti
      const ex = laneIndex === 0 ? 80 : 240;
      setConfettis(prev => [...prev, { id: Date.now(), x: ex, y: Math.max(50, y) }]);
      setTimeout(() => setConfettis(prev => prev.slice(1)), 800);

      // Fade out all in lane
      setChoices(prev => prev.map(c => c.laneIndex === laneIndex ? { ...c, fadingOut: true, opacity: 0.8 } : c));

      // Spawn next
      setTimeout(() => {
        if (phaseRef.current !== 'ended') {
          const other = lanesRef.current[1 - laneIndex];
          spawnLane(laneIndex, other?.english);
        }
      }, 500);

    } else {
      // Wrong
      recordResult(word.english, false);
      logWrongAnswer(word);

      // Sound effect + TTS pronunciation (so they learn the correct word)
      playWrongSound();
      setTimeout(() => speak(word.english), 250);

      wrongRef.current += 1;
      setWrongCount(w => w + 1);
      comboRef.current = 0;
      setCombo(0);
      shake();
      showEffect('\u274C', 'wrong', laneIndex);
      setChoices(prev => prev.map(c => c.id === choice.id ? { ...c, fadingOut: true } : c));

      // Adaptive difficulty
      updateAdaptiveDifficulty(false);

      // Survival mode: lose a life on wrong
      loseSurvivalLife();

      // Report wrong answer to WiseXP
      if (window.WiseXP) window.WiseXP.reportWrong({ question: word.english, correct: word.correct, playerAnswer: choice.text });
    }
  }, [spawnLane, updateAdaptiveDifficulty, showMilestone, loseSurvivalLife]);

  const levelInfo = levelKey === 'weak'
    ? { name: '\u82E6\u624B\u5358\u8A9E', icon: '\uD83D\uDD34', color: '#FF6B6B' }
    : LEVEL_INFO[levelKey] || {};

  const areaH = areaRef.current?.clientHeight || 500;
  const areaW = areaRef.current?.clientWidth || 350;
  const laneW = areaW / 2;

  const isSurvival = gameMode === 'survival';

  return (
    <div
      style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(135deg, #FFF5F7, #F5F0FF, #F0F8FF, #F0FFF4)',
        animation: shakeScreen ? 'shake 0.3s ease' : 'none',
        overflow: 'hidden',
      }}
    >
      {/* HUD */}
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', zIndex: 10 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#aaa', fontWeight: 700 }}>{'\uD83D\uDC8E'} SCORE</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#333', fontFamily: 'Fredoka One' }}>{score.toLocaleString()}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#aaa', fontWeight: 700 }}>{'\uD83D\uDD25'} COMBO</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: combo >= 5 ? '#FFD700' : '#333', fontFamily: 'Fredoka One',
            animation: combo >= 3 ? 'pulse 0.6s ease infinite' : 'none' }}>{combo}</div>
        </div>
        {isSurvival ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#aaa', fontWeight: 700 }}>{'\u2764\uFE0F'} LIVES</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: lives <= 1 ? '#FF6B6B' : '#FF6B9D', fontFamily: 'Fredoka One',
              animation: lives <= 1 ? 'pulse 0.5s ease infinite' : 'none' }}>
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} style={{ opacity: i < lives ? 1 : 0.2 }}>{'\u2764\uFE0F'}</span>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#aaa', fontWeight: 700 }}>{'\u23F1\uFE0F'} TIME</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: timeLeft <= 10 ? '#FF6B6B' : '#333', fontFamily: 'Fredoka One',
              animation: timeLeft <= 10 ? 'pulse 0.5s ease infinite' : 'none' }}>{timeLeft}</div>
          </div>
        )}
        <div style={{ fontSize: 13, color: levelInfo.color || '#999', fontWeight: 700 }}>
          {levelInfo.icon} {levelInfo.name}
          {isSurvival && <div style={{ fontSize: 10, color: '#FF8A5C' }}>SURVIVAL</div>}
        </div>
      </div>

      {/* Timer bar / Survival indicator */}
      {isSurvival ? (
        <div style={{ width: '100%', height: 5, background: '#F0F0F0' }}>
          <div style={{ height: '100%', width: `${(lives / 3) * 100}%`, background: lives <= 1 ? '#FF6B6B' : 'linear-gradient(90deg, #FF6B9D, #A78BFA)', transition: 'width 0.3s ease' }} />
        </div>
      ) : (
        <div style={{ width: '100%', height: 5, background: '#F0F0F0' }}>
          <div style={{ height: '100%', width: `${(timeLeft / GAME_DURATION) * 100}%`, background: timeLeft <= 10 ? '#FF6B6B' : 'linear-gradient(90deg, #4ECDC4, #45B7D1)', transition: 'width 0.9s linear, background 0.5s' }} />
        </div>
      )}

      {/* Lane headers */}
      <div style={{ display: 'flex', borderBottom: '2px solid rgba(0,0,0,0.06)' }}>
        {[0, 1].map(i => (
          <div key={i} style={{ flex: 1, padding: '10px 12px', background: i === 0 ? 'rgba(255,107,157,0.08)' : 'rgba(69,183,209,0.08)', borderRight: i === 0 ? '2px solid rgba(0,0,0,0.06)' : 'none', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: i === 0 ? '#FF6B9D' : '#45B7D1', fontWeight: 700, marginBottom: 2 }}>
              {i === 0 ? '\uD83D\uDC48 LEFT' : 'RIGHT \uD83D\uDC49'}
            </div>
            <div style={{ fontFamily: 'Fredoka One', fontSize: 20, color: '#333', minHeight: 28 }}>
              {lanes[i]?.english || '...'}
            </div>
          </div>
        ))}
      </div>

      {/* Game area */}
      <div ref={areaRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* Danger zone - just a line, no background so buttons stay visible */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: `${DANGER_Y * 100}%`, borderTop: '2px dashed rgba(255,107,107,0.5)', pointerEvents: 'none', zIndex: 5 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,107,107,0.7)', fontWeight: 700, paddingLeft: 8 }}>{'\u26A0\uFE0F'} DANGER</span>
        </div>

        {/* Lane divider */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'rgba(0,0,0,0.06)', pointerEvents: 'none' }} />

        {/* Choices */}
        {choices.map(c => (
          <button
            key={c.id}
            onClick={() => handleChoiceClick(c)}
            style={{
              position: 'absolute',
              left: c.laneIndex === 0 ? 8 : laneW + 8,
              width: laneW - 16,
              top: c.y,
              padding: '12px 8px',
              borderRadius: 14,
              border: 'none',
              background: LANE_COLORS[c.laneIndex][(c.id) % 4],
              color: 'white',
              fontFamily: 'Nunito',
              fontWeight: 800,
              fontSize: 15,
              opacity: c.opacity,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.28), 0 0 0 2px rgba(255,255,255,0.5)',
              transition: 'opacity 0.25s ease',
              zIndex: 10,
              minHeight: 44,
              textShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          >
            {c.text}
          </button>
        ))}

        {/* Effects */}
        {effects.map(e => (
          <div key={e.id} style={{
            position: 'absolute',
            left: e.laneIndex === 0 ? '25%' : '75%',
            top: '30%',
            transform: 'translateX(-50%)',
            fontWeight: 800,
            fontSize: e.type === 'miss' ? 18 : 22,
            color: e.type === 'correct' ? '#4ECDC4' : e.type === 'miss' ? '#FFB347' : '#FF6B6B',
            animation: 'fadeUp 0.9s ease forwards',
            pointerEvents: 'none',
            zIndex: 30,
            whiteSpace: 'nowrap',
            textShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>{e.text}</div>
        ))}

        {/* Confetti */}
        {confettis.map(cf => (
          <ConfettiBurst key={cf.id} x={cf.x} y={cf.y} />
        ))}

        {/* Combo display */}
        {combo >= 3 && (
          <div style={{
            position: 'absolute', left: '50%', top: '40%', transform: 'translateX(-50%)',
            fontFamily: 'Fredoka One', fontSize: 24,
            color: combo >= 7 ? '#FFD700' : '#FF8A5C',
            animation: 'comboIn 0.3s ease',
            pointerEvents: 'none', zIndex: 20,
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}>
            {'\uD83D\uDD25'} {combo} COMBO!
          </div>
        )}

        {/* Combo milestone overlay */}
        {milestone && (
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: 'Fredoka One',
            fontSize: 48,
            color: '#FFD700',
            textShadow: '0 4px 20px rgba(255,215,0,0.6), 0 0 40px rgba(255,215,0,0.3)',
            animation: 'milestoneIn 1.5s ease-out forwards',
            pointerEvents: 'none',
            zIndex: 50,
            whiteSpace: 'nowrap',
            textAlign: 'center',
            lineHeight: 1.3,
          }}>
            <div style={{ fontSize: 56 }}>{milestone.emoji}</div>
            {milestone.text}
          </div>
        )}
      </div>
    </div>
  );
}

function ConfettiBurst({ x, y }) {
  const particles = Array.from({ length: 10 }, (_, i) => ({
    angle: (i / 10) * Math.PI * 2 + Math.random() * 0.5,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 4 + Math.random() * 4,
    rotation: Math.random() * 360,
    anim: i % 4,
  }));

  return (
    <>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: x, top: y,
          width: p.size, height: p.size * 0.6,
          background: p.color, borderRadius: 2,
          transform: `rotate(${p.rotation}deg)`,
          animation: `confetti${p.anim} 0.7s ease-out forwards`,
          pointerEvents: 'none', zIndex: 40,
        }} />
      ))}
    </>
  );
}
