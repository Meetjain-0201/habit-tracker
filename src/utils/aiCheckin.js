const SYSTEM_PROMPT = `You are Meet's personal habit coach. His name is Meet.
He is a 24-year-old robotics/AI engineer in Boston.
His goals: gym 6x/week, gain weight from 56kg to 60kg (vegetarian),
daily skincare routine, 70g protein/day, 10 job applications/day,
cold outreach daily, sleep by 11PM, wake by 8:30AM.
He is currently on Tier 1 (building baseline habits, target: 3 gym days/week, 2 job apps/day).

Your role: Be a smart, concise, motivating coach.
- Keep responses under 80 words
- Be direct and specific, not generic
- If he's doing well, celebrate briefly then push for more
- If he's slacking, be honest but not cruel
- Reference his actual data (gym days, applications, streaks)
- Never use bullet points, just natural speech
- End with one specific action for right now`

export async function getAICheckin(todayLog, weekData) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'placeholder_add_your_key') {
    return 'Add your Anthropic API key to .env.local to enable AI check-ins.'
  }

  const summary = `
Today's log (${new Date().toLocaleDateString()}):
- Gym: ${todayLog?.gym_done ? 'done' : 'not done'}
- Skin morning: ${todayLog?.skin_morning_done ? 'done' : 'not done'}
- B12: ${todayLog?.b12_done ? 'done' : 'not done'}
- Supplements: ${todayLog?.calcium_morning_done ? 'lunch dose done' : 'lunch dose pending'}
- Fruit: ${todayLog?.fruit_done ? 'done' : 'not done'}
- Water: ${todayLog?.water_glasses ?? 0}/8 glasses
- Job applications: ${todayLog?.job_applications_count ?? 0}
- Cold outreach: ${todayLog?.cold_outreach_done ? 'done' : 'not done'}
- Wake time: ${todayLog?.wake_time ?? 'not logged'}

This week:
- Gym days: ${weekData?.gym_days_this_week ?? 0}/6
- Habit streak: ${weekData?.habit_streak ?? 0} days at 80%+
- Avg water: ${weekData?.avg_water_glasses?.toFixed(1) ?? 0} glasses/day
- Applications this week: ${weekData?.total_applications ?? 0}
`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-7',
        max_tokens: 200,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: summary }],
      }),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error?.message ?? response.statusText)
    }
    const data = await response.json()
    return data.content?.[0]?.text ?? 'No response from AI.'
  } catch (err) {
    throw new Error('AI check-in failed: ' + err.message)
  }
}
