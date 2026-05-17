'use client'

import { useState, useEffect } from 'react'
import { Meeting, MeetingType, MEETING_TYPE_COLORS, MEETING_TYPES, MEETING_TYPE_LABELS } from '@/lib/types'

interface MeetingDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: {
    title: string
    scheduled_at: string
    attendees: string[]
    location: string
    meeting_type: MeetingType
  }) => void
  meeting?: Meeting | null
}

export default function MeetingDialog({ open, onClose, onSave, meeting }: MeetingDialogProps) {
  const [title, setTitle] = useState('')
  const [scheduled_at, setScheduledAt] = useState('')
  const [attendees, setAttendees] = useState('')
  const [location, setLocation] = useState('')
  const [meeting_type, setMeetingType] = useState<MeetingType>('project_review')

  useEffect(() => {
    if (meeting && open) {
      setTitle(meeting.title)
      const date = meeting.scheduled_at ? new Date(meeting.scheduled_at) : new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      setScheduledAt(`${year}-${month}-${day}T${hours}:${minutes}`)
      setAttendees(meeting.attendees?.join(', ') || '')
      setLocation(meeting.location || '')
      setMeetingType((meeting.meeting_type as MeetingType) || 'project_review')
    } else if (!meeting && open) {
      setTitle('')
      setScheduledAt('')
      setAttendees('')
      setLocation('')
      setMeetingType('project_review')
    }
  }, [meeting, open])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title,
      scheduled_at,
      attendees: attendees
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      location,
      meeting_type,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              {meeting ? '编辑会议' : '创建会议'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="请输入会议标题"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                时间
              </label>
              <input
                type="datetime-local"
                value={scheduled_at}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                参会人
              </label>
              <input
                type="text"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="多个参会人用逗号分隔"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                地点/链接
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="会议室地址或在线会议链接"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                会议类型
              </label>
              <div className="flex flex-wrap gap-2">
                {MEETING_TYPES.map((type) => {
                  const colors = MEETING_TYPE_COLORS[type]
                  const isSelected = type === meeting_type
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMeetingType(type)}
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

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                {meeting ? '保存更改' : '创建会议'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
