import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'

export function useWeightLog() {
  const [weights, setWeights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('weight_log')
        .select('*')
        .order('log_date', { ascending: true })
      if (cancelled) return
      if (err) {
        setError(err)
      } else {
        setWeights(data || [])
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const addWeight = useCallback(async (kg) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data, error: err } = await supabase
      .from('weight_log')
      .insert({ log_date: today, weight_kg: kg })
      .select()
      .single()

    if (err) {
      setError(err)
      return
    }
    setWeights((prev) =>
      [...prev, data].sort((a, b) => a.log_date.localeCompare(b.log_date))
    )
  }, [])

  return { weights, loading, error, addWeight }
}
