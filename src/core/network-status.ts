import { getIsLoggedIn, getIsRefreshing } from './login-status'
import { refreshSession } from './refresh-session'

export function startListeningNetworkStatus(): void {
  navigator.connection?.removeEventListener('change', handleConnectionChange)
  navigator.connection?.addEventListener('change', handleConnectionChange)
}

function handleConnectionChange(): void {
  const isOnline = navigator.connection?.rtt !== 0

  if (isOnline) {
    handleOnline()
  }
}

async function handleOnline(): Promise<void> {
  const isLoggedIn = await getIsLoggedIn()
  const isRefreshing = await getIsRefreshing()

  if (!isLoggedIn && !isRefreshing) {
    await refreshSession()
  }
}
