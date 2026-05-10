import { useEffect, useRef, useState } from 'react'
import { format, isThursday } from 'date-fns'
import { useDailyLog } from '../hooks/useDailyLog'
import { useWeeklyData } from '../hooks/useWeeklyData'
import { useUserProfile } from '../hooks/useUserProfile'
import { USER_PROFILE, HABITS } from '../data/habits'
import { BOOLEAN_FIELDS } from '../utils/weeklyStats'
import HabitRow from '../components/HabitRow'
import AICheckin from '../components/AICheckin'
import { requestNotificationPermission, scheduleDailyReminders } from '../utils/notifications'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function Section({ title, children }) {
  return (
    <section className="bg-[#1a1a1a] rounded-2xl p-4 mb-4">
      <h2 className="text-base font-semibold text-white mb-1">{title}</h2>
      <div className="divide-y divide-[#2a2a2a]">{children}</div>
    </section>
  )
}

export default function Today() {
  const { log, loading, error, updateLog, refetch } = useDailyLog()
  const { weekData } = useWeeklyData()
  const { profile } = useUserProfile()
  const today = new Date()
  const dateStr = format(today, 'EEEE, MMMM d')
  const greeting = getGreeting()
  const isThurs = isThursday(today)

  const [pulling, setPulling] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const refreshingRef = useRef(false)
  const touchState = useRef({ startY: 0, active: false, currentPull: 0 })

  useEffect(() => {
    let cancelled = false
    requestNotificationPermission().then(({ granted }) => {
      if (!cancelled && granted) scheduleDailyReminders()
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    refreshingRef.current = refreshing
  }, [refreshing])

  useEffect(() => {
    function onStart(e) {
      if (window.scrollY > 0 || refreshingRef.current) return
      touchState.current = {
        startY: e.touches[0].clientY,
        active: true,
        currentPull: 0,
      }
    }
    function onMove(e) {
      if (!touchState.current.active) return
      if (window.scrollY > 0) {
        touchState.current.active = false
        setPulling(0)
        return
      }
      const delta = e.touches[0].clientY - touchState.current.startY
      if (delta > 0) {
        const clamped = Math.min(delta, 120)
        touchState.current.currentPull = clamped
        setPulling(clamped)
      }
    }
    async function onEnd() {
      if (!touchState.current.active) return
      const finalPull = touchState.current.currentPull
      touchState.current.active = false
      setPulling(0)
      if (finalPull >= 80) {
        setRefreshing(true)
        try {
          await refetch?.()
        } finally {
          setRefreshing(false)
        }
      }
    }

    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
  }, [refetch])

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[60vh]">
        <div
          className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin"
          aria-label="Loading"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-400 text-sm">
        Error loading today's log: {error.message ?? String(error)}
      </div>
    )
  }

  if (!log) return null

  const doneCount = BOOLEAN_FIELDS.filter((f) => log[f]).length
  const totalCount = BOOLEAN_FIELDS.length
  const pct = totalCount === 0 ? 0 : (doneCount / totalCount) * 100

  const currentTier = profile?.current_tier ?? USER_PROFILE.current_tier
  const tierKey = `tier${currentTier}`
  const jobTarget = HABITS.JOB_APPLICATIONS[tierKey]
  const waterGlasses = log.water_glasses ?? 0
  const jobCount = log.job_applications_count ?? 0
  const gymQuality = log.gym_quality ?? 0

  function toggle(field) {
    updateLog(field, !log[field])
  }

  function tapGlass(index) {
    const next = waterGlasses === index ? index - 1 : index
    updateLog('water_glasses', next)
  }

  function bumpJobs(delta) {
    const next = Math.max(0, jobCount + delta)
    updateLog('job_applications_count', next)
  }

  function logWakeNow() {
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    updateLog('wake_time', `${hh}:${mm}:00`)
  }

  const showEmptyState = doneCount === 0
  const pullProgress = Math.min(pulling / 80, 1)

  return (
    <div className="px-4 pt-6 animate-fadeIn">
      {(pulling > 0 || refreshing) && (
        <div
          className="fixed left-1/2 z-40 pointer-events-none"
          style={{
            top: '0.5rem',
            transform: `translateX(-50%) translateY(${refreshing ? 8 : Math.min(pulling - 24, 16)}px)`,
            opacity: refreshing ? 1 : pullProgress,
          }}
        >
          <div
            className={`w-6 h-6 border-2 border-[#22c55e] border-t-transparent rounded-full ${
              refreshing ? 'animate-spin' : ''
            }`}
            style={!refreshing ? { transform: `rotate(${pulling * 3}deg)` } : undefined}
          />
        </div>
      )}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-white">
          {greeting}, {USER_PROFILE.name} 👋
        </h1>
        <p className="text-sm text-gray-400 mt-1">{dateStr}</p>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>{doneCount} / {totalCount} habits</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#22c55e] transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </header>

      {showEmptyState && (
        <div className="bg-[#0f0f0f] border border-[#22c55e] rounded-2xl p-4 mb-4 text-center">
          <p className="text-sm text-white">
            Fresh day, {USER_PROFILE.name}. Let's make it count 💪
          </p>
        </div>
      )}

      <AICheckin log={log} weekData={weekData} />

      <Section title="💊 Supplements">
        <HabitRow
          label="B12 (500mcg)"
          subtext="Take before breakfast, empty stomach"
          done={log.b12_done}
          onToggle={() => toggle('b12_done')}
        />
        <HabitRow
          label="Calcium / Mag / Zinc / D3"
          subtext="With lunch"
          done={log.calcium_morning_done}
          onToggle={() => toggle('calcium_morning_done')}
        />
        <HabitRow
          label="Calcium / Mag / Zinc / D3"
          subtext="With dinner"
          done={log.calcium_evening_done}
          onToggle={() => toggle('calcium_evening_done')}
        />
      </Section>

      <Section title="🧴 Skin">
        <HabitRow
          label="Morning routine"
          subtext={!log.skin_morning_done ? 'Cleanser, Niacinamide, Moisturizer, SPF' : null}
          done={log.skin_morning_done}
          onToggle={() => toggle('skin_morning_done')}
        />
        <HabitRow
          label="Evening routine"
          subtext={!log.skin_evening_done ? 'Cleanser, Moisturizer (Adapalene once a week)' : null}
          done={log.skin_evening_done}
          onToggle={() => toggle('skin_evening_done')}
        />
      </Section>

      <Section title="💪 Gym">
        <HabitRow
          label="Gym done today?"
          done={log.gym_done}
          onToggle={() => toggle('gym_done')}
        />
        <HabitRow
          label="Sauna"
          done={log.sauna_done}
          onToggle={() => toggle('sauna_done')}
        />
        {log.gym_done && (
          <>
            <HabitRow
              label="Protein shake"
              subtext="Post workout"
              done={log.protein_shake_done}
              onToggle={() => toggle('protein_shake_done')}
            />
            <div className="py-3">
              <div className="text-sm text-white mb-2">Workout quality</div>
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() =>
                      updateLog('gym_quality', gymQuality === n ? null : n)
                    }
                    className={`w-7 h-7 rounded-full text-xs flex items-center justify-center transition-colors ${
                      n <= gymQuality
                        ? 'bg-[#22c55e] text-white'
                        : 'bg-[#2a2a2a] text-gray-400'
                    }`}
                    aria-label={`Quality ${n}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </Section>

      <Section title="🥗 Nutrition">
        <HabitRow
          label="Fruit"
          done={log.fruit_done}
          onToggle={() => toggle('fruit_done')}
        />
        <HabitRow
          label="Breakfast"
          subtext="optional"
          done={log.breakfast_done}
          onToggle={() => toggle('breakfast_done')}
        />
        <HabitRow
          label="Lunch"
          done={log.lunch_done}
          onToggle={() => toggle('lunch_done')}
        />
        <HabitRow
          label="Dinner"
          done={log.dinner_done}
          onToggle={() => toggle('dinner_done')}
        />
        <div className="py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white">Water</span>
            <span className="text-xs text-gray-400">
              {waterGlasses} / 8 glasses
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => tapGlass(n)}
                className={`text-2xl transition-opacity ${
                  n <= waterGlasses ? 'opacity-100' : 'opacity-30'
                }`}
                aria-label={`Glass ${n}`}
              >
                🥤
              </button>
            ))}
          </div>
        </div>
      </Section>

      {isThurs && (
        <Section title="💆 Hair">
          <HabitRow
            label="Oil hair tonight?"
            done={log.hair_oil_done}
            onToggle={() => toggle('hair_oil_done')}
          />
        </Section>
      )}

      <Section title="💼 Applications">
        <HabitRow
          label="Cold outreach"
          done={log.cold_outreach_done}
          onToggle={() => toggle('cold_outreach_done')}
        />
        <div className="py-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-white">Job applications</span>
            <span className="text-xs text-gray-400">
              Tier {currentTier}: aim for {jobTarget} today
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => bumpJobs(-1)}
              className="w-9 h-9 rounded-full bg-[#2a2a2a] text-white text-lg leading-none active:scale-95 transition-transform"
              aria-label="Decrease applications"
            >
              -
            </button>
            <span className="text-2xl font-semibold text-white w-12 text-center">
              {jobCount}
            </span>
            <button
              type="button"
              onClick={() => bumpJobs(1)}
              className="w-9 h-9 rounded-full bg-[#22c55e] text-white text-lg leading-none active:scale-95 transition-transform"
              aria-label="Increase applications"
            >
              +
            </button>
          </div>
        </div>
      </Section>

      <Section title="😴 Sleep">
        <div className="py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white">Wake time</span>
            <span className="text-xs text-gray-400">
              target {HABITS.SLEEP.target_wake}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="time"
              value={log.wake_time ? log.wake_time.slice(0, 5) : ''}
              onChange={(e) =>
                updateLog(
                  'wake_time',
                  e.target.value ? `${e.target.value}:00` : null
                )
              }
              className="bg-[#2a2a2a] text-white px-3 py-2 rounded-lg flex-1 text-sm"
            />
            <button
              type="button"
              onClick={logWakeNow}
              className="bg-[#22c55e] text-white px-3 py-2 rounded-lg text-sm font-medium active:scale-95 transition-transform"
            >
              Log now
            </button>
          </div>
        </div>
      </Section>
    </div>
  )
}
