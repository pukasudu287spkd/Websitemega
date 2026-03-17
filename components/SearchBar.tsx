'use client'

import { useState, useEffect, useRef } from 'react'
import { FiSearch, FiX, FiTrendingUp, FiTag, FiChevronDown, FiCheck } from 'react-icons/fi'
import { supabase } from '@/lib/supabase'
import { SORT_OPTIONS } from './SortDropdown'
import type { SortOption, Category } from '@/lib/types'

interface SearchBarProps {
  searchQuery: string
  sortOption: SortOption
  selectedCategory: string | null
  onSearchChange: (query: string) => void
  onSortChange: (sort: SortOption) => void
  onCategoryChange: (id: string | null) => void
}

export default function SearchBar({
  searchQuery,
  sortOption,
  selectedCategory,
  onSearchChange,
  onSortChange,
  onCategoryChange,
}: SearchBarProps) {
  const [showTrending, setShowTrending] = useState(false)
  const [trending, setTrending] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [catOpen, setCatOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const catRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase
      .from('posts')
      .select('title')
      .order('view_count', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (data) setTrending(data.map(p => p.title))
      })
    supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
      .then(({ data }) => {
        if (data) setCategories(data as Category[])
      })
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowTrending(false)
      }
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleTrendingClick = (title: string) => {
    onSearchChange(title)
    setShowTrending(false)
    inputRef.current?.blur()
  }

  const filtered = searchQuery
    ? trending.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    : trending

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3" style={{ position: 'relative', zIndex: 200 }}>

      {/* Search input row + Category button */}
      <div className="flex items-center gap-2" style={{ position: 'relative', zIndex: 10 }}>

        {/* Search input */}
        <div ref={wrapperRef} className="flex-1" style={{ position: 'relative', zIndex: 100 }}>
          <div
            className="flex items-center gap-2.5 rounded-2xl px-4 py-3 h-full transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${showTrending ? 'rgba(95,133,219,0.45)' : 'rgba(255,255,255,0.10)'}`,
              boxShadow: showTrending ? '0 0 0 3px rgba(95,133,219,0.07)' : 'none',
            }}
          >
            <FiSearch
              size={15}
              style={{
                color: showTrending ? '#5F85DB' : 'rgba(255,255,255,0.3)',
                flexShrink: 0,
                transition: 'color 0.2s',
              }}
            />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              onFocus={() => setShowTrending(true)}
              placeholder="Search posts..."
              className="bg-transparent text-white text-sm placeholder-white/25 outline-none flex-1 min-w-0"
            />
            {searchQuery && (
              <button
                onMouseDown={e => { e.preventDefault(); onSearchChange(''); setShowTrending(true) }}
                className="flex-shrink-0 transition-colors duration-150"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)')}
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          {/* Trending panel */}
          {showTrending && filtered.length > 0 && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 'calc(100% + 8px)',
                zIndex: 9999,
                borderRadius: 16,
                overflow: 'hidden',
                background: 'rgba(10,13,30,0.97)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.10)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 4px 16px rgba(95,133,219,0.08)',
              }}
            >
              <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                <FiTrendingUp size={12} style={{ color: '#5F85DB' }} />
                <span className="text-white/30 text-xs font-medium uppercase tracking-wider">Trending</span>
              </div>
              <div className="p-2">
                {filtered.map((title, i) => (
                  <button
                    key={i}
                    onMouseDown={e => { e.preventDefault(); handleTrendingClick(title) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left group transition-colors duration-100"
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                  >
                    <FiTrendingUp size={12} className="flex-shrink-0" style={{ color: 'rgba(95,133,219,0.5)' }} />
                    <span className="text-white/60 text-sm truncate group-hover:text-white transition-colors duration-100">
                      {title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category button — fixed width, right of search bar */}
        {categories.length > 0 && (
          <div ref={catRef} style={{ position: 'relative', flexShrink: 0, zIndex: 100 }}>
            <button
              onClick={() => setCatOpen(o => !o)}
              onMouseDown={e => e.stopPropagation()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                width: 148,
                padding: '12px 16px',
                borderRadius: 16,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                background: selectedCategory ? 'rgba(95,133,219,0.18)' : 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${selectedCategory ? 'rgba(95,133,219,0.45)' : 'rgba(255,255,255,0.10)'}`,
                color: selectedCategory ? '#5F85DB' : 'rgba(255,255,255,0.45)',
                transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              <FiTag size={13} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 76, flexShrink: 1 }}>
                {selectedCategory
                  ? (categories.find(c => c.id === selectedCategory)?.name ?? 'Category')
                  : 'Categories'}
              </span>
              <FiChevronDown
                size={12}
                style={{
                  flexShrink: 0,
                  transition: 'transform 0.2s',
                  transform: catOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {catOpen && (
              <div
                onMouseDown={e => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: 188,
                  zIndex: 9999,
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: 'rgba(10,13,30,0.97)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 4px 16px rgba(95,133,219,0.08)',
                }}
              >
                <div style={{ padding: '10px 12px 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiTag size={11} style={{ color: '#5F85DB' }} />
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Categories
                  </span>
                </div>
                <div style={{ padding: 6 }}>
                  <button
                    onClick={() => { onCategoryChange(null); setCatOpen(false) }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: 12, padding: '8px 12px', borderRadius: 12, textAlign: 'left', fontSize: 14,
                      color: !selectedCategory ? 'white' : 'rgba(255,255,255,0.55)',
                      background: 'transparent', cursor: 'pointer', transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                  >
                    <span>All</span>
                    {!selectedCategory && <FiCheck size={12} style={{ color: '#5F85DB', flexShrink: 0 }} />}
                  </button>

                  {categories.map(cat => {
                    const isSelected = selectedCategory === cat.id
                    return (
                      <button
                        key={cat.id}
                        onClick={() => { onCategoryChange(cat.id); setCatOpen(false) }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          gap: 12, padding: '8px 12px', borderRadius: 12, textAlign: 'left', fontSize: 14,
                          color: isSelected ? 'white' : 'rgba(255,255,255,0.55)',
                          background: 'transparent', cursor: 'pointer', transition: 'background 0.1s',
                          overflow: 'hidden',
                        }}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                        {isSelected && <FiCheck size={12} style={{ color: '#5F85DB', flexShrink: 0 }} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter chips row */}
      <div className="flex items-center gap-2 flex-wrap" style={{ position: 'relative', zIndex: 1 }}>
        {SORT_OPTIONS.map(option => {
          const isActive = sortOption === option.value
          return (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
              style={{
                background: isActive ? 'rgba(95,133,219,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isActive ? 'rgba(95,133,219,0.45)' : 'rgba(255,255,255,0.08)'}`,
                color: isActive ? '#5F85DB' : 'rgba(255,255,255,0.45)',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.background = 'rgba(255,255,255,0.08)'
                  el.style.color = 'rgba(255,255,255,0.7)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.background = 'rgba(255,255,255,0.05)'
                  el.style.color = 'rgba(255,255,255,0.45)'
                }
              }}
            >
              <span style={{ fontSize: 11 }}>{option.icon}</span>
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
