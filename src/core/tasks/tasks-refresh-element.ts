import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
dayjs.locale('ko')

export default class TasksRefreshElement {
  private static readonly refreshButtonClassName = 'yontil-tasks-refresh-button'
  private static readonly labelClassName = 'yontil-tasks-refresh-status-label'

  private static lastUpdatedTextRefresher?: NodeJS.Timeout

  private constructor() {}

  static initialize({
    isRefreshing,
    lastUpdated,
    onRefresh,
  }: {
    isRefreshing: boolean
    lastUpdated?: number
    onRefresh: () => void
  }) {
    const headerTitleElement = document.querySelector(
      '.front-box-header .title'
    )
    if (!headerTitleElement) return

    const labelElement = document.createElement('span')
    labelElement.classList.add(this.labelClassName)
    labelElement.innerHTML = ''

    const refreshButtonElement = document.createElement('span')
    refreshButtonElement.classList.add(this.refreshButtonClassName)
    refreshButtonElement.innerHTML = '↻'
    refreshButtonElement.addEventListener('click', onRefresh)

    headerTitleElement.append(refreshButtonElement, labelElement)

    this.update({ isRefreshing, lastUpdated })
  }

  static update({
    isRefreshing,
    lastUpdated,
  }: {
    isRefreshing: boolean
    lastUpdated?: number
  }) {
    const element = document.querySelector(`.${this.labelClassName}`)
    if (!element) return

    if (isRefreshing) {
      element.innerHTML = '할 일 불러오는 중...'
      this.clearLastUpdatedTextRefresher()
    } else if (lastUpdated) {
      this.updateLastUpdatedText(lastUpdated)
      this.restartLastUpdatedTextRefresher(lastUpdated)
    } else {
      element.innerHTML = ''
    }
  }

  private static updateLastUpdatedText(lastUpdated: number) {
    const element = document.querySelector(
      `.${this.labelClassName}`
    ) as HTMLElement
    if (!element) return

    element.innerHTML = `마지막 업데이트: ${dayjs(lastUpdated).fromNow()}`
    element.title = `마지막 업데이트: ${new Date(lastUpdated).toLocaleTimeString()}`
  }

  private static clearLastUpdatedTextRefresher() {
    if (this.lastUpdatedTextRefresher) {
      clearInterval(this.lastUpdatedTextRefresher)
      this.lastUpdatedTextRefresher = undefined
    }
  }

  private static restartLastUpdatedTextRefresher(lastUpdated: number) {
    this.clearLastUpdatedTextRefresher()

    this.lastUpdatedTextRefresher = setInterval(async () => {
      this.updateLastUpdatedText(lastUpdated)
    }, 1000 * 60)
  }

  static dispose() {
    this.clearLastUpdatedTextRefresher()
    document.querySelector(`.${this.refreshButtonClassName}`)?.remove()
    document.querySelector(`.${this.labelClassName}`)?.remove()
  }
}
