'use client'

import { useState } from 'react'
import { Meeting } from '@/lib/types'
import { Sparkles, Edit3, Save, CheckCircle, AlertTriangle, MessageSquare, FileText, User, Calendar, RotateCcw, Download } from 'lucide-react'

interface DiscussionItem {
  topic: string
  content: string
  participants: string[]
}

interface ActionItem {
  task: string
  assignee: string
  deadline: string
  priority: 'high' | 'medium' | 'low'
}

interface Controversy {
  issue: string
  views: string[]
  status: string
}

interface MeetingMinutesData {
  summary: string
  discussions: DiscussionItem[]
  decisions: string[]
  actionItems: ActionItem[]
  controversies: Controversy[]
  generatedAt: string
}

interface MeetingMinutesProps {
  minutes: MeetingMinutesData
  meeting: Meeting
  onRegenerate: () => void
}

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

export default function MeetingMinutes({ minutes, meeting, onRegenerate }: MeetingMinutesProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedMinutes, setEditedMinutes] = useState(minutes)
  const [showExportMenu, setShowExportMenu] = useState(false)

  const handleSave = () => {
    localStorage.setItem(`minutes_${meeting.id}`, JSON.stringify(editedMinutes))
    setIsEditing(false)
  }

  const exportToMarkdown = () => {
    const md = `# ${meeting.title} - 会议纪要

> 生成时间: ${new Date(minutes.generatedAt).toLocaleString('zh-CN')}

## 会议摘要

${minutes.summary}

## 讨论内容

${minutes.discussions.map((d, i) => `### ${i + 1}. ${d.topic}

**参与人:** ${d.participants.join(', ')}

${d.content}
`).join('\n')}

## 决议事项

${minutes.decisions.map((d, i) => `${i + 1}. ${d}`).join('\n')}

## 待办事项

| 任务 | 负责人 | 截止日期 | 优先级 |
|------|--------|----------|--------|
${minutes.actionItems.map((a) => `| ${a.task} | ${a.assignee} | ${a.deadline} | ${priorityLabels[a.priority]} |`).join('\n')}

## 争议问题

${minutes.controversies.map((c, i) => `### ${i + 1}. ${c.issue}

**状态:** ${c.status}

${c.views.map((v, j) => `- 观点 ${j + 1}: ${v}`).join('\n')}
`).join('\n')}
`

    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${meeting.title}_会议纪要.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  const updateField = (field: keyof MeetingMinutesData, value: any) => {
    setEditedMinutes((prev) => ({ ...prev, [field]: value }))
  }

  const updateDiscussion = (index: number, field: keyof DiscussionItem, value: string | string[]) => {
    const updated = [...editedMinutes.discussions]
    updated[index] = { ...updated[index], [field]: value }
    updateField('discussions', updated)
  }

  const updateActionItem = (index: number, field: keyof ActionItem, value: string) => {
    const updated = [...editedMinutes.actionItems]
    updated[index] = { ...updated[index], [field]: value }
    updateField('actionItems', updated)
  }

  const updateControversy = (index: number, field: keyof Controversy, value: string | string[]) => {
    const updated = [...editedMinutes.controversies]
    updated[index] = { ...updated[index], [field]: value }
    updateField('controversies', updated)
  }

  const displayMinutes = isEditing ? editedMinutes : minutes

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">会议纪要</h2>
              <p className="text-sm text-slate-500">
                生成于 {new Date(minutes.generatedAt).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4 inline mr-1" />
                导出
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                  <button
                    onClick={exportToMarkdown}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    导出为 Markdown
                  </button>
                </div>
              )}
            </div>
            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <Edit3 className="w-4 h-4" />
                编辑
              </button>
            )}
            <button
              onClick={onRegenerate}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              重新生成
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              会议摘要
            </h3>
            {isEditing ? (
              <textarea
                value={displayMinutes.summary}
                onChange={(e) => updateField('summary', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                rows={3}
              />
            ) : (
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg">{displayMinutes.summary}</p>
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              讨论内容
            </h3>
            <div className="space-y-4">
              {displayMinutes.discussions.map((discussion, i) => (
                <div key={i} className="bg-slate-50 rounded-lg p-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={discussion.topic}
                        onChange={(e) => updateDiscussion(i, 'topic', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                      />
                      <input
                        type="text"
                        value={discussion.participants.join(', ')}
                        onChange={(e) => updateDiscussion(i, 'participants', e.target.value.split(',').map((s) => s.trim()))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        placeholder="参与人,用逗号分隔"
                      />
                      <textarea
                        value={discussion.content}
                        onChange={(e) => updateDiscussion(i, 'content', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        rows={3}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-slate-900">{discussion.topic}</span>
                        <span className="text-xs text-slate-500">
                          ({discussion.participants.join(', ')})
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{discussion.content}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              决议事项
            </h3>
            <div className="space-y-2">
              {displayMinutes.decisions.map((decision, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {i + 1}
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={decision}
                      onChange={(e) => {
                        const updated = [...editedMinutes.decisions]
                        updated[i] = e.target.value
                        updateField('decisions', updated)
                      }}
                      className="flex-1 px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                  ) : (
                    <span className="text-slate-700">{decision}</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              待办事项
            </h3>
            <div className="space-y-2">
              {displayMinutes.actionItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${priorityColors[item.priority]}`}>
                    {priorityLabels[item.priority]}
                  </span>
                  {isEditing ? (
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={item.task}
                        onChange={(e) => updateActionItem(i, 'task', e.target.value)}
                        className="px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                      />
                      <input
                        type="text"
                        value={item.assignee}
                        onChange={(e) => updateActionItem(i, 'assignee', e.target.value)}
                        className="px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        placeholder="负责人"
                      />
                      <input
                        type="date"
                        value={item.deadline}
                        onChange={(e) => updateActionItem(i, 'deadline', e.target.value)}
                        className="px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                      />
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 text-slate-700">{item.task}</span>
                      <span className="flex items-center gap-1 text-sm text-slate-500">
                        <User className="w-3.5 h-3.5" />
                        {item.assignee}
                      </span>
                      <span className="text-sm text-slate-500">
                        截止: {new Date(item.deadline).toLocaleDateString('zh-CN')}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          {displayMinutes.controversies.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                争议问题
              </h3>
              <div className="space-y-4">
                {displayMinutes.controversies.map((controversy, i) => (
                  <div key={i} className="bg-orange-50 rounded-lg p-4">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={controversy.issue}
                          onChange={(e) => updateControversy(i, 'issue', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                        />
                        <input
                          type="text"
                          value={controversy.status}
                          onChange={(e) => updateControversy(i, 'status', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                          placeholder="状态"
                        />
                        {controversy.views.map((view, j) => (
                          <input
                            key={j}
                            type="text"
                            value={view}
                            onChange={(e) => {
                              const updated = [...controversy.views]
                              updated[j] = e.target.value
                              updateControversy(i, 'views', updated)
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                            placeholder={`观点 ${j + 1}`}
                          />
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-slate-900">{controversy.issue}</span>
                          <span className="px-2 py-0.5 bg-orange-200 text-orange-800 text-xs font-medium rounded-full">
                            {controversy.status}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {controversy.views.map((view, j) => (
                            <p key={j} className="text-sm text-slate-600">
                              <span className="font-medium">观点 {j + 1}:</span> {view}
                            </p>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
