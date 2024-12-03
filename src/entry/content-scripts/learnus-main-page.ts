refreshTasks()

async function refreshTasks() {
  const courseElements = document.querySelectorAll('.my-course-lists li')

  const courses: {
    element: Element
    tasks: Element[]
  }[] = []

  for (const courseElement of courseElements) {
    const courseLinkElement = courseElement.querySelector('.course-link')
    if (!(courseLinkElement instanceof HTMLAnchorElement)) continue

    const tasks = await fetchCourseTasks(courseLinkElement.href)
    courses.push({ element: courseElement, tasks })
  }

  for (const course of courses) {
    showTasks(course.element, course.tasks)
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

function showTasks(courseElement: Element, tasks: Element[]) {
  const tasksElement = document.createElement('ul')
  tasksElement.classList.add('yontil-tasks')
  tasksElement.append(...tasks)
  courseElement.append(tasksElement)
}
