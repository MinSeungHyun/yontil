const VIDEO_PLAYBACK_RATE_KEY = 'videoPlaybackRate'

interface VideoPlaybackRate {
  [VIDEO_PLAYBACK_RATE_KEY]: number | undefined
}

export async function getVideoPlaybackRate(): Promise<number | undefined> {
  const { videoPlaybackRate } =
    await chrome.storage.local.get<VideoPlaybackRate>(VIDEO_PLAYBACK_RATE_KEY)
  return videoPlaybackRate
}

export async function setVideoPlaybackRate(rate: number): Promise<void> {
  await chrome.storage.local.set<VideoPlaybackRate>({
    [VIDEO_PLAYBACK_RATE_KEY]: rate,
  })
}
