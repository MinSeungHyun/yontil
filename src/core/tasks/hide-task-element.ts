export default class HideTaskElement {
  private static readonly hideTaskButtonClassName = 'yontil-hide-task-button'

  private constructor() {}

  static insertHideTaskButton({
    taskElement,
    isHiddenTask = false,
    onButtonClick,
  }: {
    taskElement: Element
    isHiddenTask?: boolean
    onButtonClick: (taskId: string) => void
  }) {
    const taskId = taskElement.id
    if (!taskId || !taskId.startsWith('module-')) return

    const hideTaskButton = document.createElement('span')
    hideTaskButton.classList.add(this.hideTaskButtonClassName)
    hideTaskButton.innerHTML = isHiddenTask ? '숨김 해제' : '숨기기'
    hideTaskButton.addEventListener('click', () => {
      const confirmMessage = isHiddenTask
        ? '이 할 일을 홈에서 다시 보이게 할까요?'
        : '이 할 일을 숨길까요?\n강좌 페이지에서는 숨겨지지 않아요.'
      if (confirm(confirmMessage)) {
        onButtonClick(taskId)
      }
    })

    taskElement.querySelector('.actions')?.prepend(hideTaskButton)
  }

  static removeAllHideTaskButtons() {
    const hideTaskButtons = document.getElementsByClassName(
      this.hideTaskButtonClassName
    )
    for (const hideTaskButton of hideTaskButtons) {
      hideTaskButton.remove()
    }
  }
}
