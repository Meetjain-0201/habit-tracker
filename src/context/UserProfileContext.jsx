import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { USER_PROFILE as DEFAULT_PROFILE } from '../data/habits'

const UserProfileContext = createContext({
  profile: DEFAULT_PROFILE,
  loading: true,
  error: null,
  updateTier: async () => ({ error: 'no provider' }),
})

export function UserProfileProvider({ children }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [profileId, setProfileId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const { data, error: fetchErr } = await supabase
        .from('user_profile')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (cancelled) return

      if (fetchErr) {
        setError(fetchErr)
        setLoading(false)
        return
      }

      if (data) {
        setProfileId(data.id)
        setProfile({
          ...DEFAULT_PROFILE,
          ...data,
          name: data.name ?? DEFAULT_PROFILE.name,
        })
        setLoading(false)
        return
      }

      const { data: inserted, error: insertErr } = await supabase
        .from('user_profile')
        .insert({
          name: DEFAULT_PROFILE.name,
          weight_kg: DEFAULT_PROFILE.weight_kg,
          target_weight_kg: DEFAULT_PROFILE.target_weight_kg,
          current_tier: DEFAULT_PROFILE.current_tier,
        })
        .select()
        .single()

      if (cancelled) return

      if (insertErr) {
        setError(insertErr)
      } else if (inserted) {
        setProfileId(inserted.id)
        setProfile({ ...DEFAULT_PROFILE, ...inserted })
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const updateTier = useCallback(
    async (newTier) => {
      if (!profileId) return { error: 'profile not loaded' }
      const previous = profile
      setProfile({ ...profile, current_tier: newTier })
      const { error: updateErr } = await supabase
        .from('user_profile')
        .update({ current_tier: newTier })
        .eq('id', profileId)
      if (updateErr) {
        setProfile(previous)
        return { error: updateErr.message }
      }
      return { ok: true }
    },
    [profile, profileId]
  )

  return (
    <UserProfileContext.Provider value={{ profile, loading, error, updateTier }}>
      {children}
    </UserProfileContext.Provider>
  )
}

export function useUserProfile() {
  return useContext(UserProfileContext)
}
