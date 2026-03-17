-- Run these SQL statements in your Supabase SQL Editor

-- Posts table
create table posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,  -- nullable: admin posts have no user_id
  title text not null,
  cover_image_url text not null,
  file_size text not null,
  file_size_bytes bigint not null default 0,
  photo_count integer not null default 0,
  video_count integer not null default 0,
  link text not null,
  admin_link text,
  view_count integer not null default 0,
  created_at timestamptz default now() not null
);

-- User history table (tracks which posts a user has viewed)
create table user_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  viewed_at timestamptz default now() not null,
  unique(user_id, post_id)
);

-- User follows table (for My Feed)
create table user_follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references auth.users(id) on delete cascade not null,
  following_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(follower_id, following_id)
);

-- Enable Row Level Security
alter table posts enable row level security;
alter table user_history enable row level security;
alter table user_follows enable row level security;

-- RLS Policies for posts
create policy "Anyone can view posts" on posts for select using (true);
create policy "Anyone can insert posts" on posts for insert with check (true);
create policy "Anyone can update posts" on posts for update using (true);
create policy "Anyone can delete posts" on posts for delete using (true);

-- RLS Policies for user_history
create policy "Users can view their own history" on user_history for select using (auth.uid() = user_id);
create policy "Users can insert their own history" on user_history for insert with check (auth.uid() = user_id);
create policy "Users can update their own history" on user_history for update using (auth.uid() = user_id);

-- RLS Policies for user_follows
create policy "Users can view follows" on user_follows for select using (true);
create policy "Users can manage their own follows" on user_follows for insert with check (auth.uid() = follower_id);
create policy "Users can delete their own follows" on user_follows for delete using (auth.uid() = follower_id);

-- Storage bucket for cover images (run in Supabase Storage section or SQL)
insert into storage.buckets (id, name, public) values ('covers', 'covers', true);
create policy "Anyone can view cover images" on storage.objects for select using (bucket_id = 'covers');
create policy "Authenticated users can upload covers" on storage.objects for insert with check (bucket_id = 'covers' and auth.role() = 'authenticated');

-- Link clicks tracking table (for 4-hour cooldown after 3 clicks)
-- Run this in Supabase SQL Editor:
create table link_clicks (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade,
  ip_address text not null,
  clicked_at timestamptz default now() not null
);
alter table link_clicks disable row level security;

-- Category system
-- Run these in Supabase SQL Editor:
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamptz default now()
);

create table post_categories (
  post_id uuid references posts(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (post_id, category_id)
);

alter table categories disable row level security;
alter table post_categories disable row level security;
