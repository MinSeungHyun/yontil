import { LEARNUS_URL } from './const'
import { refreshSession } from './login'
import { encode } from './utils/encoding'

const loginCycleMinutes = 59

chrome.runtime.onInstalled.addListener((_) => {
  chrome.alarms.create('refreshSession', {
    periodInMinutes: loginCycleMinutes,
    delayInMinutes: 0,
  })
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'refreshSession') {
    await refreshSession()
  }
})

chrome.windows.onCreated.addListener(async () => {
  await refreshSession()
})

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const body = details.requestBody?.formData
    const username = body?.username?.at(0)
    const password = body?.password?.at(0)

    if (username && password) {
      saveAuthData(username, password)
    }
  },
  {
    urls: [`${LEARNUS_URL}passni/sso/coursemosLogin.php`],
  },
  ['requestBody']
)

chrome.runtime.onMessage.addListener(async (message, _, __) => {
  if (message.name === 'login') {
    const { id, pw } = message.data
    console.log(id, pw)
    await saveAuthData(id, pw)
  }
})

async function saveAuthData(username: string, password: string) {
  const json = JSON.stringify({ username, password })
  await chrome.storage.sync.set({
    yontilAuthData: encode(json),
  })
}
