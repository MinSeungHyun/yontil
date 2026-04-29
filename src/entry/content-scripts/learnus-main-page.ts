import LearnusMainPageActionsElement from '../../core/learnus-main-page-actions-element'
import fetchTasks, { TasksCourse } from '../../core/tasks/fetch-tasks'
import TasksListElement from '../../core/tasks/tasks-list-element'
import TasksRefreshElement from '../../core/tasks/tasks-refresh-element'
import {
  getCoursesData,
  getHiddenTaskIds,
  getIsTasksEnabled,
  getTasksInitialState,
  setCoursesData,
  setHiddenTaskIds,
  setIsTasksEnabled,
  setIsTasksRefreshing,
} from '../../core/tasks/tasks-repository'
import { TabMessage } from '../../utils/tab-message'

const TASKS_REFRESH_INTERVAL = 1000 * 60 * 60 // 1 hour

async function main() {
  const isInCoursesPage = document.querySelector('.my-course-lists')
  if (!isInCoursesPage) return

  const isTasksEnabled = await getIsTasksEnabled()

  LearnusMainPageActionsElement.initialize({
    isTasksEnabled,
    onTasksSwitchClick: handleTasksSwitchClick,
  })

  if (isTasksEnabled) {
    initializeTasks()
  }
}

async function initializeTasks() {
  const { isTasksRefreshing, courses, coursesLastUpdated, hiddenTaskIds } =
    await getTasksInitialState()

  TasksRefreshElement.initialize({
    isRefreshing: isTasksRefreshing,
    lastUpdated: coursesLastUpdated,
    onRefresh: refreshTasks,
  })

  if (courses) {
    TasksListElement.showTasks({
      courses,
      hiddenTaskIds,
      onHideTask: handleHideTask,
    })
  }

  const isTasksNeedRefresh =
    !coursesLastUpdated ||
    Date.now() - coursesLastUpdated > TASKS_REFRESH_INTERVAL
  if (isTasksNeedRefresh) {
    await refreshTasks()
  }
}

function disposeTasks() {
  TasksRefreshElement.dispose()
  TasksListElement.dispose()
}

chrome.runtime.onMessage.addListener(async (message: TabMessage) => {
  switch (message.type) {
    case 'tasks-enabled-updated':
      LearnusMainPageActionsElement.updateTasksSwitch({
        isTasksEnabled: message.isTasksEnabled,
      })

      if (message.isTasksEnabled) {
        initializeTasks()
      } else {
        disposeTasks()
      }
      break

    case 'tasks-refreshing-updated':
      TasksRefreshElement.update({ isRefreshing: message.isRefreshing })
      break

    case 'courses-data-updated':
      if (message.courses) {
        const hiddenTaskIds = await getHiddenTaskIds()

        TasksListElement.showTasks({
          courses: message.courses,
          hiddenTaskIds,
          onHideTask: handleHideTask,
        })
      }
      if (message.lastUpdated) {
        TasksRefreshElement.update({
          isRefreshing: false,
          lastUpdated: message.lastUpdated,
        })
      }
      break

    case 'hidden-task-ids-updated':
      const { coursesData } = await getCoursesData()
      if (!coursesData) break

      TasksListElement.showTasks({
        courses: coursesData,
        hiddenTaskIds: message.hiddenTaskIds,
        onHideTask: handleHideTask,
      })
      break
  }
})

async function handleTasksSwitchClick(isEnabled: boolean) {
  await setIsTasksEnabled(!isEnabled)
}

let isTasksRefreshingInThisTab = false

window.addEventListener('beforeunload', async () => {
  if (isTasksRefreshingInThisTab) {
    await setIsTasksRefreshing(false)
  }
})

async function refreshTasks() {
  isTasksRefreshingInThisTab = true
  await setIsTasksRefreshing(true)

  try {
    const tasksCourses: TasksCourse[] = await fetchTasks()

    await setCoursesData(
      tasksCourses.map((tasksCourse) => ({
        courseUrl: tasksCourse.url,
        tasks: tasksCourse.taskElements.map((task) => task.outerHTML),
      }))
    )
  } catch (e) {
    console.log(`[${new Date().toISOString()}] Failed to fetch tasks:`, e)
  }

  await setIsTasksRefreshing(false)
  isTasksRefreshingInThisTab = false
}

async function handleHideTask(taskId: string) {
  const hiddenTaskIds = await getHiddenTaskIds()
  if (hiddenTaskIds.includes(taskId)) return

  await setHiddenTaskIds([...hiddenTaskIds, taskId])
}

main()
