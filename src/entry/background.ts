import { LEARNUS_URL_PATTERN, YONSEI_URL_PATTERN } from '../core/constants'
import {
  removeLastRefreshedTime,
  SESSION_EXPIRATION_TIME_IN_MINUTES,
  getShowRefreshingOverlay,
} from '../core/login-status'
import { startListeningNetworkStatus } from '../core/network-status'
import { refreshSession } from '../core/refresh-session'
import { sendMessageToTabs } from '../utils/tab-message'

const REFRESH_SESSION_ALARM_NAME = 'refreshSession'
const REFRESH_SESSION_PERIOD_IN_MINUTES = SESSION_EXPIRATION_TIME_IN_MINUTES - 1

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(REFRESH_SESSION_ALARM_NAME, {
    periodInMinutes: REFRESH_SESSION_PERIOD_IN_MINUTES,
  })
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  switch (alarm.name) {
    case REFRESH_SESSION_ALARM_NAME:
      await refreshSession()
      break
  }
})

chrome.windows.onCreated.addListener(async () => {
  await removeLastRefreshedTime()
  await refreshSession()

  startListeningNetworkStatus()
})

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
