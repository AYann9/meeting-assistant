'use client'

import { useState } from 'react'
import { LogOut, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [userName] = useState('演示用户')

  const handleLogout = async () => {
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-6 h-6 text-primary" />
          <span className="text-lg font-semibold text-slate-900">
            视频会议助手
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {userName.charAt(0)}
              </span>
            </div>
            <span className="text-sm text-slate-700 font-medium">
              {userName}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </div>
    </nav>
  )
}
