/**
 * Returns the list of allowed admin emails from the environment variable.
 * Set NEXT_PUBLIC_ADMIN_EMAILS in .env.local as a comma-separated list.
 * Example: admin@example.com,owner@example.com
 */
export function getAdminEmails(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? ''
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  const admins = getAdminEmails()
  return admins.includes(email.toLowerCase())
}
