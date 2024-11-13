export default async function saveLoginData(id?: string, password?: string) {
  const loginData = btoa(JSON.stringify({ id, password }))
  await chrome.storage.local.set({ loginData })
}
