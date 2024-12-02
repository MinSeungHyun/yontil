import { SESSION_EXPIRATION_TIME_IN_MINUTES } from './login/login-status'

const REFRESH_SESSION_PERIOD_IN_MINUTES = SESSION_EXPIRATION_TIME_IN_MINUTES - 1

export const REFRESH_SESSION_ALARM_NAME = 'refreshSession'

export async function recreateRefreshSessionAlarm(): Promise<void> {
  await chrome.alarms.create(REFRESH_SESSION_ALARM_NAME, {
    periodInMinutes: REFRESH_SESSION_PERIOD_IN_MINUTES,
  })
}

export async function getIsRefreshSessionAlarmExists(): Promise<boolean> {
  return Boolean(await chrome.alarms.get(REFRESH_SESSION_ALARM_NAME))
}
