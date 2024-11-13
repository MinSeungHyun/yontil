import { loadLoginData } from '../core/login-data'
import loginLearnUs from '../core/login-learnus'

chrome.windows.onCreated.addListener(async () => {
  const loginData = await loadLoginData()
  if (loginData) {
    loginLearnUs(loginData.id, loginData.password)
  }
})
