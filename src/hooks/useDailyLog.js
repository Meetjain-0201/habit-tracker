import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function getTodayDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useDailyLog() {
  const [log, setLog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const today = getTodayDate()

  useEffect(() => {
    let cancelled = false

    async function loadOrCreate() {
      setLoading(true)
      setError(null)

      const { data: existing, error: fetchErr } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('log_date', today)
        .maybeSingle()

      if (cancelled) return

      if (fetchErr) {
        setError(fetchErr)
        setLoading(false)
        return
      }

      if (existing) {
        setLog(existing)
        setLoading(false)
        return
      }

      const { data: inserted, error: insertErr } = await supabase
        .from('daily_logs')
        .insert({ log_date: today })
        .select()
        .single()

      if (cancelled) return

      if (insertErr) {
        setError(insertErr)
      } else {
        setLog(inserted)
      }
      setLoading(false)
    }

    loadOrCreate()
    return () => {
      cancelled = true
    }
  }, [today])

  const updateLog = useCallback(
    async (field, value) => {
      if (!log) return
      const previous = log
      setLog({ ...log, [field]: value })

      const { data, error: updateErr } = await supabase
        .from('daily_logs')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('log_date', today)
        .select()
        .single()

      if (updateErr) {
        setLog(previous)
        setError(updateErr)
        return
      }
      setLog(data)
    },
    [log, today]
  )

  return { log, loading, error, updateLog }
}
