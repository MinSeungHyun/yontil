import { onSessionRefreshed } from './refresh-session'

const LOGIN_DATA_KEY = 'loginData'

export interface LoginData {
  id: string
  password: string
}

export async function saveLoginData(loginData: LoginData): Promise<void> {
  const loginDataString = btoa(JSON.stringify(loginData))
  await chrome.storage.local.set({ [LOGIN_DATA_KEY]: loginDataString })

  await onSessionRefreshed()
}

export async function loadLoginData(): Promise<LoginData | null> {
  const { loginData } = await chrome.storage.local.get(LOGIN_DATA_KEY)
  if (!loginData) return null

  return JSON.parse(atob(loginData))
}
