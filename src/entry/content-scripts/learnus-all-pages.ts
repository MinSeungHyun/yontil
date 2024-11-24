import '../../main.css'

import { setupRefreshingOverlay } from '../../core/setup-refreshing-overlay'
import { TabMessage } from '../../utils/tab-message'

const { handleShowRefreshingOverlayChange } = setupRefreshingOverlay({
  checkIsInLoginPage: () => {
    const loginEntryButton = document.querySelector('a.btn.btn-sso')
    const loginForm = document.getElementById('ssoLoginForm')

    return Boolean(loginEntryButton || loginForm)
  },
})

chrome.runtime.onMessage.addListener((message: TabMessage) => {
  switch (message.type) {
    case 'refreshing-overlay':
      handleShowRefreshingOverlayChange(message.show)
      break
    case 'update-learnus-sesskey':
      localStorage.setItem('sesskey', message.sesskey)

      const scriptElement = document.createElement('script')
      scriptElement.setAttribute('type', 'text/javascript')
      scriptElement.setAttribute(
        'src',
        chrome.runtime.getURL('/update-learnus-sesskey-script.js')
      )

      document.body.appendChild(scriptElement)
      break
  }
})
