import { waitUntilTabsLoaded } from '../utils/wait-until-tabs-loaded'
import { LEARNUS_URL_PATTERN, YONSEI_URL_PATTERN } from './constants'
import { loadLoginData } from './login-data'
import loginLearnUs from './login-learnus'
import loginPortal from './login-portal'
import { saveLastRefreshedTime, saveIsRefreshing } from './login-status'
import updateLearnUsSesskey from './update-learnus-sesskey'

export async function refreshSession(): Promise<void> {
  const loginData = await loadLoginData()

  if (loginData) {
    await saveIsRefreshing(true)

    await waitUntilTabsLoaded({
      url: [LEARNUS_URL_PATTERN, YONSEI_URL_PATTERN],
    })

    try {
      await loginLearnUs(loginData.id, loginData.password)
      updateLearnUsSesskey()
      await loginPortal()

      await saveLastRefreshedTime()
    } catch (e) {
      console.log(`[${new Date().toISOString()}] Failed to refresh session:`, e)
    } finally {
      await saveIsRefreshing(false)
    }
  }
}
