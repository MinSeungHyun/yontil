import '../../main.css'

import { getShowRefreshingOverlay } from '../../core/login-status'
import { renderToStaticMarkup } from 'react-dom/server'
import RefreshingOverlay from '../../components/refreshing-overlay'
import React from 'react'
import { TabMessage } from '../../utils/tab-message'

getShowRefreshingOverlay().then(handleShowRefreshingOverlayChange)

chrome.runtime.onMessage.addListener((message: TabMessage) => {
  switch (message.type) {
    case 'refreshing-overlay':
      handleShowRefreshingOverlayChange(message.show)
      break
  }
})

function handleShowRefreshingOverlayChange(show: boolean) {
  if (show) {
    showRefreshingOverlay()
  } else if (checkIsRefreshing()) {
    if (checkIsInLoginPage()) {
      window.location.reload()
    } else {
      hideRefreshingOverlay()
    }
  }
}

function showRefreshingOverlay() {
  const element = renderToStaticMarkup(
    <RefreshingOverlay id="refreshing-overlay" />
  )
  document.body.insertAdjacentHTML('afterbegin', element)
}

function hideRefreshingOverlay() {
  const element = document.getElementById('refreshing-overlay')
  element?.remove()
}

function checkIsRefreshing(): boolean {
  return document.getElementById('refreshing-overlay') !== null
}

function checkIsInLoginPage(): boolean {
  const loginEntryButton = document.querySelector('a.btn.btn-sso')
  const loginForm = document.getElementById('ssoLoginForm')

  return Boolean(loginEntryButton || loginForm)
}
