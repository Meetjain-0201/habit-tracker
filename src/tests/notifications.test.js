import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  scheduleNotificationToday,
  sendNotification,
  requestNotificationPermission,
} from '../utils/notifications'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('scheduleNotificationToday', () => {
  it('returns null for past times', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-09T15:00:00'))
    const result = scheduleNotificationToday(8, 0, 'morning', 'body')
    expect(result).toBeNull()
  })

  it('returns a timer id for future times', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-09T08:00:00'))
    const result = scheduleNotificationToday(20, 0, 'evening', 'body')
    expect(result).not.toBeNull()
  })
})

describe('sendNotification', () => {
  it('does nothing when permission is not granted', () => {
    vi.stubGlobal('Notification', { permission: 'default' })
    expect(() => sendNotification('test', 'body')).not.toThrow()
  })

  it('does nothing when Notification is undefined', () => {
    const had = 'Notification' in globalThis
    const original = globalThis.Notification
    delete globalThis.Notification
    try {
      expect(() => sendNotification('test', 'body')).not.toThrow()
    } finally {
      if (had) globalThis.Notification = original
    }
  })
})

describe('requestNotificationPermission', () => {
  it('returns not_supported when Notification is undefined', async () => {
    const had = 'Notification' in globalThis
    const original = globalThis.Notification
    delete globalThis.Notification
    try {
      const result = await requestNotificationPermission()
      expect(result).toEqual({ granted: false, reason: 'not_supported' })
    } finally {
      if (had) globalThis.Notification = original
    }
  })

  it('returns granted when permission is already granted', async () => {
    vi.stubGlobal('Notification', { permission: 'granted' })
    const result = await requestNotificationPermission()
    expect(result).toEqual({ granted: true })
  })
})
