export async function waitUntilTabsLoaded(
  query?: chrome.tabs.QueryInfo
): Promise<void> {
  const startTime = Date.now()
  const TIMEOUT_MS = 10000
  const INTERVAL_MS = 100

  while (true) {
    const tabs = await chrome.tabs.query({ ...query, status: 'loading' })
    if (tabs.length === 0) {
      break
    }

    if (Date.now() - startTime > TIMEOUT_MS) {
      break
    }

    await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS))
  }
}
