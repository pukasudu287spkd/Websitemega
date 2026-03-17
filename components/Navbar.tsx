'use client'

import Link from 'next/link'
import { FiFilm } from 'react-icons/fi'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/8"
      style={{ background: 'rgba(10, 12, 26, 0.8)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-13 py-2.5">
          <Link href="/" className="flex items-center gap-2 font-bold text-white group">
            <FiFilm
              size={20}
              className="transition-transform duration-200 group-hover:scale-110"
              style={{ color: '#5F85DB' }}
            />
            <span className="text-sm tracking-wide text-white/80 group-hover:text-white transition-colors duration-200">
              MediaVault
            </span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
