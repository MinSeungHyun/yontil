import { setLoginData } from '../../core/login/login-data-repository'

let id: string | undefined
let password: string | undefined

const idInput = document.getElementById('loginId')
const pwInput = document.getElementById('loginPasswd')

idInput?.addEventListener('input', (event) => {
  id = (event.target as HTMLInputElement | null)?.value
})
pwInput?.addEventListener('input', (event) => {
  password = (event.target as HTMLInputElement | null)?.value
})

const loginButton = document.getElementById('loginBtn')

loginButton?.addEventListener('click', (event) => {
  if (id && password) {
    setLoginData({ id, password })
  }
})
