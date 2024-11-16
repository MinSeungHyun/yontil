const LAST_REFRESHED_TIME_KEY = 'lastRefreshedTime'

interface LastRefreshedTime {
  [LAST_REFRESHED_TIME_KEY]: number | undefined
}

export async function saveLastRefreshedTime(): Promise<void> {
  await chrome.storage.session.set<LastRefreshedTime>({
    lastRefreshedTime: Date.now(),
  })
}

async function getIsLoggedIn(): Promise<boolean> {
  const { lastRefreshedTime } =
    await chrome.storage.session.get<LastRefreshedTime>(LAST_REFRESHED_TIME_KEY)

  return (
    lastRefreshedTime !== undefined &&
    lastRefreshedTime > Date.now() - 1000 * 60 * 60
  )
}

const IS_REFRESHING_KEY = 'isRefreshing'

interface IsRefreshing {
  [IS_REFRESHING_KEY]: boolean | undefined
}

export async function saveIsRefreshing(isRefreshing: boolean): Promise<void> {
  await chrome.storage.session.set<IsRefreshing>({ isRefreshing })
}

async function getIsRefreshing(): Promise<boolean> {
  const { isRefreshing } =
    await chrome.storage.session.get<IsRefreshing>(IS_REFRESHING_KEY)

  return isRefreshing ?? false
}

export async function shouldShowRefreshingOverlay(): Promise<boolean> {
  const isLoggedIn = await getIsLoggedIn()
  const isRefreshing = await getIsRefreshing()

  return !isLoggedIn && isRefreshing
}
