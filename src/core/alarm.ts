import { SESSION_EXPIRATION_TIME_IN_MINUTES } from './login-status'

const REFRESH_SESSION_PERIOD_IN_MINUTES = SESSION_EXPIRATION_TIME_IN_MINUTES - 1

export const REFRESH_SESSION_ALARM_NAME = 'refreshSession'

export function recreateRefreshSessionAlarm(): void {
  chrome.alarms.create(REFRESH_SESSION_ALARM_NAME, {
    periodInMinutes: REFRESH_SESSION_PERIOD_IN_MINUTES,
  })
}
