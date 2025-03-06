import {
  getCoursesData,
  getCoursesDataLastUpdated,
  setCoursesData,
  setCoursesDataLastUpdated,
} from '../../core/tasks/course-data-repository'
import TasksRefreshElement from '../../core/tasks/tasks-refresh-element'
import {
  getTasksEnabled,
  setTasksEnabled,
} from '../../core/tasks/tasks-setting-repository'
import TasksSwitchElement from '../../core/tasks/tasks-switch-element'

const TASKS_REFRESH_INTERVAL = 1000 * 60 * 60 // 1 hour

let isTasksRefreshing = false

async function main() {
  showCachedTasks()

  const isTasksEnabled = await getTasksEnabled()
  TasksSwitchElement.initialize({
    isEnabled: isTasksEnabled,
    onClick: handleTasksSwitchClick,
  })

  await TasksRefreshElement.initialize({
    onRefresh: refreshTasks,
  })

  const lastUpdated = await getCoursesDataLastUpdated()

  if (!lastUpdated || Date.now() - lastUpdated > TASKS_REFRESH_INTERVAL) {
    await refreshTasks()
  } else {
    await TasksRefreshElement.update({ isRefreshing: false })
  }

  setInterval(
    () => TasksRefreshElement.update({ isRefreshing: false }),
    1000 * 60
  )
}

async function handleTasksSwitchClick(isEnabled: boolean) {
  isEnabled = !isEnabled
  TasksSwitchElement.updateSwitch({ isEnabled })
  await setTasksEnabled(isEnabled)
}

async function refreshTasks() {
  const courseElements = document.querySelectorAll('.my-course-lists li')
  if (courseElements.length === 0) return

  if (isTasksRefreshing) return
  isTasksRefreshing = true
  await TasksRefreshElement.update({ isRefreshing: true })

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

  await TasksRefreshElement.update({ isRefreshing: false })
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

main()
