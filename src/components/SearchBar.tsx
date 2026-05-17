"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Sparkles } from "lucide-react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  loading?: boolean
}

export default function SearchBar({ value, onChange, onSearch, loading }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={`relative flex items-center gap-2 transition-all ${isFocused ? "scale-[1.01]" : ""}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="搜索会议纪要，例如：上次和王总讨论预算"
          className="pl-10 pr-10 h-11 text-base"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <Button onClick={onSearch} disabled={loading} className="h-11 px-6">
        {loading ? (
          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Search className="w-4 h-4 mr-2" />
        )}
        {loading ? "搜索中..." : "搜索"}
      </Button>
    </div>
  )
}
