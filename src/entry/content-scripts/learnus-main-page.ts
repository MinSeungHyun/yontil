import fetchTasks, { TasksCourse } from '../../core/tasks/fetch-tasks'
import TasksListElement from '../../core/tasks/tasks-list-element'
import TasksRefreshElement from '../../core/tasks/tasks-refresh-element'
import {
  getIsTasksEnabled,
  getIsTasksRefreshing,
  getTasksInitialState,
  setCoursesData,
  setIsTasksEnabled,
  setTasksRefreshingStarted,
} from '../../core/tasks/tasks-repository'
import TasksSwitchElement from '../../core/tasks/tasks-switch-element'
import { TabMessage } from '../../utils/tab-message'

const TASKS_REFRESH_INTERVAL = 1000 * 60 * 60 // 1 hour

async function main() {
  const isInCoursesPage = document.querySelector('.my-course-lists')
  if (!isInCoursesPage) return

  const isTasksEnabled = await getIsTasksEnabled()

  TasksSwitchElement.initialize({
    isEnabled: isTasksEnabled,
    onClick: handleTasksSwitchClick,
  })

  if (isTasksEnabled) {
    initializeTasks()
  }
}

async function initializeTasks() {
  const { isTasksRefreshing, courses, coursesLastUpdated } =
    await getTasksInitialState()

  TasksRefreshElement.initialize({
    isRefreshing: isTasksRefreshing,
    lastUpdated: coursesLastUpdated,
    onRefresh: refreshTasks,
  })

  if (courses) {
    TasksListElement.showTasks(courses)
  }

  const isTasksNeedRefresh =
    !coursesLastUpdated ||
    Date.now() - coursesLastUpdated > TASKS_REFRESH_INTERVAL
  if (!isTasksRefreshing && isTasksNeedRefresh) {
    await refreshTasks()
  }
}

function disposeTasks() {
  TasksRefreshElement.dispose()
  TasksListElement.dispose()
}

chrome.runtime.onMessage.addListener((message: TabMessage) => {
  switch (message.type) {
    case 'tasks-enabled-updated':
      TasksSwitchElement.updateSwitch({ isEnabled: message.isTasksEnabled })

      if (message.isTasksEnabled) {
        initializeTasks()
      } else {
        disposeTasks()
      }
      break

    case 'tasks-refreshing-started':
      TasksRefreshElement.update({ isRefreshing: true })
      break

    case 'courses-data-updated':
      if (message.courses) {
        TasksListElement.showTasks(message.courses)
      }
      if (message.lastUpdated) {
        TasksRefreshElement.update({
          isRefreshing: false,
          lastUpdated: message.lastUpdated,
        })
      }
      break
  }
})

async function handleTasksSwitchClick(isEnabled: boolean) {
  await setIsTasksEnabled(!isEnabled)
}

async function refreshTasks() {
  if (await getIsTasksRefreshing()) return
  await setTasksRefreshingStarted()

  const tasksCourses: TasksCourse[] = await fetchTasks()

  await setCoursesData(
    tasksCourses.map((tasksCourse) => ({
      courseUrl: tasksCourse.url,
      tasks: tasksCourse.taskElements.map((task) => task.outerHTML),
    }))
  )
}

main()
