import HideTaskElement from '../../core/tasks/hide-task-element'
import {
  getHiddenTaskIds,
  setHiddenTaskIds,
} from '../../core/tasks/tasks-repository'
import { TabMessage } from '../../utils/tab-message'

async function main() {
  const hiddenTaskIds = await getHiddenTaskIds()
  initializeHiddenTasks(hiddenTaskIds)
}

async function initializeHiddenTasks(hiddenTaskIds: string[]) {
  HideTaskElement.removeAllHideTaskButtons()

  for (const hiddenTaskId of hiddenTaskIds) {
    const taskElement = document.getElementById(hiddenTaskId)
    if (!taskElement) continue

    HideTaskElement.insertHideTaskButton({
      taskElement,
      isHiddenTask: true,
      onButtonClick: handleUnhideTask,
    })
  }
}

async function handleUnhideTask(taskId: string) {
  const hiddenTaskIds = await getHiddenTaskIds()
  await setHiddenTaskIds(hiddenTaskIds.filter((id) => id !== taskId))
}

chrome.runtime.onMessage.addListener((message: TabMessage) => {
  switch (message.type) {
    case 'hidden-task-ids-updated':
      initializeHiddenTasks(message.hiddenTaskIds)
      break
  }
})

main()
