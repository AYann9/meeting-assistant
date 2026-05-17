'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Meeting } from '@/lib/types'
import { getMeetingById } from '@/lib/supabase'
import { ArrowLeft, Mic, FileText, Sparkles, Loader2, Upload, Headphones } from 'lucide-react'
import Link from 'next/link'
import MeetingMinutes from '@/components/MeetingMinutes'

export default function MeetingNotesPage() {
  const params = useParams()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inputMode, setInputMode] = useState<'audio' | 'text'>('text')
  const [rawText, setRawText] = useState('')
  const [transcribedText, setTranscribedText] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMinutes, setGeneratedMinutes] = useState<any>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function loadMeeting() {
      try {
        setLoading(true)
        setError(null)
        const data = await getMeetingById(params.id as string)
        if (data) {
          setMeeting(data)
          const saved = localStorage.getItem(`minutes_${data.id}`)
          if (saved) {
            setGeneratedMinutes(JSON.parse(saved))
          }
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

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        const file = new File([blob], `recording_${Date.now()}.wav`, { type: 'audio/wav' })
        setAudioFile(file)
        handleTranscription(file)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('录音失败:', err)
      alert('无法访问麦克风,请检查权限设置')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
    setIsRecording(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      handleTranscription(file)
    }
  }

  const handleTranscription = async (file: File) => {
    setIsTranscribing(true)
    setTranscribedText('')

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockTranscriptions: Record<string, string> = {
      project_review: `好的,我们开始今天的项目进度会议。

首先,前端团队汇报一下目前的进展。我们完成了用户登录模块的开发,正在进行会议列表页面的优化。预计本周五可以完成首页的响应式适配。

后端这边,API接口已经对接完成,Supabase的集成也测试通过了。不过我们在OAuth回调处理上遇到了一些问题,需要再调试一下。

关于资源分配,我们目前需要增加一名UI设计师,首页的视觉设计还需要完善。另外,测试环境的服务器配置也需要升级。

下一步,前端继续推进详情页开发,后端解决OAuth问题,下周一我们再同步一次。`,
      client_visit: `感谢各位参加今天的客户需求沟通会。

客户主要提出了三个核心需求:第一,希望增加会议录音自动转文字的功能;第二,需要AI辅助生成会议纪要;第三,要求支持多语言实时翻译。

关于技术实现,我们建议采用Whisper API做语音识别,GPT-4o做纪要生成。多语言翻译可以考虑集成Google Translate API。

商务方面,客户预算在50万左右,交付周期3个月。我们需要在下周三前提供详细的技术方案和报价。

行动项:产品经理整理需求文档,技术负责人评估方案可行性,商务准备报价单。`,
      weekly_standup: `本周例会开始。

上周完成情况:会议管理功能已上线,用户反馈整体不错。修复了3个bug,优化了页面加载速度。

本周计划:开发会议详情页的"准备面板"功能,包括会前简报、议程管理和材料管理三个模块。

风险和问题:AI功能需要调用外部API,成本较高,需要评估用量。另外,拖拽排序在移动端体验不佳,需要优化。

其他事项:下周团建活动安排在周六,请大家确认参加人数。`,
      other: `会议开始。

今天我们主要讨论新功能的开发计划。大家有什么想法可以提出来。

我提议增加一个智能助手功能,可以自动分析会议内容,提取关键信息。这个需求很强烈,很多用户都在反馈。

技术实现上,我们可以先对接OpenAI的API,做MVP版本。后续再考虑自研模型。

时间规划:两周完成原型,一个月上线测试版。

谁负责这个需求?小王你来牵头吧,需要资源随时找我协调。`,
    }

    const text = mockTranscriptions[meeting?.meeting_type || 'other'] || mockTranscriptions['other']
    setTranscribedText(text)
    setIsTranscribing(false)
  }

  const handleTextSubmit = () => {
    if (!rawText.trim()) return
    setTranscribedText(rawText)
  }

  const generateMinutes = async () => {
    if (!transcribedText) return
    setIsGenerating(true)

    await new Promise((resolve) => setTimeout(resolve, 3000))

    const mockMinutes = {
      summary: `本次会议围绕${meeting?.title || '项目'}展开讨论,主要涉及进度同步、需求确认和资源配置等议题。`,
      discussions: [
        {
          topic: '进度汇报',
          content: '前端完成登录模块开发,正在进行会议列表页面优化。后端API接口对接完成,Supabase集成测试通过。',
          participants: ['前端负责人', '后端负责人'],
        },
        {
          topic: '需求确认',
          content: '确认增加会议录音转文字、AI纪要生成、多语言翻译三项核心需求。建议采用Whisper API和GPT-4o实现。',
          participants: ['产品经理', '技术负责人'],
        },
        {
          topic: '资源配置',
          content: '需要增加UI设计师一名,测试环境服务器需要升级。预算约50万,交付周期3个月。',
          participants: ['项目经理', '商务'],
        },
      ],
      decisions: [
        '采用Whisper API + GPT-4o方案实现AI功能',
        '下周三前提交技术方案和报价',
        '两周完成智能助手MVP原型开发',
        '增加一名UI设计师支持首页设计',
      ],
      actionItems: [
        { task: '整理客户需求文档', assignee: '产品经理', deadline: '2026-05-18', priority: 'high' as const },
        { task: '评估技术方案可行性', assignee: '技术负责人', deadline: '2026-05-19', priority: 'high' as const },
        { task: '准备项目报价单', assignee: '商务', deadline: '2026-05-19', priority: 'medium' as const },
        { task: '招聘UI设计师', assignee: 'HR', deadline: '2026-05-25', priority: 'medium' as const },
        { task: '升级测试环境服务器', assignee: '运维', deadline: '2026-05-20', priority: 'low' as const },
      ],
      controversies: [
        {
          issue: 'AI功能成本较高,是否值得投入',
          views: ['技术负责人认为应该自研模型降低成本', '产品经理建议先用API快速验证市场'],
          status: '待决策',
        },
        {
          issue: '拖拽排序在移动端体验不佳',
          views: ['设计师建议改为按钮排序', '前端认为可以优化拖拽手势'],
          status: '讨论中',
        },
      ],
      generatedAt: new Date().toISOString(),
    }

    setGeneratedMinutes(mockMinutes)
    localStorage.setItem(`minutes_${meeting?.id}`, JSON.stringify(mockMinutes))
    setIsGenerating(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

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

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/meetings/${meeting.id}`}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">会议纪要生成</h1>
              <p className="text-sm text-slate-500">{meeting.title}</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {!generatedMinutes ? (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">输入会议内容</h2>

              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setInputMode('text')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    inputMode === 'text'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  粘贴简记文本
                </button>
                <button
                  onClick={() => setInputMode('audio')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    inputMode === 'audio'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  上传录音文件
                </button>
              </div>

              {inputMode === 'text' ? (
                <div className="space-y-4">
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="请粘贴会议简记文本,或手动输入会议内容..."
                    className="w-full h-64 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                  />
                  <button
                    onClick={handleTextSubmit}
                    disabled={!rawText.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4" />
                    开始解析
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-primary transition-colors">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium mb-2">拖拽录音文件到此处,或点击上传</p>
                    <p className="text-sm text-slate-400 mb-4">支持 MP3、WAV、M4A 格式</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      选择文件
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-sm text-slate-400">或</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  <div className="flex items-center justify-center">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                        isRecording
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                          录音中 {formatTime(recordingTime)}
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5" />
                          开始录音
                        </>
                      )}
                    </button>
                  </div>

                  {audioFile && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Headphones className="w-5 h-5 text-primary" />
                      <span className="text-sm text-slate-700">{audioFile.name}</span>
                      <span className="text-xs text-slate-500">
                        ({(audioFile.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isTranscribing && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <h3 className="font-semibold text-slate-900">正在转录语音...</h3>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded animate-pulse" style={{ width: '80%' }} />
                  <div className="h-3 bg-slate-100 rounded animate-pulse" style={{ width: '60%' }} />
                  <div className="h-3 bg-slate-100 rounded animate-pulse" style={{ width: '90%' }} />
                </div>
              </div>
            )}

            {transcribedText && !isTranscribing && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">转录结果</h3>
                  <button
                    onClick={() => setTranscribedText('')}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    重新输入
                  </button>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{transcribedText}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    共 {transcribedText.length} 字符
                  </p>
                  <button
                    onClick={generateMinutes}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        AI 生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        生成结构化纪要
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <MeetingMinutes
            minutes={generatedMinutes}
            meeting={meeting}
            onRegenerate={() => {
              setGeneratedMinutes(null)
              setTranscribedText('')
              setRawText('')
            }}
          />
        )}
      </div>
    </div>
  )
}
