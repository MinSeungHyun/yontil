export default class TasksSwitchElement {
  private static readonly switchClassName = 'yontil-tasks-switch'
  private static _isEnabled: boolean = false

  static get isEnabled(): boolean {
    return this._isEnabled
  }

  private static set isEnabled(isEnabled: boolean) {
    this._isEnabled = isEnabled
  }

  private constructor() {}

  static initialize({
    isEnabled,
    onClick,
  }: {
    isEnabled: boolean
    onClick: (isEnabled: boolean) => void
  }) {
    this._isEnabled = isEnabled

    this.moveActionElement()
    this.addSwitch({ onClick })
    this.updateSwitch({ isEnabled })
  }

  private static moveActionElement() {
    const actionElement = document.querySelector(
      '.front-box.front-box-course .action'
    )
    if (!actionElement) return

    document.querySelector('.front-box.front-box-course')?.append(actionElement)
  }

  private static addSwitch({
    onClick,
  }: {
    onClick: (isEnabled: boolean) => void
  }) {
    const switchElement = document.createElement('span')
    switchElement.classList.add(this.switchClassName)
    switchElement.addEventListener('click', () => onClick(this.isEnabled))
    document
      .querySelector('.front-box.front-box-course .front-box-header')
      ?.append(switchElement)
  }

  static updateSwitch({ isEnabled }: { isEnabled: boolean }) {
    this.isEnabled = isEnabled

    const switchElement = document.querySelector(`.${this.switchClassName}`)
    if (!switchElement) return

    if (isEnabled) {
      switchElement.innerHTML = '할 일 목록 끄기'
    } else {
      switchElement.innerHTML = '할 일 목록 켜기'
    }
  }
}
