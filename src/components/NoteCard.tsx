"use client"

import Link from "next/link"
import { Meeting } from "@/lib/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock, FileText, ArrowRight } from "lucide-react"

interface NoteCardProps {
  meeting: Meeting
  minutes?: {
    summary: string
    decisions: string[]
  }
  highlights?: string[]
}

export default function NoteCard({ meeting, minutes, highlights }: NoteCardProps) {
  const date = meeting.scheduled_at ? new Date(meeting.scheduled_at) : new Date()

  const formattedDate = date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Link href={`/meetings/${meeting.id}`} className="block">
      <Card className="group hover:shadow-md transition-all cursor-pointer border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm text-slate-500">{formattedDate}</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {meeting.duration_min || 90} 分钟
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
            {meeting.title}
          </h3>

          {minutes?.summary && (
            <p className="text-sm text-slate-600 line-clamp-2">{minutes.summary}</p>
          )}

          {highlights && highlights.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {highlights.map((h, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                  {h}
                </Badge>
              ))}
            </div>
          )}

          {minutes?.decisions && minutes.decisions.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">决议：</p>
              <ul className="space-y-1">
                {minutes.decisions.slice(0, 2).map((d, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <span className="mt-1 w-1 h-1 bg-green-500 rounded-full flex-shrink-0" />
                    {d}
                  </li>
                ))}
                {minutes.decisions.length > 2 && (
                  <li className="text-xs text-slate-400">+{minutes.decisions.length - 2} 项决议</li>
                )}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {meeting.attendees && meeting.attendees.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Users className="w-3 h-3" />
                {meeting.attendees.slice(0, 3).join("、")}
                {meeting.attendees.length > 3 && ` +${meeting.attendees.length - 3}`}
              </div>
            )}
            <span className="text-xs text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              查看详情 <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
