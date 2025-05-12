export default class LearnusMainPageActionsElement {
  private static readonly actionsContainerClassName =
    'yontil-learnus-main-page-actions-container'
  private static readonly tasksSwitchClassName = 'yontil-tasks-switch'
  private static readonly reorderCoursesButtonClassName =
    'yontil-reorder-courses-button'
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
    this.addActionsContainer()
    this.addTasksSwitch({ onTasksSwitchClick })
    this.updateTasksSwitch({ isTasksEnabled })
    this.addReorderCoursesButton()
  }

  private static movePreviousActionElement() {
    const actionElement = document.querySelector(
      '.front-box.front-box-course .action'
    )
    if (!actionElement) return

    document.querySelector('.front-box.front-box-course')?.append(actionElement)
  }

  private static addActionsContainer() {
    const actionsContainer = document.createElement('div')
    actionsContainer.classList.add(this.actionsContainerClassName)
    document
      .querySelector('.front-box.front-box-course .front-box-header')
      ?.append(actionsContainer)
  }

  private static addTasksSwitch({
    onTasksSwitchClick,
  }: {
    onTasksSwitchClick: (isTasksEnabled: boolean) => void
  }) {
    const switchElement = document.createElement('button')
    switchElement.classList.add(this.tasksSwitchClassName)
    switchElement.addEventListener('click', () =>
      onTasksSwitchClick(this.isTasksEnabled)
    )
    document
      .querySelector(`.${this.actionsContainerClassName}`)
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

  private static addReorderCoursesButton() {
    const reorderCoursesButton = document.createElement('a')
    reorderCoursesButton.innerHTML = '강좌 순서 변경'
    reorderCoursesButton.href = '/local/ubion/user/mycourse_setting.php'
    reorderCoursesButton.classList.add(this.reorderCoursesButtonClassName)
    document
      .querySelector(`.${this.actionsContainerClassName}`)
      ?.append(reorderCoursesButton)
  }
}
