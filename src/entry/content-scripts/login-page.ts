import { saveLoginData } from '../../core/login-data'

const loginForm = document.getElementById('ssoLoginForm')

loginForm?.addEventListener('submit', (event) => {
  const formData = new FormData(event.target as HTMLFormElement)
  const id = formData.get('username') as string | null
  const password = formData.get('password') as string | null

  if (id && password) {
    saveLoginData({ id, password })
  }
})
