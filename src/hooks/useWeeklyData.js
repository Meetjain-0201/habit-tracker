import { useEffect, useState } from 'react'
import { format, subDays, startOfDay } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'
import {
  BOOLEAN_FIELDS,
  gymStatus,
  avgWater,
  rowCompletionPct,
} from '../utils/weeklyStats'

const HISTORY_DAYS = 30

function dateStr(d) {
  return format(d, 'yyyy-MM-dd')
}

export function useWeeklyData() {
  const { showToast } = useToast()
  const [weekData, setWeekData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const today = startOfDay(new Date())
      const start = subDays(today, HISTORY_DAYS - 1)

      const { data, error: err } = await supabase
        .from('daily_logs')
        .select('*')
        .gte('log_date', dateStr(start))
        .lte('log_date', dateStr(today))
        .order('log_date', { ascending: true })

      if (cancelled) return
      if (err) {
        setError(err)
        showToast(`Could not load weekly data: ${err.message}`, 'error')
        setLoading(false)
        return
      }

      const byDate = new Map((data || []).map((r) => [r.log_date, r]))

      const last7 = []
      for (let i = 6; i >= 0; i--) {
        const d = subDays(today, i)
        const ds = dateStr(d)
        last7.push({
          date: ds,
          day_label: format(d, 'EEE'),
          row: byDate.get(ds) || null,
        })
      }

      const gymDays = last7.filter((d) => d.row?.gym_done).length
      const status = gymStatus(gymDays)

      const watersWith = last7.filter((d) => d.row).map((d) => d.row.water_glasses ?? 0)
      const water = avgWater(watersWith)

      const totalApps = last7.reduce(
        (s, d) => s + (d.row?.job_applications_count ?? 0),
        0
      )
      const totalOutreach = last7.filter((d) => d.row?.cold_outreach_done).length

      const completionByDay = last7.map((d) => ({
        date: d.date,
        day_label: d.day_label,
        pct: rowCompletionPct(d.row),
        gym_done: !!d.row?.gym_done,
      }))

      let skinStreak = 0
      for (let i = 0; i < HISTORY_DAYS; i++) {
        const ds = dateStr(subDays(today, i))
        const row = byDate.get(ds)
        if (row?.skin_morning_done) {
          skinStreak++
        } else if (i === 0) {
          continue
        } else {
          break
        }
      }

      let habitStreak = 0
      for (let i = 0; i < HISTORY_DAYS; i++) {
        const ds = dateStr(subDays(today, i))
        const row = byDate.get(ds)
        const pct = rowCompletionPct(row)
        if (row && pct >= 80) {
          habitStreak++
        } else if (i === 0) {
          continue
        } else {
          break
        }
      }

      if (cancelled) return
      setWeekData({
        gym_days_this_week: gymDays,
        gym_status: status,
        avg_water_glasses: water,
        total_applications: totalApps,
        total_outreach: totalOutreach,
        skin_morning_streak: skinStreak,
        completion_by_day: completionByDay,
        habit_streak: habitStreak,
      })
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [showToast])

  return { weekData, loading, error }
}
