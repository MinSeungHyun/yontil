import Hls from 'hls.js'

export function initializeSeekBarPreview() {
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
