export const BOOLEAN_FIELDS = [
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

export function gymStatus(gymDays) {
  if (gymDays >= 4) return 'great'
  if (gymDays >= 2) return 'acceptable'
  return 'bad'
}

export function avgWater(values) {
  if (!values || values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

export function rowCompletionPct(row, fields = BOOLEAN_FIELDS) {
  if (!row) return 0
  const done = fields.filter((f) => row[f]).length
  return (done / fields.length) * 100
}
