export type TabMessage =
  | ShowRefreshingOverlayMessage
  | UpdateLearnUsSesskeyMessage
  | RecreateRefreshSessionAlarmMessage

interface ShowRefreshingOverlayMessage {
  type: 'refreshing-overlay'
  show: boolean
}

interface UpdateLearnUsSesskeyMessage {
  type: 'update-learnus-sesskey'
  sesskey: string
}

interface RecreateRefreshSessionAlarmMessage {
  type: 'recreate-refresh-session-alarm'
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

export async function sendMessageToBackground(message: TabMessage) {
  await chrome.runtime.sendMessage<TabMessage>(message)
}
