const IS_TASKS_ENABLED_KEY = 'isTasksEnabled'
const IS_TASKS_ENABLED_DEFAULT = true

interface IsTasksEnabled {
  [IS_TASKS_ENABLED_KEY]: boolean | undefined
}

export async function getIsTasksEnabled(): Promise<boolean> {
  const { isTasksEnabled } =
    await chrome.storage.local.get<IsTasksEnabled>(IS_TASKS_ENABLED_KEY)
  return isTasksEnabled ?? IS_TASKS_ENABLED_DEFAULT
}

export async function setIsTasksEnabled(enabled: boolean): Promise<void> {
  await chrome.storage.local.set<IsTasksEnabled>({
    [IS_TASKS_ENABLED_KEY]: enabled,
  })
}

export const IS_TASKS_REFRESHING_KEY = 'isTasksRefreshing'
const IS_TASKS_REFRESHING_DEFAULT = false

interface IsTasksRefreshing {
  [IS_TASKS_REFRESHING_KEY]: boolean | undefined
}

export async function setTasksRefreshingStarted(): Promise<void> {
  await chrome.storage.local.set<IsTasksRefreshing>({
    [IS_TASKS_REFRESHING_KEY]: true,
  })
}

export async function getIsTasksRefreshing(): Promise<boolean> {
  const { isTasksRefreshing } =
    await chrome.storage.local.get<IsTasksRefreshing>(IS_TASKS_REFRESHING_KEY)
  return isTasksRefreshing ?? IS_TASKS_REFRESHING_DEFAULT
}

export const COURSES_DATA_KEY = 'coursesData'
export const COURSES_DATA_LAST_UPDATED_KEY = 'coursesDataLastUpdated'

export interface Course {
  courseUrl: string
  tasks: string[]
}

export interface CoursesData {
  [COURSES_DATA_KEY]: Course[] | undefined
  [COURSES_DATA_LAST_UPDATED_KEY]: number | undefined
}

export async function setCoursesData(courses: Course[]): Promise<void> {
  await chrome.storage.local.set<IsTasksRefreshing & CoursesData>({
    [IS_TASKS_REFRESHING_KEY]: false,
    [COURSES_DATA_KEY]: courses,
    [COURSES_DATA_LAST_UPDATED_KEY]: Date.now(),
  })
}

export async function getCoursesData(): Promise<CoursesData> {
  return await chrome.storage.local.get<CoursesData>([
    COURSES_DATA_KEY,
    COURSES_DATA_LAST_UPDATED_KEY,
  ])
}

interface TasksInitialState {
  isTasksEnabled: boolean
  isTasksRefreshing: boolean
  courses: Course[] | undefined
  coursesLastUpdated: number | undefined
}

export async function getTasksInitialState(): Promise<TasksInitialState> {
  const state = await chrome.storage.local.get<
    IsTasksEnabled & IsTasksRefreshing & CoursesData
  >([
    IS_TASKS_ENABLED_KEY,
    IS_TASKS_REFRESHING_KEY,
    COURSES_DATA_KEY,
    COURSES_DATA_LAST_UPDATED_KEY,
  ])

  return {
    isTasksEnabled: state[IS_TASKS_ENABLED_KEY] ?? IS_TASKS_ENABLED_DEFAULT,
    isTasksRefreshing:
      state[IS_TASKS_REFRESHING_KEY] ?? IS_TASKS_REFRESHING_DEFAULT,
    courses: state[COURSES_DATA_KEY],
    coursesLastUpdated: state[COURSES_DATA_LAST_UPDATED_KEY],
  }
}
