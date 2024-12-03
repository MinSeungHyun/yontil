const COURSES_DATA_KEY = 'coursesData'

export interface CoursesData {
  [COURSES_DATA_KEY]: Course[] | undefined
}

export interface Course {
  courseUrl: string
  tasks: string[]
}

export async function saveCoursesData(courses: Course[]): Promise<void> {
  await chrome.storage.local.set<CoursesData>({ [COURSES_DATA_KEY]: courses })
}

export async function getCoursesData(): Promise<Course[] | null> {
  const { coursesData } =
    await chrome.storage.local.get<CoursesData>(COURSES_DATA_KEY)
  return coursesData ?? null
}
