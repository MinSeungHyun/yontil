import { Course } from './tasks-repository'

export default class TasksListElement {
  private static readonly tasksClassName = 'yontil-tasks'

  private constructor() {}

  static showTasks(courses: Course[]) {
    const courseElements = document.querySelectorAll('.my-course-lists li')

    for (const courseElement of courseElements) {
      const courseLinkElement = courseElement.querySelector('.course-link')
      if (!(courseLinkElement instanceof HTMLAnchorElement)) continue

      const courseUrl = courseLinkElement.href
      const course = courses.find((course) => course.courseUrl === courseUrl)
      if (!course) continue

      this.showHtmlTasks(courseElement, course.tasks)
    }
  }

  private static showHtmlTasks(courseElement: Element, tasks: string[]) {
    let existingTasksElement = courseElement.querySelector(
      `.${this.tasksClassName}`
    )

    if (tasks.length === 0) {
      existingTasksElement?.remove()
      return
    }

    if (existingTasksElement) {
      existingTasksElement.innerHTML = tasks.join('')
      return
    }

    const newTasksElement = document.createElement('ul')
    newTasksElement.classList.add(this.tasksClassName)
    newTasksElement.innerHTML = tasks.join('')

    courseElement.append(newTasksElement)
  }
}
