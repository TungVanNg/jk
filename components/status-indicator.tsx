"use client"
import type { LucideIcon } from "lucide-react"

interface StatusIndicatorProps {
  icon: LucideIcon
  label: string
  status?: boolean
  color: "blue" | "green" | "orange" | "red"
  compact?: boolean
}

export function StatusIndicator({ icon: Icon, label, status, color, compact = false }: StatusIndicatorProps) {
  const getColorClasses = () => {
    if (!status) return "text-gray-400 bg-gray-100"

    switch (color) {
      case "blue":
        return "text-blue-600 bg-blue-100"
      case "green":
        return "text-green-600 bg-green-100"
      case "orange":
        return "text-orange-600 bg-orange-100"
      case "red":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${getColorClasses()}`}>
        <Icon className="h-3 w-3" />
        <span className="text-xs font-medium">{label}</span>
        <div className={`w-1.5 h-1.5 rounded-full ${status ? "bg-current" : "bg-gray-400"}`} />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getColorClasses()}`}>
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
      <div className={`w-2 h-2 rounded-full ${status ? "bg-current" : "bg-gray-400"}`} />
    </div>
  )
}
