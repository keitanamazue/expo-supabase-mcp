# Todoリストアプリ セットアップガイド

## 実装完了項目

✅ Supabaseクライアントの設定 (`lib/supabase.ts`)
✅ TypeScript型定義 (`types/todo.ts`)
✅ Todo管理用カスタムフック (`hooks/useTodos.ts`)
✅ TodoItemコンポーネント (`components/todo/TodoItem.tsx`)
✅ TodoFormコンポーネント (`components/todo/TodoForm.tsx`)
✅ メインのTodoリスト画面 (`app/(tabs)/index.tsx`)

## 次のステップ

### 1. データベーステーブルの作成

SupabaseのダッシュボードでSQL Editorを開き、以下のSQLを実行してください：

**開発環境用（認証なし）:**

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

**本番環境用（認証あり）:**

詳細は `agents.md` の「オプションA: 認証あり（本番環境推奨）」を参照してください。

### 2. アプリの起動

```bash
npm start
```

または

```bash
npx expo start
```

### 3. 動作確認

- Todoの追加ができること
- Todoの完了状態を切り替えられること
- Todoの削除ができること
- プルダウンでリフレッシュできること

## トラブルシューティング

### エラー: "relation 'todos' does not exist"

→ データベーステーブルが作成されていません。上記のSQLを実行してください。

### エラー: "new row violates row-level security policy"

→ RLSが有効になっています。開発環境の場合は、上記のSQLでRLSを無効化してください。

### Todoが表示されない

→ ブラウザの開発者ツールのコンソールでエラーを確認してください。Supabaseの接続情報が正しいか確認してください。

## 次の機能追加（オプション）

- ユーザー認証の実装
- Todoの編集機能
- リアルタイム更新（Supabase Realtime）
- Todoの並び替え
- フィルタリング（完了/未完了）

詳細は `agents.md` を参照してください。

