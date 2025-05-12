export default class LearnusMainPageActionsElement {
  private static readonly tasksSwitchClassName = 'yontil-tasks-switch'
  private static isTasksEnabled: boolean = false

  private constructor() {}

  static initialize({
    isTasksEnabled,
    onTasksSwitchClick,
  }: {
    isTasksEnabled: boolean
    onTasksSwitchClick: (isTasksEnabled: boolean) => void
  }) {
    this.isTasksEnabled = isTasksEnabled

    this.movePreviousActionElement()
    this.addTasksSwitch({ onTasksSwitchClick })
    this.updateTasksSwitch({ isTasksEnabled })
  }

  private static movePreviousActionElement() {
    const actionElement = document.querySelector(
      '.front-box.front-box-course .action'
    )
    if (!actionElement) return

    document.querySelector('.front-box.front-box-course')?.append(actionElement)
  }

  private static addTasksSwitch({
    onTasksSwitchClick,
  }: {
    onTasksSwitchClick: (isTasksEnabled: boolean) => void
  }) {
    const switchElement = document.createElement('span')
    switchElement.classList.add(this.tasksSwitchClassName)
    switchElement.addEventListener('click', () =>
      onTasksSwitchClick(this.isTasksEnabled)
    )
    document
      .querySelector('.front-box.front-box-course .front-box-header')
      ?.append(switchElement)
  }

  static updateTasksSwitch({ isTasksEnabled }: { isTasksEnabled: boolean }) {
    this.isTasksEnabled = isTasksEnabled

    const switchElement = document.querySelector(
      `.${this.tasksSwitchClassName}`
    )
    if (!switchElement) return

    if (isTasksEnabled) {
      switchElement.innerHTML = '할 일 목록 끄기'
    } else {
      switchElement.innerHTML = '할 일 목록 켜기'
    }
  }
}
