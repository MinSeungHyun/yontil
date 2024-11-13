import saveLoginData from '../../core/save-login-data'

const loginForm = document.getElementById('ssoLoginForm')

loginForm?.addEventListener('submit', (event) => {
  const formData = new FormData(event.target as HTMLFormElement)
  const id = formData.get('username')?.toString()
  const password = formData.get('password')?.toString()

  saveLoginData(id, password)
})
