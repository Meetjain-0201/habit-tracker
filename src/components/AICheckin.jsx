import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { getAICheckin } from '../utils/aiCheckin'
import { useToast } from '../context/ToastContext'

const STORAGE_PREFIX = 'ai_checkin_'

function getCacheKey() {
  return STORAGE_PREFIX + format(new Date(), 'yyyy-MM-dd')
}

export default function AICheckin({ log, weekData }) {
  const { showToast } = useToast()
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const cached = localStorage.getItem(getCacheKey())
      if (cached) setResponse(cached)
    } catch {
      // localStorage unavailable, ignore
    }
  }, [])

  async function fetchCheckin() {
    if (loading) return
    setLoading(true)
    try {
      const text = await getAICheckin(log, weekData)
      setResponse(text)
      try {
        localStorage.setItem(getCacheKey(), text)
      } catch {
        // ignore quota errors
      }
    } catch (err) {
      showToast(err.message ?? 'Check-in failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-[#1a1a1a] rounded-2xl p-4 mb-4 border border-[#2a2a2a]">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-sm text-white font-semibold">🤖 Daily Check-in</div>
          <div className="text-[11px] text-gray-500">Personal habit coach</div>
        </div>
        <button
          type="button"
          onClick={fetchCheckin}
          disabled={loading}
          className="bg-[#22c55e] text-white px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-50 active:scale-95 transition-transform whitespace-nowrap"
        >
          {loading ? '...' : response ? 'Refresh' : 'Get Check-in 🤖'}
        </button>
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-3 h-3 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
          Thinking...
        </div>
      )}
      {!loading && response && (
        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
          {response}
        </p>
      )}
      {!loading && !response && (
        <p className="text-xs text-gray-500">
          Tap to get a quick read on your day.
        </p>
      )}
    </section>
  )
}
