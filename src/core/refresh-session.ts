import { loadLoginData } from './login-data'
import loginLearnUs from './login-learnus'
import loginPortal from './login-portal'
import { saveLastRefreshedTime, saveIsRefreshing } from './login-status'

export async function refreshSession(): Promise<void> {
  const loginData = await loadLoginData()

  if (loginData) {
    await saveIsRefreshing(true)

    try {
      await loginLearnUs(loginData.id, loginData.password)
      await loginPortal()

      await saveLastRefreshedTime()
    } catch (error) {
      console.error(error)
    } finally {
      await saveIsRefreshing(false)
    }
  }
}
