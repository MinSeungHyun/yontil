const ALRS_VIDEO_PLAYBACK_RATE_KEY = 'alrsVideoPlaybackRate'

interface AlrsVideoPlaybackRate {
  [ALRS_VIDEO_PLAYBACK_RATE_KEY]: number | undefined
}

export async function getAlrsVideoPlaybackRate(): Promise<number | undefined> {
  const { alrsVideoPlaybackRate } =
    await chrome.storage.local.get<AlrsVideoPlaybackRate>(
      ALRS_VIDEO_PLAYBACK_RATE_KEY
    )
  return alrsVideoPlaybackRate
}

export async function setAlrsVideoPlaybackRate(rate: number): Promise<void> {
  await chrome.storage.local.set<AlrsVideoPlaybackRate>({
    [ALRS_VIDEO_PLAYBACK_RATE_KEY]: rate,
  })
}
