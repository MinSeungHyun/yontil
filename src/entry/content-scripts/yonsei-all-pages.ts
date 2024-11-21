import '../../main.css'

import { setupRefreshingOverlay } from '../../core/setup-refreshing-overlay'

setupRefreshingOverlay({
  checkIsInLoginPage: () => {
    const loginEntryButton = document.querySelector('div.login_btn')
    const loginForm = document.getElementById('ssoLoginForm')

    return Boolean(loginEntryButton || loginForm)
  },
})
