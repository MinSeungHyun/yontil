import { loadLoginData } from './login-data'
import loginLearnUs from './login-learnus'

export async function refreshSession(): Promise<void> {
  const loginData = await loadLoginData()
  if (loginData) {
    loginLearnUs(loginData.id, loginData.password)
  }
}
