import HideTaskElement from '../../core/tasks/hide-task-element'
import {
  getHiddenTaskIds,
  setHiddenTaskIds,
} from '../../core/tasks/tasks-repository'

async function main() {
  const hiddenTaskIds = await getHiddenTaskIds()

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

main()
