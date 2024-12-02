import { waitUntilTabsLoaded } from '../../utils/wait-until-tabs-loaded'
import { recreateRefreshSessionAlarm } from '../alarm'
import { LEARNUS_URL_PATTERN, YONSEI_URL_PATTERN } from '../constants'
import { loadLoginData } from './login-data'
import loginLearnUs from './login-learnus'
import loginPortal from './login-portal'
import {
  saveLastSessionRefreshedTime,
  saveIsSessionRefreshing,
} from './login-status'
import updateLearnUsSesskey from './update-learnus-sesskey'

let isRefreshing = false

export async function refreshSession(): Promise<void> {
  if (isRefreshing) return

  isRefreshing = true
  await saveIsSessionRefreshing(true)

  const loginData = await loadLoginData()
  if (!loginData) {
    await saveIsSessionRefreshing(false)
    isRefreshing = false
    return
  }

  let tryCount = 1
  const MAX_TRIES = 3

  while (tryCount <= MAX_TRIES) {
    try {
      await waitUntilTabsLoaded({
        url: [LEARNUS_URL_PATTERN, YONSEI_URL_PATTERN],
      })

      await loginLearnUs(loginData.id, loginData.password)
      updateLearnUsSesskey()
      await loginPortal()

      await onSessionRefreshed()

      break
    } catch (e) {
      console.log(
        `[${new Date().toISOString()}] Failed to refresh session (attempt ${tryCount}/${MAX_TRIES}):`,
        e
      )

      if (tryCount === MAX_TRIES) {
        console.log(
          `[${new Date().toISOString()}] Max tries reached, giving up.`
        )
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      tryCount++
    }
  }

  await saveIsSessionRefreshing(false)
  isRefreshing = false
}

export async function onSessionRefreshed() {
  await saveLastSessionRefreshedTime()
  recreateRefreshSessionAlarm()
}
