'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiShield, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiFilm, FiCheck } from 'react-icons/fi'

type InputFieldProps = {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  icon: React.ReactNode
  suffix?: React.ReactNode
}

function InputField({ label, type, value, onChange, placeholder, icon, suffix }: InputFieldProps) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 8 }}>
        {label}
      </label>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 14px',
        borderRadius: 12,
        background: focused ? 'rgba(95,133,219,0.06)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${focused ? 'rgba(95,133,219,0.5)' : 'rgba(255,255,255,0.08)'}`,
        transition: 'all 0.2s',
      }}>
        <span style={{ color: focused ? '#5F85DB' : 'rgba(255,255,255,0.25)', flexShrink: 0, display: 'flex', transition: 'color 0.2s' }}>
          {icon}
        </span>
        <input
          type={type}
          required
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'white',
            fontSize: 14,
            padding: '13px 0',
          }}
        />
        {suffix}
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Login failed.'); setLoading(false); return }
    router.push('/puka/sudu/admin/dashboard')
    router.refresh()
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex' }}>

      {/* ── Left panel ── */}
      <div style={{
        width: '45%',
        display: 'none',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #0c1128 0%, #0f1535 50%, #080a14 100%)',
      }} className="lg-left-panel">

        {/* Glow blobs */}
        <div style={{
          position: 'absolute', top: '20%', left: '15%',
          width: 340, height: 340, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(95,133,219,0.15) 0%, transparent 70%)',
          filter: 'blur(50px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%',
          width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(95,133,219,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.025,
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 300 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{
              borderRadius: 12, padding: '8px 10px',
              background: 'rgba(95,133,219,0.15)', border: '1px solid rgba(95,133,219,0.25)',
            }}>
              <FiFilm size={20} style={{ color: '#5F85DB', display: 'block' }} />
            </div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>MediaVault</span>
          </div>

          {/* Shield */}
          <div style={{
            display: 'inline-flex', padding: 20, borderRadius: 24, marginBottom: 24,
            background: 'rgba(95,133,219,0.10)', border: '1px solid rgba(95,133,219,0.2)',
            boxShadow: '0 0 60px rgba(95,133,219,0.12)',
          }}>
            <FiShield size={44} style={{ color: '#5F85DB' }} />
          </div>

          <h2 style={{ color: 'white', fontSize: 24, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.3px' }}>
            Admin Portal
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, lineHeight: 1.7, marginBottom: 36 }}>
            Secure access to manage your media library, posts, and content settings.
          </p>

          {/* Feature list */}
          <div style={{ textAlign: 'left' }}>
            {['Manage all posts', 'Upload & edit media', 'Track analytics'].map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(95,133,219,0.15)', border: '1px solid rgba(95,133,219,0.2)',
                }}>
                  <FiCheck size={11} style={{ color: '#5F85DB' }} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        background: '#080a14',
        position: 'relative',
      }}>
        {/* Top glow (mobile) */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 500, height: 300, pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(95,133,219,0.09) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />

        <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>

          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 36 }}
            className="mobile-logo">
            <FiFilm size={17} style={{ color: '#5F85DB' }} />
            <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: 15 }}>MediaVault</span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ color: 'white', fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6 }}>
              Sign in
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
              Enter your admin credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <InputField
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="admin@example.com"
              icon={<FiMail size={16} />}
            />

            <InputField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              placeholder="••••••••••"
              icon={<FiLock size={16} />}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{ color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, flexShrink: 0 }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.25)')}
                >
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              }
            />

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                borderRadius: 12, fontSize: 13,
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171',
              }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '14px 24px', borderRadius: 12, marginTop: 4,
                background: 'linear-gradient(135deg, #5F85DB 0%, #4a70c4 100%)',
                border: 'none', color: 'white', fontWeight: 600, fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                boxShadow: '0 4px 24px rgba(95,133,219,0.3)',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 28px rgba(95,133,219,0.5)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(95,133,219,0.3)' }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite', flexShrink: 0,
                  }} />
                  Verifying...
                </>
              ) : (
                <>Sign in to Dashboard <FiArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 28 }}>
            <a href="/" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, textDecoration: 'none' }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.2)')}>
              ← Back to site
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 1024px) {
          .lg-left-panel { display: flex !important; }
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </main>
  )
}
