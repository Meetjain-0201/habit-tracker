import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { useWeeklyData } from '../hooks/useWeeklyData'
import { useWeightLog } from '../hooks/useWeightLog'
import { useUserProfile } from '../hooks/useUserProfile'
import { USER_PROFILE, HABITS } from '../data/habits'

const STATUS_BADGE = {
  great: { text: 'Great 🔥', className: 'bg-[#22c55e] text-white' },
  acceptable: { text: 'On Track 👍', className: 'bg-yellow-600 text-white' },
  bad: { text: 'Pick it up ⚠️', className: 'bg-red-600 text-white' },
}

const APP_WEEKLY_TARGET = { 1: 14, 2: 35, 3: 70 }
const TIER_STREAK_TARGET = { 1: 7, 2: 14 }

function Section({ title, children }) {
  return (
    <section className="bg-[#1a1a1a] rounded-2xl p-4 mb-4">
      <h2 className="text-base font-semibold text-white mb-3">{title}</h2>
      {children}
    </section>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div
        className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin"
        aria-label="Loading"
      />
    </div>
  )
}

export default function Progress() {
  const { weekData, loading, error } = useWeeklyData()
  const { weights, addWeight, error: weightErr } = useWeightLog()
  const { profile } = useUserProfile()
  const [draftKg, setDraftKg] = useState(USER_PROFILE.weight_kg)

  useEffect(() => {
    if (weights.length > 0) {
      setDraftKg(Number(weights[weights.length - 1].weight_kg))
    }
  }, [weights])

  if (loading) return <Spinner />
  if (error) {
    return (
      <div className="p-4 text-red-400 text-sm">
        Error loading week: {error.message ?? String(error)}
      </div>
    )
  }
  if (!weekData) return null

  const status = STATUS_BADGE[weekData.gym_status]
  const currentTier = profile?.current_tier ?? USER_PROFILE.current_tier
  const weeklyAppTarget = APP_WEEKLY_TARGET[currentTier] ?? APP_WEEKLY_TARGET[1]
  const appProgress = Math.min(
    100,
    weeklyAppTarget === 0 ? 0 : (weekData.total_applications / weeklyAppTarget) * 100
  )

  const lastWeight =
    weights.length > 0
      ? Number(weights[weights.length - 1].weight_kg)
      : USER_PROFILE.weight_kg
  const startWeight =
    weights.length > 0 ? Number(weights[0].weight_kg) : USER_PROFILE.weight_kg
  const targetWeight = USER_PROFILE.target_weight_kg
  const weightDenom = targetWeight - startWeight
  const weightPct =
    weightDenom === 0
      ? 100
      : Math.max(
          0,
          Math.min(100, ((lastWeight - startWeight) / weightDenom) * 100)
        )

  const tierTarget = TIER_STREAK_TARGET[currentTier]
  const tierStreakPct = tierTarget
    ? Math.min(100, (weekData.habit_streak / tierTarget) * 100)
    : 100

  return (
    <div className="px-4 pt-6 animate-fadeIn">
      <h1 className="text-2xl font-semibold text-white mb-6">Progress</h1>

      <Section title="📅 This Week">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-sm text-white">Gym</div>
            <div className="text-xs text-gray-400">
              {weekData.gym_days_this_week} / {HABITS.GYM.target} days
            </div>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full ${status.className}`}>
            {status.text}
          </span>
        </div>

        <div className="flex justify-between gap-2 mb-4">
          {weekData.completion_by_day.map((d) => (
            <div key={d.date} className="flex flex-col items-center gap-1 flex-1">
              <span
                className={`w-4 h-4 rounded-full ${
                  d.gym_done ? 'bg-[#22c55e]' : 'bg-[#3a3a3a]'
                }`}
                aria-label={`${d.day_label} ${d.gym_done ? 'gym done' : 'no gym'}`}
              />
              <span className="text-[10px] text-gray-500">{d.day_label[0]}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#2a2a2a]">
          <div>
            <div className="text-[11px] text-gray-500">Skin morning</div>
            <div className="text-sm text-white">
              {weekData.skin_morning_streak} day streak
            </div>
          </div>
          <div>
            <div className="text-[11px] text-gray-500">Water</div>
            <div className="text-sm text-white">
              avg {weekData.avg_water_glasses.toFixed(1)} glasses/day
            </div>
          </div>
        </div>
      </Section>

      <Section title="💼 Applications This Week">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">Total applications</span>
          <span className="text-white font-semibold">
            {weekData.total_applications}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-gray-400">Cold outreach days</span>
          <span className="text-white font-semibold">
            {weekData.total_outreach}/7
          </span>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Tier {currentTier} weekly target</span>
            <span>
              {weekData.total_applications} / {weeklyAppTarget}
            </span>
          </div>
          <div className="h-2 bg-[#0f0f0f] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#22c55e] transition-all duration-300"
              style={{ width: `${appProgress}%` }}
            />
          </div>
        </div>
      </Section>

      <Section title="📈 Habit Completion (Last 7 Days)">
        <div className="h-32 flex items-end gap-2">
          {weekData.completion_by_day.map((d) => (
            <div
              key={d.date}
              className="flex-1 flex flex-col items-center justify-end h-full"
            >
              <span className="text-[10px] text-gray-400 mb-1">
                {Math.round(d.pct)}%
              </span>
              <div
                className="w-full bg-[#22c55e] rounded-t-md transition-all duration-300"
                style={{
                  height: `${d.pct}%`,
                  minHeight: d.pct > 0 ? '2px' : '0',
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          {weekData.completion_by_day.map((d) => (
            <div
              key={`${d.date}_l`}
              className="flex-1 text-center text-[10px] text-gray-500"
            >
              {d.day_label}
            </div>
          ))}
        </div>
      </Section>

      <Section title="⚖️ Weight Tracker">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-3xl font-semibold text-white leading-none">
              {lastWeight}
              <span className="text-base text-gray-400 ml-1">kg</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              target {targetWeight}kg
            </div>
          </div>
          <div className="text-xs text-gray-400 text-right">
            {weights.length === 0
              ? 'no entries yet'
              : lastWeight >= targetWeight
                ? 'target reached'
                : `${(targetWeight - lastWeight).toFixed(1)}kg to go`}
          </div>
        </div>

        <div className="mb-4">
          <div className="h-2 bg-[#0f0f0f] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#22c55e] transition-all duration-300"
              style={{ width: `${weightPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>{startWeight}kg</span>
            <span>{Math.round(weightPct)}%</span>
            <span>{targetWeight}kg</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => setDraftKg((k) => +(k - 0.5).toFixed(1))}
            className="w-9 h-9 rounded-full bg-[#2a2a2a] text-white text-lg leading-none active:scale-95 transition-transform"
            aria-label="Decrease weight"
          >
            -
          </button>
          <span className="text-xl font-semibold text-white w-24 text-center">
            {draftKg.toFixed(1)} kg
          </span>
          <button
            type="button"
            onClick={() => setDraftKg((k) => +(k + 0.5).toFixed(1))}
            className="w-9 h-9 rounded-full bg-[#2a2a2a] text-white text-lg leading-none active:scale-95 transition-transform"
            aria-label="Increase weight"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => addWeight(draftKg)}
            className="ml-auto bg-[#22c55e] text-white px-3 py-2 rounded-lg text-sm font-medium active:scale-95 transition-transform"
          >
            Log Weight
          </button>
        </div>

        {weightErr && (
          <div className="text-xs text-red-400 mb-2">
            Could not save: {weightErr.message ?? String(weightErr)}
          </div>
        )}

        {weights.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-2">Recent</div>
            <div className="space-y-1">
              {weights
                .slice(-5)
                .reverse()
                .map((w) => (
                  <div
                    key={w.id}
                    className="flex justify-between text-xs py-1 border-b border-[#2a2a2a] last:border-b-0"
                  >
                    <span className="text-gray-400">
                      {format(parseISO(w.log_date), 'MMM d')}
                    </span>
                    <span className="text-white">{Number(w.weight_kg)} kg</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Section>

      <Section title="🏆 Tier Progress">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-400">Current tier</div>
          <div className="text-lg font-semibold text-white">Tier {currentTier}</div>
        </div>

        {tierTarget ? (
          <>
            <div className="text-xs text-gray-400 mb-3">
              Tier {currentTier} to {currentTier + 1}: hit 80% completion for{' '}
              {tierTarget} consecutive days
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Current streak</span>
              <span>
                {weekData.habit_streak} / {tierTarget} days
              </span>
            </div>
            <div className="h-2 bg-[#0f0f0f] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#22c55e] transition-all duration-300"
                style={{ width: `${tierStreakPct}%` }}
              />
            </div>
          </>
        ) : (
          <div className="text-sm text-[#22c55e]">Maxed out at Tier 3 🏆</div>
        )}
      </Section>
    </div>
  )
}
