'use client'

import { useState } from 'react'
import { Meeting, MeetingType } from '@/lib/types'
import { useMeetings } from '@/hooks/useMeetings'
import MeetingCard from '@/components/MeetingCard'
import CreateMeetingDialog from '@/components/CreateMeetingDialog'
import { Plus, Video, Calendar, ArrowRight, LayoutDashboard, Search, Settings, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { meetings, loading, addMeeting, updateMeeting } = useMeetings()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)

  const now = new Date()
  const upcomingMeetings = meetings
    .filter((m) => m.scheduled_at && new Date(m.scheduled_at) > now)
    .sort((a, b) => new Date(a.scheduled_at || '').getTime() - new Date(b.scheduled_at || '').getTime())
    .slice(0, 6)

  const pastMeetings = meetings
    .filter((m) => m.scheduled_at && new Date(m.scheduled_at) <= now)
    .sort((a, b) => new Date(b.scheduled_at || '').getTime() - new Date(a.scheduled_at || '').getTime())

  const handleSave = async (data: {
    title: string
    scheduled_at: string
    attendees: string[]
    location: string
    meeting_type: MeetingType
  }) => {
    if (editingMeeting) {
      await updateMeeting(editingMeeting.id, data)
      setEditingMeeting(null)
    } else {
      await addMeeting(data)
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingMeeting(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">视频会议助手</span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/search" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <Search className="w-4 h-4" />
              搜索纪要
            </Link>
            <Link href="/meetings" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              全部会议
            </Link>
            <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              设置
            </Link>
            <button
              onClick={() => {
                setEditingMeeting(null)
                setDialogOpen(true)
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              创建会议
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            欢迎回来
          </h1>
          <p className="text-slate-500">
            {now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-slate-500">加载会议数据中...</p>
          </div>
        ) : (
          <>
            {upcomingMeetings.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-slate-900">即将到来的会议</h2>
                  </div>
                  <Link href="/meetings" className="flex items-center gap-1 text-sm text-primary hover:underline">
                    查看全部 <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="relative">
                      <MeetingCard meeting={meeting} />
                      {meeting.scheduled_at && new Date(meeting.scheduled_at).getTime() - now.getTime() < 1800000 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          即将开始
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {pastMeetings.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">已结束的会议</h2>
                  <span className="text-sm text-slate-500">{pastMeetings.length} 场</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pastMeetings.slice(0, 3).map((meeting) => (
                    <div key={meeting.id} className="opacity-70">
                      <MeetingCard meeting={meeting} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {meetings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-blue-400/10 rounded-2xl flex items-center justify-center mb-6">
                  <Video className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  暂无会议
                </h3>
                <p className="text-slate-500 mb-8 text-center max-w-md">
                  您还没有创建任何会议。点击"创建会议"按钮，开始安排您的第一次视频会议。
                </p>
                <button
                  onClick={() => {
                    setEditingMeeting(null)
                    setDialogOpen(true)
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/25"
                >
                  <Plus className="w-5 h-5" />
                  创建第一个会议
                </button>
              </div>
            )}

            {meetings.length > 0 && upcomingMeetings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  没有即将到来的会议
                </h3>
                <p className="text-slate-500 mb-6 text-center max-w-sm">
                  所有会议已结束，创建新会议来安排下次视频会议
                </p>
                <button
                  onClick={() => {
                    setEditingMeeting(null)
                    setDialogOpen(true)
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  创建会议
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <CreateMeetingDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        meeting={editingMeeting}
      />
    </div>
  )
}
