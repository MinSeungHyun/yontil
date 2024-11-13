export default async function saveLoginData(
  username?: string,
  password?: string
) {
  const loginData = btoa(JSON.stringify({ username, password }))
  await chrome.storage.local.set({ loginData })
}
