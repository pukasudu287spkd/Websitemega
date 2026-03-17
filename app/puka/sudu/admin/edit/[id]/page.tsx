'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { FiUploadCloud, FiX, FiArrowLeft } from 'react-icons/fi'
import type { Post } from '@/lib/types'

const inputCls = 'w-full text-white placeholder-white/25 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200'
const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [fileSize, setFileSize] = useState('')
  const [adminLink, setAdminLink] = useState('')
  const [photoCount, setPhotoCount] = useState('')
  const [videoCount, setVideoCount] = useState('')
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    const fetchPost = async () => {
      const { data, error } = await supabase.from('posts').select('*').eq('id', id).single()
      if (error || !data) { router.push('/puka/sudu/admin/dashboard'); return }
      const post = data as Post
      setTitle(post.title)
      setLink(post.link)
      setFileSize(post.file_size)
      setAdminLink(post.admin_link ?? '')
      setPhotoCount(String(post.photo_count ?? ''))
      setVideoCount(String(post.video_count ?? ''))
      setExistingCoverUrl(post.cover_image_url || null)
      setLoading(false)
    }
    fetchPost()
  }, [id, router])

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setUploading(true)

    try {
      let coverImageUrl = existingCoverUrl ?? ''

      if (coverFile) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
        const formData = new FormData()
        formData.append('file', coverFile)
        formData.append('upload_preset', uploadPreset!)
        formData.append('folder', 'media_covers')

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: formData }
        )
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error?.message ? `Cloudinary: ${data.error.message}` : 'Image upload failed.')
        coverImageUrl = data.secure_url
      }

      const { error: updateError } = await supabase.from('posts').update({
        title: title.trim(), link: link.trim(),
        file_size: fileSize.trim(), file_size_bytes: 0,
        admin_link: adminLink.trim() || null,
        photo_count: parseInt(photoCount) || 0, video_count: parseInt(videoCount) || 0,
        cover_image_url: coverImageUrl,
      }).eq('id', id)

      if (updateError) throw updateError
      router.push('/puka/sudu/admin/dashboard')
    } catch (err: unknown) {
      setError(err && typeof err === 'object' && 'message' in err
        ? `Error: ${(err as { message: string }).message}`
        : 'Something went wrong. Please try again.')
    }

    setUploading(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 rounded-full animate-spin"
          style={{ borderTopColor: '#5F85DB' }} />
      </main>
    )
  }

  const displayCover = coverPreview ?? existingCoverUrl

  return (
    <main className="min-h-screen">
      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.push('/puka/sudu/admin/dashboard')}
            className="text-white/35 hover:text-white transition-colors duration-200">
            <FiArrowLeft size={18} />
          </button>
          <h1 className="text-white text-2xl font-bold">Edit Post</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Title *">
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Succubus" className={inputCls} style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(95,133,219,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.10)')} />
          </Field>

          <Field label="Public Link *">
            <input required type="url" value={link} onChange={e => setLink(e.target.value)}
              placeholder="https://mega.nz/..." className={inputCls} style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(95,133,219,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.10)')} />
          </Field>

          <AdminLinkField value={adminLink} onChange={setAdminLink} inputCls={inputCls} />

          <Field label="File Size *">
            <input required type="text" value={fileSize} onChange={e => setFileSize(e.target.value)}
              placeholder="e.g. 35 GB" className={inputCls} style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(95,133,219,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.10)')} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Photo Count">
              <input type="number" min="0" value={photoCount} onChange={e => setPhotoCount(e.target.value)}
                placeholder="e.g. 114" className={inputCls} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(95,133,219,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.10)')} />
            </Field>
            <Field label="Video Count">
              <input type="number" min="0" value={videoCount} onChange={e => setVideoCount(e.target.value)}
                placeholder="e.g. 162" className={inputCls} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(95,133,219,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.10)')} />
            </Field>
          </div>

          <Field label="Cover Image">
            {displayCover ? (
              <div className="relative">
                <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Image src={displayCover} alt="Cover" fill className="object-cover" unoptimized />
                </div>
                <button type="button"
                  onClick={() => { setCoverFile(null); setCoverPreview(null); setExistingCoverUrl(null) }}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1 transition">
                  <FiX size={16} />
                </button>
                <label className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1.5 bg-black/70 hover:bg-black/90 text-white text-xs py-2 rounded-lg cursor-pointer transition">
                  <FiUploadCloud size={13} />
                  Replace image
                  <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 w-full h-40 rounded-xl cursor-pointer transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1.5px dashed rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.3)',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLLabelElement).style.borderColor = 'rgba(95,133,219,0.4)')}
                onMouseLeave={e => ((e.currentTarget as HTMLLabelElement).style.borderColor = 'rgba(255,255,255,0.15)')}>
                <FiUploadCloud size={32} />
                <span className="text-sm">Click to upload cover image</span>
                <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
              </label>
            )}
          </Field>

          {error && (
            <div className="text-sm rounded-xl px-4 py-3"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={uploading}
            className="w-full text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#5F85DB', boxShadow: '0 4px 16px rgba(95,133,219,0.3)' }}
            onMouseEnter={e => { if (!uploading) (e.currentTarget as HTMLButtonElement).style.background = '#4a70c4' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#5F85DB' }}>
            {uploading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-white/45 text-sm mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function AdminLinkField({ value, onChange, inputCls }: {
  value: string
  onChange: (v: string) => void
  inputCls: string
}) {
  return (
    <div className="rounded-xl p-4" style={{
      background: 'rgba(95,133,219,0.06)',
      border: '1px solid rgba(95,133,219,0.2)',
    }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(95,133,219,0.2)', color: '#5F85DB' }}>
          Admin Only
        </span>
        <label className="text-white/45 text-sm">Private Link</label>
      </div>
      <input
        type="url"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="https://... (only visible to admins)"
        className={inputCls}
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(95,133,219,0.25)' }}
        onFocus={e => (e.target.style.borderColor = 'rgba(95,133,219,0.6)')}
        onBlur={e => (e.target.style.borderColor = 'rgba(95,133,219,0.25)')}
      />
    </div>
  )
}
