import {
  getIsRefreshSessionAlarmExists,
  recreateRefreshSessionAlarm,
  REFRESH_SESSION_ALARM_NAME,
} from '../core/alarm'
import {
  INFRA_URL_PATTERN,
  LEARNUS_URL_PATTERN,
  PORTAL_URL_PATTERN,
} from '../core/constants'
import {
  removeLastSessionRefreshedTime,
  getShowRefreshingOverlay,
} from '../core/login/login-status'
import { startListeningNetworkStatus } from '../core/network-status'
import { refreshSession } from '../core/login/refresh-session'
import { sendMessageToTabs, TabMessage } from '../utils/tab-message'
import { migrateLocalStorageKey } from '../utils/migrate-storage-key'

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    await migrateLocalStorageKey(
      'lastRefreshedTime',
      'lastSessionRefreshedTime'
    )
    await migrateLocalStorageKey('isRefreshing', 'isSessionRefreshing')
  }

  const isAlarmExists = await getIsRefreshSessionAlarmExists()
  if (!isAlarmExists) {
    await recreateRefreshSessionAlarm()
  }
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  switch (alarm.name) {
    case REFRESH_SESSION_ALARM_NAME:
      await refreshSession()
      break
  }
})

chrome.windows.onCreated.addListener(
  async () => {
    const allWindows = await chrome.windows.getAll({ windowTypes: ['normal'] })
    const isFirstWindow =
      allWindows.filter((window) => !window.incognito).length <= 1

    if (isFirstWindow) {
      await removeLastSessionRefreshedTime()
      await refreshSession()
    }

    startListeningNetworkStatus()
  },
  { windowTypes: ['normal'] }
)

chrome.storage.onChanged.addListener(async () => {
  const tabs = await chrome.tabs.query({
    url: [LEARNUS_URL_PATTERN, PORTAL_URL_PATTERN, INFRA_URL_PATTERN],
  })

  const tabIds = tabs.map((tab) => tab.id).filter((id) => id !== undefined)
  await sendMessageToTabs(tabIds, { type: 'refreshing-overlay' })
})

chrome.runtime.onMessage.addListener(async (message: TabMessage) => {
  switch (message.type) {
    case 'recreate-refresh-session-alarm':
      await recreateRefreshSessionAlarm()
      break
    case 'on-signed-out':
      await refreshSession()
      break
  }
})
