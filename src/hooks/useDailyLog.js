import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'

const QUIET_FIELDS = new Set(['water_glasses', 'gym_quality'])

function getTodayDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useDailyLog() {
  const { showToast } = useToast()
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
        showToast(`Could not load today's log: ${fetchErr.message}`, 'error')
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
        showToast(`Could not create today's log: ${insertErr.message}`, 'error')
      } else {
        setLog(inserted)
      }
      setLoading(false)
    }

    loadOrCreate()
    return () => {
      cancelled = true
    }
  }, [today, showToast])

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('log_date', today)
      .maybeSingle()
    if (err) {
      setError(err)
    } else if (data) {
      setLog(data)
    }
    setLoading(false)
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
        showToast(`Save failed: ${updateErr.message}`, 'error')
        return
      }
      setLog(data)
      if (!QUIET_FIELDS.has(field)) {
        showToast('Saved ✓', 'success')
      }
    },
    [log, today, showToast]
  )

  return { log, loading, error, updateLog, refetch }
}
