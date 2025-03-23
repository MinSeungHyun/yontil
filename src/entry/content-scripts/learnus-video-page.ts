addEventListener('keyup', (e) => {
  if (e.key === '>') {
    increaseVideoPlaybackRate()
  } else if (e.key === '<') {
    decreaseVideoPlaybackRate()
  }
})

function increaseVideoPlaybackRate() {
  const video = document.querySelector('video')
  if (!video) return

  const currentSpeed = video.playbackRate
  if (currentSpeed >= 2.0) return

  video.playbackRate = currentSpeed + 0.25
}

function decreaseVideoPlaybackRate() {
  const video = document.querySelector('video')
  if (!video) return

  const currentSpeed = video.playbackRate
  if (currentSpeed <= 0.25) return

  video.playbackRate = currentSpeed - 0.25
}
