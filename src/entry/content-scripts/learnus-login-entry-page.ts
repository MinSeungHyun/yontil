import { sendMessageToBackground } from '../../utils/tab-message'

const loginEntryButton = document.querySelector('a.btn.btn-sso')
if (loginEntryButton) {
  sendMessageToBackground({ type: 'on-signed-out' })
}
