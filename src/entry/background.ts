import {
  recreateRefreshSessionAlarm,
  REFRESH_SESSION_ALARM_NAME,
} from '../core/alarm'
import { LEARNUS_URL_PATTERN, YONSEI_URL_PATTERN } from '../core/constants'
import {
  removeLastRefreshedTime,
  getShowRefreshingOverlay,
} from '../core/login-status'
import { startListeningNetworkStatus } from '../core/network-status'
import { refreshSession } from '../core/refresh-session'
import { sendMessageToTabs } from '../utils/tab-message'

chrome.runtime.onInstalled.addListener(() => {
  recreateRefreshSessionAlarm()
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
      await removeLastRefreshedTime()
      await refreshSession()
    }

    startListeningNetworkStatus()
  },
  { windowTypes: ['normal'] }
)

chrome.storage.onChanged.addListener(async () => {
  const tabs = await chrome.tabs.query({
    url: [LEARNUS_URL_PATTERN, YONSEI_URL_PATTERN],
  })

  const showRefreshingOverlay = await getShowRefreshingOverlay()

  const tabIds = tabs.map((tab) => tab.id).filter((id) => id !== undefined)
  await sendMessageToTabs(tabIds, {
    type: 'refreshing-overlay',
    show: showRefreshingOverlay,
  })
})
