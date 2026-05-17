'use client'

import { useState, useEffect, useMemo } from 'react'
import { Meeting, MeetingType, MEETING_TYPE_COLORS, MEETING_TYPE_LABELS } from '@/lib/types'
import { getMeetings } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, CheckCircle, Clock, Calendar, Users, TrendingUp, Timer } from 'lucide-react'

interface MonthlyStats {
  month: string
  count: number
  totalDuration: number
  completedActions: number
  totalActions: number
}

interface TypeStats {
  type: MeetingType
  count: number
  percentage: number
}

export default function StatisticsPanel() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    async function load() {
      try {
        const data = await getMeetings()
        setMeetings(data || [])
      } catch (err) {
        console.error('加载会议数据失败:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const now = new Date()
    let startDate = new Date()

    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const filteredMeetings = meetings.filter(m => m.scheduled_at && new Date(m.scheduled_at) >= startDate)

    const totalMeetings = filteredMeetings.length
    const totalDuration = filteredMeetings.reduce((sum, m) => sum + (m.duration_min || 90), 0) / 60

    let totalActions = 0
    let completedActions = 0

    for (const meeting of filteredMeetings) {
      const actionItemsData = localStorage.getItem(`action_items_${meeting.id}`)
      if (actionItemsData) {
        try {
          const actionItems = JSON.parse(actionItemsData)
          totalActions += actionItems.length
          completedActions += actionItems.filter((a: any) => a.status === 'completed').length
        } catch {
          // ignore
        }
      }
    }

    const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0

    const uniqueAttendees = new Set<string>()
    for (const meeting of filteredMeetings) {
      meeting.attendees?.forEach(a => uniqueAttendees.add(a))
    }

    const typeCount: Record<string, number> = {}
    for (const meeting of filteredMeetings) {
      if (meeting.meeting_type) {
        typeCount[meeting.meeting_type] = (typeCount[meeting.meeting_type] || 0) + 1
      }
    }

    const typeStats: TypeStats[] = Object.entries(typeCount).map(([type, count]) => ({
      type: type as MeetingType,
      count,
      percentage: totalMeetings > 0 ? Math.round((count / totalMeetings) * 100) : 0,
    })).sort((a, b) => b.count - a.count)

    const monthlyData: Record<string, MonthlyStats> = {}
    for (const meeting of filteredMeetings) {
      if (!meeting.scheduled_at) continue
      const date = new Date(meeting.scheduled_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          count: 0,
          totalDuration: 0,
          completedActions: 0,
          totalActions: 0,
        }
      }

      monthlyData[monthKey].count += 1
      monthlyData[monthKey].totalDuration += (meeting.duration_min || 90) / 60

      const actionItemsData = localStorage.getItem(`action_items_${meeting.id}`)
      if (actionItemsData) {
        try {
          const actionItems = JSON.parse(actionItemsData)
          monthlyData[monthKey].totalActions += actionItems.length
          monthlyData[monthKey].completedActions += actionItems.filter((a: any) => a.status === 'completed').length
        } catch {
          // ignore
        }
      }
    }

    const monthlyTrend = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))

    return {
      totalMeetings,
      totalDuration,
      completionRate,
      totalActions,
      completedActions,
      uniqueAttendees: uniqueAttendees.size,
      typeStats,
      monthlyTrend,
    }
  }, [meetings, timeRange])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-10 w-10 rounded-lg mb-3" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">会议统计</h2>
          <p className="text-sm text-slate-500 mt-1">查看您的会议数据和分析</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
          {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {range === 'week' && '本周'}
              {range === 'month' && '本月'}
              {range === 'quarter' && '本季'}
              {range === 'year' && '本年'}
            </button>
          ))}
        </div>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-slate-500">会议总数</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalMeetings}</p>
            <p className="text-xs text-slate-400 mt-1">场会议</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Timer className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-slate-500">总时长</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalDuration.toFixed(1)}</p>
            <p className="text-xs text-slate-400 mt-1">小时</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-slate-500">待办完成率</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.completionRate}%</p>
            <p className="text-xs text-slate-400 mt-1">
              {stats.completedActions}/{stats.totalActions} 已完成
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm text-slate-500">协作人数</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.uniqueAttendees}</p>
            <p className="text-xs text-slate-400 mt-1">位参会人</p>
          </CardContent>
        </Card>
      </div>

      {/* 会议类型分布 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">会议类型分布</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.typeStats.length > 0 ? (
            <div className="space-y-4">
              {stats.typeStats.map((stat) => {
                const colors = MEETING_TYPE_COLORS[stat.type]
                return (
                  <div key={stat.type}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border}`}>
                          {MEETING_TYPE_LABELS[stat.type]}
                        </Badge>
                        <span className="text-sm text-slate-600">{stat.count} 场</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">{stat.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">暂无数据</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 月度趋势 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">月度趋势</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.monthlyTrend.length > 0 ? (
            <div className="space-y-4">
              {stats.monthlyTrend.map((month) => (
                <div key={month.month} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-slate-500">{month.month}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min((month.count / Math.max(...stats.monthlyTrend.map(m => m.count))) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-900 w-8">{month.count}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{month.totalDuration.toFixed(1)} 小时</span>
                      {month.totalActions > 0 && (
                        <span>
                          待办完成: {Math.round((month.completedActions / month.totalActions) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">暂无数据</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
