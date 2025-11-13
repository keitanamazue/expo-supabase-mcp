-- Todoテーブルに新しいカラムを追加
-- SupabaseダッシュボードのSQL Editorで実行してください

-- descriptionカラムを追加
alter table todos add column if not exists description text;

-- priorityカラムを追加（デフォルト: 'medium'）
alter table todos add column if not exists priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent'));

-- categoryカラムを追加（デフォルト: 'other'）
alter table todos add column if not exists category text default 'other' check (category in ('work', 'personal', 'shopping', 'health', 'other'));

-- due_dateカラムを追加
alter table todos add column if not exists due_date timestamp with time zone;

-- 既存のレコードにデフォルト値を設定
update todos set priority = 'medium' where priority is null;
update todos set category = 'other' where category is null;

