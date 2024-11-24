import '../../main.css'

import { setupRefreshingOverlay } from '../../core/setup-refreshing-overlay'
import { TabMessage } from '../../utils/tab-message'

const { handleShowRefreshingOverlayChange } = setupRefreshingOverlay({
  checkIsInLoginPage: () => {
    const loginEntryButton = document.querySelector('div.login_btn')
    const loginForm = document.getElementById('ssoLoginForm')

    return Boolean(loginEntryButton || loginForm)
  },
})

chrome.runtime.onMessage.addListener((message: TabMessage) => {
  switch (message.type) {
    case 'refreshing-overlay':
      handleShowRefreshingOverlayChange(message.show)
      break
  }
})
