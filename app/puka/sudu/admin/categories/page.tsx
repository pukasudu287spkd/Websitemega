'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import {
  FiTag, FiPlus, FiTrash2, FiArrowLeft,
  FiCheck, FiImage, FiSave, FiLoader, FiSearch, FiX
} from 'react-icons/fi'
import type { Category, Post } from '@/lib/types'

const glass = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.10)',
} as React.CSSProperties

export default function CategoriesPage() {
  const router = useRouter()

  const [categories, setCategories] = useState<(Category & { post_count: number })[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [assignedPostIds, setAssignedPostIds] = useState<Set<string>>(new Set())
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  const [newCatName, setNewCatName] = useState('')
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [postSearch, setPostSearch] = useState('')

  // Fetch all categories with post counts
  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from('categories')
      .select('*, post_categories(count)')
      .order('created_at', { ascending: false })

    if (data) {
      const cats = data.map((c: Category & { post_categories: { count: number }[] }) => ({
        ...c,
        post_count: c.post_categories?.[0]?.count ?? 0,
      }))
      setCategories(cats)
    }
  }, [])

  // Fetch all posts
  const fetchPosts = useCallback(async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setPosts(data as Post[])
  }, [])

  useEffect(() => {
    fetchCategories()
    fetchPosts()
  }, [fetchCategories, fetchPosts])

  // Load assigned posts when a category is selected
  const handleSelectCategory = async (cat: Category) => {
    setSelectedCategory(cat)
    setPostSearch('')
    setLoadingPosts(true)
    const { data } = await supabase
      .from('post_categories')
      .select('post_id')
      .eq('category_id', cat.id)
    const ids = new Set((data ?? []).map((r: { post_id: string }) => r.post_id))
    setAssignedPostIds(ids)
    setPendingIds(new Set(ids))
    setLoadingPosts(false)
  }

  const togglePost = (postId: string) => {
    setPendingIds(prev => {
      const next = new Set(prev)
      next.has(postId) ? next.delete(postId) : next.add(postId)
      return next
    })
  }

  const handleSave = async () => {
    if (!selectedCategory) return
    setSaving(true)

    const toAdd = [...pendingIds].filter(id => !assignedPostIds.has(id))
    const toRemove = [...assignedPostIds].filter(id => !pendingIds.has(id))

    if (toAdd.length > 0) {
      await supabase.from('post_categories').insert(
        toAdd.map(post_id => ({ post_id, category_id: selectedCategory.id }))
      )
    }
    if (toRemove.length > 0) {
      await supabase.from('post_categories')
        .delete()
        .eq('category_id', selectedCategory.id)
        .in('post_id', toRemove)
    }

    setAssignedPostIds(new Set(pendingIds))
    await fetchCategories()
    setSaving(false)
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    setCreating(true)
    const { error } = await supabase
      .from('categories')
      .insert({ name: newCatName.trim() })
    if (!error) {
      setNewCatName('')
      await fetchCategories()
    }
    setCreating(false)
  }

  const handleDeleteCategory = async (cat: Category) => {
    if (!window.confirm(`Delete category "${cat.name}"? Posts will not be deleted.`)) return
    setDeletingId(cat.id)
    await supabase.from('categories').delete().eq('id', cat.id)
    if (selectedCategory?.id === cat.id) {
      setSelectedCategory(null)
      setPendingIds(new Set())
      setAssignedPostIds(new Set())
    }
    await fetchCategories()
    setDeletingId(null)
  }

  const hasChanges =
    pendingIds.size !== assignedPostIds.size ||
    [...pendingIds].some(id => !assignedPostIds.has(id))

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push('/puka/sudu/admin/dashboard')}
            className="text-white/35 hover:text-white transition-colors duration-200"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-white text-2xl font-bold">Categories</h1>
            <p className="text-white/35 text-sm mt-0.5">Create categories and assign posts to them</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">

          {/* ── Left: Category list ── */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="rounded-2xl overflow-hidden" style={glass}>

              {/* Create new */}
              <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">
                  New Category
                </p>
                <form onSubmit={handleCreateCategory} className="flex gap-2">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="Category name..."
                    className="flex-1 text-white text-sm rounded-xl px-3 py-2 outline-none min-w-0 transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.10)',
                    }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(95,133,219,0.5)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.10)')}
                  />
                  <button
                    type="submit"
                    disabled={creating || !newCatName.trim()}
                    className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 disabled:opacity-40"
                    style={{ background: '#5F85DB' }}
                    onMouseEnter={e => { if (!creating) (e.currentTarget as HTMLButtonElement).style.background = '#4a70c4' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#5F85DB' }}
                  >
                    {creating
                      ? <FiLoader size={14} className="text-white animate-spin" />
                      : <FiPlus size={14} className="text-white" />}
                  </button>
                </form>
              </div>

              {/* Category list */}
              <div className="p-2">
                {categories.length === 0 ? (
                  <div className="py-8 text-center text-white/25 text-sm">
                    <FiTag size={24} className="mx-auto mb-2 opacity-40" />
                    No categories yet
                  </div>
                ) : (
                  categories.map(cat => {
                    const isSelected = selectedCategory?.id === cat.id
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group"
                        style={{
                          background: isSelected ? 'rgba(95,133,219,0.15)' : 'transparent',
                          border: `1px solid ${isSelected ? 'rgba(95,133,219,0.3)' : 'transparent'}`,
                        }}
                        onClick={() => handleSelectCategory(cat)}
                        onMouseEnter={e => {
                          if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)'
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                        }}
                      >
                        <FiTag size={13} style={{ color: isSelected ? '#5F85DB' : 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                        <span className="flex-1 text-sm truncate" style={{ color: isSelected ? '#5F85DB' : 'rgba(255,255,255,0.75)' }}>
                          {cat.name}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}>
                          {cat.post_count}
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteCategory(cat) }}
                          disabled={deletingId === cat.id}
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 rounded-lg"
                          style={{ color: '#f87171' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.12)')}
                          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Post assignment ── */}
          <div className="flex-1">
            {!selectedCategory ? (
              <div className="flex flex-col items-center justify-center h-64 rounded-2xl text-white/20" style={glass}>
                <FiTag size={36} className="mb-3 opacity-30" />
                <p className="text-sm">Select a category to assign posts</p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={glass}>
                {/* Panel header */}
                <div className="px-5 py-4 flex items-center justify-between gap-4"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <FiTag size={14} style={{ color: '#5F85DB' }} />
                      <h2 className="text-white font-semibold">{selectedCategory.name}</h2>
                    </div>
                    <p className="text-white/30 text-xs mt-0.5">
                      {pendingIds.size} post{pendingIds.size !== 1 ? 's' : ''} selected
                    </p>
                  </div>

                  {/* Search posts */}
                  <div className="flex items-center gap-2 flex-1 max-w-xs rounded-xl px-3 py-2 transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
                    onFocus={() => {}}
                  >
                    <FiSearch size={13} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                    <input
                      type="text"
                      value={postSearch}
                      onChange={e => setPostSearch(e.target.value)}
                      placeholder="Search posts..."
                      className="bg-transparent text-white text-sm outline-none flex-1 min-w-0 placeholder-white/20"
                      onFocus={e => (e.currentTarget.parentElement!.style.borderColor = 'rgba(95,133,219,0.45)')}
                      onBlur={e => (e.currentTarget.parentElement!.style.borderColor = 'rgba(255,255,255,0.09)')}
                    />
                    {postSearch && (
                      <button onClick={() => setPostSearch('')} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                        <FiX size={13} />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="flex-shrink-0 flex items-center gap-1.5 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: hasChanges ? '#5F85DB' : 'rgba(255,255,255,0.06)',
                      boxShadow: hasChanges ? '0 4px 16px rgba(95,133,219,0.3)' : 'none',
                    }}
                    onMouseEnter={e => { if (hasChanges && !saving) (e.currentTarget as HTMLButtonElement).style.background = '#4a70c4' }}
                    onMouseLeave={e => { if (hasChanges) (e.currentTarget as HTMLButtonElement).style.background = '#5F85DB' }}
                  >
                    {saving
                      ? <><FiLoader size={13} className="animate-spin" /> Saving...</>
                      : <><FiSave size={13} /> Save</>}
                  </button>
                </div>

                {/* Posts list */}
                {loadingPosts ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-6 h-6 border-2 border-white/10 rounded-full animate-spin"
                      style={{ borderTopColor: '#5F85DB' }} />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="py-12 text-center text-white/25 text-sm">No posts yet</div>
                ) : posts.filter(p => p.title.toLowerCase().includes(postSearch.toLowerCase())).length === 0 ? (
                  <div className="py-12 text-center text-white/25 text-sm">
                    No posts match &ldquo;{postSearch}&rdquo;
                  </div>
                ) : (
                  <div>
                    {posts
                      .filter(p => p.title.toLowerCase().includes(postSearch.toLowerCase()))
                      .map((post, idx, arr) => {
                      const isChecked = pendingIds.has(post.id)
                      return (
                        <div
                          key={post.id}
                          className="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors duration-100"
                          style={{
                            borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            background: isChecked ? 'rgba(95,133,219,0.06)' : 'transparent',
                          }}
                          onClick={() => togglePost(post.id)}
                          onMouseEnter={e => {
                            if (!isChecked) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLDivElement).style.background = isChecked ? 'rgba(95,133,219,0.06)' : 'transparent'
                          }}
                        >
                          {/* Checkbox */}
                          <div
                            className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all duration-150"
                            style={{
                              background: isChecked ? '#5F85DB' : 'rgba(255,255,255,0.06)',
                              border: `1px solid ${isChecked ? '#5F85DB' : 'rgba(255,255,255,0.15)'}`,
                            }}
                          >
                            {isChecked && <FiCheck size={11} className="text-white" />}
                          </div>

                          {/* Thumbnail */}
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {post.cover_image_url ? (
                              <div className="relative w-full h-full">
                                <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" unoptimized />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full text-white/20">
                                <FiImage size={16} />
                              </div>
                            )}
                          </div>

                          {/* Title */}
                          <p className="flex-1 text-sm truncate transition-colors duration-100"
                            style={{ color: isChecked ? 'white' : 'rgba(255,255,255,0.6)' }}>
                            {post.title}
                          </p>

                          {/* Size */}
                          <span className="text-white/25 text-xs flex-shrink-0">{post.file_size}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
