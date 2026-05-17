'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Meeting } from '@/lib/types'
import { getMeetingById } from '@/lib/supabase'
import { Video, ArrowLeft, Calendar, Users, ExternalLink, FileText, Loader2 } from 'lucide-react'
import Link from 'next/link'
import PreMeetingPanel from '@/components/PreMeetingPanel'
import PostMeetingPanel from '@/components/PostMeetingPanel'

export default function MeetingDetailPage() {
  const params = useParams()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pre' | 'post'>('pre')

  useEffect(() => {
    async function loadMeeting() {
      try {
        setLoading(true)
        setError(null)
        const data = await getMeetingById(params.id as string)
        if (data) {
          setMeeting(data)
        } else {
          setError('会议未找到')
        }
      } catch (err: any) {
        console.error('加载会议详情失败:', err)
        setError(err.message || '加载会议详情失败')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadMeeting()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">{error || '会议未找到'}</h2>
          <p className="text-slate-500 mb-6">该会议可能已被删除或不存在</p>
          <Link
            href="/meetings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回会议列表
          </Link>
        </div>
      </div>
    )
  }

  const date = meeting.scheduled_at ? new Date(meeting.scheduled_at) : new Date()
  const formattedDate = date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
  const formattedTime = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const isLink = meeting.location?.startsWith('http') || false

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/meetings"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-primary" />
                  <h1 className="text-lg font-semibold text-slate-900">{meeting.title}</h1>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate} {formattedTime}
                </span>
                {meeting.attendees && meeting.attendees.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {meeting.attendees.length} 人
                  </span>
                )}
                {meeting.location && (
                  <span className="flex items-center gap-1">
                    {isLink ? (
                      <a
                        href={meeting.location}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        加入会议
                      </a>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {meeting.location}
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('pre')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'pre'
                ? 'bg-primary text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            会前准备
          </button>
          <button
            onClick={() => setActiveTab('post')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'post'
                ? 'bg-primary text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            会后处理
          </button>
        </div>

        {activeTab === 'pre' && <PreMeetingPanel meeting={meeting} />}
        {activeTab === 'post' && <PostMeetingPanel meeting={meeting} />}
      </div>
    </div>
  )
}
