import { jsbn, pki } from 'node-forge'
import { parseInputTagsFromHtml } from '../utils/parse-html-string'
import { INFRA_ORIGIN, LEARNUS_ORIGIN } from './constants'

export default async function loginLearnUs(
  id: string,
  password: string
): Promise<void> {
  const data1 = await fetch1(id, password)
  const data2 = await fetch2(data1, id, password)
  const data3 = await fetch3(data2, id, password)
  const data4 = await fetch4(data2, data3, id, password)
  await fetch5(data4, id, password)
  await fetch6()
}

async function fetch1(username: string, password: string) {
  const response = await fetch(
    `${LEARNUS_ORIGIN}/passni/sso/coursemosLogin.php`,
    {
      method: 'POST',
      body: new URLSearchParams({
        ssoGubun: 'Login',
        logintype: 'sso',
        type: 'popup_login',
        username,
        password,
      }),
    }
  )

  return parseInputTagsFromHtml(await response.text())
}

async function fetch2(
  data1: Record<string, string>,
  username: string,
  password: string
) {
  const response = await fetch(`${INFRA_ORIGIN}/sso/PmSSOService`, {
    method: 'POST',
    body: new URLSearchParams({
      app_id: 'ednetYonsei',
      retUrl: 'https://ys.learnus.org',
      failUrl: 'https://ys.learnus.org/login/index.php',
      baseUrl: 'https://ys.learnus.org',
      S1: data1['S1'],
      loginUrl: 'https://ys.learnus.org/passni/sso/coursemosLogin.php',
      ssoGubun: 'Login',
      refererUrl: 'https://ys.learnus.org',
      test: 'SSOAuthLogin',
      loginType: 'invokeID',
      E2: '',
      username,
      password,
    }),
  })

  return parseInputTagsFromHtml(await response.text())
}

async function fetch3(
  data2: Record<string, string>,
  username: string,
  password: string
) {
  const response = await fetch(
    `${LEARNUS_ORIGIN}/passni/sso/coursemosLogin.php`,
    {
      method: 'POST',
      body: new URLSearchParams({
        app_id: 'ednetYonsei',
        retUrl: 'https://ys.learnus.org',
        failUrl: 'https://ys.learnus.org/login/index.php',
        baseUrl: 'https://ys.learnus.org',
        loginUrl: 'https://ys.learnus.org/passni/sso/coursemosLogin.php',
        ssoChallenge: data2['ssoChallenge'],
        loginType: 'invokeID',
        returnCode: '',
        returnMessage: '',
        keyModulus: data2['keyModulus'],
        keyExponent: data2['keyExponent'],
        ssoGubun: 'Login',
        refererUrl: 'https://ys.learnus.org',
        test: 'SSOAuthLogin',
        username,
        password,
      }),
    }
  )

  return parseInputTagsFromHtml(await response.text())
}

async function fetch4(
  data2: Record<string, string>,
  data3: Record<string, string>,
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
      failUrl: 'https://ys.learnus.org/login/index.php',
      baseUrl: 'https://ys.learnus.org',
      S1: data3['S1'],
      loginUrl: 'https://ys.learnus.org/passni/sso/coursemosLogin.php',
      ssoGubun: 'Login',
      refererUrl: 'https://ys.learnus.org',
      test: 'SSOAuthLogin',
      loginType: 'invokeID',
      E2,
      username,
      password,
    }),
  })

  return parseInputTagsFromHtml(await response.text())
}

async function fetch5(
  data4: Record<string, string>,
  username: string,
  password: string
) {
  await fetch(`${LEARNUS_ORIGIN}/passni/sso/spLoginData.php`, {
    method: 'POST',
    body: new URLSearchParams({
      app_id: 'ednetYonsei',
      retUrl: 'https://ys.learnus.org',
      failUrl: 'https://ys.learnus.org/login/index.php',
      baseUrl: 'https://ys.learnus.org',
      loginUrl: 'https://ys.learnus.org/passni/sso/coursemosLogin.php',
      E3: data4['E3'],
      E4: data4['E4'],
      S2: data4['S2'],
      CLTID: data4['CLTID'],
      ssoGubun: 'Login',
      refererUrl: 'https://ys.learnus.org',
      test: 'SSOAuthLogin',
      username,
      password,
    }),
  })
}

async function fetch6() {
  await fetch(`${LEARNUS_ORIGIN}/passni/spLoginProcess.php`)
}

function stringToHex(raw: string) {
  let result = ''
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16)
    result += hex.length === 2 ? hex : '0' + hex
  }
  return result.toUpperCase()
}
