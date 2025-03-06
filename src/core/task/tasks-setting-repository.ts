const TASKS_ENABLED_KEY = 'tasksEnabled'
const TASKS_ENABLED_DEFAULT = true

interface TasksEnabled {
  [TASKS_ENABLED_KEY]: boolean | undefined
}

export async function getTasksEnabled(): Promise<boolean> {
  const { tasksEnabled } =
    await chrome.storage.local.get<TasksEnabled>(TASKS_ENABLED_KEY)
  return tasksEnabled ?? TASKS_ENABLED_DEFAULT
}

export async function setTasksEnabled(enabled: boolean): Promise<void> {
  await chrome.storage.local.set<TasksEnabled>({
    [TASKS_ENABLED_KEY]: enabled,
  })
}
