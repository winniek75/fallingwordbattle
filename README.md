# 🎮 Falling Word Battle - 英単語バトル

落ちてくる英単語の正しい日本語訳を選ぶ、エキサイティングな英語学習ゲーム！

## 機能

| フェーズ | 状態 | 内容 |
|---|---|---|
| Phase 1 | ✅ 実装済み | レベル選択（英検5〜2級）、苦手単語モード、XPランクシステム土台 |
| Phase 2 | 🚧 予定 | SRS間隔反復、ランクアップ演出、ロードマップUI |
| Phase 3 | 🔮 将来 | マルチプレイ対戦、デイリーランキング、バッジシステム |

## 技術スタック

- **React 18** + Vite
- **localStorage** — 苦手単語トラッキング & XP保存
- **requestAnimationFrame** — 60fps落下ゲームループ
- デプロイ: **Vercel**

## ローカル開発

```bash
npm install
npm run dev
```

## Vercelへのデプロイ手順

1. このリポジトリをGitHubにpush
2. [vercel.com](https://vercel.com) → **New Project**
3. GitHubリポジトリを選択してインポート
4. Framework Preset: **Vite** が自動検出される
5. **Deploy** ボタンを押すだけ！

> `vercel.json` が設定済みなので追加設定は不要です。

## ファイル構成

```
src/
├── main.jsx              # エントリーポイント
├── App.jsx               # フェーズ管理（levelSelect / playing / result）
├── components/
│   ├── LevelSelect.jsx   # レベル選択 + ロードマップ表示
│   ├── Game.jsx          # メインゲームエンジン（落下・判定・エフェクト）
│   └── Result.jsx        # リザルト画面 + XP表示
├── data/
│   └── wordData.js       # 英検DB（xlsx→JS変換済み・150語）
└── hooks/
    └── useWordStats.js   # localStorage統計・XPシステム
```

## 苦手単語モードの仕組み

- 不正解になった単語を `localStorage` に記録
- `wrongCount > 0` の単語を `weakScore` でソートして最大50語プール化
- ゲームプレイ数が増えるほど「本当に苦手な単語」だけに絞られる

## XP・ランクシステム（土台）

| ランク | 必要XP | アイコン |
|---|---|---|
| ルーキー | 0 | 🥚 |
| ブロンズ | 500 | 🥉 |
| シルバー | 1,500 | 🥈 |
| ゴールド | 3,000 | 🥇 |
| プラチナ | 6,000 | 💎 |
| マスター | 12,000 | 👑 |

XP計算式: `スコア × 0.5 + 正解数 × 10`

## モードと直接起動（2026-10 追加）

| モード | 内容 |
|---|---|
| 🐢 やさしい (`easy`) | 1レーン・ゆっくり（約半分の速さ・加速なし）・10語を1回ずつ・時間制限なし |
| ⏱️ ノーマル (`normal`) | 左右2レーン同時・30秒 |
| ❤️ サバイバル (`survival`) | 左右2レーン同時・3ライフ |

- 結果画面は「誤答（えらびまちがい）」と「時間切れ（とりのがし）」を別集計。苦手単語・WiseXP `reportWrong`・`wrongAnswers` に入るのは誤答だけ。
- 時間切れの語は結果画面から「じかんせいげんなしで たしかめる」で再確認でき、そこで間違えた語だけ苦手単語になる。
- プレイヤー選択画面の「つくらずに すぐ ためす（ゲスト）」でプレイヤー作成なしに遊べる。

URLパラメータ（ポータルからの直接起動。プレイヤー未作成でもゲストで開く）:

| パラメータ | 値 | 説明 |
|---|---|---|
| `grade`（または `level`） | `5` `4` `3` `pre2` `2` `weak` | 級。指定すると単語確認画面から開く |
| `mode` | `easy` `normal` `survival` | モード（`practice` / `beginner` は `easy` と同じ） |
| `count` | `5`〜`20` | 出題語数（省略時 easy=10、ほか=12） |
| `kana` | `1` | 日本語をひらがな表示（5〜3級） |
| `start` | `game` | 単語確認をとばしてすぐ開始 |

例: `/?grade=5&mode=easy&count=10` 、 `/?grade=pre2&mode=normal&start=game`
