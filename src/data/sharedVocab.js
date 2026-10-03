// 共通語彙セット — FlashInput の10ユニットと同じ単語
// ?unit=5-1 〜 5-5, 4-1 〜 4-5 で指定できる
export const SHARED_UNITS = {
  "5-1": [
    { word:"apple",     japanese:"りんご" },
    { word:"dog",       japanese:"犬" },
    { word:"cat",       japanese:"猫" },
    { word:"bird",      japanese:"鳥" },
    { word:"milk",      japanese:"牛乳" },
    { word:"breakfast", japanese:"朝食" },
  ],
  "5-2": [
    { word:"run",   japanese:"走る" },
    { word:"swim",  japanese:"泳ぐ" },
    { word:"sing",  japanese:"歌う" },
    { word:"cook",  japanese:"料理する" },
    { word:"write", japanese:"書く" },
    { word:"watch", japanese:"見る" },
  ],
  "5-3": [
    { word:"school",   japanese:"学校" },
    { word:"library",  japanese:"図書館" },
    { word:"hospital", japanese:"病院" },
    { word:"park",     japanese:"公園" },
    { word:"bus",      japanese:"バス" },
    { word:"train",    japanese:"電車" },
  ],
  "5-4": [
    { word:"bed",    japanese:"ベッド" },
    { word:"book",   japanese:"本" },
    { word:"shirt",  japanese:"シャツ" },
    { word:"flower", japanese:"花" },
    { word:"guitar", japanese:"ギター" },
    { word:"mother", japanese:"母" },
  ],
  "5-5": [
    { word:"happy",  japanese:"幸せな" },
    { word:"tired",  japanese:"疲れた" },
    { word:"cold",   japanese:"寒い" },
    { word:"rain",   japanese:"雨" },
    { word:"Sunday", japanese:"日曜日" },
    { word:"soccer", japanese:"サッカー" },
  ],
  "4-1": [
    { word:"arrive", japanese:"到着する" },
    { word:"borrow", japanese:"借りる" },
    { word:"bridge", japanese:"橋" },
    { word:"camera", japanese:"カメラ" },
    { word:"corner", japanese:"角" },
    { word:"cousin", japanese:"いとこ" },
  ],
  "4-2": [
    { word:"climb",    japanese:"登る" },
    { word:"collect",  japanese:"集める" },
    { word:"dinosaur", japanese:"恐竜" },
    { word:"dream",    japanese:"夢" },
    { word:"excited",  japanese:"わくわくした" },
    { word:"foreign",  japanese:"外国の" },
  ],
  "4-3": [
    { word:"cookie",  japanese:"クッキー" },
    { word:"dolphin", japanese:"イルカ" },
    { word:"island",  japanese:"島" },
    { word:"penguin", japanese:"ペンギン" },
    { word:"rainbow", japanese:"虹" },
    { word:"whale",   japanese:"クジラ" },
  ],
  "4-4": [
    { word:"address",   japanese:"住所" },
    { word:"blanket",   japanese:"毛布" },
    { word:"champion",  japanese:"チャンピオン" },
    { word:"furniture", japanese:"家具" },
    { word:"garage",    japanese:"車庫" },
    { word:"healthy",   japanese:"健康な" },
  ],
  "4-5": [
    { word:"crowd",     japanese:"群衆" },
    { word:"emperor",   japanese:"皇帝" },
    { word:"jewelry",   japanese:"宝石" },
    { word:"president", japanese:"大統領" },
    { word:"stadium",   japanese:"スタジアム" },
    { word:"success",   japanese:"成功" },
  ],
};

// 同じ級の全単語プール（ダミー選択肢用）
const GRADE5_ALL = Object.entries(SHARED_UNITS)
  .filter(([k]) => k.startsWith("5-")).flatMap(([,v]) => v);
const GRADE4_ALL = Object.entries(SHARED_UNITS)
  .filter(([k]) => k.startsWith("4-")).flatMap(([,v]) => v);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** ユニットの6語から4択クイズを生成（eiken-game 用） */
export function buildQuestionsFromUnit(unitKey) {
  const words = SHARED_UNITS[unitKey];
  if (!words) return null;
  const pool = unitKey.startsWith("5-") ? GRADE5_ALL : GRADE4_ALL;
  return shuffle(words).map(w => {
    const wrongs = shuffle(pool.filter(p => p.word !== w.word)).slice(0, 3);
    const opts = shuffle([w, ...wrongs]);
    return {
      question: w.japanese,
      options: opts.map(o => o.word),
      answer: opts.findIndex(o => o.word === w.word),
    };
  });
}

/** ユニットの6語をフォーリングワード用に変換 */
export function buildFallingWords(unitKey) {
  const words = SHARED_UNITS[unitKey];
  if (!words) return null;
  const pool = unitKey.startsWith("5-") ? GRADE5_ALL : GRADE4_ALL;
  return words.map(w => {
    const wrongs = shuffle(pool.filter(p => p.word !== w.word)).slice(0, 3).map(p => p.japanese);
    return { english: w.word, japanese: w.japanese, correct: w.japanese, wrongs };
  });
}
