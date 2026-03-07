-- Supabase: study_records テーブル
-- Supabase Dashboard の SQL Editor で実行してください

create table if not exists study_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  heritage_id integer not null,
  wrong_count integer default 0 not null,
  correct_count integer default 0 not null,
  correct_streak integer default 0 not null,
  last_studied_at timestamptz,
  is_weak boolean default false not null,
  is_manual_review boolean default false not null,
  is_learned boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, heritage_id)
);

-- RLS (Row Level Security) を有効化
alter table study_records enable row level security;

-- ユーザーは自分のレコードのみ読み書き可能
create policy "Users can read own study records"
  on study_records for select
  using (auth.uid() = user_id);

create policy "Users can insert own study records"
  on study_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update own study records"
  on study_records for update
  using (auth.uid() = user_id);

create policy "Users can delete own study records"
  on study_records for delete
  using (auth.uid() = user_id);

-- インデックス
create index if not exists idx_study_records_user_id on study_records(user_id);
create index if not exists idx_study_records_heritage on study_records(user_id, heritage_id);
