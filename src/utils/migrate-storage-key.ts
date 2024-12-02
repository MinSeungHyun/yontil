export async function migrateLocalStorageKey(
  from: string,
  to: string
): Promise<void> {
  const value = await chrome.storage.local.get(from)
  if (value[from] === undefined) return

  await chrome.storage.local.set({ [to]: value[from] })
  await chrome.storage.local.remove(from)
}
