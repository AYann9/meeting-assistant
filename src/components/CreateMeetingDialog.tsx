"use client"

import { useState, useEffect } from "react"
import { Meeting, MeetingType, MEETING_TYPE_LABELS, MEETING_TYPES } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin, Type } from "lucide-react"

interface CreateMeetingDialogProps {
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

export default function CreateMeetingDialog({
  open,
  onClose,
  onSave,
  meeting,
}: CreateMeetingDialogProps) {
  const [title, setTitle] = useState("")
  const [scheduled_at, setScheduledAt] = useState("")
  const [attendees, setAttendees] = useState("")
  const [location, setLocation] = useState("")
  const [meeting_type, setMeetingType] = useState<MeetingType>("project_review")

  useEffect(() => {
    if (meeting && open) {
      setTitle(meeting.title)
      const date = meeting.scheduled_at ? new Date(meeting.scheduled_at) : new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const hours = String(date.getHours()).padStart(2, "0")
      const minutes = String(date.getMinutes()).padStart(2, "0")
      setScheduledAt(`${year}-${month}-${day}T${hours}:${minutes}`)
      setAttendees(meeting.attendees?.join(", ") || "")
      setLocation(meeting.location || "")
      setMeetingType((meeting.meeting_type as MeetingType) || "project_review")
    } else if (!meeting && open) {
      setTitle("")
      setScheduledAt("")
      setAttendees("")
      setLocation("")
      setMeetingType("project_review")
    }
  }, [meeting, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title,
      scheduled_at,
      attendees: attendees
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      location,
      meeting_type,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            {meeting ? "编辑会议" : "创建会议"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-slate-400" />
              标题
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="请输入会议标题"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              时间
            </Label>
            <Input
              id="time"
              type="datetime-local"
              value={scheduled_at}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendees" className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              参会人
            </Label>
            <Input
              id="attendees"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="多个参会人用逗号分隔"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              地点/链接
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="会议室地址或在线会议链接"
            />
          </div>

          <div className="space-y-2">
            <Label>会议类型</Label>
            <div className="flex flex-wrap gap-2">
              {MEETING_TYPES.map((type) => (
                <Badge
                  key={type}
                  variant={type === meeting_type ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1.5 text-sm font-medium transition-all ${
                    type === meeting_type
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "hover:bg-slate-100"
                  }`}
                  onClick={() => setMeetingType(type)}
                >
                  {MEETING_TYPE_LABELS[type]}
                </Badge>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit">
              {meeting ? "保存更改" : "创建会议"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
