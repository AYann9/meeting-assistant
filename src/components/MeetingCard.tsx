import Link from 'next/link'
import { Meeting, MEETING_TYPE_COLORS, MEETING_TYPE_LABELS } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Video, Calendar, Users, ExternalLink, MapPin } from 'lucide-react'

interface MeetingCardProps {
  meeting: Meeting
}

export default function MeetingCard({ meeting }: MeetingCardProps) {
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
    <Link href={`/meetings/${meeting.id}`} className="block">
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-slate-200">
        <div className="h-1.5 bg-gradient-to-r from-primary to-blue-400" />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              <Badge
                variant="outline"
                className={`${typeColors.bg} ${typeColors.text} ${typeColors.border} font-medium`}
              >
                {typeLabel}
              </Badge>
            </div>
            {isUpcoming && (
              <Badge variant="secondary" className="text-primary bg-primary/10">
                {timeUntilMeeting()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 group-hover:text-primary transition-colors">
            {meeting.title}
          </h3>

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
                    <Badge key={i} variant="secondary" className="font-normal bg-slate-100 text-slate-700 hover:bg-slate-100">
                      {attendee}
                    </Badge>
                  ))}
                  {meeting.attendees.length > 3 && (
                    <span className="text-slate-400 text-xs self-center">+{meeting.attendees.length - 3}</span>
                  )}
                </div>
              </div>
            )}

            {meeting.location && (
              <div className="flex items-center gap-2.5 text-sm text-slate-600">
                {isLink ? (
                  <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
                ) : (
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
                {isLink ? (
                  <span
                    className="text-primary hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    点击加入会议
                  </span>
                ) : (
                  <span className="truncate">{meeting.location}</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
