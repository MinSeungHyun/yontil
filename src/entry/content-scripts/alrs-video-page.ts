import {
  getAlrsVideoPlaybackRate,
  setAlrsVideoPlaybackRate,
} from '../../core/video/alrs-video-repository'

const VIDEOS_COUNT_IN_PAGE = 4
const MAX_VIDEO_PLAYBACK_RATE = 3.0
const MIN_VIDEO_PLAYBACK_RATE = 0.25
const VIDEO_PLAYBACK_RATE_STEP = 0.25

const videos: HTMLVideoElement[] = []

const onBodyMutate: MutationCallback = (mutations, observer) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node instanceof HTMLVideoElement) {
        videos.push(node)

        if (videos.length >= VIDEOS_COUNT_IN_PAGE) {
          observer.disconnect()
          initialize()
        }
      }
    }
  }
}

new MutationObserver(onBodyMutate).observe(document.body, {
  childList: true,
  subtree: true,
})

async function initialize() {
  let isFirstPlay = true

  videos[0]?.addEventListener('play', async () => {
    if (!isFirstPlay) return
    isFirstPlay = false

    const savedPlaybackRate = await getAlrsVideoPlaybackRate()
    if (savedPlaybackRate) {
      setVideoPlaybackRate(savedPlaybackRate)
    }
  })

  videos[0].addEventListener('ratechange', async () => {
    const currentPlaybackRate = videos[0].playbackRate
    await setAlrsVideoPlaybackRate(currentPlaybackRate)
  })

  addEventListener('keyup', (e) => {
    if (e.key === '>') {
      increaseVideoPlaybackRate()
    } else if (e.key === '<') {
      decreaseVideoPlaybackRate()
    }
  })
}

function increaseVideoPlaybackRate() {
  const currentSpeed = videos[0].playbackRate
  if (currentSpeed >= MAX_VIDEO_PLAYBACK_RATE) return

  const newSpeed = currentSpeed + VIDEO_PLAYBACK_RATE_STEP
  setVideoPlaybackRate(newSpeed)
}

function decreaseVideoPlaybackRate() {
  const currentSpeed = videos[0].playbackRate
  if (currentSpeed <= MIN_VIDEO_PLAYBACK_RATE) return

  const newSpeed = currentSpeed - VIDEO_PLAYBACK_RATE_STEP
  setVideoPlaybackRate(newSpeed)
}

function setVideoPlaybackRate(rate: number) {
  videos.forEach((video) => {
    video.playbackRate = rate
  })
}
