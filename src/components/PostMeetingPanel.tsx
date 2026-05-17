"use client"

import { useState, useRef } from "react"
import { Meeting } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Mic,
  FileText,
  Sparkles,
  Loader2,
  Upload,
  Headphones,
  CheckCircle2,
  AlertTriangle,
  Send,
  Copy,
  ExternalLink,
  GripVertical,
  Trash2,
  Pencil,
  Clock,
  User,
  Flag,
} from "lucide-react"

interface PostMeetingPanelProps {
  meeting: Meeting
}

export default function PostMeetingPanel({ meeting }: PostMeetingPanelProps) {
  const [activeTab, setActiveTab] = useState("upload")
  const [inputMode, setInputMode] = useState<"audio" | "text">("text")
  const [rawText, setRawText] = useState("")
  const [transcribedText, setTranscribedText] = useState("")
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMinutes, setGeneratedMinutes] = useState<any>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [todos, setTodos] = useState<any[]>([])
  const [distributing, setDistributing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" })
        const file = new File([blob], `recording_${Date.now()}.wav`, { type: "audio/wav" })
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
    } catch {
      alert("无法访问麦克风，请检查权限设置")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
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
    setTranscribedText("")
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockText = `好的，我们开始今天的${meeting.title}。

首先，前端团队汇报一下目前的进展。我们完成了用户登录模块的开发，正在进行会议列表页面的优化。预计本周五可以完成首页的响应式适配。

后端这边，API接口已经对接完成，Supabase的集成也测试通过了。不过我们在OAuth回调处理上遇到了一些问题，需要再调试一下。

关于资源分配，我们目前需要增加一名UI设计师，首页的视觉设计还需要完善。另外，测试环境的服务器配置也需要升级。

下一步，前端继续推进详情页开发，后端解决OAuth问题，下周一我们再同步一次。`

    setTranscribedText(mockText)
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

    const minutes = {
      summary: `本次会议围绕${meeting.title}展开讨论，主要涉及进度同步、需求确认和资源配置等议题。`,
      discussions: [
        {
          topic: "进度汇报",
          content: "前端完成登录模块开发，正在进行会议列表页面优化。后端API接口对接完成，Supabase集成测试通过。",
          participants: ["前端负责人", "后端负责人"],
        },
        {
          topic: "需求确认",
          content: "确认增加会议录音转文字、AI纪要生成、多语言翻译三项核心需求。建议采用Whisper API和GPT-4o实现。",
          participants: ["产品经理", "技术负责人"],
        },
        {
          topic: "资源配置",
          content: "需要增加UI设计师一名，测试环境服务器需要升级。预算约50万，交付周期3个月。",
          participants: ["项目经理", "商务"],
        },
      ],
      decisions: [
        "采用Whisper API + GPT-4o方案实现AI功能",
        "下周三前提交技术方案和报价",
        "两周完成智能助手MVP原型开发",
        "增加一名UI设计师支持首页设计",
      ],
      actionItems: [
        { task: "整理客户需求文档", assignee: "产品经理", deadline: "2026-05-18", priority: "high" },
        { task: "评估技术方案可行性", assignee: "技术负责人", deadline: "2026-05-19", priority: "high" },
        { task: "准备项目报价单", assignee: "商务", deadline: "2026-05-19", priority: "medium" },
        { task: "招聘UI设计师", assignee: "HR", deadline: "2026-05-25", priority: "medium" },
        { task: "升级测试环境服务器", assignee: "运维", deadline: "2026-05-20", priority: "low" },
      ],
      controversies: [
        {
          issue: "AI功能成本较高，是否值得投入",
          views: ["技术负责人认为应该自研模型降低成本", "产品经理建议先用API快速验证市场"],
          status: "待决策",
        },
        {
          issue: "拖拽排序在移动端体验不佳",
          views: ["设计师建议改为按钮排序", "前端认为可以优化拖拽手势"],
          status: "讨论中",
        },
      ],
    }

    setGeneratedMinutes(minutes)
    setTodos(minutes.actionItems)
    setIsGenerating(false)
    setActiveTab("minutes")
  }

  const distributeTodos = async () => {
    setDistributing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setDistributing(false)
    alert("待办事项已生成复制文本，可粘贴到飞书/企微/Notion")
  }

  const moveTodo = (index: number, direction: "up" | "down") => {
    setTodos((prev) => {
      const newItems = [...prev]
      const targetIndex = direction === "up" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= newItems.length) return prev
      ;[newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]
      return newItems
    })
  }

  const deleteTodo = (index: number) => {
    setTodos((prev) => prev.filter((_, i) => i !== index))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200"
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "low":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "高"
      case "medium":
        return "中"
      case "low":
        return "低"
      default:
        return priority
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
        <TabsTrigger value="upload">上传/输入</TabsTrigger>
        <TabsTrigger value="minutes" disabled={!generatedMinutes}>
          结构化纪要
        </TabsTrigger>
        <TabsTrigger value="todos" disabled={todos.length === 0}>
          待办分发
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upload" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" />
              输入会议内容
            </CardTitle>
            <CardDescription>上传录音文件或粘贴简记文本，AI 将自动转录并生成纪要</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={inputMode === "text" ? "default" : "outline"}
                size="sm"
                onClick={() => setInputMode("text")}
              >
                <FileText className="w-4 h-4 mr-1.5" />
                粘贴文本
              </Button>
              <Button
                variant={inputMode === "audio" ? "default" : "outline"}
                size="sm"
                onClick={() => setInputMode("audio")}
              >
                <Mic className="w-4 h-4 mr-1.5" />
                上传录音
              </Button>
            </div>

            {inputMode === "text" ? (
              <div className="space-y-3">
                <Textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="请粘贴会议简记文本，或手动输入会议内容..."
                  className="min-h-[200px]"
                />
                <Button onClick={handleTextSubmit} disabled={!rawText.trim()}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  开始解析
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-primary transition-colors">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium mb-2">拖拽录音文件到此处，或点击上传</p>
                  <p className="text-sm text-slate-400 mb-4">支持 MP3、WAV、M4A 格式</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    选择文件
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-sm text-slate-400">或</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="flex justify-center">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? (
                      <>
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse mr-2" />
                        录音中 {formatTime(recordingTime)}
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        开始录音
                      </>
                    )}
                  </Button>
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
          </CardContent>
        </Card>

        {isTranscribing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                正在转录语音...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        )}

        {transcribedText && !isTranscribing && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>转录结果</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setTranscribedText("")}>
                  重新输入
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {transcribedText}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">共 {transcribedText.length} 字符</p>
                <Button onClick={generateMinutes} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      AI 生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      生成结构化纪要
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="minutes" className="space-y-4">
        {generatedMinutes && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  会议摘要
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">{generatedMinutes.summary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  决议事项
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {generatedMinutes.decisions.map((d: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {generatedMinutes.discussions.map((d: any, i: number) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{d.topic}</CardTitle>
                    <div className="flex gap-1">
                      {d.participants.map((p: string, j: number) => (
                        <Badge key={j} variant="secondary" className="text-xs">
                          <User className="w-3 h-3 mr-1" />
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{d.content}</p>
                </CardContent>
              </Card>
            ))}

            {generatedMinutes.controversies.length > 0 && (
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="w-5 h-5" />
                    争议问题
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {generatedMinutes.controversies.map((c: any, i: number) => (
                    <div key={i} className="p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-amber-900">{c.issue}</span>
                        <Badge variant="outline" className="text-xs">
                          {c.status}
                        </Badge>
                      </div>
                      <ul className="space-y-1">
                        {c.views.map((v: string, j: number) => (
                          <li key={j} className="text-xs text-amber-700 flex items-start gap-1.5">
                            <span className="mt-1 w-1 h-1 bg-amber-500 rounded-full flex-shrink-0" />
                            {v}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </TabsContent>

      <TabsContent value="todos" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-primary" />
                待办事项确认
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={distributeTodos} disabled={distributing}>
                  {distributing ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-1.5" />
                  )}
                  {distributing ? "分发中..." : "一键分发"}
                </Button>
              </div>
            </div>
            <CardDescription>拖拽调整顺序，可编辑或删除待办项</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {todos.map((todo, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveTodo(index, "up")}
                    disabled={index === 0}
                    className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <GripVertical className="w-4 h-4 rotate-90" />
                  </button>
                  <button
                    onClick={() => moveTodo(index, "down")}
                    disabled={index === todos.length - 1}
                    className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <GripVertical className="w-4 h-4 rotate-90" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{todo.task}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {todo.assignee}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {todo.deadline}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className={`text-xs ${getPriorityColor(todo.priority)}`}>
                  {getPriorityLabel(todo.priority)}
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="w-4 h-4 text-slate-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteTodo(index)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="flex items-start gap-3 py-4">
            <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">外部工具分发</p>
              <p className="text-xs text-blue-700 mt-1">
                点击"一键分发"将生成格式化的待办清单文本，支持粘贴到飞书任务、Notion、企业微信等工具
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
