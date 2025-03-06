import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import relativeTime from 'dayjs/plugin/relativeTime'
import { getCoursesDataLastUpdated } from './course-data-repository'

dayjs.extend(relativeTime)
dayjs.locale('ko')

export default class TasksRefreshElement {
  private static readonly refreshButtonClassName = 'yontil-tasks-refresh-button'
  private static readonly labelClassName = 'yontil-tasks-refresh-status-label'

  private constructor() {}

  static async initialize({ onRefresh }: { onRefresh: () => void }) {
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
  }

  static async update({
    isRefreshing,
  }: {
    isRefreshing: boolean
  }): Promise<void> {
    const element = document.querySelector(`.${this.labelClassName}`)
    if (!element) return

    if (isRefreshing) {
      element.innerHTML = '할 일 불러오는 중...'
    } else {
      const lastUpdated = await getCoursesDataLastUpdated()

      if (!lastUpdated) {
        element.innerHTML = ''
        return
      }

      element.innerHTML = `마지막 업데이트: ${dayjs(lastUpdated).fromNow()}`
    }
  }
}
