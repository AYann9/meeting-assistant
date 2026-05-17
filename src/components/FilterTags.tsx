"use client"

import { Badge } from "@/components/ui/badge"
import { X, Filter } from "lucide-react"

export type FilterType = "type" | "attendee" | "tag" | "date"

export interface FilterOption {
  type: FilterType
  value: string
  label: string
}

interface FilterTagsProps {
  filters: FilterOption[]
  onRemove: (filter: FilterOption) => void
  onClearAll: () => void
  availableFilters?: {
    types?: { value: string; label: string }[]
    attendees?: string[]
    tags?: string[]
  }
  onAddFilter?: (filter: FilterOption) => void
}

export default function FilterTags({
  filters,
  onRemove,
  onClearAll,
  availableFilters,
  onAddFilter,
}: FilterTagsProps) {
  const getFilterColor = (type: FilterType) => {
    switch (type) {
      case "type":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
      case "attendee":
        return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
      case "tag":
        return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
      case "date":
        return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
    }
  }

  const getFilterLabel = (type: FilterType) => {
    switch (type) {
      case "type":
        return "类型"
      case "attendee":
        return "参会人"
      case "tag":
        return "标签"
      case "date":
        return "时间"
      default:
        return type
    }
  }

  return (
    <div className="space-y-3">
      {filters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          {filters.map((filter, index) => (
            <Badge
              key={`${filter.type}-${filter.value}-${index}`}
              variant="outline"
              className={`${getFilterColor(filter.type)} cursor-pointer gap-1 px-2 py-1`}
              onClick={() => onRemove(filter)}
            >
              <span className="text-xs opacity-60">{getFilterLabel(filter.type)}:</span>
              <span className="text-xs font-medium">{filter.label}</span>
              <X className="w-3 h-3 ml-0.5" />
            </Badge>
          ))}
          <button
            onClick={onClearAll}
            className="text-xs text-slate-500 hover:text-slate-700 underline"
          >
            清除全部
          </button>
        </div>
      )}

      {availableFilters && onAddFilter && (
        <div className="space-y-2">
          {availableFilters.types && availableFilters.types.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400">会议类型：</span>
              {availableFilters.types.map((type) => (
                <Badge
                  key={type.value}
                  variant="outline"
                  className="cursor-pointer text-xs hover:bg-blue-50"
                  onClick={() =>
                    onAddFilter({ type: "type", value: type.value, label: type.label })
                  }
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          )}

          {availableFilters.attendees && availableFilters.attendees.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400">参会人：</span>
              {availableFilters.attendees.slice(0, 8).map((attendee) => (
                <Badge
                  key={attendee}
                  variant="outline"
                  className="cursor-pointer text-xs hover:bg-green-50"
                  onClick={() =>
                    onAddFilter({ type: "attendee", value: attendee, label: attendee })
                  }
                >
                  {attendee}
                </Badge>
              ))}
              {availableFilters.attendees.length > 8 && (
                <span className="text-xs text-slate-400">
                  +{availableFilters.attendees.length - 8} 更多
                </span>
              )}
            </div>
          )}

          {availableFilters.tags && availableFilters.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400">标签：</span>
              {availableFilters.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer text-xs hover:bg-purple-50"
                  onClick={() => onAddFilter({ type: "tag", value: tag, label: tag })}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
