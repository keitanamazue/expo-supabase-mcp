# Expo + Supabase Todoリスト プロジェクト

## プロジェクト概要

このプロジェクトは、Expo RouterとSupabaseを使用してTodoリストアプリケーションを構築するためのものです。

## 技術スタック

- **フレームワーク**: Expo ~54.0.23
- **ルーティング**: Expo Router ~6.0.14
- **バックエンド**: Supabase
- **言語**: TypeScript
- **React**: 19.1.0
- **React Native**: 0.81.5

## セットアップ手順

### 1. 必要な依存関係のインストール

```bash
npm install @supabase/supabase-js
```

### 2. Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com)でアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトのURLとanon keyを取得

### 3. 環境変数の設定

`.env`ファイルを作成（または`.env.local`）:

```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**注意**: Expoでは`EXPO_PUBLIC_`プレフィックスが必要です。

### 4. データベーススキーマ

SupabaseのSQL Editorで以下のSQLを実行:

#### オプションA: 認証あり（本番環境推奨）

```sql
-- todosテーブルの作成
create table if not exists todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) の有効化
alter table todos enable row level security;

-- 既存のポリシーを削除（再実行時用）
drop policy if exists "Users can view their own todos" on todos;
drop policy if exists "Users can insert their own todos" on todos;
drop policy if exists "Users can update their own todos" on todos;
drop policy if exists "Users can delete their own todos" on todos;

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

#### オプションB: 認証なし（開発環境用・非推奨）

**警告**: この設定は開発環境でのみ使用してください。本番環境では使用しないでください。

```sql
-- todosテーブルの作成（user_idをnullableに）
create table if not exists todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  title text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLSを無効化（開発環境のみ）
alter table todos disable row level security;

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

## プロジェクト構造

```
expo-supabase-mcp/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Todoリスト画面
│   │   └── _layout.tsx
│   └── _layout.tsx
├── lib/
│   └── supabase.ts            # Supabaseクライアント設定
├── components/
│   └── todo/
│       ├── TodoItem.tsx       # Todoアイテムコンポーネント
│       └── TodoForm.tsx       # Todo追加フォーム
├── hooks/
│   └── useTodos.ts           # Todoデータ管理フック
└── types/
    └── todo.ts               # TypeScript型定義
```

## 実装ガイドライン

### 1. Supabaseクライアントの設定

`lib/supabase.ts`を作成:

```typescript
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2. TypeScript型定義

`types/todo.ts`を作成:

```typescript
export interface Todo {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TodoInsert {
  title: string;
  completed?: boolean;
}

export interface TodoUpdate {
  title?: string;
  completed?: boolean;
}
```

### 3. カスタムフックの実装

`hooks/useTodos.ts`を作成して、TodoのCRUD操作を管理:

- `fetchTodos()`: Todoリストの取得
- `addTodo(title: string)`: 新しいTodoの追加
- `updateTodo(id: string, updates: TodoUpdate)`: Todoの更新
- `deleteTodo(id: string)`: Todoの削除
- `toggleTodo(id: string)`: Todoの完了状態の切り替え

### 4. UIコンポーネント

- **TodoItem**: 個別のTodoアイテムを表示
  - チェックボックス（完了状態）
  - タイトル
  - 削除ボタン
  
- **TodoForm**: 新しいTodoを追加するフォーム
  - テキスト入力
  - 追加ボタン

### 5. 認証の実装（オプション）

認証が必要な場合:

```typescript
// サインアップ
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// サインイン
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// サインアウト
await supabase.auth.signOut();

// 現在のユーザーを取得
const { data: { user } } = await supabase.auth.getUser();
```

## 実装の優先順位

1. **Phase 1: 基本セットアップ**
   - Supabaseクライアントの設定
   - データベーススキーマの作成
   - 型定義の作成

2. **Phase 2: 基本機能**
   - Todoリストの表示
   - Todoの追加
   - Todoの削除

3. **Phase 3: 拡張機能**
   - Todoの完了状態の切り替え
   - Todoの編集
   - リアルタイム更新（Supabase Realtime）

4. **Phase 4: 認証（オプション）**
   - ユーザー認証の実装
   - ユーザーごとのTodo管理

## 参考リソース

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

## Expo MCP ローカル自動化ツール

### セットアップ

1. **expo-mcpパッケージのインストール**
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

以下のツールは、開発サーバーが`EXPO_UNSTABLE_MCP_SERVER=1`で起動されている場合にのみ利用可能です：

- `automation_find_view_by_testid`: testIDでビューを検索
- `automation_tap_by_testid`: testIDでビューをタップ
- `automation_take_screenshot`: デバイスのスクリーンショットを撮影
- `automation_tap`: 特定の座標をタップ

### testIDの設定

すべてのインタラクティブなUI要素にtestIDを設定しています：

**認証画面 (`app/auth.tsx`):**
- `login-email-input`: メールアドレス入力フィールド
- `login-password-input`: パスワード入力フィールド
- `login-submit-button`: ログイン/アカウント作成ボタン
- `login-switch-mode-button`: ログイン/アカウント作成モード切り替えボタン

**Todoリスト画面 (`app/(tabs)/index.tsx`):**
- `todo-search-input`: 検索入力フィールド
- `todo-filter-button`: フィルタボタン
- `todo-signout-button`: ログアウトボタン
- `todo-filter-option-{filter}`: フィルタオプション（all, active, completed）
- `todo-sort-option-{sort}`: ソートオプション（created, priority, due_date, title）
- `todo-filter-close-button`: フィルタモーダルの閉じるボタン

**Todoフォーム (`components/todo/TodoForm.tsx`):**
- `todo-input`: Todoタイトル入力フィールド
- `todo-add-button`: Todo追加ボタン
- `todo-advanced-button`: 詳細設定ボタン
- `todo-description-input`: 説明入力フィールド
- `todo-priority-{priority}`: 優先度ボタン（low, medium, high, urgent）
- `todo-category-{category}`: カテゴリボタン（work, personal, shopping, health, other）
- `todo-due-date-input`: 期限入力フィールド
- `todo-advanced-close-button`: 詳細設定モーダルの閉じるボタン

**Todoアイテム (`components/todo/TodoItem.tsx`):**
- `todo-item-{id}`: Todoアイテムコンテナ
- `todo-toggle-{id}`: Todo完了状態の切り替え
- `todo-edit-{id}`: Todo編集ボタン
- `todo-delete-{id}`: Todo削除ボタン

**Todo編集モーダル (`components/todo/TodoEditModal.tsx`):**
- `todo-edit-title-input`: タイトル入力フィールド
- `todo-edit-description-input`: 説明入力フィールド
- `todo-edit-priority-{priority}`: 優先度ボタン
- `todo-edit-category-{category}`: カテゴリボタン
- `todo-edit-due-date-input`: 期限入力フィールド
- `todo-edit-save-button`: 保存ボタン
- `todo-edit-cancel-button`: キャンセルボタン
- `todo-edit-close-button`: 閉じるボタン
- `todo-edit-modal-overlay`: モーダルオーバーレイ

### ローカル自動化ツールの使用例

**ログイン操作の例:**
1. `automation_find_view_by_testid`で`login-email-input`を検索
2. メールアドレスを入力
3. `automation_find_view_by_testid`で`login-password-input`を検索
4. パスワードを入力
5. `automation_tap_by_testid`で`login-submit-button`をタップ
6. 1-2秒待機
7. `automation_take_screenshot`でスクリーンショットを撮影してログイン成功を確認

## 注意事項

- Expoでは環境変数に`EXPO_PUBLIC_`プレフィックスが必要
- SupabaseのRLSポリシーを適切に設定すること
- リアルタイム更新を使用する場合は、Supabase Realtimeを有効化すること
- 認証を使用する場合は、適切なセキュリティ対策を実装すること
- Expo MCPのローカル自動化ツールを使用する場合は、開発サーバーを`EXPO_UNSTABLE_MCP_SERVER=1`で起動すること
- MCPサーバー接続を再確立した後、ローカル自動化ツールが利用可能になるまで時間がかかる場合があります

