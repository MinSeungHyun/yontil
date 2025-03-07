export const LAST_SESSION_REFRESHED_TIME_KEY = 'lastSessionRefreshedTime'

export const SESSION_EXPIRATION_TIME_IN_MINUTES = 60

interface LastSessionRefreshedTime {
  [LAST_SESSION_REFRESHED_TIME_KEY]: number | undefined
}

export async function setLastSessionRefreshedTime(): Promise<void> {
  await chrome.storage.local.set<LastSessionRefreshedTime>({
    lastSessionRefreshedTime: Date.now(),
  })
}

export async function removeLastSessionRefreshedTime(): Promise<void> {
  await chrome.storage.local.remove(LAST_SESSION_REFRESHED_TIME_KEY)
}

async function getIsLoggedIn(): Promise<boolean> {
  const { lastSessionRefreshedTime } =
    await chrome.storage.local.get<LastSessionRefreshedTime>(
      LAST_SESSION_REFRESHED_TIME_KEY
    )

  return (
    lastSessionRefreshedTime !== undefined &&
    lastSessionRefreshedTime >
      Date.now() - 1000 * 60 * SESSION_EXPIRATION_TIME_IN_MINUTES
  )
}

export const IS_SESSION_REFRESHING_KEY = 'isSessionRefreshing'

interface IsSessionRefreshing {
  [IS_SESSION_REFRESHING_KEY]: boolean | undefined
}

export async function setIsSessionRefreshing(
  isSessionRefreshing: boolean
): Promise<void> {
  await chrome.storage.local.set<IsSessionRefreshing>({ isSessionRefreshing })
}

async function getIsSessionRefreshing(): Promise<boolean> {
  const { isSessionRefreshing } =
    await chrome.storage.local.get<IsSessionRefreshing>(
      IS_SESSION_REFRESHING_KEY
    )

  return isSessionRefreshing ?? false
}

export async function getShowRefreshingOverlay(): Promise<boolean> {
  const isLoggedIn = await getIsLoggedIn()
  const isSessionRefreshing = await getIsSessionRefreshing()

  return !isLoggedIn && isSessionRefreshing
}

export async function getIsSessionRefreshNeeded(): Promise<boolean> {
  const isLoggedIn = await getIsLoggedIn()
  const isSessionRefreshing = await getIsSessionRefreshing()

  return !isLoggedIn && !isSessionRefreshing
}
