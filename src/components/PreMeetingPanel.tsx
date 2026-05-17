"use client"

import { useState } from "react"
import { Meeting } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles,
  GripVertical,
  FileText,
  Upload,
  Clock,
  Users,
  Lightbulb,
  CheckCircle2,
  Loader2,
  FileUp,
  Bell,
} from "lucide-react"

interface PreMeetingPanelProps {
  meeting: Meeting
}

export default function PreMeetingPanel({ meeting }: PreMeetingPanelProps) {
  const [activeTab, setActiveTab] = useState("brief")
  const [generatingBrief, setGeneratingBrief] = useState(false)
  const [brief, setBrief] = useState<any>(null)
  const [agendaItems, setAgendaItems] = useState([
    { id: "1", content: "项目进度回顾", suggested: false },
    { id: "2", content: "Q2 目标对齐讨论", suggested: true },
    { id: "3", content: "技术难点解决方案", suggested: true },
    { id: "4", content: "资源分配确认", suggested: false },
  ])
  const [materials, setMaterials] = useState([
    { id: "1", name: "Q2_产品路线图_v1.pdf", version: 1, date: "2026-05-15" },
    { id: "2", name: "竞品分析报告.pptx", version: 1, date: "2026-05-16" },
  ])
  const [uploading, setUploading] = useState(false)

  const generateBrief = async () => {
    setGeneratingBrief(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setBrief({
      summary: `基于过往与 ${meeting.attendees?.join("、") || "参会人"} 的会议记录，本次${meeting.title}需要关注以下要点：`,
      history: [
        {
          topic: "上次会议遗留问题",
          content: "前端登录模块开发已完成，需确认接口联调进度。",
          meeting: "2026-05-10 技术周会",
        },
        {
          topic: "相关背景",
          content: "Q2 产品路线图已于上周定稿，本次需与各团队对齐执行计划。",
          meeting: "2026-05-12 产品评审",
        },
      ],
      suggestions: [
        "提前准备各团队资源需求清单",
        "确认技术方案可行性评估结果",
        "讨论潜在风险及应对措施",
      ],
    })
    setGeneratingBrief(false)
  }

  const handleUpload = async () => {
    setUploading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setMaterials((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        name: "新上传材料_v1.pdf",
        version: 1,
        date: new Date().toISOString().split("T")[0],
      },
    ])
    setUploading(false)
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("材料更新", {
        body: `会议"${meeting.title}"有新材料上传`,
      })
    }
  }

  const moveAgendaItem = (index: number, direction: "up" | "down") => {
    setAgendaItems((prev) => {
      const newItems = [...prev]
      const targetIndex = direction === "up" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= newItems.length) return prev
      ;[newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]
      return newItems
    })
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
        <TabsTrigger value="brief">会前简报</TabsTrigger>
        <TabsTrigger value="agenda">议程管理</TabsTrigger>
        <TabsTrigger value="materials">材料管理</TabsTrigger>
      </TabsList>

      <TabsContent value="brief" className="space-y-4">
        {!brief && !generatingBrief && (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">AI 会前简报</h3>
              <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
                基于参会人和会议主题，AI 将从过往纪要中检索相关背景，自动生成会前简报
              </p>
              <Button onClick={generateBrief}>
                <Sparkles className="w-4 h-4 mr-2" />
                生成会前简报
              </Button>
            </CardContent>
          </Card>
        )}

        {generatingBrief && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                AI 正在分析历史数据...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        )}

        {brief && !generatingBrief && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  会议要点
                </CardTitle>
                <CardDescription>{brief.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {brief.suggestions.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {brief.history.map((item: any, i: number) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{item.topic}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {item.meeting}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{item.content}</p>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setBrief(null)}>
                重新生成
              </Button>
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="agenda" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                会议议程
              </CardTitle>
              <Button variant="outline" size="sm">
                <Sparkles className="w-4 h-4 mr-1.5" />
                AI 推荐议程
              </Button>
            </div>
            <CardDescription>拖拽调整议程顺序，点击 AI 推荐获取智能建议</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {agendaItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveAgendaItem(index, "up")}
                    disabled={index === 0}
                    className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <GripVertical className="w-4 h-4 rotate-90" />
                  </button>
                </div>
                <span className="text-sm font-medium text-slate-500 w-6">{index + 1}.</span>
                <span className="flex-1 text-sm text-slate-700">{item.content}</span>
                {item.suggested && (
                  <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI 推荐
                  </Badge>
                )}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveAgendaItem(index, "down")}
                    disabled={index === agendaItems.length - 1}
                    className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <GripVertical className="w-4 h-4 rotate-90" />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="materials" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-primary" />
                会议材料
              </CardTitle>
              <Button onClick={handleUpload} disabled={uploading} size="sm">
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-1.5" />
                )}
                {uploading ? "上传中..." : "上传文件"}
              </Button>
            </div>
            <CardDescription>支持 PDF、PPT 格式，上传后参会人将收到通知</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{material.name}</p>
                    <p className="text-xs text-slate-500">
                      版本 {material.version} · {material.date}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  v{material.version}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="flex items-start gap-3 py-4">
            <Bell className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">更新通知</p>
              <p className="text-xs text-amber-700 mt-1">
                材料更新后，系统将通过浏览器通知提醒所有参会人查看最新版本
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
