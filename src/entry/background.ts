import { loggedOutTabs, refreshSession } from '../core/refresh-session'

const REFRESH_SESSION_ALARM_NAME = 'refreshSession'
const REFRESH_SESSION_PERIOD_IN_MINUTES = 59

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
  await refreshSession()
})

chrome.webRequest.onBeforeRedirect.addListener(
  (details) => {
    const { redirectUrl, url, tabId } = details
    if (redirectUrl === 'https://ys.learnus.org/login/index.php') {
      loggedOutTabs.push({ tabId, targetUrl: url })
    }
  },
  {
    urls: ['https://*.learnus.org/*'],
    types: ['main_frame'],
  }
)
