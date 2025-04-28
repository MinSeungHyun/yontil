import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
dayjs.locale('ko')

export default class TasksRefreshElement {
  private static readonly refreshButtonClassName = 'yontil-tasks-refresh-button'
  private static readonly labelClassName = 'yontil-tasks-refresh-status-label'

  private static lastUpdatedTextRefresher?: NodeJS.Timeout
  private static lastUpdated?: number

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
    if (isRefreshing) {
      this.updateLastUpdatedTextElement({
        text: '할 일 불러오는 중...',
      })
      this.clearLastUpdatedTextRefresher()
    } else {
      this.updateLastUpdated(lastUpdated ?? this.lastUpdated)
    }
  }

  private static updateLastUpdated(lastUpdated?: number) {
    if (!lastUpdated) return

    this.lastUpdated = lastUpdated

    this.updateLastUpdatedTextElement({
      text: `마지막 업데이트: ${dayjs(lastUpdated).fromNow()}`,
      tooltip: `마지막 업데이트: ${new Date(lastUpdated).toLocaleTimeString()}`,
    })

    this.restartLastUpdatedTextRefresher(lastUpdated)
  }

  private static updateLastUpdatedTextElement({
    text,
    tooltip,
  }: {
    text: string
    tooltip?: string
  }) {
    const element = document.querySelector(
      `.${this.labelClassName}`
    ) as HTMLElement
    if (!element) return

    element.innerHTML = text
    element.title = tooltip ?? ''
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
      this.updateLastUpdated(lastUpdated)
    }, 1000 * 60)
  }

  static dispose() {
    this.clearLastUpdatedTextRefresher()
    document.querySelector(`.${this.refreshButtonClassName}`)?.remove()
    document.querySelector(`.${this.labelClassName}`)?.remove()
  }
}
