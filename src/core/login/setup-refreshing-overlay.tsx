import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import RefreshingOverlay, {
  CANCEL_REFRESH_BUTTON_ID,
} from '../../components/refreshing-overlay'
import { sendMessageToBackground } from '../../utils/tab-message'
import { getShowRefreshingOverlay } from './login-status-repository'

interface Options {
  checkIsInLoginPage: () => boolean
}

export function setupRefreshingOverlay({ checkIsInLoginPage }: Options) {
  getShowRefreshingOverlay().then(handleShowRefreshingOverlayChange)

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

    const cancelRefreshButton = document.getElementById(
      CANCEL_REFRESH_BUTTON_ID
    )
    cancelRefreshButton?.addEventListener('click', () => {
      sendMessageToBackground({
        type: 'cancel-refreshing-session',
      })
    })
  }
  function hideRefreshingOverlay() {
    const element = document.getElementById('refreshing-overlay')
    element?.remove()
  }

  function checkIsRefreshing(): boolean {
    return document.getElementById('refreshing-overlay') !== null
  }

  return {
    handleShowRefreshingOverlayChange,
  }
}
