import Hls from 'hls.js'
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

function initializeSeekBarPreview() {
  const source = document.getElementsByTagName('source')[0]
  const src = source.src

  const container = document.createElement('div')
  container.classList.add('yontil-seek-bar-preview-container')
  document.body.appendChild(container)

  const seekBarPreviewVideo = document.createElement('video')
  seekBarPreviewVideo.classList.add('yontil-seek-bar-preview')
  container.appendChild(seekBarPreviewVideo)

  if (Hls.isSupported()) {
    var hls = new Hls()
    hls.loadSource(src)
    hls.attachMedia(seekBarPreviewVideo)
  } else if (seekBarPreviewVideo.canPlayType('application/vnd.apple.mpegurl')) {
    seekBarPreviewVideo.src = src
  }

  const progressControl = document.querySelector('.vjs-progress-control')
  if (!progressControl) return

  progressControl.addEventListener('mousemove', (e) => {
    const event = e as MouseEvent

    const progressControlRect = progressControl.getBoundingClientRect()
    // The reason why we don't use event.offsetX: https://stackoverflow.com/q/39568498/10202769
    const offsetX = event.x - progressControlRect.left

    const percentage = offsetX / progressControlRect.width

    seekBarPreviewVideo.currentTime = seekBarPreviewVideo.duration * percentage

    container.style.top = `${progressControlRect.top - container.offsetHeight - 32}px`
    const leftMin = 16
    const leftMax = document.body.offsetWidth - container.offsetWidth - 16
    container.style.left = `${Math.max(
      Math.min(event.x - container.offsetWidth / 2, leftMax),
      leftMin
    )}px`
  })

  progressControl.addEventListener('mouseenter', () => {
    container.style.opacity = '1'
  })

  progressControl.addEventListener('mouseleave', () => {
    container.style.opacity = '0'
  })
}
