import HideTaskElement from './hide-task-element'
import { Course } from './tasks-repository'

export default class TasksListElement {
  private static readonly tasksClassName = 'yontil-tasks'

  private constructor() {}

  static showTasks({
    courses,
    hiddenTaskIds,
    onHideTask,
  }: {
    courses: Course[]
    hiddenTaskIds: string[]
    onHideTask: (taskId: string) => void
  }) {
    const courseElements = document.querySelectorAll('.my-course-lists li')

    for (const courseElement of courseElements) {
      const courseLinkElement = courseElement.querySelector('.course-link')
      if (!(courseLinkElement instanceof HTMLAnchorElement)) continue

      const courseUrl = courseLinkElement.href
      const course = courses.find((course) => course.courseUrl === courseUrl)
      if (!course) continue

      this.showHtmlTasks(courseElement, course.tasks, hiddenTaskIds, onHideTask)
    }
  }

  private static showHtmlTasks(
    courseElement: Element,
    tasks: string[],
    hiddenTaskIds: string[],
    onHideTask: (taskId: string) => void
  ) {
    let tasksElement = courseElement.querySelector(`.${this.tasksClassName}`)

    if (tasks.length === 0) {
      tasksElement?.remove()
      return
    }

    if (!tasksElement) {
      tasksElement = document.createElement('ul')
      tasksElement.classList.add(this.tasksClassName)
      courseElement.append(tasksElement)
    }

    const taskElements: Element[] = []

    for (const task of tasks) {
      const taskTemplateElement = document.createElement('template')
      taskTemplateElement.innerHTML = task
      const taskElement = taskTemplateElement.content.children[0]

      if (hiddenTaskIds.includes(taskElement.id)) continue

      taskElements.push(taskElement)
    }

    tasksElement.replaceChildren(...taskElements)

    for (const taskElement of tasksElement.children) {
      HideTaskElement.insertHideTaskButton({
        taskElement,
        onButtonClick: onHideTask,
      })
    }
  }

  static dispose() {
    document.querySelectorAll(`.${this.tasksClassName}`).forEach((element) => {
      element.remove()
    })
  }
}
