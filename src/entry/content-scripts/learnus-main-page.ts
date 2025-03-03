import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  getCoursesData,
  getCoursesDataLastUpdated,
  saveCoursesData,
  saveCoursesDataLastUpdated,
} from '../../core/task/course-data'

dayjs.extend(relativeTime)
dayjs.locale('ko')

class TasksRefreshStatusLabel {
  private static readonly className = 'yontil-tasks-refresh-status-label'

  private constructor() {}

  static initialize() {
    const headerTitleElement = document.querySelector(
      '.front-box-header .title'
    )
    if (!headerTitleElement) return

    const indicatorElement = document.createElement('span')
    indicatorElement.classList.add(TasksRefreshStatusLabel.className)
    indicatorElement.innerHTML = ''
    headerTitleElement.append(indicatorElement)
  }

  static async update(isRefreshing: boolean): Promise<void> {
    const element = document.querySelector(
      `.${TasksRefreshStatusLabel.className}`
    )
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

TasksRefreshStatusLabel.initialize()

refreshTasks()

async function refreshTasks() {
  const courseElements = document.querySelectorAll('.my-course-lists li')
  if (courseElements.length === 0) return

  await TasksRefreshStatusLabel.update(true)

  showCachedTasks(courseElements)

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

  await saveCoursesData(
    courses.map((course) => ({
      courseUrl: course.url,
      tasks: course.tasks.map((task) => task.outerHTML),
    }))
  )

  await saveCoursesDataLastUpdated()

  await TasksRefreshStatusLabel.update(false)
}

async function showCachedTasks(courseElements: NodeListOf<Element>) {
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
    '.course-box-top .activity:has(img[src="https://ys.learnus.org/theme/image.php/coursemosv2/core/1727860802/i/completion-auto-n"])'
  )
  const weekTasks = document.querySelectorAll(
    '.total-sections .activity:has(img[src="https://ys.learnus.org/theme/image.php/coursemosv2/core/1727860802/i/completion-auto-n"])'
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
