'use client'

import { useState, useEffect } from 'react'
import { Meeting, MeetingType } from '@/lib/types'
import { GripVertical, Plus, Trash2, Clock, Sparkles, ArrowUp, ArrowDown } from 'lucide-react'

interface AgendaItem {
  id: string
  title: string
  duration: number
  description: string
  order: number
}

interface AgendaPanelProps {
  meeting: Meeting
}

const AGENDA_TEMPLATES: Record<MeetingType, string[]> = {
  '项目推进': [
    '项目进度回顾',
    '关键里程碑检查',
    '风险和问题讨论',
    '资源需求确认',
    '下一步行动计划',
  ],
  '客户拜访': [
    '客户需求回顾',
    '产品演示',
    '方案讨论',
    '商务条款沟通',
    '后续跟进安排',
  ],
  '周例会': [
    '上周工作总结',
    '本周工作计划',
    '跨团队协作事项',
    '问题和风险同步',
    '其他事项',
  ],
  '其他': [
    '会议目标确认',
    '主要议题讨论',
    '决策事项确认',
    '行动项分配',
    '下次会议安排',
  ],
}

export default function AgendaPanel({ meeting }: AgendaPanelProps) {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([])
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemDuration, setNewItemDuration] = useState(15)
  const [newItemDescription, setNewItemDescription] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    const templates = AGENDA_TEMPLATES[meeting.meeting_type] || AGENDA_TEMPLATES['其他']
    const saved = localStorage.getItem(`agenda_${meeting.id}`)
    if (saved) {
      setAgendaItems(JSON.parse(saved))
    } else {
      const items: AgendaItem[] = templates.map((title, i) => ({
        id: `agenda_${i}`,
        title,
        duration: 15,
        description: '',
        order: i,
      }))
      setAgendaItems(items)
    }
  }, [meeting])

  const saveAgenda = (items: AgendaItem[]) => {
    setAgendaItems(items)
    localStorage.setItem(`agenda_${meeting.id}`, JSON.stringify(items))
  }

  const handleDragStart = (id: string) => {
    setDraggedItem(id)
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (draggedItem === targetId) return

    const draggedIndex = agendaItems.findIndex((item) => item.id === draggedItem)
    const targetIndex = agendaItems.findIndex((item) => item.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newItems = [...agendaItems]
    const [removed] = newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, removed)

    const reordered = newItems.map((item, i) => ({ ...item, order: i }))
    saveAgenda(reordered)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const addItem = () => {
    if (!newItemTitle.trim()) return

    const newItem: AgendaItem = {
      id: `agenda_${Date.now()}`,
      title: newItemTitle,
      duration: newItemDuration,
      description: newItemDescription,
      order: agendaItems.length,
    }

    saveAgenda([...agendaItems, newItem])
    setNewItemTitle('')
    setNewItemDuration(15)
    setNewItemDescription('')
    setShowAddForm(false)
  }

  const deleteItem = (id: string) => {
    const filtered = agendaItems.filter((item) => item.id !== id)
    const reordered = filtered.map((item, i) => ({ ...item, order: i }))
    saveAgenda(reordered)
  }

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const index = agendaItems.findIndex((item) => item.id === id)
    if (index === -1) return

    const newItems = [...agendaItems]
    if (direction === 'up' && index > 0) {
      ;[newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]]
    } else if (direction === 'down' && index < newItems.length - 1) {
      ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
    }

    const reordered = newItems.map((item, i) => ({ ...item, order: i }))
    saveAgenda(reordered)
  }

  const totalDuration = agendaItems.reduce((sum, item) => sum + item.duration, 0)

  const generateAIAgenda = () => {
    const templates = AGENDA_TEMPLATES[meeting.meeting_type] || AGENDA_TEMPLATES['其他']
    const items: AgendaItem[] = templates.map((title, i) => ({
      id: `agenda_ai_${Date.now()}_${i}`,
      title,
      duration: [20, 15, 10, 15, 10][i] || 15,
      description: [
        '回顾上次会议确定的目标完成情况',
        '检查当前阶段的关键交付物',
        '识别潜在风险并制定应对方案',
        '确认团队资源分配是否合理',
        '明确各成员的具体任务和时间节点',
      ][i] || '',
      order: i,
    }))
    saveAgenda(items)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">会议议程</h2>
              <p className="text-sm text-slate-500">
                总时长: {Math.floor(totalDuration / 60)}小时{totalDuration % 60}分钟
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={generateAIAgenda}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              AI 推荐议程
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              添加议程
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg space-y-3">
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="议程标题"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex gap-3">
              <input
                type="number"
                value={newItemDuration}
                onChange={(e) => setNewItemDuration(Number(e.target.value))}
                placeholder="时长(分钟)"
                className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                type="text"
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="描述(可选)"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addItem}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                确认添加
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors text-sm"
              >
                取消
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {agendaItems.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-4 bg-slate-50 rounded-lg cursor-move hover:bg-slate-100 transition-colors ${
                draggedItem === item.id ? 'opacity-50' : ''
              }`}
            >
              <GripVertical className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{item.title}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.duration}分钟
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveItem(item.id, 'up')}
                  disabled={index === 0}
                  className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 rounded"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveItem(item.id, 'down')}
                  disabled={index === agendaItems.length - 1}
                  className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 rounded"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-1 text-slate-400 hover:text-red-500 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {agendaItems.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">暂无议程项</p>
            <p className="text-sm text-slate-400 mt-1">点击"添加议程"或"AI 推荐议程"开始创建</p>
          </div>
        )}
      </div>
    </div>
  )
}
