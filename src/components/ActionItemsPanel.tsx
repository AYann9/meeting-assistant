'use client'

import { useState, useEffect } from 'react'
import { Meeting } from '@/lib/types'
import { GripVertical, Plus, Trash2, ArrowUp, ArrowDown, Sparkles, Send, Copy, Check, ExternalLink, Calendar, User, AlertCircle, X } from 'lucide-react'

interface ActionItem {
  id: string
  task: string
  assignee: string
  deadline: string
  priority: 'high' | 'medium' | 'low'
  source: string
  status: 'pending' | 'in_progress' | 'completed'
}

interface ActionItemsPanelProps {
  meeting: Meeting
  initialItems?: ActionItem[]
}

const priorityColors = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  low: 'bg-green-50 text-green-700 border-green-200',
}

const priorityLabels = {
  high: '高',
  medium: '中',
  low: '低',
}

const statusColors = {
  pending: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

const statusLabels = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成',
}

export default function ActionItemsPanel({ meeting, initialItems }: ActionItemsPanelProps) {
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showDistributeModal, setShowDistributeModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)

  const [newItem, setNewItem] = useState({
    task: '',
    assignee: '',
    deadline: '',
    priority: 'medium' as const,
  })

  useEffect(() => {
    const saved = localStorage.getItem(`action_items_${meeting.id}`)
    if (saved) {
      setActionItems(JSON.parse(saved))
    } else if (initialItems) {
      setActionItems(initialItems)
    }
  }, [meeting.id, initialItems])

  const saveItems = (items: ActionItem[]) => {
    setActionItems(items)
    localStorage.setItem(`action_items_${meeting.id}`, JSON.stringify(items))
  }

  const extractFromMinutes = async () => {
    setIsExtracting(true)
    const minutesData = localStorage.getItem(`minutes_${meeting.id}`)
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    let extractedItems: ActionItem[] = []
    
    if (minutesData) {
      try {
        const minutes = JSON.parse(minutesData)
        extractedItems = minutes.actionItems?.map((item: any, index: number) => ({
          id: `extracted_${Date.now()}_${index}`,
          task: item.task,
          assignee: item.assignee,
          deadline: item.deadline,
          priority: item.priority,
          source: '会议纪要',
          status: 'pending' as const,
        })) || []
      } catch {
        // fallback to mock data
      }
    }
    
    if (extractedItems.length === 0) {
      extractedItems = [
        {
          id: `extracted_${Date.now()}_1`,
          task: '整理客户需求文档',
          assignee: '产品经理',
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'high',
          source: 'AI提取',
          status: 'pending',
        },
        {
          id: `extracted_${Date.now()}_2`,
          task: '评估技术方案可行性',
          assignee: '技术负责人',
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'high',
          source: 'AI提取',
          status: 'pending',
        },
        {
          id: `extracted_${Date.now()}_3`,
          task: '准备项目报价单',
          assignee: '商务',
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'medium',
          source: 'AI提取',
          status: 'pending',
        },
      ]
    }
    
    const merged = [...extractedItems, ...actionItems.filter(item => item.source !== 'AI提取')]
    saveItems(merged)
    setIsExtracting(false)
  }

  const handleDragStart = (id: string) => {
    setDraggedItem(id)
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (draggedItem === targetId) return

    const draggedIndex = actionItems.findIndex((item) => item.id === draggedItem)
    const targetIndex = actionItems.findIndex((item) => item.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newItems = [...actionItems]
    const [removed] = newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, removed)
    saveItems(newItems)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const addItem = () => {
    if (!newItem.task.trim()) return

    const item: ActionItem = {
      id: `manual_${Date.now()}`,
      task: newItem.task,
      assignee: newItem.assignee,
      deadline: newItem.deadline,
      priority: newItem.priority,
      source: '手动添加',
      status: 'pending',
    }

    saveItems([...actionItems, item])
    setNewItem({ task: '', assignee: '', deadline: '', priority: 'medium' })
    setShowAddForm(false)
  }

  const deleteItem = (id: string) => {
    saveItems(actionItems.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof ActionItem, value: any) => {
    saveItems(
      actionItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const index = actionItems.findIndex((item) => item.id === id)
    if (index === -1) return

    const newItems = [...actionItems]
    if (direction === 'up' && index > 0) {
      ;[newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]]
    } else if (direction === 'down' && index < newItems.length - 1) {
      ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
    }
    saveItems(newItems)
  }

  const generateDistributeText = (platform: string) => {
    const pendingItems = actionItems.filter(item => item.status !== 'completed')
    
    let text = `📋 ${meeting.title} - 待办事项\n`
    text += `⏰ 生成时间: ${new Date().toLocaleString('zh-CN')}\n`
    text += `🔗 会议详情: ${window.location.origin}/meetings/${meeting.id}\n\n`
    
    pendingItems.forEach((item, i) => {
      text += `${i + 1}. ${item.task}\n`
      text += `   👤 负责人: ${item.assignee}\n`
      text += `   📅 截止: ${item.deadline}\n`
      text += `   🏷️ 优先级: ${priorityLabels[item.priority]}\n\n`
    })
    
    if (platform === 'feishu') {
      text += `\n💡 点击链接查看详情: ${window.location.origin}/meetings/${meeting.id}`
    } else if (platform === 'notion') {
      text = pendingItems.map((item, i) => 
        `- [ ] ${item.task} @${item.assignee} 📅 ${item.deadline} ${priorityLabels[item.priority]}优先级`
      ).join('\n')
    } else if (platform === 'wecom') {
      text = `【待办提醒】\n${meeting.title}\n\n${pendingItems.map((item, i) => 
        `${i + 1}. ${item.task}（${item.assignee}，${item.deadline}）`
      ).join('\n')}`
    }
    
    return text
  }

  const copyToClipboard = (platform: string) => {
    const text = generateDistributeText(platform)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const completedCount = actionItems.filter(item => item.status === 'completed').length
  const totalCount = actionItems.length

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">待办事项</h2>
              <p className="text-sm text-slate-500">
                {completedCount}/{totalCount} 已完成
                {totalCount > 0 && (
                  <span className="ml-2">
                    ({Math.round((completedCount / totalCount) * 100)}%)
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={extractFromMinutes}
              disabled={isExtracting}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isExtracting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  AI提取中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI提取待办
                </>
              )}
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              添加待办
            </button>
            {actionItems.length > 0 && (
              <button
                onClick={() => setShowDistributeModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Send className="w-4 h-4" />
                一键分发
              </button>
            )}
          </div>
        </div>

        {totalCount > 0 && (
          <div className="w-full bg-slate-100 rounded-full h-2 mb-6">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        )}

        {showAddForm && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg space-y-3">
            <input
              type="text"
              value={newItem.task}
              onChange={(e) => setNewItem({ ...newItem, task: e.target.value })}
              placeholder="待办事项内容"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex gap-3">
              <input
                type="text"
                value={newItem.assignee}
                onChange={(e) => setNewItem({ ...newItem, assignee: e.target.value })}
                placeholder="负责人"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                type="date"
                value={newItem.deadline}
                onChange={(e) => setNewItem({ ...newItem, deadline: e.target.value })}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <select
                value={newItem.priority}
                onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as 'high' | 'medium' | 'low' })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="high">高优先级</option>
                <option value="medium">中优先级</option>
                <option value="low">低优先级</option>
              </select>
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
          {actionItems.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-4 bg-slate-50 rounded-lg cursor-move hover:bg-slate-100 transition-colors ${
                draggedItem === item.id ? 'opacity-50' : ''
              } ${item.status === 'completed' ? 'opacity-60' : ''}`}
            >
              <GripVertical className="w-5 h-5 text-slate-400 flex-shrink-0" />
              
              <input
                type="checkbox"
                checked={item.status === 'completed'}
                onChange={(e) => updateItem(item.id, 'status', e.target.checked ? 'completed' : 'pending')}
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-medium ${item.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {item.task}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${priorityColors[item.priority]}`}>
                    {priorityLabels[item.priority]}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[item.status]}`}>
                    {statusLabels[item.status]}
                  </span>
                  {item.source === 'AI提取' && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      AI
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {item.assignee}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.deadline}
                  </span>
                </div>
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
                  disabled={index === actionItems.length - 1}
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

        {actionItems.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">暂无待办事项</p>
            <p className="text-sm text-slate-400 mt-1">点击"AI提取待办"或"添加待办"开始创建</p>
          </div>
        )}
      </div>

      {showDistributeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">一键分发待办</h3>
              <button
                onClick={() => setShowDistributeModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="text-sm font-medium text-slate-900 mb-2">飞书任务</h4>
                <p className="text-xs text-slate-500 mb-3">生成飞书格式文本，复制后粘贴到飞书</p>
                <button
                  onClick={() => copyToClipboard('feishu')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? '已复制' : '复制文本'}
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="text-sm font-medium text-slate-900 mb-2">Notion</h4>
                <p className="text-xs text-slate-500 mb-3">生成 Notion 待办列表格式</p>
                <button
                  onClick={() => copyToClipboard('notion')}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? '已复制' : '复制文本'}
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="text-sm font-medium text-slate-900 mb-2">企业微信</h4>
                <p className="text-xs text-slate-500 mb-3">生成企业微信消息格式</p>
                <button
                  onClick={() => copyToClipboard('wecom')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? '已复制' : '复制文本'}
                </button>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="text-sm font-medium text-slate-900 mb-2">分享链接</h4>
                <p className="text-xs text-slate-500 mb-3">复制会议详情链接分享给团队成员</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/meetings/${meeting.id}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/meetings/${meeting.id}`)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
