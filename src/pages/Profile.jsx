import { useState, useEffect, useRef } from 'react'
import { format, subDays } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useUserProfile } from '../hooks/useUserProfile'
import { useWeightLog } from '../hooks/useWeightLog'
import { useToast } from '../context/ToastContext'
import { USER_PROFILE as DEFAULT_PROFILE } from '../data/habits'
import { MEAL_PLAN, PROTEIN_BY_DAY, DAYS_ORDER } from '../data/mealPlan'
import { TIERS } from '../data/tiers'
import {
  requestNotificationPermission,
  scheduleDailyReminders,
} from '../utils/notifications'

const DAY_CODES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function todayDayCode() {
  return DAY_CODES[new Date().getDay()]
}

function readPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission
}

function Section({ title, children }) {
  return (
    <section className="bg-[#1a1a1a] rounded-2xl p-4 mb-4">
      <h2 className="text-base font-semibold text-white mb-3">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  )
}

function SupItem({ name, detail }) {
  return (
    <li>
      <div className="text-white">{name}</div>
      <div className="text-gray-400 text-[11px]">{detail}</div>
    </li>
  )
}

export default function Profile() {
  const { profile, updateTier } = useUserProfile()
  const { weights } = useWeightLog()
  const { showToast } = useToast()
  const [permission, setPermission] = useState(readPermission())
  const today = todayDayCode()

  const mealScrollRef = useRef(null)
  const todayCardRef = useRef(null)

  useEffect(() => {
    const card = todayCardRef.current
    const container = mealScrollRef.current
    if (!card || !container) return
    const offset =
      card.offsetLeft - (container.clientWidth - card.clientWidth) / 2
    container.scrollLeft = Math.max(0, offset)
  }, [])

  const lastWeight =
    weights.length > 0
      ? Number(weights[weights.length - 1].weight_kg)
      : (profile?.weight_kg ?? DEFAULT_PROFILE.weight_kg)
  const targetWeight = profile?.target_weight_kg ?? DEFAULT_PROFILE.target_weight_kg
  const currentTier = profile?.current_tier ?? DEFAULT_PROFILE.current_tier

  async function changeTier(direction) {
    const next = currentTier + direction
    if (next < 1 || next > 3) return
    const result = await updateTier(next)
    if (result?.error) {
      showToast(`Tier change failed: ${result.error}`, 'error')
      return
    }
    if (direction > 0) {
      showToast(`Advanced to Tier ${next}! 🎯`, 'success')
    } else {
      showToast(`Stepped back to Tier ${next}`, 'info')
    }
  }

  async function enableNotifications() {
    const { granted, reason } = await requestNotificationPermission()
    setPermission(granted ? 'granted' : reason ?? 'default')
    if (granted) {
      scheduleDailyReminders()
      showToast('Notifications enabled', 'success')
    } else if (reason === 'denied') {
      showToast('Notifications blocked. Enable in browser settings.', 'error')
    } else if (reason === 'not_supported') {
      showToast('Notifications not supported in this browser', 'error')
    }
  }

  function rescheduleReminders() {
    if (permission !== 'granted') {
      showToast('Enable notifications first', 'info')
      return
    }
    scheduleDailyReminders()
    showToast('Reminders rescheduled for today', 'success')
  }

  async function resetTodaysLog() {
    if (!window.confirm("Reset today's log? This cannot be undone.")) return
    const todayDate = format(new Date(), 'yyyy-MM-dd')
    const defaults = {
      wake_time: null,
      sleep_time: null,
      gym_done: false,
      gym_quality: null,
      sauna_done: false,
      skin_morning_done: false,
      skin_evening_done: false,
      hair_oil_done: false,
      b12_done: false,
      calcium_morning_done: false,
      calcium_evening_done: false,
      protein_shake_done: false,
      fruit_done: false,
      breakfast_done: false,
      lunch_done: false,
      dinner_done: false,
      water_glasses: 0,
      cold_outreach_done: false,
      job_applications_count: 0,
      work_prep_done: false,
      notes: null,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase
      .from('daily_logs')
      .update(defaults)
      .eq('log_date', todayDate)
    if (error) {
      showToast(`Reset failed: ${error.message}`, 'error')
      return
    }
    showToast("Today's log reset", 'success')
  }

  async function exportThisWeek() {
    const now = new Date()
    const start = subDays(now, 6)
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .gte('log_date', format(start, 'yyyy-MM-dd'))
      .lte('log_date', format(now, 'yyyy-MM-dd'))
      .order('log_date', { ascending: true })
    if (error) {
      showToast(`Export failed: ${error.message}`, 'error')
      return
    }
    const json = JSON.stringify(data ?? [], null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `habit-data-${format(now, 'yyyy-MM-dd')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast(`Exported ${data?.length ?? 0} day(s)`, 'success')
  }

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-semibold text-white mb-6">Profile</h1>

      <Section title="👤 Your Profile">
        <div className="space-y-1 text-sm">
          <Row label="Name" value={profile?.name ?? DEFAULT_PROFILE.name} />
          <Row label="Current weight" value={`${lastWeight}kg`} />
          <Row label="Target weight" value={`${targetWeight}kg`} />
          <Row label="Height" value={`${DEFAULT_PROFILE.height_cm}cm`} />
          <Row label="Diet" value="Vegetarian" />
          <Row
            label="Daily protein target"
            value={`${DEFAULT_PROFILE.daily_protein_target_g}g`}
          />
          <div className="flex justify-between items-center pt-2 mt-1 border-t border-[#2a2a2a]">
            <span className="text-gray-400">Tier</span>
            <span className="bg-[#22c55e] text-white text-xs px-3 py-1 rounded-full font-medium">
              Tier {currentTier}
            </span>
          </div>
        </div>
      </Section>

      <Section title="🎯 Tier System">
        <div className="space-y-3">
          {[1, 2, 3].map((t) => {
            const tier = TIERS[t]
            const active = t === currentTier
            return (
              <div
                key={t}
                className={`p-3 rounded-xl border ${
                  active
                    ? 'border-[#22c55e] bg-[#0f0f0f]'
                    : 'border-[#2a2a2a]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-semibold ${
                      active ? 'text-[#22c55e]' : 'text-white'
                    }`}
                  >
                    {tier.label}
                    {active && <span className="text-[10px] ml-2 text-[#22c55e]">Current</span>}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {tier.sublabel}
                  </span>
                </div>
                <ul className="text-xs text-gray-400 space-y-0.5">
                  <li>Gym: {tier.gym_label}</li>
                  <li>Job applications: {tier.applications}/day</li>
                  <li>Cold outreach: {tier.cold_outreach}/day</li>
                  {tier.streak_days ? (
                    <li>
                      Streak to advance: {tier.streak_days} days at 80%+
                    </li>
                  ) : (
                    <li>Target state, maintain consistency</li>
                  )}
                </ul>
              </div>
            )
          })}
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => changeTier(-1)}
            disabled={currentTier <= 1}
            className="flex-1 bg-[#2a2a2a] text-white text-xs py-2 rounded-lg disabled:opacity-40 active:scale-95 transition-transform"
          >
            Step Back Tier
          </button>
          <button
            type="button"
            onClick={() => changeTier(1)}
            disabled={currentTier >= 3}
            className="flex-1 bg-[#22c55e] text-white text-xs py-2 rounded-lg disabled:opacity-40 active:scale-95 transition-transform"
          >
            Advance Tier
          </button>
        </div>
      </Section>

      <Section title="🍽️ Meal Reference Chart">
        <p className="text-[11px] text-gray-500 mb-3">
          Reference only, not strict. Today highlighted.
        </p>
        <div
          ref={mealScrollRef}
          className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {DAYS_ORDER.map((day) => {
            const isToday = day === today
            const meals = MEAL_PLAN[day]
            const protein = PROTEIN_BY_DAY[day]
            return (
              <div
                key={day}
                ref={isToday ? todayCardRef : null}
                className={`shrink-0 w-56 rounded-xl p-3 border ${
                  isToday
                    ? 'border-[#22c55e] bg-[#0f0f0f]'
                    : 'border-[#2a2a2a]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-semibold ${
                      isToday ? 'text-[#22c55e]' : 'text-white'
                    }`}
                  >
                    {day}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    ~{protein}g protein
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="text-gray-500 text-[10px] uppercase tracking-wider">
                      Breakfast
                    </div>
                    <div className="text-gray-200">{meals.breakfast}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-[10px] uppercase tracking-wider">
                      Lunch
                    </div>
                    <div className="text-gray-200">{meals.lunch}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-[10px] uppercase tracking-wider">
                      Dinner
                    </div>
                    <div className="text-gray-200">{meals.dinner}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="💊 Supplement Guide">
        <ul className="space-y-3 text-xs">
          <SupItem
            name="B12 (500mcg x2)"
            detail="Morning, empty stomach, before 9AM"
          />
          <SupItem
            name="Calcium / Mag / Zinc / D3"
            detail="With lunch and with dinner. Space 6 hours apart."
          />
          <SupItem name="Protein shake" detail="Post gym only" />
          <SupItem
            name="Creatine"
            detail="3 to 5g daily, any time, with water"
          />
          <SupItem name="Fruit" detail="Once daily, any time" />
        </ul>
      </Section>

      <Section title="🧴 Skincare Guide">
        <div className="space-y-3 text-xs">
          <div>
            <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">
              Morning
            </div>
            <div className="text-gray-200">
              Cleanser, Niacinamide + Zinc, Moisturizer (Cetaphil), SPF 50 (LA Shield)
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">
              Evening
            </div>
            <div className="text-gray-200">
              Cleanser, Retinol (start 2-3x/week), Moisturizer
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">
              Hair
            </div>
            <div className="text-gray-200">
              Coconut or castor oil Thursday night, wash Friday morning
            </div>
          </div>
        </div>
      </Section>

      <Section title="🔔 Notification Settings">
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Permission status</span>
            <span className="text-white">
              {permission === 'granted' && 'Granted ✅'}
              {permission === 'denied' && 'Denied ❌'}
              {permission === 'default' && 'Not asked yet'}
              {permission === 'unsupported' && 'Not supported'}
              {permission === 'not_supported' && 'Not supported'}
            </span>
          </div>
          {permission !== 'granted' && (
            <button
              type="button"
              onClick={enableNotifications}
              disabled={
                permission === 'denied' ||
                permission === 'unsupported' ||
                permission === 'not_supported'
              }
              className="w-full bg-[#22c55e] text-white py-2 rounded-lg font-medium disabled:opacity-40 active:scale-95 transition-transform"
            >
              Enable notifications
            </button>
          )}
          <button
            type="button"
            onClick={rescheduleReminders}
            className="w-full bg-[#2a2a2a] text-white py-2 rounded-lg active:scale-95 transition-transform"
          >
            Reschedule today's reminders
          </button>
          <p className="text-[10px] text-gray-500">
            Reminders auto-schedule when you open the app.
          </p>
        </div>
      </Section>

      <Section title="⚙️ App Settings">
        <div className="space-y-2 text-xs">
          <button
            type="button"
            onClick={resetTodaysLog}
            className="w-full bg-red-600 text-white py-2 rounded-lg active:scale-95 transition-transform"
          >
            Reset today's log
          </button>
          <button
            type="button"
            onClick={exportThisWeek}
            className="w-full bg-[#2a2a2a] text-white py-2 rounded-lg active:scale-95 transition-transform"
          >
            Export this week's data as JSON
          </button>
          <div className="flex justify-between pt-3 mt-3 border-t border-[#2a2a2a] text-[11px] text-gray-500">
            <span>App version</span>
            <span>v1.0.0</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-gray-500">GitHub</span>
            <a
              href="https://github.com/Meetjain-0201/habit-tracker"
              target="_blank"
              rel="noreferrer"
              className="text-[#22c55e]"
            >
              Meetjain-0201/habit-tracker
            </a>
          </div>
        </div>
      </Section>
    </div>
  )
}
