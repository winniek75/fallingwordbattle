// 英語ネイティブ音声を明示的に選択する共有ユーティリティ
let cachedEnglishVoice = null;
let voicesLoaded = false;

function getEnglishVoice() {
  if (cachedEnglishVoice && voicesLoaded) return cachedEnglishVoice;
  const voices = window.speechSynthesis?.getVoices() || [];
  if (voices.length === 0) return null;
  voicesLoaded = true;

  // 優先順位リスト
  const priorityNames = ['Samantha', 'Ava', 'Tom', 'Alex'];

  // 1. iOS/macOS高品質音声
  for (const name of priorityNames) {
    const v = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'));
    if (v) { cachedEnglishVoice = v; return v; }
  }

  // 2. Google英語音声
  const googleEn = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en-US'));
  if (googleEn) { cachedEnglishVoice = googleEn; return googleEn; }

  // 3. Microsoft英語音声
  const msEn = voices.find(v => v.name.includes('Microsoft') && v.lang.startsWith('en-US'));
  if (msEn) { cachedEnglishVoice = msEn; return msEn; }

  // 4. en-USローカル音声
  const enUS = voices.find(v => v.lang === 'en-US');
  if (enUS) { cachedEnglishVoice = enUS; return enUS; }

  // 5. en-GB音声
  const enGB = voices.find(v => v.lang === 'en-GB');
  if (enGB) { cachedEnglishVoice = enGB; return enGB; }

  // 6. その他英語音声
  const anyEn = voices.find(v => v.lang.startsWith('en'));
  if (anyEn) { cachedEnglishVoice = anyEn; return anyEn; }

  return null;
}

// 音声リストの非同期ロードに対応
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedEnglishVoice = null;
    voicesLoaded = false;
    getEnglishVoice();
  };
}

export function speak(text, rate = 0.85) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  const voice = getEnglishVoice();
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}
