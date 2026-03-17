'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { FiBox, FiImage, FiGrid, FiUpload } from 'react-icons/fi'
import type { Post } from '@/lib/types'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true }).replace(/^about /, '')

  return (
    <Link href={`/post/${post.id}`} className="group block">
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1"
        style={{
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = 'rgba(95,133,219,0.45)'
          el.style.boxShadow = '0 8px 32px rgba(95,133,219,0.18), 0 2px 12px rgba(0,0,0,0.4)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = 'rgba(255,255,255,0.08)'
          el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)'
        }}
      >
        {/* Cover image — full card */}
        <div className="relative w-full aspect-[3/4] bg-white/5">
          {post.cover_image_url ? (
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <FiImage size={40} style={{ color: 'rgba(255,255,255,0.1)' }} />
            </div>
          )}

          {/* Liquid glass overlay — top */}
          <div
            className="absolute top-0 left-0 right-0 px-3 pt-3 pb-2.5"
            style={{
              background: 'rgba(10, 12, 26, 0.35)',
              backdropFilter: 'blur(18px) saturate(1.6)',
              WebkitBackdropFilter: 'blur(18px) saturate(1.6)',
            }}
          >
            {/* Title */}
            <div className="mb-1.5">
              <h2
                className="text-white font-bold leading-snug line-clamp-1"
                style={{ fontSize: 17, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
              >
                {post.title}
              </h2>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Stat icon={<FiBox size={11} />} value={post.file_size} />
              <Stat icon={<FiImage size={11} />} value={String(post.photo_count)} />
              <Stat icon={<FiGrid size={11} />} value={String(post.video_count)} />
              <Stat icon={<FiUpload size={11} />} value={timeAgo} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span
      className="flex items-center gap-1"
      style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
    >
      <span style={{ color: 'rgba(255,255,255,0.5)' }}>{icon}</span>
      {value}
    </span>
  )
}
