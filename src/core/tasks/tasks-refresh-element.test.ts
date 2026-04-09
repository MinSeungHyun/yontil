import TasksRefreshElement, { formatElapsedTime } from './tasks-refresh-element'

describe('TasksRefreshElement', () => {
  const originalDocument = global.document
  afterEach(() => {
    global.document = originalDocument
    jest.restoreAllMocks()
  })

  it('shows loading text while refreshing', () => {
    const labelElement = { innerHTML: '', title: '' }

    global.document = {
      querySelector: jest.fn((selector: string) => {
        if (selector === '.yontil-tasks-refresh-status-label') {
          return labelElement
        }
        return null
      }),
    } as unknown as Document

    TasksRefreshElement.update({ isRefreshing: true })

    expect(labelElement.innerHTML).toBe('할 일 불러오는 중...')
  })

  it('shows last updated label after refreshing', () => {
    const labelElement = { innerHTML: '', title: '' }

    global.document = {
      querySelector: jest.fn((selector: string) => {
        if (selector === '.yontil-tasks-refresh-status-label') {
          return labelElement
        }
        return null
      }),
    } as unknown as Document

    jest.spyOn(Date, 'now').mockReturnValue(10_000)

    TasksRefreshElement.update({ isRefreshing: false, lastUpdated: 10_000 })

    expect(labelElement.innerHTML).toBe('마지막 업데이트: 0초 전')
  })
})

describe('formatElapsedTime', () => {
  it('formats elapsed time in seconds', () => {
    expect(formatElapsedTime(9_000, 10_000)).toBe('1초 전')
    expect(formatElapsedTime(10_000, 10_000)).toBe('0초 전')
  })

  it('formats elapsed time in minutes, hours, and days', () => {
    expect(formatElapsedTime(0, 60_000)).toBe('1분 전')
    expect(formatElapsedTime(0, 60 * 60 * 1000)).toBe('1시간 전')
    expect(formatElapsedTime(0, 24 * 60 * 60 * 1000)).toBe('1일 전')
  })
})
