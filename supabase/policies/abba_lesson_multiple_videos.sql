alter table public.abba_lessons add column if not exists videos jsonb not null default '[]'::jsonb;
alter table public.abba_lessons add constraint abba_lesson_videos_array check (jsonb_typeof(videos) = 'array');
