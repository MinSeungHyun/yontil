import { jsbn, pki } from 'node-forge'
import { parseInputTagsFromHtml } from '../../utils/parse-html-string'
import { INFRA_ORIGIN, LEARNUS_ORIGIN } from '../constants'

export default async function loginLearnUs(
  id: string,
  password: string
): Promise<void> {
  const data1 = await fetch1()
  const data2 = await fetch2(data1)
  const data4 = await fetch3(data2, id, password)
  await fetch4(data4)
  await fetch5()
}

/**
 * Note: This function relies on Chrome extension's declarative net request rules
 * defined in file://./../../../public/declarative_net_request_rules_1.json which:
 * - Matches requests to this exact endpoint (ys.learnus.org/passni/sso/spLogin2.php)
 * - Sets the Referer header to "https://ys.learnus.org" for authentication validation
 */
async function fetch1() {
  const response = await fetch(`${LEARNUS_ORIGIN}/passni/sso/spLogin2.php`, {
    signal: AbortSignal.timeout(5000),
  })

  return parseInputTagsFromHtml(await response.text())
}

async function fetch2(data1: Record<string, string>) {
  const response = await fetch(`${INFRA_ORIGIN}/sso/PmSSOService`, {
    method: 'POST',
    body: new URLSearchParams({
      app_id: 'ednetYonsei',
      retUrl: 'https://ys.learnus.org',
      failUrl: 'https://ys.learnus.org',
      baseUrl: 'https://ys.learnus.org',
      S1: data1['S1'],
      refererUrl: 'https://ys.learnus.org',
    }),
    signal: AbortSignal.timeout(5000),
  })

  const html = await response.text()

  const ssoChallenge = html.match(/var ssoChallenge\s*=\s*'([^']+)'/)?.[1] || ''
  const keyModulusMatch = html.match(
    /rsa\.setPublic\(\s*'([^']+)',\s*'([^']+)'/i
  )
  const keyModulus = keyModulusMatch?.[1] || ''
  const keyExponent = keyModulusMatch?.[2] || ''

  return {
    ssoChallenge,
    keyModulus,
    keyExponent,
  }
}

async function fetch3(
  data2: Record<string, string>,
  username: string,
  password: string
) {
  const E2Bytes = pki.rsa
    .setPublicKey(
      new jsbn.BigInteger(data2['keyModulus'], 16),
      new jsbn.BigInteger(data2['keyExponent'], 16)
    )
    .encrypt(
      JSON.stringify({
        userid: username,
        userpw: password,
        ssoChallenge: data2['ssoChallenge'],
      })
    )
  const E2 = stringToHex(E2Bytes)

  const response = await fetch(`${INFRA_ORIGIN}/sso/PmSSOAuthService`, {
    method: 'POST',
    body: new URLSearchParams({
      app_id: 'ednetYonsei',
      retUrl: 'https://ys.learnus.org',
      failUrl: 'https://ys.learnus.org',
      baseUrl: 'https://ys.learnus.org',
      loginType: 'invokeID',
      E2,
      refererUrl: 'https://ys.learnus.org',
    }),
    signal: AbortSignal.timeout(5000),
  })

  return parseInputTagsFromHtml(await response.text())
}

async function fetch4(data4: Record<string, string>) {
  await fetch(`${LEARNUS_ORIGIN}/passni/sso/spLoginData.php`, {
    method: 'POST',
    body: new URLSearchParams({
      app_id: 'ednetYonsei',
      retUrl: 'https://ys.learnus.org',
      failUrl: 'https://ys.learnus.org',
      baseUrl: 'https://ys.learnus.org',
      E3: data4['E3'],
      E4: data4['E4'],
      S2: data4['S2'],
      CLTID: data4['CLTID'],
      refererUrl: 'https://ys.learnus.org',
    }),
    signal: AbortSignal.timeout(5000),
  })
}

async function fetch5() {
  await fetch(`${LEARNUS_ORIGIN}/passni/spLoginProcess.php`, {
    signal: AbortSignal.timeout(5000),
  })
}

function stringToHex(raw: string) {
  let result = ''
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16)
    result += hex.length === 2 ? hex : '0' + hex
  }
  return result.toUpperCase()
}
