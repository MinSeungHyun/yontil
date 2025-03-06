import {
  getCoursesDataLastUpdated,
  setCoursesData,
  setCoursesDataLastUpdated,
} from '../../core/tasks/course-data-repository'
import fetchTasks, { TasksCourse } from '../../core/tasks/fetch-tasks'
import TasksListElement from '../../core/tasks/tasks-list-element'
import TasksRefreshElement from '../../core/tasks/tasks-refresh-element'
import {
  getTasksEnabled,
  setTasksEnabled,
} from '../../core/tasks/tasks-setting-repository'
import TasksSwitchElement from '../../core/tasks/tasks-switch-element'

const TASKS_REFRESH_INTERVAL = 1000 * 60 * 60 // 1 hour

let isTasksRefreshing = false

async function main() {
  TasksListElement.showCachedTasks()

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
  if (isTasksRefreshing) return
  isTasksRefreshing = true
  await TasksRefreshElement.update({ isRefreshing: true })

  const tasksCourses: TasksCourse[] = await fetchTasks()

  for (const tasksCourse of tasksCourses) {
    TasksListElement.showTasks(tasksCourse.element, tasksCourse.taskElements)
  }

  await setCoursesData(
    tasksCourses.map((tasksCourse) => ({
      courseUrl: tasksCourse.url,
      tasks: tasksCourse.taskElements.map((task) => task.outerHTML),
    }))
  )

  await setCoursesDataLastUpdated()

  await TasksRefreshElement.update({ isRefreshing: false })
  isTasksRefreshing = false
}

main()
