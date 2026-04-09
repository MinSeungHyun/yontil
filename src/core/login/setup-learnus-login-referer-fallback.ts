import { LEARNUS_ORIGIN } from '../constants'

const LEARNUS_LOGIN_URL = `${LEARNUS_ORIGIN}/passni/sso/spLogin2.php`
const LEARNUS_LOGIN_FILTER: chrome.webRequest.RequestFilter = {
  urls: [LEARNUS_LOGIN_URL],
  types: ['xmlhttprequest'],
}
const LEARNUS_LOGIN_EXTRA_INFO_SPEC: string[] = ['blocking', 'requestHeaders']

export function updateRequestHeadersWithLearnUsReferer(
  requestHeaders: chrome.webRequest.HttpHeader[] = []
): chrome.webRequest.HttpHeader[] {
  const nextHeaders = [...requestHeaders]
  const refererHeader = nextHeaders.find(
    (header) => header.name.toLowerCase() === 'referer'
  )

  if (refererHeader) {
    refererHeader.value = LEARNUS_ORIGIN
    return nextHeaders
  }

  nextHeaders.push({ name: 'Referer', value: LEARNUS_ORIGIN })
  return nextHeaders
}

export function handleLearnUsLoginBeforeSendHeaders(
  details: chrome.webRequest.WebRequestHeadersDetails
): chrome.webRequest.BlockingResponse {
  return {
    requestHeaders: updateRequestHeadersWithLearnUsReferer(
      details.requestHeaders
    ),
  }
}

export function setupLearnUsLoginRefererFallback(
  chromeApi: typeof chrome = chrome
): void {
  const onBeforeSendHeaders = chromeApi.webRequest?.onBeforeSendHeaders
  if (!onBeforeSendHeaders) return

  if (onBeforeSendHeaders.hasListener(handleLearnUsLoginBeforeSendHeaders)) {
    return
  }

  onBeforeSendHeaders.addListener(
    handleLearnUsLoginBeforeSendHeaders,
    LEARNUS_LOGIN_FILTER,
    LEARNUS_LOGIN_EXTRA_INFO_SPEC
  )
}
