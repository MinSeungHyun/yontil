import { LEARNUS_ORIGIN, PORTAL_ORIGIN } from '../constants'
import { checkIfSessionAlive } from './refresh-session'

describe('checkIfSessionAlive', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('includes credentials when verifying whether the saved session is still alive', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        text: jest
          .fn()
          .mockResolvedValue('<a href="/login/logout.php">logout</a>'),
      })
      .mockResolvedValueOnce({}) as typeof fetch

    await expect(checkIfSessionAlive()).resolves.toBe(true)

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      LEARNUS_ORIGIN,
      expect.objectContaining({ credentials: 'include' })
    )
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      PORTAL_ORIGIN,
      expect.objectContaining({ credentials: 'include' })
    )
  })
})
