'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import {
  FiHardDrive, FiImage, FiFilm, FiClock,
  FiExternalLink, FiArrowLeft, FiEye, FiCopy, FiCheck, FiLock
} from 'react-icons/fi'
// FiExternalLink kept for the Open Link button
import type { Post } from '@/lib/types'

const glass = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.10)',
} as React.CSSProperties

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0s'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Cooldown state
  const [onCooldown, setOnCooldown] = useState(false)
  const [countdown, setCountdown] = useState('')
  const [clickCount, setClickCount] = useState(0)
  const cooldownEndsRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Start countdown ticker
  const startTimer = useCallback((endsAt: number) => {
    cooldownEndsRef.current = endsAt
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const remaining = (cooldownEndsRef.current ?? 0) - Date.now()
      if (remaining <= 0) {
        clearInterval(timerRef.current!)
        setOnCooldown(false)
        setCountdown('')
        setClickCount(0)
      } else {
        setCountdown(formatCountdown(remaining))
      }
    }, 1000)
    setCountdown(formatCountdown(endsAt - Date.now()))
  }, [])

  // Check cooldown status on mount
  useEffect(() => {
    const checkCooldown = async () => {
      const res = await fetch('/api/track-click')
      const data = await res.json()
      setClickCount(data.count ?? 0)
      if (data.onCooldown && data.cooldownEndsAt) {
        setOnCooldown(true)
        startTimer(new Date(data.cooldownEndsAt).getTime())
      }
    }
    checkCooldown()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [startTimer])

  useEffect(() => {
    if (!id) return
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts').select('*').eq('id', id).single()
      if (error || !data) { router.push('/'); return }
      setPost(data as Post)
      setLoading(false)
      await supabase.from('posts')
        .update({ view_count: (data.view_count ?? 0) + 1 }).eq('id', id)
    }
    fetchPost()
  }, [id, router])

  // Record a click and update cooldown state
  const recordClick = useCallback(async () => {
    const res = await fetch('/api/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: id }),
    })
    const data = await res.json()
    setClickCount(data.count ?? 0)
    if (data.onCooldown && data.cooldownEndsAt) {
      setOnCooldown(true)
      startTimer(new Date(data.cooldownEndsAt).getTime())
    }
  }, [id, startTimer])

  const handleCopy = async () => {
    if (!post || onCooldown) return
    navigator.clipboard.writeText(post.link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    await recordClick()
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 rounded-full animate-spin"
          style={{ borderTopColor: '#5F85DB' }} />
      </main>
    )
  }

  if (!post) return null

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true }).replace(/^about /, '')

  return (
    <main className="min-h-screen">
      <div className="max-w-screen-lg mx-auto px-4 py-6">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/40 hover:text-white mb-6 transition-colors text-sm group"
        >
          <FiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left — Cover image */}
          <div className="w-full lg:w-[320px] flex-shrink-0">
            <div
              className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden"
              style={{
                ...glass,
                boxShadow: '0 16px 48px rgba(95,133,219,0.15), 0 4px 16px rgba(0,0,0,0.5)',
              }}
            >
              {post.cover_image_url ? (
                <Image
                  src={post.cover_image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white/20">
                  <FiImage size={64} />
                </div>
              )}
            </div>
          </div>

          {/* Right — Details */}
          <div className="flex-1 flex flex-col">
            <h1 className="text-white text-3xl font-bold mb-1 leading-tight">{post.title}</h1>
            <p className="text-white/35 text-sm mb-6">{timeAgo}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              <StatCard icon={<FiHardDrive size={16} />} label="File Size" value={post.file_size} accent="#5F85DB" />
              <StatCard icon={<FiImage size={16} />} label="Photos" value={post.photo_count.toLocaleString()} accent="#5adb8e" />
              <StatCard icon={<FiFilm size={16} />} label="Videos" value={post.video_count.toLocaleString()} accent="#a78bfa" />
              <StatCard icon={<FiEye size={16} />} label="Views" value={(post.view_count ?? 0).toLocaleString()} accent="#fbbf24" />
              <StatCard icon={<FiClock size={16} />} label="Uploaded" value={timeAgo} accent="#f87171" />
            </div>

            {/* Divider */}
            <div className="border-t border-white/8 mb-6" />

            {/* Cooldown warning banner */}
            {onCooldown && (
              <div
                className="rounded-xl px-4 py-3 mb-4 flex items-center gap-3 text-sm"
                style={{
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.2)',
                  color: 'rgba(251,191,36,0.85)',
                }}
              >
                <FiLock size={14} className="flex-shrink-0" />
                <span>
                  You have used {clickCount} of 3 free link accesses. Links unlock in{' '}
                  <span className="font-bold">{countdown}</span>
                </span>
              </div>
            )}

            {/* Click counter (when not on cooldown) */}
            {!onCooldown && clickCount > 0 && (
              <p className="text-white/25 text-xs mb-3 text-center">
                {3 - clickCount} free link {3 - clickCount === 1 ? 'access' : 'accesses'} remaining
              </p>
            )}

            {/* Open Link button */}
            {onCooldown ? (
              <div
                className="flex items-center justify-center gap-2 w-full font-semibold py-4 rounded-2xl mb-3 text-base cursor-not-allowed select-none"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.25)',
                }}
              >
                <FiLock size={16} />
                Available in {countdown}
              </div>
            ) : (
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordClick()}
                className="flex items-center justify-center gap-2 w-full text-white font-semibold py-4 rounded-2xl transition-all duration-200 text-base mb-3"
                style={{
                  background: '#5F85DB',
                  boxShadow: '0 8px 32px rgba(95,133,219,0.35)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = '#4a70c4'
                  ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(95,133,219,0.5)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = '#5F85DB'
                  ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(95,133,219,0.35)'
                }}
              >
                <FiExternalLink size={18} />
                Open Link
              </a>
            )}

            {/* Copy button */}
            {onCooldown ? (
              <div
                className="flex items-center justify-center gap-2 w-full font-medium py-3 rounded-2xl text-sm border cursor-not-allowed select-none"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.2)',
                }}
              >
                <FiLock size={14} />
                Copy Link
              </div>
            ) : (
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 w-full font-medium py-3 rounded-2xl transition-all duration-200 text-sm border"
                style={copied ? {
                  background: 'rgba(74,222,128,0.1)',
                  borderColor: 'rgba(74,222,128,0.3)',
                  color: '#4ade80',
                } : {
                  ...glass,
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function StatCard({ icon, label, value, accent }: {
  icon: React.ReactNode
  label: string
  value: string
  accent: string
}) {
  return (
    <div
      className="rounded-xl px-4 py-3 flex items-center gap-3"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span className="flex-shrink-0" style={{ color: accent }}>{icon}</span>
      <div className="min-w-0">
        <p className="text-white/30 text-xs">{label}</p>
        <p className="text-white text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  )
}
