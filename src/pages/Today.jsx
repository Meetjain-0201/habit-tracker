import { format, isThursday } from 'date-fns'
import { useDailyLog } from '../hooks/useDailyLog'
import { USER_PROFILE, HABITS } from '../data/habits'
import HabitRow from '../components/HabitRow'

const BOOLEAN_FIELDS = [
  'gym_done',
  'sauna_done',
  'skin_morning_done',
  'skin_evening_done',
  'hair_oil_done',
  'b12_done',
  'calcium_morning_done',
  'calcium_evening_done',
  'protein_shake_done',
  'fruit_done',
  'breakfast_done',
  'lunch_done',
  'dinner_done',
  'cold_outreach_done',
  'work_prep_done',
]

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
  const { log, loading, error, updateLog } = useDailyLog()
  const today = new Date()
  const dateStr = format(today, 'EEEE, MMMM d')
  const greeting = getGreeting()
  const isThurs = isThursday(today)

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

  const tierKey = `tier${USER_PROFILE.current_tier}`
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

  return (
    <div className="px-4 pt-6">
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
          subtext={!log.skin_evening_done ? 'Cleanser, Retinol, Moisturizer' : null}
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
              Tier {USER_PROFILE.current_tier}: aim for {jobTarget} today
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
