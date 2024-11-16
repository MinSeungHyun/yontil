import { loadLoginData } from './login-data'
import loginLearnUs from './login-learnus'
import loginPortal from './login-portal'

export let loggedOutTabs: { tabId: number; targetUrl: string }[] = []

export async function refreshSession(): Promise<void> {
  const loginData = await loadLoginData()

  if (loginData) {
    loggedOutTabs = []

    await loginLearnUs(loginData.id, loginData.password)
    await loginPortal()

    for (const loggedOutTab of loggedOutTabs) {
      chrome.tabs.update(loggedOutTab.tabId, { url: loggedOutTab.targetUrl })
    }
  }
}
