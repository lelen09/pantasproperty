import { BadgeCheck, Star, Trophy } from 'lucide-react'

const CONFIG: Record<string, { label: string; icon: any; className: string }> = {
  verified: { label: 'Terverifikasi', icon: BadgeCheck, className: 'text-blue-500' },
  top_agent: { label: 'Top Agent', icon: Star, className: 'text-gold-500' },
  super_agent: { label: 'Super Agent', icon: Trophy, className: 'text-amber-600' },
}

export default function AgentBadge({ badge, size = 13 }: { badge?: string; size?: number }) {
  if (!badge || badge === 'none' || !CONFIG[badge]) return null
  const { label, icon: Icon, className } = CONFIG[badge]
  return (
    <span className={`inline-flex items-center ${className}`} title={label}>
      <Icon size={size} fill="currentColor" className="opacity-90" />
    </span>
  )
}
