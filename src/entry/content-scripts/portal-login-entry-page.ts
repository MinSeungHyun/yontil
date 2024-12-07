import { sendMessageToBackground } from '../../utils/tab-message'

const loginEntryButton = document.querySelector('div.login_btn')
if (loginEntryButton) {
  sendMessageToBackground({ type: 'on-signed-out' })
}
