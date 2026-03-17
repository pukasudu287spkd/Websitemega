'use client'

import { useEffect, useRef } from 'react'
import {
  FiClock, FiTrendingUp, FiEye,
  FiShuffle, FiHardDrive, FiCalendar,
  FiCheck
} from 'react-icons/fi'
import type { SortOption } from '@/lib/types'

interface SortItem {
  value: SortOption
  label: string
  icon: React.ReactNode
  requiresAuth: boolean
}

const SORT_OPTIONS: SortItem[] = [
  { value: 'new',    label: 'New',    icon: <FiClock />,      requiresAuth: false },
  { value: 'hot',    label: 'Hot',    icon: <FiTrendingUp />, requiresAuth: false },
  { value: 'views',  label: 'Views',  icon: <FiEye />,        requiresAuth: false },
  { value: 'random', label: 'Random', icon: <FiShuffle />,    requiresAuth: false },
  { value: 'size',   label: 'Size',   icon: <FiHardDrive />,  requiresAuth: false },
  { value: 'oldest', label: 'Oldest', icon: <FiCalendar />,   requiresAuth: false },
]

interface SortDropdownProps {
  current: SortOption
  onSelect: (value: SortOption) => void
  onClose: () => void
}

export default function SortDropdown({ current, onSelect, onClose }: SortDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { void onClose }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-44 rounded-2xl overflow-hidden z-50 border"
      style={{
        background: 'rgba(13,16,37,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderColor: 'rgba(255,255,255,0.12)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 4px 16px rgba(95,133,219,0.1)',
      }}
    >
      {SORT_OPTIONS.map((item) => {
        const isActive = current === item.value
        return (
          <button
            key={item.value}
            onClick={() => { onSelect(item.value); onClose() }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors duration-150"
            style={{
              background: isActive ? 'rgba(95,133,219,0.15)' : undefined,
              color: isActive ? '#5F85DB' : 'rgba(255,255,255,0.75)',
            }}
            onMouseEnter={e => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'
            }}
            onMouseLeave={e => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            }}
          >
            <span style={{ color: isActive ? '#5F85DB' : 'rgba(255,255,255,0.35)' }}>
              {item.icon}
            </span>
            <span className="flex-1">{item.label}</span>
            {isActive && <FiCheck size={14} style={{ color: '#5F85DB' }} />}
          </button>
        )
      })}
    </div>
  )
}

export { SORT_OPTIONS }
export type { SortItem }
