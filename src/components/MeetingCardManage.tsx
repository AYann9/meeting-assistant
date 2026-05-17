import { Meeting, MEETING_TYPE_COLORS, MEETING_TYPE_LABELS } from '@/lib/types'
import { Video, Calendar, Users, ExternalLink, Pencil, Trash2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface MeetingCardProps {
  meeting: Meeting
  onEdit: (meeting: Meeting) => void
  onDelete: (id: string) => void
}

export default function MeetingCardManage({ meeting, onEdit, onDelete }: MeetingCardProps) {
  const date = meeting.scheduled_at ? new Date(meeting.scheduled_at) : new Date()
  const now = new Date()
  const isUpcoming = date > now

  const formattedDate = date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const formattedTime = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const meetingType = (meeting.meeting_type || 'other') as keyof typeof MEETING_TYPE_COLORS
  const typeColors = MEETING_TYPE_COLORS[meetingType]
  const typeLabel = MEETING_TYPE_LABELS[meetingType]

  const isLink = meeting.location?.startsWith('http') || false

  const timeUntilMeeting = () => {
    const diff = date.getTime() - now.getTime()
    if (diff < 0) return '已结束'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 24) return `还有 ${Math.floor(hours / 24)} 天`
    if (hours > 0) return `还有 ${hours} 小时`
    return `还有 ${minutes} 分钟`
  }

  return (
    <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all">
      <div className="relative">
        <div className="h-1.5 bg-gradient-to-r from-primary to-blue-400" />

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeColors.bg} ${typeColors.text} ${typeColors.border}`}>
                {typeLabel}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isUpcoming && (
                <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full">
                  {timeUntilMeeting()}
                </span>
              )}
              <button
                onClick={() => onEdit(meeting)}
                className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="编辑"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(meeting.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <Link href={`/meetings/${meeting.id}`} className="block">
            <h3 className="text-lg font-semibold text-slate-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
              {meeting.title}
            </h3>
          </Link>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>{formattedDate}</span>
              <span className="text-slate-400">·</span>
              <span className="font-medium">{formattedTime}</span>
            </div>

            {meeting.attendees && meeting.attendees.length > 0 && (
              <div className="flex items-start gap-2.5 text-sm text-slate-600">
                <Users className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1.5">
                  {meeting.attendees.slice(0, 3).map((attendee, i) => (
                    <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">
                      {attendee}
                    </span>
                  ))}
                  {meeting.attendees.length > 3 && (
                    <span className="text-slate-400 text-xs">+{meeting.attendees.length - 3}</span>
                  )}
                </div>
              </div>
            )}

            {meeting.location && (
              <div className="flex items-center gap-2.5 text-sm text-slate-600">
                {isLink ? (
                  <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
                ) : (
                  <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                {isLink ? (
                  <a
                    href={meeting.location}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate"
                  >
                    点击加入会议
                  </a>
                ) : (
                  <span className="truncate">{meeting.location}</span>
                )}
              </div>
            )}
          </div>

          <Link
            href={`/meetings/${meeting.id}`}
            className="flex items-center gap-1 mt-4 text-sm text-primary hover:underline"
          >
            进入准备面板
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
