import { waitUntilTabsLoaded } from '../../utils/wait-until-tabs-loaded'
import { recreateRefreshSessionAlarm } from '../alarm'
import {
  INFRA_URL_PATTERN,
  LEARNUS_URL_PATTERN,
  PORTAL_URL_PATTERN,
} from '../constants'
import { getLoginData } from './login-data-repository'
import loginLearnUs from './login-learnus'
import loginPortal from './login-portal'
import {
  setIsSessionRefreshing,
  setLastSessionRefreshedTime,
} from './login-status-repository'
import updateLearnUsSesskey from './update-learnus-sesskey'

let isRefreshing = false

export async function refreshSession(): Promise<void> {
  if (isRefreshing) return

  isRefreshing = true
  await setIsSessionRefreshing(true)

  const loginData = await getLoginData()
  if (!loginData) {
    await setIsSessionRefreshing(false)
    isRefreshing = false
    return
  }

  let tryCount = 1
  const MAX_TRIES = 3

  while (tryCount <= MAX_TRIES && isRefreshing) {
    try {
      await waitUntilTabsLoaded({
        url: [LEARNUS_URL_PATTERN, PORTAL_URL_PATTERN, INFRA_URL_PATTERN],
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

  await setIsSessionRefreshing(false)
  isRefreshing = false
}

export async function onSessionRefreshed() {
  await setLastSessionRefreshedTime()
  recreateRefreshSessionAlarm()
}

export async function cancelRefreshingSession() {
  await setIsSessionRefreshing(false)
  isRefreshing = false
}
