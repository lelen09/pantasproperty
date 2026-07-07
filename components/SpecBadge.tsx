import type { LucideIcon } from 'lucide-react'

export default function SpecBadge({
  icon: Icon,
  label,
}: {
  icon: LucideIcon
  label: string
}) {
  return (
    <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
      <Icon size={14} className="text-gray-400" />
      {label}
    </span>
  )
}
