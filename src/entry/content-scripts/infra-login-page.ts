import { setLoginData } from '../../core/login/login-data-repository'

function getInputValueById(id: string): string | null {
  const input = document.getElementById(id)
  if (!(input instanceof HTMLInputElement)) return null

  const value = input.value.trim()
  return value.length > 0 ? value : null
}

function saveLoginDataFromForm() {
  const id = getInputValueById('loginId')
  const password = getInputValueById('loginPasswd')
  if (!id || !password) return

  setLoginData({ id, password })
}

const loginButton = document.getElementById('loginBtn')
loginButton?.addEventListener('click', () => {
  saveLoginDataFromForm()
})

const loginForm = document.getElementById('ssoLoginForm')
loginForm?.addEventListener('submit', () => {
  saveLoginDataFromForm()
})

const idInput = document.getElementById('loginId')
const pwInput = document.getElementById('loginPasswd')
for (const inputElement of [idInput, pwInput]) {
  inputElement?.addEventListener('keydown', (event) => {
    if ((event as KeyboardEvent).key === 'Enter') {
      saveLoginDataFromForm()
    }
  })
  inputElement?.addEventListener('change', () => {
    // Browser autofill may skip input events, so capture on change as well.
    saveLoginDataFromForm()
  })
  inputElement?.addEventListener('blur', () => {
    // Save as soon as both fields are available.
    saveLoginDataFromForm()
  })
}
