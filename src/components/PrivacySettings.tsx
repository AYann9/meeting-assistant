'use client'

import { useState, useEffect } from 'react'
import { Shield, Mic, Globe, Lock, Eye, EyeOff, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface PrivacyConfig {
  localTranscription: boolean
  saveRecordings: boolean
  shareAnalytics: boolean
  autoDeleteDays: number
  encryptStorage: boolean
}

export default function PrivacySettings() {
  const [config, setConfig] = useState<PrivacyConfig>({
    localTranscription: false,
    saveRecordings: true,
    shareAnalytics: false,
    autoDeleteDays: 30,
    encryptStorage: false,
  })
  const [saved, setSaved] = useState(false)
  const [showLocalModeInfo, setShowLocalModeInfo] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('privacy_config')
    if (saved) {
      try {
        setConfig(JSON.parse(saved))
      } catch {
        // ignore
      }
    }
  }, [])

  const saveConfig = () => {
    localStorage.setItem('privacy_config', JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleSetting = (key: keyof PrivacyConfig) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">隐私设置</h2>
        <p className="text-sm text-slate-500 mt-1">管理您的数据隐私和本地处理选项</p>
      </div>

      {/* 本地转录模式 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">本地转录模式</h3>
              <p className="text-sm text-slate-500">使用 Web Worker + Whisper 在本地处理语音</p>
            </div>
          </div>
          <button
            onClick={() => toggleSetting('localTranscription')}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              config.localTranscription ? 'bg-green-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                config.localTranscription ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {config.localTranscription && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">本地模式已启用</p>
                <p className="text-sm text-green-700 mt-1">
                  语音数据将在您的设备上处理,不会上传到任何服务器。需要下载约 150MB 的模型文件。
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={() => setShowLocalModeInfo(!showLocalModeInfo)}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Info className="w-4 h-4" />
            了解本地转录模式
          </button>
          
          {showLocalModeInfo && (
            <div className="mt-3 p-4 bg-slate-50 rounded-lg text-sm text-slate-700 space-y-2">
              <p><strong>工作原理:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>使用 Web Worker 在后台线程运行 Whisper 模型</li>
                <li>语音数据完全在浏览器本地处理</li>
                <li>无需网络连接即可进行转录</li>
                <li>支持多种语言识别</li>
              </ul>
              <p className="mt-2"><strong>注意事项:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>首次使用需要下载模型文件(约 150MB)</li>
                <li>转录速度取决于设备性能</li>
                <li>建议使用 Chrome 或 Edge 浏览器</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 数据存储设置 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">数据存储</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">保存录音文件</p>
                <p className="text-sm text-slate-500">在本地存储原始录音文件</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('saveRecordings')}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                config.saveRecordings ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  config.saveRecordings ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <EyeOff className="w-5 h-5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">加密存储</p>
                <p className="text-sm text-slate-500">使用本地加密保护敏感数据</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('encryptStorage')}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                config.encryptStorage ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  config.encryptStorage ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">共享使用数据</p>
                <p className="text-sm text-slate-500">匿名分享使用统计以改进产品</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('shareAnalytics')}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                config.shareAnalytics ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  config.shareAnalytics ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div className="flex-1">
                <p className="font-medium text-slate-900">自动删除数据</p>
                <p className="text-sm text-slate-500">超过指定天数后自动删除会议数据</p>
              </div>
              <select
                value={config.autoDeleteDays}
                onChange={(e) => setConfig(prev => ({ ...prev, autoDeleteDays: Number(e.target.value) }))}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              >
                <option value={7}>7 天</option>
                <option value={30}>30 天</option>
                <option value={90}>90 天</option>
                <option value={180}>180 天</option>
                <option value={365}>1 年</option>
                <option value={0}>永不删除</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <button
          onClick={saveConfig}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              已保存
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              保存设置
            </>
          )}
        </button>
      </div>
    </div>
  )
}
