export type TabMessage = ShowRefreshingOverlayMessage

interface ShowRefreshingOverlayMessage {
  type: 'refreshing-overlay'
  show: boolean
}

export async function sendMessageToTab(tabId: number, message: TabMessage) {
  try {
    await chrome.tabs.sendMessage<TabMessage>(tabId, message)
  } catch (e) {
    console.log(
      `[${new Date().toISOString()}] Failed to send message to tab ${tabId}:`,
      message,
      e
    )
  }
}

export async function sendMessageToTabs(tabIds: number[], message: TabMessage) {
  await Promise.all(tabIds.map((tabId) => sendMessageToTab(tabId, message)))
}
