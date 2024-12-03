refreshTasks()

async function refreshTasks() {
  const courseElements = document.querySelectorAll('.my-course-lists li')

  for (const courseElement of courseElements) {
    const courseLinkElement = courseElement.querySelector('.course-link')
    if (!(courseLinkElement instanceof HTMLAnchorElement)) continue

    const courseUrl = courseLinkElement.href
    const tasks = await fetchCourseTasks(courseUrl)
    if (tasks.length === 0) continue

    const tasksElement = document.createElement('ul')
    tasksElement.classList.add('yontil-tasks')
    tasksElement.append(...tasks)
    courseElement.append(tasksElement)
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
