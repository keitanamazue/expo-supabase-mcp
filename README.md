# Expo + Supabase Todoリスト アプリ

Expo RouterとSupabaseを使用して構築された機能豊富なTodoリストアプリケーションです。

## 技術スタック

- **フレームワーク**: Expo ~54.0.23
- **ルーティング**: Expo Router ~6.0.14
- **バックエンド**: Supabase
- **言語**: TypeScript
- **React**: 19.1.0
- **React Native**: 0.81.5
- **テスト**: Jest + React Native Testing Library

## 機能

- ✅ Todoの追加、編集、削除
- ✅ Todoの完了状態の切り替え
- ✅ 優先度設定（低、中、高、緊急）
- ✅ カテゴリ分類（仕事、個人、買い物、健康、その他）
- ✅ 期限設定
- ✅ 説明の追加
- ✅ フィルタリング（すべて、未完了、完了）
- ✅ ソート（作成日、優先度、期限、タイトル）
- ✅ 検索機能
- ✅ 統計情報の表示
- ✅ ユーザー認証（サインアップ、ログイン、ログアウト）
- ✅ Expo MCPローカル自動化ツール対応

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```bash
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**注意**: `.env.local`ファイルは`.gitignore`で無視されるため、Gitにコミットされません。

### 3. Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com)でアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトのURLとanon keyを取得
4. `.env.local`に設定

### 4. データベーススキーマの作成

SupabaseのSQL Editorで以下のSQLを実行してください：

```sql
-- todosテーブルの作成
create table if not exists todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  completed boolean default false,
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  category text default 'other' check (category in ('work', 'personal', 'shopping', 'health', 'other')),
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) の有効化
alter table todos enable row level security;

-- ポリシーの作成: ユーザーは自分のTodoのみ閲覧・操作可能
create policy "Users can view their own todos"
  on todos for select
  using (auth.uid() = user_id);

create policy "Users can insert their own todos"
  on todos for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own todos"
  on todos for update
  using (auth.uid() = user_id);

create policy "Users can delete their own todos"
  on todos for delete
  using (auth.uid() = user_id);

-- updated_atを自動更新する関数
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- updated_atトリガーの作成
drop trigger if exists update_todos_updated_at on todos;
create trigger update_todos_updated_at
  before update on todos
  for each row
  execute function update_updated_at_column();
```

### 5. アプリの起動

```bash
# 通常の起動
npx expo start

# Expo MCPローカル自動化ツールを使用する場合
EXPO_UNSTABLE_MCP_SERVER=1 npx expo start
```

## プロジェクト構造

```
expo-supabase-mcp/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Todoリスト画面
│   │   ├── explore.tsx         # 探索画面
│   │   └── _layout.tsx         # タブレイアウト
│   ├── auth.tsx                # 認証画面
│   └── _layout.tsx             # ルートレイアウト
├── components/
│   └── todo/
│       ├── TodoItem.tsx        # Todoアイテムコンポーネント
│       ├── TodoForm.tsx        # Todo追加フォーム
│       └── TodoEditModal.tsx   # Todo編集モーダル
├── hooks/
│   ├── useTodos.ts             # Todoデータ管理フック
│   └── useAuth.ts              # 認証管理フック
├── lib/
│   └── supabase.ts             # Supabaseクライアント設定
├── types/
│   └── todo.ts                 # TypeScript型定義
├── __tests__/                  # テストファイル
└── migrations/                 # データベースマイグレーション
```

## テスト

```bash
# すべてのテストを実行
npm test

# ウォッチモードでテストを実行
npm run test:watch

# カバレッジレポートを生成
npm run test:coverage
```

## Expo MCP ローカル自動化ツール

このプロジェクトは、Expo MCPのローカル自動化ツールに対応しています。すべてのインタラクティブなUI要素に`testID`が設定されており、AIアシスタントがシミュレーターでアプリを操作できます。

### セットアップ

1. **expo-mcpパッケージのインストール**（既にインストール済み）
   ```bash
   npx expo install expo-mcp --dev
   ```

2. **開発サーバーの起動（MCP有効）**
   ```bash
   EXPO_UNSTABLE_MCP_SERVER=1 npx expo start
   ```

3. **MCPサーバー接続の確認**
   - CursorのMCP設定でExpo MCPサーバーが接続されていることを確認
   - ローカル自動化ツールが利用可能になるまで、MCP接続を再確立する必要がある場合があります

### 利用可能なローカル自動化ツール

- `automation_find_view_by_testid`: testIDでビューを検索
- `automation_tap_by_testid`: testIDでビューをタップ
- `automation_take_screenshot`: デバイスのスクリーンショットを撮影
- `automation_tap`: 特定の座標をタップ

### testIDの設定

すべてのインタラクティブなUI要素にtestIDが設定されています。詳細は`agents.md`を参照してください。

**主要なtestID:**
- 認証画面: `login-email-input`, `login-password-input`, `login-submit-button`
- Todoフォーム: `todo-input`, `todo-add-button`, `todo-advanced-button`
- Todoアイテム: `todo-item-{id}`, `todo-toggle-{id}`, `todo-edit-{id}`, `todo-delete-{id}`

## 開発

### コードの実行

```bash
# iOSシミュレーターで起動
npx expo start --ios

# Androidエミュレーターで起動
npx expo start --android

# Webブラウザで起動
npx expo start --web
```

### リント

```bash
npm run lint
```

## 参考リソース

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Expo MCP Documentation](https://docs.expo.dev/eas/ai/mcp/)

## 注意事項

- Expoでは環境変数に`EXPO_PUBLIC_`プレフィックスが必要です
- `.env.local`ファイルはGitにコミットされません（`.gitignore`で無視されます）
- SupabaseのRLSポリシーを適切に設定してください
- Expo MCPのローカル自動化ツールを使用する場合は、開発サーバーを`EXPO_UNSTABLE_MCP_SERVER=1`で起動してください
- MCPサーバー接続を再確立した後、ローカル自動化ツールが利用可能になるまで時間がかかる場合があります

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
