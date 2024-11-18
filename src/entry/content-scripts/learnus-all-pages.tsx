import '../../main.css'

import { shouldShowRefreshingOverlay } from '../../core/login-status'
import { renderToStaticMarkup } from 'react-dom/server'
import RefreshingOverlay from '../../components/refreshing-overlay'
import React from 'react'

shouldShowRefreshingOverlay().then(handleShouldShowRefreshingOverlayChange)

chrome.runtime.onMessage.addListener((message) => {
  handleShouldShowRefreshingOverlayChange(message)
})

function handleShouldShowRefreshingOverlayChange(shouldShow: boolean) {
  if (shouldShow) {
    showRefreshingOverlay()
    return
  }

  if (checkIsRefreshing()) {
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
