<img src="https://github.com/user-attachments/assets/aa28695d-b093-450a-9eed-17396df52409" width="100%"/>



### ドラッグ&ドロップをメインにしたタスク管理ツール

**FLOW**とは「ラベルなどをドラッグで設定できる」「ローカルDBの活用で高速化」などにより、
流れるように作業が進むイメージから名付けました。<br>

▼ アプリURL ▼
<br>https://use-flow.vercel.app
<br>ID：tset@test.com
<br>パスワード：test1234



---

### 開発理由

個人のタスク管理としてTrelloを使用していましたがデザインや機能面で気になる箇所ができた為、
カンバンボードをベースにし、「デザイン」と「UX」を両立を目指したタスク管理ツールの作成に取り掛かりました。



### こだわり

- **デザインについて：**
単なるツールではなく、毎日触れたくなる「没入感」のある体験を目指しました。ガジェット好きな層をターゲットに、発光表現やアニメーションを取り入れることで、『タスクをこなすこと自体にゲーム的な楽しさ』を与え、ユーザーの定着率を高める設計を目指しています。

- **パフォーマンスについて：**
タスク管理において「ロード時間」は最大の離脱要因かと考えています。ローカルDBを採用し、2回目以降の表示速度を極限まで高めることで、ユーザーの集中力を削がないというビジネス上の価値を追求しました。

---

### 使用技術
| 区分 | 技術 | 目的 |
| --- | --- | --- |
| フロントエンド | Next.js (React/TypeScript) | 以前にReact+Laravelでの開発経験があったため採用。|
| バックエンド | Next.js (APIRoutes) | フレームワーク一本化を図る。|
| データベース | PostgreSQL | string配列など、MySQLでは扱えないものを使用するため採用。|
| ORM | Prisma | TypeScriptの型システムを活用し、SQL文を直接書かずに安全にDB操作を行うため。実行前にDBエラーを検出可能。 |
| ローカルDB | Dexie | indexDB使用のため。|
| 状態管理 | Zustand | 共通で使用したいStateを管理するため採用。 |
| デプロイ | Vercel | Next.js単体であるためデプロイが容易なVercelを選定。 |
| テスト | Vitest | 高速なライブラリ|
| リモートテスト | GitHub Actions | プッシュ時やプルリクエスト時にテストを自動実行し、デプロイ前の品質を担保する。 |
| 主要ライブラリ | Dnd-Kit | タスクのドラッグ＆ドロップ機能を実装するため採用。 |
| 認証機能 | Firebase (Authentication) | セキュリティ面・実装コスト削減のため。|


### アプリの構成と機能一覧


<img width="50%" src="https://github.com/user-attachments/assets/bfa89dc2-dd48-4270-8d40-602d15f860a6" />

**タスク管理ページ**
<br>

<img width="50%" src="https://github.com/user-attachments/assets/8994bcb9-7a10-44cb-a3a2-32b26a36d464" />

**カード編集**
<br>

<img width="50%" src="https://github.com/user-attachments/assets/3dacf275-d943-41c8-8213-43f924b0472d" />

**カード追加**
<br>

<img width="50%" src="https://github.com/user-attachments/assets/a8c7e8c0-9d86-4728-8084-5bf3ce61de95" />

**プロジェクト管理画面**
<br>

<img width="50%" src="https://github.com/user-attachments/assets/cbc42c08-a4b6-4cd7-b505-f3b7427ca5ee" />
<img width="50%" src="https://github.com/user-attachments/assets/f2c5d87c-e5e6-47f1-80df-020fdbbe740c" />

**招待画面**
<br>

<img width="50%" src="https://github.com/user-attachments/assets/a62ff55d-9f3a-415a-8c18-75f6a682f77f" />

**プロフィール編集**
<br>

<img width="50%" src="https://github.com/user-attachments/assets/2c9aae93-3f44-47a9-b2cf-a9262a31772d" />

**テーマ変更**
<br>

<img width="50%" src="https://github.com/user-attachments/assets/cf0ea6c1-34e4-42f6-bae7-be9ebe39e231" />

**ログイン画面**
<br>

<img width="50%" src="https://github.com/user-attachments/assets/cd7ef0be-83ef-41c1-b8e5-6f1b1195bd8a" />

**新規登録画面**
