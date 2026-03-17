'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import {
  FiGrid, FiEye, FiImage, FiFilm,
  FiHardDrive, FiClock, FiEdit2, FiTrash2,
  FiPlusCircle, FiLogOut, FiTag
} from 'react-icons/fi'
import type { Post } from '@/lib/types'

const glass = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.10)',
} as React.CSSProperties

export default function AdminDashboardPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchPosts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts').select('*').order('created_at', { ascending: false })
    if (!error && data) setPosts(data as Post[])
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  const handleDelete = async (post: Post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    setDeletingId(post.id)
    await supabase.from('posts').delete().eq('id', post.id)
    setPosts(prev => prev.filter(p => p.id !== post.id))
    setDeletingId(null)
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/')
    router.refresh()
  }

  const totalPosts = posts.length
  const totalViews = posts.reduce((sum, p) => sum + (p.view_count ?? 0), 0)
  const totalPhotos = posts.reduce((sum, p) => sum + (p.photo_count ?? 0), 0)
  const totalVideos = posts.reduce((sum, p) => sum + (p.video_count ?? 0), 0)

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-white/35 text-sm mt-0.5">Manage all posts</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/puka/sudu/admin/new"
              className="flex items-center gap-1.5 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200"
              style={{
                background: '#5F85DB',
                boxShadow: '0 4px 16px rgba(95,133,219,0.3)',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#4a70c4')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#5F85DB')}
            >
              <FiPlusCircle size={15} />
              New Post
            </Link>
            <Link
              href="/puka/sudu/admin/categories"
              className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.background = 'rgba(95,133,219,0.15)'
                el.style.borderColor = 'rgba(95,133,219,0.3)'
                el.style.color = '#5F85DB'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.background = 'rgba(255,255,255,0.06)'
                el.style.borderColor = 'rgba(255,255,255,0.10)'
                el.style.color = ''
              }}
            >
              <FiTag size={15} />
              Categories
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm px-3 py-2 rounded-xl transition-colors duration-200"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <FiLogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard icon={<FiGrid size={18} />} label="Total Posts" value={totalPosts.toLocaleString()} accent="#5F85DB" />
          <StatCard icon={<FiEye size={18} />} label="Total Views" value={totalViews.toLocaleString()} accent="#fbbf24" />
          <StatCard icon={<FiImage size={18} />} label="Total Photos" value={totalPhotos.toLocaleString()} accent="#4ade80" />
          <StatCard icon={<FiFilm size={18} />} label="Total Videos" value={totalVideos.toLocaleString()} accent="#a78bfa" />
        </div>

        {/* Posts list */}
        <div className="rounded-2xl overflow-hidden" style={glass}>
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-white font-semibold">All Posts</h2>
            <span className="text-white/30 text-sm">{totalPosts} total</span>
          </div>

          {loading ? (
            <div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-14 h-14 rounded-lg bg-white/5 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/8 rounded w-1/3" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-white/25">
              <FiGrid size={32} className="mb-3" />
              <p>No posts yet</p>
              <Link href="/puka/sudu/admin/new" className="text-sm mt-2 transition-colors hover:text-white/60"
                style={{ color: '#5F85DB' }}>
                Create your first post
              </Link>
            </div>
          ) : (
            <div>
              {posts.map((post, idx) => (
                <PostRow
                  key={post.id}
                  post={post}
                  deleting={deletingId === post.id}
                  onDelete={() => handleDelete(post)}
                  isLast={idx === posts.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function PostRow({ post, deleting, onDelete, isLast }: {
  post: Post
  deleting: boolean
  onDelete: () => void
  isLast: boolean
}) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
  const router = useRouter()

  return (
    <div
      className="flex items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-white/[0.03]"
      style={isLast ? {} : { borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {post.cover_image_url ? (
          <div className="relative w-full h-full">
            <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-white/20">
            <FiImage size={20} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white font-medium text-sm truncate">{post.title}</p>
          {post.admin_link && (
            <span className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(95,133,219,0.2)', color: '#5F85DB' }}>
              🔒 private link
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
          {[
            { icon: <FiHardDrive size={10} />, val: post.file_size },
            { icon: <FiImage size={10} />, val: post.photo_count.toLocaleString() },
            { icon: <FiFilm size={10} />, val: post.video_count.toLocaleString() },
            { icon: <FiEye size={10} />, val: (post.view_count ?? 0).toLocaleString() },
            { icon: <FiClock size={10} />, val: timeAgo },
          ].map((s, i) => (
            <span key={i} className="flex items-center gap-1 text-white/30 text-xs">
              {s.icon} {s.val}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => router.push(`/puka/sudu/admin/edit/${post.id}`)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-150"
          style={{
            background: 'rgba(95,133,219,0.1)',
            border: '1px solid rgba(95,133,219,0.2)',
            color: '#5F85DB',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.background = 'rgba(95,133,219,0.2)'
            el.style.color = '#fff'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.background = 'rgba(95,133,219,0.1)'
            el.style.color = '#5F85DB'
          }}
        >
          <FiEdit2 size={12} />
          <span className="hidden sm:inline">Edit</span>
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-150 disabled:opacity-40"
          style={{
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.18)',
            color: '#f87171',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.background = 'rgba(248,113,113,0.2)'
            el.style.color = '#fff'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.background = 'rgba(248,113,113,0.08)'
            el.style.color = '#f87171'
          }}
        >
          <FiTrash2 size={12} />
          <span className="hidden sm:inline">{deleting ? '...' : 'Delete'}</span>
        </button>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: string; accent: string
}) {
  return (
    <div className="rounded-2xl px-4 py-4" style={glass}>
      <div className="mb-2" style={{ color: accent }}>{icon}</div>
      <p className="text-white text-xl font-bold">{value}</p>
      <p className="text-white/30 text-xs mt-0.5">{label}</p>
    </div>
  )
}
