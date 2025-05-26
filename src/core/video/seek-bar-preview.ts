import Hls from 'hls.js'

const seekBarPreviewContainerClassName = 'yontil-seek-bar-preview-container'

export function initializeSeekBarPreview() {
  const container = createContainer()
  const previewVideo = createPreviewVideo(container)

  const progressControl = document.querySelector('.vjs-progress-control')
  if (!progressControl) return

  progressControl.addEventListener('mousemove', (e) => {
    const event = e as MouseEvent
    const progressControlRect = progressControl.getBoundingClientRect()

    // The reason why we don't use event.offsetX: https://stackoverflow.com/q/39568498/10202769
    const offsetX = event.x - progressControlRect.left
    const videoProgress = offsetX / progressControlRect.width
    previewVideo.currentTime = previewVideo.duration * videoProgress

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

function createContainer(): HTMLDivElement {
  const container = document.createElement('div')
  container.classList.add(seekBarPreviewContainerClassName)
  document.body.appendChild(container)

  return container
}

function createPreviewVideo(container: HTMLElement): HTMLVideoElement {
  const previewVideo = document.createElement('video')
  const videoSrc = document.getElementsByTagName('source')[0].src

  if (Hls.isSupported()) {
    const hls = new Hls({ maxBufferLength: 1 })
    hls.loadSource(videoSrc)
    hls.attachMedia(previewVideo)
  } else if (previewVideo.canPlayType('application/vnd.apple.mpegurl')) {
    previewVideo.src = videoSrc
  }

  container.appendChild(previewVideo)

  return previewVideo
}
