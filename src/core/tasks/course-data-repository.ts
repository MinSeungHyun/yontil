export const COURSES_DATA_KEY = 'coursesData'
export const COURSES_DATA_LAST_UPDATED_KEY = 'coursesDataLastUpdated'
export const IS_TASKS_REFRESHING_KEY = 'isTasksRefreshing'

export interface Course {
  courseUrl: string
  tasks: string[]
}

export interface CoursesData {
  [COURSES_DATA_KEY]: Course[] | undefined
  [COURSES_DATA_LAST_UPDATED_KEY]: number | undefined
}

interface IsTasksRefreshing {
  [IS_TASKS_REFRESHING_KEY]: boolean | undefined
}

export async function setCoursesData(courses: Course[]): Promise<void> {
  await chrome.storage.local.set<CoursesData & IsTasksRefreshing>({
    [COURSES_DATA_KEY]: courses,
    [COURSES_DATA_LAST_UPDATED_KEY]: Date.now(),
    [IS_TASKS_REFRESHING_KEY]: false,
  })
}

export async function getCoursesData(): Promise<CoursesData> {
  return await chrome.storage.local.get<CoursesData>([
    COURSES_DATA_KEY,
    COURSES_DATA_LAST_UPDATED_KEY,
  ])
}

export async function setTasksRefreshingStarted(): Promise<void> {
  await chrome.storage.local.set<IsTasksRefreshing>({
    [IS_TASKS_REFRESHING_KEY]: true,
  })
}

export async function getIsTasksRefreshing(): Promise<boolean> {
  const { isTasksRefreshing } =
    await chrome.storage.local.get<IsTasksRefreshing>(IS_TASKS_REFRESHING_KEY)
  return isTasksRefreshing ?? false
}
