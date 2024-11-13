import { loadLoginData } from './login-data'
import loginLearnUs from './login-learnus'
import loginPortal from './login-portal'

export async function refreshSession(): Promise<void> {
  const loginData = await loadLoginData()
  if (loginData) {
    await loginLearnUs(loginData.id, loginData.password)
    await loginPortal()
  }
}
