'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import PostCard from '@/components/PostCard'
import SearchBar from '@/components/SearchBar'
import type { Post, SortOption } from '@/lib/types'
import { FiInbox } from 'react-icons/fi'

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('new')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)

    let posts: Post[] = []

    if (selectedCategory) {
      // Fetch posts belonging to the selected category
      const { data, error } = await supabase
        .from('post_categories')
        .select('posts(*)')
        .eq('category_id', selectedCategory)

      if (error) {
        console.error('Error fetching posts by category:', error)
        setPosts([])
        setLoading(false)
        return
      }

      const rows = (data ?? []) as unknown as { posts: Post }[]
      posts = rows.map(row => row.posts).filter(Boolean)
    } else {
      const { data, error } = await supabase.from('posts').select('*')
      if (error) {
        console.error('Error fetching posts:', error)
        setPosts([])
        setLoading(false)
        return
      }
      posts = data as Post[]
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      posts = posts.filter(p => p.title.toLowerCase().includes(q))
    }

    // Apply sort
    switch (sortOption) {
      case 'new':
        posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'hot':
      case 'views':
        posts.sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))
        break
      case 'size':
        posts.sort((a, b) => (b.file_size_bytes ?? 0) - (a.file_size_bytes ?? 0))
        break
      case 'oldest':
        posts.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'random':
        posts = posts.sort(() => Math.random() - 0.5)
        break
    }

    setPosts(posts)
    setLoading(false)
  }, [searchQuery, sortOption, selectedCategory])

  const handleCategoryChange = useCallback(async (id: string | null) => {
    setSelectedCategory(id)
    if (id) {
      const { data } = await supabase.from('categories').select('name').eq('id', id).single()
      setCategoryName(data?.name ?? null)
    } else {
      setCategoryName(null)
    }
  }, [])

  useEffect(() => {
    const debounce = setTimeout(() => fetchPosts(), 300)
    return () => clearTimeout(debounce)
  }, [fetchPosts])

  return (
    <main className="min-h-screen">

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2" style={{ position: 'relative', zIndex: 500 }}>
        <SearchBar
          searchQuery={searchQuery}
          sortOption={sortOption}
          selectedCategory={selectedCategory}
          onSearchChange={setSearchQuery}
          onSortChange={setSortOption}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5" style={{ position: 'relative', zIndex: 1 }}>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse border border-white/5"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-white/8 rounded w-2/3" />
                  <div className="h-2.5 bg-white/5 rounded w-full" />
                </div>
                <div className="aspect-[3/4] bg-white/5" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
              style={{
                background: 'rgba(95,133,219,0.08)',
                border: '1px solid rgba(95,133,219,0.15)',
              }}>
              <FiInbox size={36} style={{ color: 'rgba(95,133,219,0.5)' }} />
            </div>
            <p className="text-white/60 font-semibold text-lg mb-1">
              {searchQuery ? 'No results found' : 'No posts yet'}
            </p>
            <p className="text-white/25 text-sm max-w-xs">
              {searchQuery
                ? `Nothing matched "${searchQuery}". Try a different keyword.`
                : 'Check back soon for new media collections.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-5 text-sm px-4 py-2 rounded-xl transition-all duration-200"
                style={{
                  background: 'rgba(95,133,219,0.1)',
                  border: '1px solid rgba(95,133,219,0.2)',
                  color: '#5F85DB',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(95,133,219,0.18)')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(95,133,219,0.1)')}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Result count */}
            <p className="text-white/20 text-xs mb-3 px-1">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              {categoryName && ` in "${categoryName}"`}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
