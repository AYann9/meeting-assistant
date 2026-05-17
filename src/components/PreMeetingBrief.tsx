'use client'

import { useState, useEffect } from 'react'
import { Meeting } from '@/lib/types'
import { Sparkles, FileText, Users, Clock, TrendingUp, AlertCircle } from 'lucide-react'

interface PreMeetingBriefProps {
  meeting: Meeting
}

interface BriefData {
  summary: string
  keyPoints: string[]
  relatedMeetings: { title: string; date: string; takeaway: string }[]
  attendeeContext: { name: string; role: string; notes: string }[]
  actionItems: { item: string; priority: 'high' | 'medium' | 'low' }[]
}

export default function PreMeetingBrief({ meeting }: PreMeetingBriefProps) {
  const [brief, setBrief] = useState<BriefData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const mockBrief: BriefData = {
        summary: `根据历史会议记录分析，本次"${meeting.title}"是${meeting.meeting_type}类会议。相关团队在过去一个月内已进行3次类似主题讨论，主要聚焦于项目进度同步和关键决策确认。`,
        keyPoints: [
          '上次会议确定的核心目标已完成 75%',
          '当前项目处于关键里程碑阶段',
          '需要确认下一阶段的资源分配方案',
          '技术架构评审结果待最终确认',
        ],
        relatedMeetings: [
          {
            title: '项目启动会',
            date: '2026-04-15',
            takeaway: '确定了项目范围和时间节点，明确了各团队职责',
          },
          {
            title: '中期评审会议',
            date: '2026-04-28',
            takeaway: '技术方案通过评审，需要补充性能测试数据',
          },
          {
            title: '周例会 #12',
            date: '2026-05-09',
            takeaway: '前端开发进度超前，后端接口联调待开始',
          },
        ],
        attendeeContext: meeting.attendees.map((name, i) => ({
          name,
          role: ['项目经理', '技术负责人', '产品经理', '设计师', '测试工程师'][i % 5],
          notes: `参与${meeting.meeting_type}相关会议${Math.floor(Math.random() * 10 + 3)}次，上次会议提出${['资源需求', '技术方案', '用户反馈', '竞品分析', '风险评估'][i % 5]}`,
        })),
        actionItems: [
          { item: '确认Q3资源预算分配', priority: 'high' },
          { item: '完成技术架构文档更新', priority: 'high' },
          { item: '整理用户测试反馈报告', priority: 'medium' },
          { item: '安排跨团队对接会议', priority: 'medium' },
          { item: '更新项目进度看板', priority: 'low' },
        ],
      }
      setBrief(mockBrief)
      setLoading(false)
    }, 1500)
  }, [meeting])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">AI 会前简报生成中...</h2>
            <p className="text-sm text-slate-500">正在分析历史会议记录和参会人背景</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${80 + Math.random() * 20}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (!brief) return null

  const priorityColors = {
    high: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    low: 'bg-green-50 text-green-700 border-green-200',
  }

  const priorityLabels = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级',
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">AI 会前简报</h2>
            <p className="text-sm text-slate-500">基于历史会议记录自动生成</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 leading-relaxed">{brief.summary}</p>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            关键要点
          </h3>
          <div className="grid gap-2">
            {brief.keyPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-slate-700">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            相关历史会议
          </h3>
          <div className="space-y-3">
            {brief.relatedMeetings.map((m, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-900">{m.title}</span>
                  <span className="text-xs text-slate-500">{m.date}</span>
                </div>
                <p className="text-sm text-slate-600">{m.takeaway}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            参会人背景
          </h3>
          <div className="space-y-3">
            {brief.attendeeContext.map((a, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-900">{a.name}</span>
                  <span className="text-xs text-slate-500">{a.role}</span>
                </div>
                <p className="text-sm text-slate-600">{a.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-primary" />
          待办事项提醒
        </h3>
        <div className="space-y-2">
          {brief.actionItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${priorityColors[item.priority]}`}>
                {priorityLabels[item.priority]}
              </span>
              <span className="text-slate-700">{item.item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
