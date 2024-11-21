import '../../main.css'

import { setupRefreshingOverlay } from '../../core/setup-refreshing-overlay'

setupRefreshingOverlay({
  checkIsInLoginPage: () => {
    const loginEntryButton = document.querySelector('a.btn.btn-sso')
    const loginForm = document.getElementById('ssoLoginForm')

    return Boolean(loginEntryButton || loginForm)
  },
})
