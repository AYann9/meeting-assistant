'use client'

import { useState, useEffect } from 'react'
import { Plug, MessageSquare, FileText, Send, CheckCircle, AlertCircle, ExternalLink, Copy, Eye, EyeOff, Trash2 } from 'lucide-react'

interface IntegrationConfig {
  feishu: {
    enabled: boolean
    webhook: string
    appId: string
    appSecret: string
  }
  wecom: {
    enabled: boolean
    webhook: string
    corpId: string
    corpSecret: string
  }
  notion: {
    enabled: boolean
    token: string
    databaseId: string
  }
}

export default function IntegrationSettings() {
  const [config, setConfig] = useState<IntegrationConfig>({
    feishu: { enabled: false, webhook: '', appId: '', appSecret: '' },
    wecom: { enabled: false, webhook: '', corpId: '', corpSecret: '' },
    notion: { enabled: false, token: '', databaseId: '' },
  })
  const [saved, setSaved] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [testStatus, setTestStatus] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({
    feishu: 'idle',
    wecom: 'idle',
    notion: 'idle',
  })

  useEffect(() => {
    const saved = localStorage.getItem('integration_config')
    if (saved) {
      try {
        setConfig(JSON.parse(saved))
      } catch {
        // ignore
      }
    }
  }, [])

  const saveConfig = () => {
    localStorage.setItem('integration_config', JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateConfig = (platform: keyof IntegrationConfig, field: string, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }))
  }

  const togglePlatform = (platform: keyof IntegrationConfig) => {
    setConfig(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        enabled: !prev[platform].enabled,
      },
    }))
  }

  const testConnection = async (platform: keyof IntegrationConfig) => {
    setTestStatus(prev => ({ ...prev, [platform]: 'testing' }))
    
    // 模拟测试连接
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 随机成功或失败(实际项目中这里应该调用真实API)
    const success = Math.random() > 0.3
    setTestStatus(prev => ({ ...prev, [platform]: success ? 'success' : 'error' }))
    
    setTimeout(() => {
      setTestStatus(prev => ({ ...prev, [platform]: 'idle' }))
    }, 3000)
  }

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">集成配置</h2>
        <p className="text-sm text-slate-500 mt-1">配置第三方工具对接,实现待办自动分发</p>
      </div>

      {/* 飞书 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">飞书</h3>
              <p className="text-sm text-slate-500">将待办事项发送到飞书群或私聊</p>
            </div>
          </div>
          <button
            onClick={() => togglePlatform('feishu')}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              config.feishu.enabled ? 'bg-blue-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                config.feishu.enabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {config.feishu.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Webhook 地址</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.feishu.webhook}
                  onChange={(e) => updateConfig('feishu', 'webhook', e.target.value)}
                  placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(config.feishu.webhook)}
                  className="p-2 text-slate-400 hover:text-slate-600 border border-slate-300 rounded-lg"
                  title="复制"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                在飞书群设置中添加自定义机器人,复制 Webhook 地址
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">App ID</label>
                <input
                  type="text"
                  value={config.feishu.appId}
                  onChange={(e) => updateConfig('feishu', 'appId', e.target.value)}
                  placeholder="cli_..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">App Secret</label>
                <div className="flex gap-2">
                  <input
                    type={showSecrets['feishu_secret'] ? 'text' : 'password'}
                    value={config.feishu.appSecret}
                    onChange={(e) => updateConfig('feishu', 'appSecret', e.target.value)}
                    placeholder="输入 App Secret"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                  <button
                    onClick={() => toggleSecretVisibility('feishu_secret')}
                    className="p-2 text-slate-400 hover:text-slate-600 border border-slate-300 rounded-lg"
                  >
                    {showSecrets['feishu_secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => testConnection('feishu')}
                disabled={testStatus.feishu === 'testing'}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
              >
                {testStatus.feishu === 'testing' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    测试中...
                  </>
                ) : testStatus.feishu === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    连接成功
                  </>
                ) : testStatus.feishu === 'error' ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    连接失败
                  </>
                ) : (
                  <>
                    <Plug className="w-4 h-4" />
                    测试连接
                  </>
                )}
              </button>
              <a
                href="https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                查看文档
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 企业微信 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">企业微信</h3>
              <p className="text-sm text-slate-500">将待办事项发送到企业微信群</p>
            </div>
          </div>
          <button
            onClick={() => togglePlatform('wecom')}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              config.wecom.enabled ? 'bg-green-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                config.wecom.enabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {config.wecom.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Webhook 地址</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.wecom.webhook}
                  onChange={(e) => updateConfig('wecom', 'webhook', e.target.value)}
                  placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(config.wecom.webhook)}
                  className="p-2 text-slate-400 hover:text-slate-600 border border-slate-300 rounded-lg"
                  title="复制"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                在企业微信群中添加群机器人,复制 Webhook 地址
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">企业 ID</label>
                <input
                  type="text"
                  value={config.wecom.corpId}
                  onChange={(e) => updateConfig('wecom', 'corpId', e.target.value)}
                  placeholder="ww..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Corp Secret</label>
                <div className="flex gap-2">
                  <input
                    type={showSecrets['wecom_secret'] ? 'text' : 'password'}
                    value={config.wecom.corpSecret}
                    onChange={(e) => updateConfig('wecom', 'corpSecret', e.target.value)}
                    placeholder="输入 Corp Secret"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                  <button
                    onClick={() => toggleSecretVisibility('wecom_secret')}
                    className="p-2 text-slate-400 hover:text-slate-600 border border-slate-300 rounded-lg"
                  >
                    {showSecrets['wecom_secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => testConnection('wecom')}
                disabled={testStatus.wecom === 'testing'}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
              >
                {testStatus.wecom === 'testing' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    测试中...
                  </>
                ) : testStatus.wecom === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    连接成功
                  </>
                ) : testStatus.wecom === 'error' ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    连接失败
                  </>
                ) : (
                  <>
                    <Plug className="w-4 h-4" />
                    测试连接
                  </>
                )}
              </button>
              <a
                href="https://developer.work.weixin.qq.com/document/path/91770"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                查看文档
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Notion */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Notion</h3>
              <p className="text-sm text-slate-500">将待办事项同步到 Notion 数据库</p>
            </div>
          </div>
          <button
            onClick={() => togglePlatform('notion')}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              config.notion.enabled ? 'bg-slate-800' : 'bg-slate-300'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                config.notion.enabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {config.notion.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Integration Token</label>
              <div className="flex gap-2">
                <input
                  type={showSecrets['notion_token'] ? 'text' : 'password'}
                  value={config.notion.token}
                  onChange={(e) => updateConfig('notion', 'token', e.target.value)}
                  placeholder="secret_..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                <button
                  onClick={() => toggleSecretVisibility('notion_token')}
                  className="p-2 text-slate-400 hover:text-slate-600 border border-slate-300 rounded-lg"
                >
                  {showSecrets['notion_token'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                在 Notion Integration 页面创建新的 integration,复制 Token
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Database ID</label>
              <input
                type="text"
                value={config.notion.databaseId}
                onChange={(e) => updateConfig('notion', 'databaseId', e.target.value)}
                placeholder="输入数据库 ID"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">
                在 Notion 数据库页面 URL 中复制数据库 ID
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => testConnection('notion')}
                disabled={testStatus.notion === 'testing'}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
              >
                {testStatus.notion === 'testing' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    测试中...
                  </>
                ) : testStatus.notion === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    连接成功
                  </>
                ) : testStatus.notion === 'error' ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    连接失败
                  </>
                ) : (
                  <>
                    <Plug className="w-4 h-4" />
                    测试连接
                  </>
                )}
              </button>
              <a
                href="https://developers.notion.com/docs/getting-started"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                查看文档
              </a>
            </div>
          </div>
        )}
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
              <Plug className="w-4 h-4" />
              保存配置
            </>
          )}
        </button>
      </div>
    </div>
  )
}
