import { sendMessageToTabs } from '../../utils/tab-message'
import { LEARNUS_ORIGIN, LEARNUS_URL_PATTERN } from '../constants'

export default async function updateLearnUsSesskey() {
  const tabs = await chrome.tabs.query({ url: [LEARNUS_URL_PATTERN] })
  const tabIds = tabs.map((tab) => tab.id).filter((id) => id !== undefined)

  if (tabIds.length === 0) return

  const response = await fetch(LEARNUS_ORIGIN, {
    signal: AbortSignal.timeout(5000),
  })
  const text = await response.text()

  const sesskey = text.match(/sesskey":"([^"]+)/)?.[1]
  if (!sesskey) return

  await sendMessageToTabs(tabIds, {
    type: 'update-learnus-sesskey',
    sesskey,
  })
}
