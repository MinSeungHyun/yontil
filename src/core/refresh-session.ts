import { waitUntilTabsLoaded } from '../utils/wait-until-tabs-loaded'
import { recreateRefreshSessionAlarm } from './alarm'
import { LEARNUS_URL_PATTERN, YONSEI_URL_PATTERN } from './constants'
import { loadLoginData } from './login-data'
import loginLearnUs from './login-learnus'
import loginPortal from './login-portal'
import { saveLastRefreshedTime, saveIsRefreshing } from './login-status'
import updateLearnUsSesskey from './update-learnus-sesskey'

let isRefreshing = false

export async function refreshSession(): Promise<void> {
  if (isRefreshing) return
  isRefreshing = true

  try {
    const loginData = await loadLoginData()
    if (!loginData) return

    await saveIsRefreshing(true)

    await waitUntilTabsLoaded({
      url: [LEARNUS_URL_PATTERN, YONSEI_URL_PATTERN],
    })

    await loginLearnUs(loginData.id, loginData.password)
    updateLearnUsSesskey()
    await loginPortal()

    await saveLastRefreshedTime()
    recreateRefreshSessionAlarm()
  } catch (e) {
    console.log(`[${new Date().toISOString()}] Failed to refresh session:`, e)
  } finally {
    await saveIsRefreshing(false)

    isRefreshing = false
  }
}
