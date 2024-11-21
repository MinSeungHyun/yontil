export type TabMessage = ShowRefreshingOverlayMessage

interface ShowRefreshingOverlayMessage {
  type: 'refreshing-overlay'
  show: boolean
}
