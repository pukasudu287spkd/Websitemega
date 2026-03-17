import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

const COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes
const MAX_CLICKS = 3

function getIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

// GET /api/track-click — check how many clicks this IP has in the last 4h
export async function GET(req: NextRequest) {
  const ip = getIP(req)
  const since = new Date(Date.now() - COOLDOWN_MS).toISOString()

  const { data, error } = await supabase
    .from('link_clicks')
    .select('clicked_at')
    .eq('ip_address', ip)
    .gte('clicked_at', since)
    .order('clicked_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const count = data.length
  const onCooldown = count >= MAX_CLICKS

  // The cooldown ends 4 hours after the FIRST click in this window
  const cooldownEndsAt = onCooldown
    ? new Date(new Date(data[0].clicked_at).getTime() + COOLDOWN_MS).toISOString()
    : null

  return NextResponse.json({ count, onCooldown, cooldownEndsAt, maxClicks: MAX_CLICKS })
}

// POST /api/track-click — record a new click for this IP
export async function POST(req: NextRequest) {
  const ip = getIP(req)
  const body = await req.json().catch(() => ({}))
  const post_id = body.post_id ?? null

  // Check current count first — don't record if already on cooldown
  const since = new Date(Date.now() - COOLDOWN_MS).toISOString()
  const { data: existing } = await supabase
    .from('link_clicks')
    .select('clicked_at')
    .eq('ip_address', ip)
    .gte('clicked_at', since)
    .order('clicked_at', { ascending: true })

  const count = existing?.length ?? 0

  if (count >= MAX_CLICKS) {
    const cooldownEndsAt = new Date(
      new Date(existing![0].clicked_at).getTime() + COOLDOWN_MS
    ).toISOString()
    return NextResponse.json({ onCooldown: true, count, cooldownEndsAt, maxClicks: MAX_CLICKS })
  }

  // Insert the new click
  const { error } = await supabase.from('link_clicks').insert({ ip_address: ip, post_id })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const newCount = count + 1
  const onCooldown = newCount >= MAX_CLICKS
  const allClicks = existing ?? []
  const cooldownEndsAt = onCooldown
    ? new Date(
        (allClicks.length > 0
          ? new Date(allClicks[0].clicked_at).getTime()
          : Date.now()) + COOLDOWN_MS
      ).toISOString()
    : null

  return NextResponse.json({ onCooldown, count: newCount, cooldownEndsAt, maxClicks: MAX_CLICKS })
}
