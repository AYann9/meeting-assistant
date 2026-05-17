'use client'

import { useState } from 'react'
import { BarChart3, Shield, Plug, ChevronRight, BarChart, CheckCircle, Clock, Calendar, Users, TrendingUp, Mic, Globe, Save } from 'lucide-react'
import StatisticsPanel from '@/components/StatisticsPanel'
import PrivacySettings from '@/components/PrivacySettings'
import IntegrationSettings from '@/components/IntegrationSettings'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'statistics' | 'privacy' | 'integration'>('statistics')

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-slate-900">设置</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* 侧边栏 */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setActiveTab('statistics')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === 'statistics'
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">会议统计</span>
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === 'privacy'
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">隐私设置</span>
              </button>
              <button
                onClick={() => setActiveTab('integration')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === 'integration'
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                }`}
              >
                <Plug className="w-5 h-5" />
                <span className="font-medium">集成配置</span>
              </button>
            </div>
          </div>

          {/* 内容区 */}
          <div className="flex-1">
            {activeTab === 'statistics' && <StatisticsPanel />}
            {activeTab === 'privacy' && <PrivacySettings />}
            {activeTab === 'integration' && <IntegrationSettings />}
          </div>
        </div>
      </div>
    </div>
  )
}
