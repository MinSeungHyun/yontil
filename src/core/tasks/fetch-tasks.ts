export interface TasksCourse {
  url: string
  element: Element
  taskElements: Element[]
}

export default async function fetchTasks(): Promise<TasksCourse[]> {
  const courseElements = document.querySelectorAll('.my-course-lists li')
  if (courseElements.length === 0) return []

  const tasksCourses: TasksCourse[] = []

  for (const courseElement of courseElements) {
    const courseLinkElement = courseElement.querySelector('.course-link')
    if (!(courseLinkElement instanceof HTMLAnchorElement)) continue

    const courseUrl = courseLinkElement.href
    const taskElements = await fetchTaskElementsInCourse(courseUrl)

    tasksCourses.push({ url: courseUrl, element: courseElement, taskElements })
  }

  return tasksCourses
}

async function fetchTaskElementsInCourse(
  courseUrl: string
): Promise<Element[]> {
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
