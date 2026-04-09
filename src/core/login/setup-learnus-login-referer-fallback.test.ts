import { LEARNUS_ORIGIN } from '../constants'
import {
  handleLearnUsLoginBeforeSendHeaders,
  setupLearnUsLoginRefererFallback,
  updateRequestHeadersWithLearnUsReferer,
} from './setup-learnus-login-referer-fallback'

describe('updateRequestHeadersWithLearnUsReferer', () => {
  it('adds the LearnUs referer header when it is missing', () => {
    expect(
      updateRequestHeadersWithLearnUsReferer([
        { name: 'Accept', value: 'text/html' },
      ])
    ).toEqual([
      { name: 'Accept', value: 'text/html' },
      { name: 'Referer', value: LEARNUS_ORIGIN },
    ])
  })

  it('overwrites an existing referer header regardless of case', () => {
    expect(
      updateRequestHeadersWithLearnUsReferer([
        { name: 'referer', value: 'https://example.com' },
      ])
    ).toEqual([{ name: 'referer', value: LEARNUS_ORIGIN }])
  })
})

describe('handleLearnUsLoginBeforeSendHeaders', () => {
  it('returns blocking response with corrected headers', () => {
    expect(
      handleLearnUsLoginBeforeSendHeaders({
        requestHeaders: [{ name: 'Cookie', value: 'foo=bar' }],
      } as chrome.webRequest.WebRequestHeadersDetails)
    ).toEqual({
      requestHeaders: [
        { name: 'Cookie', value: 'foo=bar' },
        { name: 'Referer', value: LEARNUS_ORIGIN },
      ],
    })
  })
})

describe('setupLearnUsLoginRefererFallback', () => {
  it('registers a blocking listener for the LearnUs login request', () => {
    const addListener = jest.fn()
    const hasListener = jest.fn().mockReturnValue(false)

    setupLearnUsLoginRefererFallback({
      webRequest: {
        onBeforeSendHeaders: {
          addListener,
          hasListener,
        },
      },
    } as unknown as typeof chrome)

    expect(hasListener).toHaveBeenCalledWith(handleLearnUsLoginBeforeSendHeaders)
    expect(addListener).toHaveBeenCalledWith(
      handleLearnUsLoginBeforeSendHeaders,
      {
        urls: [`${LEARNUS_ORIGIN}/passni/sso/spLogin2.php`],
        types: ['xmlhttprequest'],
      },
      ['blocking', 'requestHeaders']
    )
  })

  it('does not register the listener twice', () => {
    const addListener = jest.fn()
    const hasListener = jest.fn().mockReturnValue(true)

    setupLearnUsLoginRefererFallback({
      webRequest: {
        onBeforeSendHeaders: {
          addListener,
          hasListener,
        },
      },
    } as unknown as typeof chrome)

    expect(addListener).not.toHaveBeenCalled()
  })

  it('skips setup when the webRequest API is unavailable', () => {
    expect(() =>
      setupLearnUsLoginRefererFallback({} as unknown as typeof chrome)
    ).not.toThrow()
  })
})
