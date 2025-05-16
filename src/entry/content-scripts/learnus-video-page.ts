import { initializeSeekBarPreview } from '../../core/video/seek-bar-preview'
import {
  getVideoPlaybackRate,
  setVideoPlaybackRate,
} from '../../core/video/video-repository'

addEventListener('keyup', (e) => {
  if (e.key === '>') {
    increaseVideoPlaybackRate()
  } else if (e.key === '<') {
    decreaseVideoPlaybackRate()
  }
})

const video = document.querySelector('video')

function increaseVideoPlaybackRate() {
  if (!video) return

  const currentSpeed = video.playbackRate
  if (currentSpeed >= 2.0) return

  video.playbackRate = currentSpeed + 0.25
}

function decreaseVideoPlaybackRate() {
  if (!video) return

  const currentSpeed = video.playbackRate
  if (currentSpeed <= 0.25) return

  video.playbackRate = currentSpeed - 0.25
}

video?.addEventListener('ratechange', async () => {
  const currentPlaybackRate = video.playbackRate
  await setVideoPlaybackRate(currentPlaybackRate)
})

let isFirstPlay = true

video?.addEventListener('play', async () => {
  if (!isFirstPlay) return
  isFirstPlay = false

  const savedPlaybackRate = await getVideoPlaybackRate()
  if (savedPlaybackRate) {
    video.playbackRate = savedPlaybackRate
  }

  initializeSeekBarPreview()
})
