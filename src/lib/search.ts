import { Meeting, MeetingMinutes, SearchResult } from './types'
import { getMeetings } from './storage'

export interface SearchFilters {
  meetingTypes?: string[]
  attendees?: string[]
  tags?: string[]
  dateRange?: { start: string; end: string }
}

export function searchMeetings(
  query: string,
  filters?: SearchFilters
): SearchResult[] {
  const meetings = getMeetings()
  const results: SearchResult[] = []

  const normalizedQuery = query.toLowerCase().trim()
  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean)

  for (const meeting of meetings) {
    let relevance = 0
    const matchedFields: string[] = []
    const highlights: { field: string; text: string }[] = []

    // 检查过滤器
    if (filters?.meetingTypes?.length && !filters.meetingTypes.includes(meeting.meeting_type)) {
      continue
    }
    if (filters?.attendees?.length && !meeting.attendees.some(a => filters.attendees?.includes(a))) {
      continue
    }
    if (filters?.tags?.length && !meeting.tags?.some(t => filters.tags?.includes(t))) {
      continue
    }
    if (filters?.dateRange) {
      const meetingDate = new Date(meeting.scheduled_at)
      const startDate = new Date(filters.dateRange.start)
      const endDate = new Date(filters.dateRange.end)
      if (meetingDate < startDate || meetingDate > endDate) {
        continue
      }
    }

    // 搜索会议标题
    const titleLower = meeting.title.toLowerCase()
    if (titleLower.includes(normalizedQuery)) {
      relevance += 10
      matchedFields.push('title')
      highlights.push({
        field: '标题',
        text: highlightText(meeting.title, queryTerms),
      })
    }

    // 搜索参会人
    for (const attendee of meeting.attendees) {
      if (attendee.toLowerCase().includes(normalizedQuery)) {
        relevance += 8
        if (!matchedFields.includes('attendees')) {
          matchedFields.push('attendees')
          highlights.push({
            field: '参会人',
            text: `参会人: ${meeting.attendees.join(', ')}`,
          })
        }
      }
    }

    // 搜索会议类型
    if (meeting.meeting_type.toLowerCase().includes(normalizedQuery)) {
      relevance += 5
      matchedFields.push('type')
    }

    // 搜索标签
    if (meeting.tags) {
      for (const tag of meeting.tags) {
        if (tag.toLowerCase().includes(normalizedQuery)) {
          relevance += 6
          if (!matchedFields.includes('tags')) {
            matchedFields.push('tags')
            highlights.push({
              field: '标签',
              text: `标签: ${meeting.tags.join(', ')}`,
            })
          }
        }
      }
    }

    // 搜索会议纪要
    const minutesData = localStorage.getItem(`minutes_${meeting.id}`)
    let minutes: MeetingMinutes | undefined
    if (minutesData) {
      try {
        minutes = JSON.parse(minutesData)
        
        // 搜索摘要
        if (minutes.summary?.toLowerCase().includes(normalizedQuery)) {
          relevance += 7
          matchedFields.push('summary')
          highlights.push({
            field: '摘要',
            text: highlightText(minutes.summary.substring(0, 200), queryTerms),
          })
        }

        // 搜索讨论内容
        for (const discussion of minutes.discussions || []) {
          if (discussion.content?.toLowerCase().includes(normalizedQuery)) {
            relevance += 6
            if (!matchedFields.includes('discussions')) {
              matchedFields.push('discussions')
              highlights.push({
                field: '讨论',
                text: highlightText(discussion.content.substring(0, 200), queryTerms),
              })
            }
          }
          if (discussion.topic?.toLowerCase().includes(normalizedQuery)) {
            relevance += 5
          }
        }

        // 搜索决议
        for (const decision of minutes.decisions || []) {
          if (decision.toLowerCase().includes(normalizedQuery)) {
            relevance += 8
            if (!matchedFields.includes('decisions')) {
              matchedFields.push('decisions')
              highlights.push({
                field: '决议',
                text: highlightText(decision, queryTerms),
              })
            }
          }
        }

        // 搜索待办事项
        for (const action of minutes.actionItems || []) {
          if (action.task?.toLowerCase().includes(normalizedQuery)) {
            relevance += 7
            if (!matchedFields.includes('actionItems')) {
              matchedFields.push('actionItems')
              highlights.push({
                field: '待办',
                text: `${action.task} - ${action.assignee}`,
              })
            }
          }
        }

        // 搜索争议问题
        for (const controversy of minutes.controversies || []) {
          if (controversy.issue?.toLowerCase().includes(normalizedQuery)) {
            relevance += 5
            if (!matchedFields.includes('controversies')) {
              matchedFields.push('controversies')
              highlights.push({
                field: '争议',
                text: controversy.issue,
              })
            }
          }
        }

        // 搜索全文
        if (minutes.fullText?.toLowerCase().includes(normalizedQuery)) {
          relevance += 4
        }
      } catch {
        // ignore parse error
      }
    }

    // 自然语言匹配
    relevance += calculateNaturalLanguageScore(normalizedQuery, meeting, minutes)

    if (relevance > 0) {
      results.push({
        meeting,
        minutes,
        relevance,
        matchedFields,
        highlights,
      })
    }
  }

  // 按相关度排序
  return results.sort((a, b) => b.relevance - a.relevance)
}

function highlightText(text: string, queryTerms: string[]): string {
  let result = text
  for (const term of queryTerms) {
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi')
    result = result.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
  }
  return result
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function calculateNaturalLanguageScore(
  query: string,
  meeting: Meeting,
  minutes?: MeetingMinutes
): number {
  let score = 0

  // 人名匹配
  const personNames = extractPersonNames(query)
  for (const name of personNames) {
    if (meeting.attendees.some(a => a.includes(name))) {
      score += 3
    }
    if (minutes?.discussions.some(d => d.participants.some(p => p.includes(name)))) {
      score += 2
    }
  }

  // 关键词匹配
  const keywords = extractKeywords(query)
  for (const keyword of keywords) {
    if (meeting.title.includes(keyword)) score += 2
    if (minutes?.summary?.includes(keyword)) score += 1
  }

  // 时间词匹配
  const timeWords = extractTimeWords(query)
  if (timeWords.length > 0) {
    const meetingDate = new Date(meeting.scheduled_at)
    const now = new Date()
    for (const timeWord of timeWords) {
      if (timeWord === '最近' || timeWord === '上次') {
        const daysDiff = (now.getTime() - meetingDate.getTime()) / (1000 * 60 * 60 * 24)
        if (daysDiff < 30) score += 2
      }
      if (timeWord === '上周' && meetingDate > new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)) {
        score += 2
      }
    }
  }

  return score
}

function extractPersonNames(query: string): string[] {
  const patterns = [
    /([\u4e00-\u9fa5]{2,4})(?:总|经理|老师|先生|女士)/g,
    /和([\u4e00-\u9fa5]{2,4})/g,
    /与([\u4e00-\u9fa5]{2,4})/g,
  ]
  
  const names: string[] = []
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(query)) !== null) {
      names.push(match[1])
    }
  }
  return names
}

function extractKeywords(query: string): string[] {
  const stopWords = new Set(['的', '了', '和', '与', '在', '是', '我', '你', '他', '她', '它', '我们', '你们', '他们', '讨论', '关于', '上次', '最近', '之前'])
  return query.split(/\s+/).filter(word => word.length > 1 && !stopWords.has(word))
}

function extractTimeWords(query: string): string[] {
  const timePatterns = ['最近', '上次', '上周', '上周', '之前', '以前', '近期']
  return timePatterns.filter(pattern => query.includes(pattern))
}

export function getAllTags(): string[] {
  const meetings = getMeetings()
  const tags = new Set<string>()
  for (const meeting of meetings) {
    meeting.tags?.forEach(tag => tags.add(tag))
  }
  return Array.from(tags).sort()
}

export function getAllAttendees(): string[] {
  const meetings = getMeetings()
  const attendees = new Set<string>()
  for (const meeting of meetings) {
    meeting.attendees.forEach(a => attendees.add(a))
  }
  return Array.from(attendees).sort()
}

export function addTagToMeeting(meetingId: string, tag: string): void {
  const meetings = getMeetings()
  const meeting = meetings.find(m => m.id === meetingId)
  if (meeting) {
    if (!meeting.tags) meeting.tags = []
    if (!meeting.tags.includes(tag)) {
      meeting.tags.push(tag)
      localStorage.setItem('meeting_assistant_data', JSON.stringify(meetings))
    }
  }
}

export function removeTagFromMeeting(meetingId: string, tag: string): void {
  const meetings = getMeetings()
  const meeting = meetings.find(m => m.id === meetingId)
  if (meeting && meeting.tags) {
    meeting.tags = meeting.tags.filter(t => t !== tag)
    localStorage.setItem('meeting_assistant_data', JSON.stringify(meetings))
  }
}
