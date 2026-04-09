jest.mock('../../utils/parse-html-string', () => ({
  parseInputTagsFromHtml: jest.fn(),
}))

jest.mock('node-forge', () => ({
  jsbn: {
    BigInteger: function MockBigInteger() {},
  },
  pki: {
    rsa: {
      setPublicKey: jest.fn(() => ({
        encrypt: jest.fn(() => 'A'),
      })),
    },
  },
}))

import { parseInputTagsFromHtml } from '../../utils/parse-html-string'
import loginLearnUs from './login-learnus'

describe('loginLearnUs', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('includes credentials in every request needed to rebuild the LearnUs session', async () => {
    ;(parseInputTagsFromHtml as jest.Mock)
      .mockReturnValueOnce({ S1: 's1' })
      .mockReturnValueOnce({ E3: 'e3', E4: 'e4', S2: 's2', CLTID: 'cltid' })

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        text: jest.fn().mockResolvedValue('<html></html>'),
      })
      .mockResolvedValueOnce({
        text: jest.fn().mockResolvedValue('<script></script>'),
      })
      .mockResolvedValueOnce({
        text: jest.fn().mockResolvedValue('<html></html>'),
      })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({}) as typeof fetch

    await loginLearnUs('test-id', 'test-password')

    expect(global.fetch).toHaveBeenCalledTimes(5)
    ;(global.fetch as jest.Mock).mock.calls.forEach(([, init]) => {
      expect((init as RequestInit | undefined)?.credentials).toBe('include')
    })
  })
})
