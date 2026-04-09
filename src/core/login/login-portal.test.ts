import loginPortal from './login-portal'

describe('loginPortal', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('includes credentials in every request needed to rebuild the portal session', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        text: jest.fn().mockResolvedValue('<input name="S1" value="s1" />'),
      })
      .mockResolvedValueOnce({
        text: jest
          .fn()
          .mockResolvedValue(
            '<input name="E3" value="e3" /><input name="E4" value="e4" /><input name="S2" value="s2" /><input name="CLTID" value="cltid" />'
          ),
      })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({}) as typeof fetch

    await loginPortal()

    expect(global.fetch).toHaveBeenCalledTimes(5)
    ;(global.fetch as jest.Mock).mock.calls.forEach(([, init]) => {
      expect((init as RequestInit | undefined)?.credentials).toBe('include')
    })
  })
})
