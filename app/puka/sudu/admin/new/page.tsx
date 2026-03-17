'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { FiUploadCloud, FiX, FiLogOut, FiGrid } from 'react-icons/fi'

const inputCls = 'w-full text-white placeholder-white/25 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200'
const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [fileSize, setFileSize] = useState('')
  const [adminLink, setAdminLink] = useState('')
  const [photoCount, setPhotoCount] = useState('')
  const [videoCount, setVideoCount] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleAdminLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/')
    router.refresh()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setUploading(true)

    try {
      let coverImageUrl = ''

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
        if (!res.ok) throw new Error(data?.error?.message ? `Cloudinary: ${data.error.message}` : 'Image upload to Cloudinary failed.')
        coverImageUrl = data.secure_url
      }

      const { error: insertError } = await supabase.from('posts').insert({
        title: title.trim(), link: link.trim(),
        file_size: fileSize.trim(), file_size_bytes: 0,
        admin_link: adminLink.trim() || null,
        photo_count: parseInt(photoCount) || 0, video_count: parseInt(videoCount) || 0,
        cover_image_url: coverImageUrl,
      })

      if (insertError) throw insertError
      router.push('/puka/sudu/admin/dashboard')
    } catch (err: unknown) {
      setError(err && typeof err === 'object' && 'message' in err
        ? `Error: ${(err as { message: string }).message}`
        : 'Something went wrong. Please try again.')
    }

    setUploading(false)
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-white text-2xl font-bold">New Post</h1>
          <div className="flex items-center gap-2">
            <Link href="/puka/sudu/admin/dashboard"
              className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm px-3 py-1.5 rounded-lg transition-colors duration-200"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <FiGrid size={14} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <button onClick={handleAdminLogout}
              className="flex items-center gap-1.5 text-white/35 hover:text-white text-sm px-3 py-1.5 rounded-lg transition-colors duration-200"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <FiLogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
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
            {coverPreview ? (
              <div className="relative">
                <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Image src={coverPreview} alt="Cover preview" fill className="object-cover" unoptimized />
                </div>
                <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null) }}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1 transition">
                  <FiX size={16} />
                </button>
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
            {uploading ? 'Publishing...' : 'Publish Post'}
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
