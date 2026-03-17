export interface Post {
  id: string
  title: string
  cover_image_url: string
  file_size: string
  file_size_bytes: number
  photo_count: number
  video_count: number
  link: string
  admin_link?: string
  view_count: number
  created_at: string
  user_id?: string
}

export interface Category {
  id: string
  name: string
  created_at: string
  post_count?: number
}

export type SortOption =
  | 'new'
  | 'hot'
  | 'feed'
  | 'views'
  | 'random'
  | 'size'
  | 'history'
  | 'oldest'
