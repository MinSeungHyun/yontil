export default class HideTaskElement {
  private static readonly hideTaskButtonClassName = 'yontil-hide-task-button'

  private constructor() {}

  static insertHideTaskButton({
    taskElement,
    onHideTask,
  }: {
    taskElement: Element
    onHideTask: (taskId: string) => void
  }) {
    const taskId = taskElement.id
    if (!taskId || !taskId.startsWith('module-')) return

    const hideTaskButton = document.createElement('span')
    hideTaskButton.classList.add(this.hideTaskButtonClassName)
    hideTaskButton.innerHTML = '숨기기'
    hideTaskButton.addEventListener('click', () => {
      if (confirm('이 할 일을 숨길까요?\n강좌 페이지에서는 숨겨지지 않아요.')) {
        onHideTask(taskId)
      }
    })

    taskElement.querySelector('.actions')?.prepend(hideTaskButton)
  }
}
