import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  getCoursesData,
  getCoursesDataLastUpdated,
  setCoursesData,
  setCoursesDataLastUpdated,
} from '../../core/task/course-data-repository'

dayjs.extend(relativeTime)
dayjs.locale('ko')

const TASKS_REFRESH_INTERVAL = 1000 * 60 * 60 // 1 hour

async function main() {
  showCachedTasks()
  await TasksRefreshElements.initialize({
    onRefresh: refreshTasks,
  })

  const lastUpdated = await getCoursesDataLastUpdated()

  if (!lastUpdated || Date.now() - lastUpdated > TASKS_REFRESH_INTERVAL) {
    await refreshTasks()
  } else {
    await TasksRefreshElements.update({ isRefreshing: false })
  }

  setInterval(
    () => TasksRefreshElements.update({ isRefreshing: false }),
    1000 * 60
  )
}

let isTasksRefreshing = false

async function refreshTasks() {
  const courseElements = document.querySelectorAll('.my-course-lists li')
  if (courseElements.length === 0) return

  if (isTasksRefreshing) return
  isTasksRefreshing = true
  await TasksRefreshElements.update({ isRefreshing: true })

  const courses: {
    url: string
    element: Element
    tasks: Element[]
  }[] = []

  for (const courseElement of courseElements) {
    const courseLinkElement = courseElement.querySelector('.course-link')
    if (!(courseLinkElement instanceof HTMLAnchorElement)) continue

    const courseUrl = courseLinkElement.href
    const tasks = await fetchCourseTasks(courseUrl)
    courses.push({ url: courseUrl, element: courseElement, tasks })
  }

  for (const course of courses) {
    showTasks(course.element, course.tasks)
  }

  await setCoursesData(
    courses.map((course) => ({
      courseUrl: course.url,
      tasks: course.tasks.map((task) => task.outerHTML),
    }))
  )

  await setCoursesDataLastUpdated()

  await TasksRefreshElements.update({ isRefreshing: false })
  isTasksRefreshing = false
}

async function showCachedTasks() {
  const courseElements = document.querySelectorAll('.my-course-lists li')
  if (courseElements.length === 0) return

  const courses = await getCoursesData()
  if (!courses) return

  for (const courseElement of courseElements) {
    const courseLinkElement = courseElement.querySelector('.course-link')
    if (!(courseLinkElement instanceof HTMLAnchorElement)) continue

    const courseUrl = courseLinkElement.href
    const course = courses.find((course) => course.courseUrl === courseUrl)
    if (!course) continue

    showHtmlTasks(courseElement, course.tasks)
  }
}

async function fetchCourseTasks(courseUrl: string): Promise<Element[]> {
  const response = await fetch(courseUrl)
  const html = await response.text()

  const parser = new DOMParser()
  const document = parser.parseFromString(html, 'text/html')

  const fixedTasks = document.querySelectorAll(
    '.course-box-top .activity:has(img[src$="completion-auto-n"])'
  )
  const weekTasks = document.querySelectorAll(
    '.total-sections .activity:has(img[src$="completion-auto-n"])'
  )

  return [...fixedTasks, ...weekTasks]
}

function showHtmlTasks(courseElement: Element, tasks: string[]) {
  let tasksElement = courseElement.querySelector('.yontil-tasks')

  if (tasks.length === 0) {
    tasksElement?.remove()
    return
  }

  if (tasksElement) {
    tasksElement.innerHTML = tasks.join('')
    return
  }

  tasksElement = createTasksElement()
  tasksElement.innerHTML = tasks.join('')
  courseElement.append(tasksElement)
}

function showTasks(courseElement: Element, tasks: Element[]) {
  let tasksElement = courseElement.querySelector('.yontil-tasks')

  if (tasks.length === 0) {
    tasksElement?.remove()
    return
  }

  if (tasksElement) {
    tasksElement.replaceChildren(...tasks)
    return
  }

  tasksElement = createTasksElement()
  tasksElement.append(...tasks)
  courseElement.append(tasksElement)
}

function createTasksElement() {
  const tasksElement = document.createElement('ul')
  tasksElement.classList.add('yontil-tasks')
  return tasksElement
}

class TasksRefreshElements {
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

main()
