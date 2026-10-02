import { useState, useMemo } from 'react';
import { recordResult, logWrongAnswer } from '../hooks/useWordStats';
import { playCorrectSound, playWrongSound } from '../utils/sound';
import { speak } from '../utils/speak';

// 時間切れ（取り逃し）になった語を、時間制限なしでたしかめる画面。
// ここで正しく選べた語は「知っていた」、まちがえた語だけを苦手単語として記録する。
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MissReview({ words, onDone }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null); // えらんだ選択肢
  const [okCount, setOkCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const word = words[idx];
  const options = useMemo(
    () => (word ? shuffle([word.correct, ...word.wrongs]) : []),
    [word]
  );

  const choose = (text) => {
    if (picked !== null) return;
    setPicked(text);
    const isCorrect = text === word.correct;
    recordResult(word.english, isCorrect);
    if (isCorrect) {
      playCorrectSound();
      setOkCount(c => c + 1);
    } else {
      playWrongSound();
      logWrongAnswer(word);
      if (window.WiseXP) window.WiseXP.reportWrong({ question: word.english, correct: word.correct, playerAnswer: text });
    }
    setTimeout(() => speak(word.english), 300);
  };

  const next = () => {
    setPicked(null);
    if (idx >= words.length - 1) setFinished(true);
    else setIdx(i => i + 1);
  };

  const wrap = {
    width: '100%', height: '100%', overflowY: 'auto',
    background: 'linear-gradient(135deg, #FFF5F7, #F5F0FF, #F0F8FF, #F0FFF4)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '20px 16px', boxSizing: 'border-box', fontFamily: 'Nunito, sans-serif',
  };
  const card = {
    width: '100%', maxWidth: 480, background: 'white', borderRadius: 20,
    padding: '20px 18px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', textAlign: 'center',
    margin: 'auto 0',
  };

  if (finished || !word) {
    return (
      <div style={wrap}>
        <div style={card}>
          <div style={{ fontSize: 44 }}>{okCount === words.length ? '🎉' : '👍'}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#333', margin: '8px 0' }}>
            {words.length}語のうち {okCount}語 せいかい！
          </div>
          <div style={{ fontSize: 13, color: '#777', lineHeight: 1.7, marginBottom: 16 }}>
            {okCount === words.length
              ? 'いみは わかっていたね。あとは スピードになれるだけ！'
              : 'まちがえた単語だけ「苦手単語」に入れました。'}
          </div>
          <button onClick={() => onDone({ okCount, total: words.length })} style={{
            width: '100%', padding: 14, borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #FF6B9D, #A78BFA)',
            color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer',
          }}>
            けっかに もどる
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#FFB347', marginBottom: 4 }}>
          ⏳ じかんせいげんなしで たしかめよう（{idx + 1}/{words.length}）
        </div>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>ゆっくり かんがえて だいじょうぶ</div>
        <button onClick={() => speak(word.english)} style={{
          border: 'none', background: 'none', cursor: 'pointer',
          fontFamily: 'Fredoka One', fontSize: 'clamp(30px, 9vw, 44px)', color: '#333', marginBottom: 14,
        }}>
          {word.english} <span style={{ fontSize: 20 }}>🔊</span>
        </button>
        <div style={{ display: 'grid', gap: 10 }}>
          {options.map(text => {
            const isAnswer = text === word.correct;
            const isPicked = picked === text;
            let bg = 'white', color = '#333', border = '2px solid #E5E7EB';
            if (picked !== null && isAnswer) { bg = '#4ECDC4'; color = 'white'; border = '2px solid #4ECDC4'; }
            else if (isPicked) { bg = '#FF6B6B'; color = 'white'; border = '2px solid #FF6B6B'; }
            return (
              <button key={text} onClick={() => choose(text)} disabled={picked !== null} style={{
                padding: '14px 10px', borderRadius: 14, border, background: bg, color,
                fontSize: 17, fontWeight: 800, cursor: picked === null ? 'pointer' : 'default',
                minHeight: 48,
              }}>
                {picked !== null && isAnswer ? '⭕ ' : isPicked ? '❌ ' : ''}{text}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <>
            <div style={{ fontSize: 14, fontWeight: 800, margin: '14px 0 10px', color: picked === word.correct ? '#22B573' : '#FF6B6B' }}>
              {picked === word.correct
                ? 'せいかい！ いみは わかっているね'
                : `${word.english} は「${word.correct}」だよ`}
            </div>
            <button onClick={next} style={{
              width: '100%', padding: 13, borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #4ECDC4, #45B7D1)',
              color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer',
            }}>
              {idx >= words.length - 1 ? 'おわり' : 'つぎへ ›'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
