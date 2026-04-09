export default class TasksRefreshElement {
  private static readonly refreshButtonClassName = 'yontil-tasks-refresh-button'
  private static readonly labelClassName = 'yontil-tasks-refresh-status-label'

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
    } else {
      this.updateLastUpdated(lastUpdated ?? this.lastUpdated)
    }
  }

  private static updateLastUpdated(lastUpdated?: number) {
    if (!lastUpdated) return

    this.lastUpdated = lastUpdated

    this.updateLastUpdatedTextElement({
      text: `마지막 업데이트: ${formatElapsedTime(lastUpdated)}`,
      tooltip: `마지막 업데이트: ${new Date(lastUpdated).toLocaleTimeString()}`,
    })
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

  static dispose() {
    document.querySelector(`.${this.refreshButtonClassName}`)?.remove()
    document.querySelector(`.${this.labelClassName}`)?.remove()
  }
}

export function formatElapsedTime(
  lastUpdated: number,
  now = Date.now()
): string {
  const elapsedSeconds = Math.max(0, Math.floor((now - lastUpdated) / 1000))
  if (elapsedSeconds < 60) {
    return `${elapsedSeconds}초 전`
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60)
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}분 전`
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60)
  if (elapsedHours < 24) {
    return `${elapsedHours}시간 전`
  }

  const elapsedDays = Math.floor(elapsedHours / 24)
  return `${elapsedDays}일 전`
}
