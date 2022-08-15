const loginButton = document.getElementById('loginBtn')
if (loginButton) {
  const idInput = document.getElementById('loginId') as HTMLInputElement
  const pwInput = document.getElementById('loginPasswd') as HTMLInputElement

  let id: string, pw: string
  idInput.addEventListener('input', () => {
    id = idInput.value
  })
  pwInput.addEventListener('input', () => {
    pw = pwInput.value
  })

  loginButton.onclick = async () => {
    await chrome.runtime.sendMessage({ name: 'login', data: { id, pw } })
  }
}
