const MAX_VIDEO_PLAYBACK_RATE = 3.0
const MIN_VIDEO_PLAYBACK_RATE = 0.25
const VIDEO_PLAYBACK_RATE_STEP = 0.25

addEventListener('keyup', (e) => {
  if (e.key === '>') {
    increaseVideoPlaybackRate()
  } else if (e.key === '<') {
    decreaseVideoPlaybackRate()
  }
})

function increaseVideoPlaybackRate() {
  const videos = Array.from(document.getElementsByTagName('video'))
  if (videos.length === 0) return

  const currentSpeed = videos[0].playbackRate
  if (currentSpeed >= MAX_VIDEO_PLAYBACK_RATE) return

  const newSpeed = currentSpeed + VIDEO_PLAYBACK_RATE_STEP
  videos.forEach((video) => {
    video.playbackRate = newSpeed
  })
}

function decreaseVideoPlaybackRate() {
  const videos = Array.from(document.getElementsByTagName('video'))
  if (videos.length === 0) return

  const currentSpeed = videos[0].playbackRate
  if (currentSpeed <= MIN_VIDEO_PLAYBACK_RATE) return

  const newSpeed = currentSpeed - VIDEO_PLAYBACK_RATE_STEP
  videos.forEach((video) => {
    video.playbackRate = newSpeed
  })
}
