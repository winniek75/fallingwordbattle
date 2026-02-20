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
