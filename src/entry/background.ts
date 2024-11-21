import {
  removeLastRefreshedTime,
  SESSION_EXPIRATION_TIME_IN_MINUTES,
  getShowRefreshingOverlay,
} from '../core/login-status'
import { refreshSession } from '../core/refresh-session'
import { TabMessage } from '../core/tab-message'

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
})

chrome.storage.onChanged.addListener(async () => {
  // TODO: Refactoring, 특정 변경에만 실행되도록, 원하는 탭만 가져오도록 수정
  const tabs = await chrome.tabs.query({
    url: ['https://*.learnus.org/*', 'https://*.yonsei.ac.kr/*'],
  })

  const showRefreshingOverlay = await getShowRefreshingOverlay()

  for (const tab of tabs) {
    if (tab.id) {
      try {
        await chrome.tabs.sendMessage<TabMessage>(tab.id, {
          type: 'refreshing-overlay',
          show: showRefreshingOverlay,
        })
      } catch (e) {}
    }
  }
})
