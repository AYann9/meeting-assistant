'use client'

import { useState, useEffect, useMemo } from 'react'
import { SearchResult, MeetingType, MEETING_TYPE_LABELS, MEETING_TYPE_COLORS } from '@/lib/types'
import { searchMeetings, SearchFilters, getAllTags, getAllAttendees } from '@/lib/search'
import { Search, Filter, X, Calendar, Users, Tag, FileText, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [filters, setFilters] = useState<SearchFilters>({
    meetingTypes: [],
    attendees: [],
    tags: [],
  })

  const allTags = useMemo(() => getAllTags(), [results])
  const allAttendees = useMemo(() => getAllAttendees(), [results])

  const searchSuggestions = [
    '上次和王总讨论预算',
    '项目推进会议决议',
    '客户拜访待办事项',
    '周例会行动计划',
    '技术方案讨论',
    '资源分配决策',
    '风险评估',
    '产品需求确认',
  ]

  useEffect(() => {
    if (query.trim()) {
      setIsSearching(true)
      const timer = setTimeout(() => {
        const searchResults = searchMeetings(query, filters)
        setResults(searchResults)
        setIsSearching(false)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setResults([])
    }
  }, [query, filters])

  useEffect(() => {
    if (query.trim().length > 0) {
      const filtered = searchSuggestions.filter(s =>
        s.toLowerCase().includes(query.toLowerCase())
      )
      setSuggestions(filtered.slice(0, 5))
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }, [query])

  const toggleFilter = (type: 'meetingTypes' | 'attendees' | 'tags', value: string) => {
    setFilters(prev => {
      const current = prev[type] || []
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [type]: updated }
    })
  }

  const clearFilters = () => {
    setFilters({ meetingTypes: [], attendees: [], tags: [] })
  }

  const activeFilterCount = (filters.meetingTypes?.length || 0) + (filters.attendees?.length || 0) + (filters.tags?.length || 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">会议纪要搜索</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="relative mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim().length > 0 && setShowSuggestions(true)}
              placeholder="搜索会议纪要... 试试: 上次和王总讨论预算"
              className="w-full pl-12 pr-32 py-4 bg-white border border-slate-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {query && (
                <button
                  onClick={() => {
                    setQuery('')
                    setResults([])
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilterCount > 0
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                筛选
                {activeFilterCount > 0 && (
                  <span className="bg-white text-primary text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {showSuggestions && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-lg z-10">
              <div className="p-2">
                <p className="text-xs text-slate-400 px-3 py-2">搜索建议</p>
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(suggestion)
                      setShowSuggestions(false)
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700 flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {showFilters && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">筛选条件</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  清除全部
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-medium text-slate-500 mb-2">会议类型</h4>
                <div className="flex flex-wrap gap-2">
                  {(['project_review', 'client_visit', 'weekly_standup', 'other'] as MeetingType[]).map(type => {
                    const colors = MEETING_TYPE_COLORS[type]
                    const isSelected = filters.meetingTypes?.includes(type)
                    return (
                      <button
                        key={type}
                        onClick={() => toggleFilter('meetingTypes', type)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                          isSelected
                            ? `${colors.bg} ${colors.text} ${colors.border} ring-2 ring-primary/30`
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {MEETING_TYPE_LABELS[type]}
                      </button>
                    )
                  })}
                </div>
              </div>

              {allAttendees.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-slate-500 mb-2">参会人</h4>
                  <div className="flex flex-wrap gap-2">
                    {allAttendees.map(attendee => {
                      const isSelected = filters.attendees?.includes(attendee)
                      return (
                        <button
                          key={attendee}
                          onClick={() => toggleFilter('attendees', attendee)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            isSelected
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {attendee}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {allTags.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-slate-500 mb-2">标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => {
                      const isSelected = filters.tags?.includes(tag)
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleFilter('tags', tag)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            isSelected
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Tag className="w-3 h-3 inline mr-1" />
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {isSearching ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500">搜索中...</p>
            </div>
          ) : query.trim() ? (
            results.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-500">
                    找到 <span className="font-medium text-slate-900">{results.length}</span> 个相关结果
                  </p>
                </div>
                {results.map((result, index) => (
                  <SearchResultCard key={result.meeting.id} result={result} index={index} />
                ))}
              </>
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">未找到相关结果</p>
                <p className="text-sm text-slate-400 mt-1">尝试其他关键词或调整筛选条件</p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">输入关键词开始搜索</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {searchSuggestions.slice(0, 4).map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(suggestion)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-primary hover:text-primary transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SearchResultCard({ result, index }: { result: SearchResult; index: number }) {
  const { meeting, minutes, highlights } = result
  const date = meeting.scheduled_at ? new Date(meeting.scheduled_at) : new Date()
  const meetingType = (meeting.meeting_type || 'other') as keyof typeof MEETING_TYPE_COLORS
  const typeColors = MEETING_TYPE_COLORS[meetingType]
  const typeLabel = MEETING_TYPE_LABELS[meetingType]

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeColors.bg} ${typeColors.text} ${typeColors.border}`}>
            {typeLabel}
          </span>
          <span className="text-xs text-slate-400">
            {date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <span className="text-xs text-slate-400">
          相关度: {Math.round(result.relevance * 10)}%
        </span>
      </div>

      <Link href={`/meetings/${meeting.id}`} className="block">
        <h3 className="text-lg font-semibold text-slate-900 mb-2 hover:text-primary transition-colors">
          {meeting.title}
        </h3>
      </Link>

      <div className="flex items-center gap-4 mb-3 text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {meeting.attendees.join(', ')}
        </span>
        {meeting.tags && meeting.tags.length > 0 && (
          <span className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            {meeting.tags.join(', ')}
          </span>
        )}
      </div>

      {highlights.length > 0 && (
        <div className="space-y-2 mt-4">
          {highlights.slice(0, 3).map((highlight, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3">
              <span className="text-xs font-medium text-slate-500 mb-1 block">
                {highlight.field}
              </span>
              <p
                className="text-sm text-slate-700"
                dangerouslySetInnerHTML={{ __html: highlight.text }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
        <Link
          href={`/meetings/${meeting.id}`}
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          查看详情
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        {minutes && (
          <Link
            href={`/meetings/${meeting.id}/notes`}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <FileText className="w-3.5 h-3.5" />
            查看纪要
          </Link>
        )}
      </div>
    </div>
  )
}
