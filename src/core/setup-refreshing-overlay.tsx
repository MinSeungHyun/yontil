import { renderToStaticMarkup } from 'react-dom/server'
import RefreshingOverlay from '../components/refreshing-overlay'
import { getShowRefreshingOverlay } from './login-status'
import React from 'react'

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
