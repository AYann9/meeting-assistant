'use client'

import { useState } from 'react'
import { Meeting, MeetingType } from '@/lib/types'
import { useMeetings } from '@/hooks/useMeetings'
import Navbar from '@/components/Navbar'
import MeetingCardManage from '@/components/MeetingCardManage'
import CreateMeetingDialog from '@/components/CreateMeetingDialog'
import { Plus, Video, Search, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function MeetingsPage() {
  const { meetings, loading, error, addMeeting, updateMeeting, deleteMeeting } = useMeetings()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)

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

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    await deleteMeeting(id)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingMeeting(null)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">会议列表</h1>
            <p className="text-slate-500 mt-1">管理您的所有会议</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              <Search className="w-4 h-4" />
              搜索纪要
            </Link>
            <button
              onClick={() => {
                setEditingMeeting(null)
                setDialogOpen(true)
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" />
              创建会议
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-slate-500">加载会议数据中...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <Video className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              加载失败
            </h3>
            <p className="text-slate-500 mb-6 text-center max-w-sm">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              重试
            </button>
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Video className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              暂无会议
            </h3>
            <p className="text-slate-500 mb-6 text-center max-w-sm">
              您还没有创建任何会议，点击"创建会议"按钮开始
            </p>
            <button
              onClick={() => {
                setEditingMeeting(null)
                setDialogOpen(true)
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              创建会议
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {meetings.map((meeting) => (
              <MeetingCardManage
                key={meeting.id}
                meeting={meeting}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
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
