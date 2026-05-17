'use client'

import { useState, useEffect, useRef } from 'react'
import { Meeting } from '@/lib/types'
import { Upload, FileText, Download, Trash2, Clock, Bell, File, Image, FileSpreadsheet } from 'lucide-react'

interface Material {
  id: string
  name: string
  type: string
  size: string
  uploadedAt: string
  version: number
  versions: { version: number; uploadedAt: string; size: string }[]
}

interface MaterialPanelProps {
  meeting: Meeting
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  'application/pdf': <FileText className="w-8 h-8 text-red-500" />,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': <FileText className="w-8 h-8 text-orange-500" />,
  'application/vnd.ms-powerpoint': <FileText className="w-8 h-8 text-orange-500" />,
  'image/': <Image className="w-8 h-8 text-blue-500" />,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': <FileSpreadsheet className="w-8 h-8 text-green-500" />,
  'application/vnd.ms-excel': <FileSpreadsheet className="w-8 h-8 text-green-500" />,
}

function getFileIcon(type: string) {
  for (const [key, icon] of Object.entries(FILE_ICONS)) {
    if (type.startsWith(key)) return icon
  }
  return <File className="w-8 h-8 text-slate-500" />
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default function MaterialPanel({ meeting }: MaterialPanelProps) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem(`materials_${meeting.id}`)
    if (saved) {
      setMaterials(JSON.parse(saved))
    }
  }, [meeting.id])

  const saveMaterials = (items: Material[]) => {
    setMaterials(items)
    localStorage.setItem(`materials_${meeting.id}`, JSON.stringify(items))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    for (const file of Array.from(files)) {
      await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          const material: Material = {
            id: `material_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: formatFileSize(file.size),
            uploadedAt: new Date().toISOString(),
            version: 1,
            versions: [
              {
                version: 1,
                uploadedAt: new Date().toISOString(),
                size: formatFileSize(file.size),
              },
            ],
          }

          const updated = [...materials, material]
          saveMaterials(updated)

          const fileData = {
            ...material,
            data: reader.result,
          }
          localStorage.setItem(`file_${material.id}`, JSON.stringify(fileData))

          resolve(null)
        }
        reader.readAsDataURL(file)
      })
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('材料已上传', {
        body: `已为会议"${meeting.title}"上传 ${files.length} 个文件`,
        icon: '/favicon.ico',
      })
    }
  }

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission()
    }
  }

  const deleteMaterial = (id: string) => {
    const updated = materials.filter((m) => m.id !== id)
    saveMaterials(updated)
    localStorage.removeItem(`file_${id}`)
    setSelectedMaterial(null)
  }

  const downloadMaterial = (material: Material) => {
    const saved = localStorage.getItem(`file_${material.id}`)
    if (!saved) return

    const fileData = JSON.parse(saved)
    const link = document.createElement('a')
    link.href = fileData.data
    link.download = material.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const replaceMaterial = async (e: React.ChangeEvent<HTMLInputElement>, materialId: string) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const reader = new FileReader()
    reader.onload = () => {
      const updated = materials.map((m) => {
        if (m.id === materialId) {
          const newVersion = m.version + 1
          return {
            ...m,
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: formatFileSize(file.size),
            uploadedAt: new Date().toISOString(),
            version: newVersion,
            versions: [
              ...m.versions,
              {
                version: newVersion,
                uploadedAt: new Date().toISOString(),
                size: formatFileSize(file.size),
              },
            ],
          }
        }
        return m
      })
      saveMaterials(updated)

      const material = updated.find((m) => m.id === materialId)
      if (material) {
        const fileData = {
          ...material,
          data: reader.result,
        }
        localStorage.setItem(`file_${materialId}`, JSON.stringify(fileData))

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('材料已更新', {
            body: `文件"${material.name}"已更新至版本 ${material.version}`,
            icon: '/favicon.ico',
          })
        }
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">会议材料</h2>
              <p className="text-sm text-slate-500">{materials.length} 个文件</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={requestNotificationPermission}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="开启更新通知"
            >
              <Bell className="w-4 h-4" />
              开启通知
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? '上传中...' : '上传文件'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {materials.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
            <Upload className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">暂无会议材料</p>
            <p className="text-sm text-slate-400 mt-1">点击"上传文件"添加 PDF、PPT 等材料</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
              >
                {getFileIcon(material.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 truncate">{material.name}</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      v{material.version}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>{material.size}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(material.uploadedAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => downloadMaterial(material)}
                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="下载"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <label className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                    title="更新版本"
                  >
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => replaceMaterial(e, material.id)}
                    />
                  </label>
                  <button
                    onClick={() => setSelectedMaterial(material)}
                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="版本历史"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMaterial(material.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">版本历史</h3>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {[...selectedMaterial.versions].reverse().map((v, i) => (
                <div key={v.version} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    v{v.version}
                  </span>
                  <div className="flex-1">
                    <span className="text-sm text-slate-600">{v.size}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(v.uploadedAt).toLocaleDateString('zh-CN')}
                  </span>
                  {i === 0 && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      最新
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
