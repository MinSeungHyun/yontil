import fetchTasks from './fetch-tasks'

describe('fetchTasks', () => {
  const originalDocument = global.document
  const originalFetch = global.fetch
  const originalDomParser = global.DOMParser
  const originalHtmlAnchorElement = global.HTMLAnchorElement

  afterEach(() => {
    global.document = originalDocument
    global.fetch = originalFetch
    global.DOMParser = originalDomParser
    global.HTMLAnchorElement = originalHtmlAnchorElement
    jest.restoreAllMocks()
  })

  it('collects incomplete visible tasks without relying on :has selectors', async () => {
    class FakeAnchorElement {}
    global.HTMLAnchorElement =
      FakeAnchorElement as unknown as typeof HTMLAnchorElement

    const courseLinkElement = Object.assign(new FakeAnchorElement(), {
      href: 'https://ys.learnus.org/course/view.php?id=1',
    })
    const courseElement = {
      querySelector: jest.fn((selector: string) => {
        if (selector === '.course-link') return courseLinkElement
        return null
      }),
    }

    const visibleIncompleteTask = {
      querySelector: jest.fn((selector: string) => {
        if (selector === 'img[src$="completion-auto-n"]') return {}
        if (selector === '.isrestricted') return null
        return null
      }),
    }
    const restrictedIncompleteTask = {
      querySelector: jest.fn((selector: string) => {
        if (selector === 'img[src$="completion-auto-n"]') return {}
        if (selector === '.isrestricted') return {}
        return null
      }),
    }
    const completedTask = {
      querySelector: jest.fn((selector: string) => {
        if (selector === 'img[src$="completion-auto-n"]') return null
        if (selector === '.isrestricted') return null
        return null
      }),
    }

    global.document = {
      querySelectorAll: jest.fn((selector: string) => {
        if (selector === '.my-course-lists li') return [courseElement]
        return []
      }),
    } as unknown as Document

    global.fetch = jest.fn().mockResolvedValue({
      text: jest.fn().mockResolvedValue('<html></html>'),
    } as never)

    const parsedDocument = {
      querySelectorAll: jest.fn((selector: string) => {
        if (selector === '.course-box-top .activity, .total-sections .activity')
          return [
            visibleIncompleteTask,
            restrictedIncompleteTask,
            completedTask,
          ]
        throw new Error(`Unsupported selector: ${selector}`)
      }),
    }

    global.DOMParser = jest.fn().mockImplementation(() => ({
      parseFromString: jest.fn().mockReturnValue(parsedDocument),
    })) as unknown as typeof DOMParser

    await expect(fetchTasks()).resolves.toEqual([
      {
        url: 'https://ys.learnus.org/course/view.php?id=1',
        element: courseElement,
        taskElements: [visibleIncompleteTask],
      },
    ])
  })
})
