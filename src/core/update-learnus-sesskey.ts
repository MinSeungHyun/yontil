import { LEARNUS_ORIGIN } from './constants'

export default async function updateLearnUsSesskey() {
  const response = await fetch(LEARNUS_ORIGIN)
  const text = await response.text()

  const sesskey = text.match(/sesskey":"([^"]+)/)?.[1]
  if (!sesskey) return
}
