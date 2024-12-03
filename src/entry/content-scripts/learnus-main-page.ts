import { getCoursesData, saveCoursesData } from '../../core/task/course-data'

refreshTasks()

async function refreshTasks() {
  const courseElements = document.querySelectorAll('.my-course-lists li')
  if (courseElements.length === 0) return

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
  if (tasks.length === 0) return

  let tasksElement = courseElement.querySelector('.yontil-tasks')
  if (tasksElement) {
    tasksElement.innerHTML = tasks.join('')
    return
  }

  tasksElement = createTasksElement()
  tasksElement.innerHTML = tasks.join('')
  courseElement.append(tasksElement)
}

function showTasks(courseElement: Element, tasks: Element[]) {
  if (tasks.length === 0) return

  let tasksElement = courseElement.querySelector('.yontil-tasks')
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
