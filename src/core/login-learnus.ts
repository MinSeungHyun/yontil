import { jsbn, pki } from 'node-forge'
import { parseInputTagsFromHtml } from '../utils/parse-html-string'

const username = ''
const password = ''

export async function loginLearnUs(): Promise<void> {
  const response1 = await fetch(
    'https://ys.learnus.org/passni/sso/coursemosLogin.php',
    {
      method: 'POST',
      mode: 'no-cors',
      body: new URLSearchParams({
        ssoGubun: 'Login',
        logintype: 'sso',
        type: 'popup_login',
        username,
        password,
      }),
    }
  )
  const data = await response1.text()
  const inputTags1 = parseInputTagsFromHtml(data)
  console.log('1', inputTags1)

  const response2 = await fetch('https://infra.yonsei.ac.kr/sso/PmSSOService', {
    method: 'POST',
    mode: 'no-cors',
    body: new URLSearchParams({
      app_id: 'ednetYonsei',
      retUrl: 'https://ys.learnus.org',
      failUrl: 'https://ys.learnus.org/login/index.php',
      baseUrl: 'https://ys.learnus.org',
      S1: inputTags1['S1'],
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
  const data2 = await response2.text()
  const inputTags2 = parseInputTagsFromHtml(data2)
  console.log('2', inputTags2)

  const response3 = await fetch(
    'https://ys.learnus.org/passni/sso/coursemosLogin.php',
    {
      method: 'POST',
      mode: 'no-cors',
      body: new URLSearchParams({
        app_id: 'ednetYonsei',
        retUrl: 'https://ys.learnus.org',
        failUrl: 'https://ys.learnus.org/login/index.php',
        baseUrl: 'https://ys.learnus.org',
        loginUrl: 'https://ys.learnus.org/passni/sso/coursemosLogin.php',
        ssoChallenge: inputTags2['ssoChallenge'],
        loginType: 'invokeID',
        returnCode: '',
        returnMessage: '',
        keyModulus: inputTags2['keyModulus'],
        keyExponent: inputTags2['keyExponent'],
        ssoGubun: 'Login',
        refererUrl: 'https://ys.learnus.org',
        test: 'SSOAuthLogin',
        username,
        password,
      }),
    }
  )
  const data3 = await response3.text()
  const inputTags3 = parseInputTagsFromHtml(data3)

  const E2 = getE2Value(
    inputTags2['keyModulus'],
    inputTags2['keyExponent'],
    username,
    password,
    inputTags2['ssoChallenge']
  )

  const response4 = await fetch(
    'https://infra.yonsei.ac.kr/sso/PmSSOAuthService',
    {
      method: 'POST',
      mode: 'no-cors',
      body: new URLSearchParams({
        app_id: 'ednetYonsei',
        retUrl: 'https://ys.learnus.org',
        failUrl: 'https://ys.learnus.org/login/index.php',
        baseUrl: 'https://ys.learnus.org',
        S1: inputTags3['S1'],
        loginUrl: 'https://ys.learnus.org/passni/sso/coursemosLogin.php',
        ssoGubun: 'Login',
        refererUrl: 'https://ys.learnus.org',
        test: 'SSOAuthLogin',
        loginType: 'invokeID',
        E2,
        username,
        password,
      }),
    }
  )
  const data4 = await response4.text()
  const inputTags4 = parseInputTagsFromHtml(data4)

  const response5 = await fetch(
    'https://ys.learnus.org/passni/sso/spLoginData.php',
    {
      method: 'POST',
      mode: 'no-cors',
      body: new URLSearchParams({
        app_id: 'ednetYonsei',
        retUrl: 'https://ys.learnus.org',
        failUrl: 'https://ys.learnus.org/login/index.php',
        baseUrl: 'https://ys.learnus.org',
        loginUrl: 'https://ys.learnus.org/passni/sso/coursemosLogin.php',
        E3: inputTags4['E3'],
        E4: inputTags4['E4'],
        S2: inputTags4['S2'],
        CLTID: inputTags4['CLTID'],
        ssoGubun: 'Login',
        refererUrl: 'https://ys.learnus.org',
        test: 'SSOAuthLogin',
        username,
        password,
      }),
    }
  )
  const data5 = await response5.text()
  const inputTags5 = parseInputTagsFromHtml(data5)

  await fetch('https://ys.learnus.org/passni/spLoginProcess.php', {
    mode: 'no-cors',
  })
}

function getE2Value(
  keyModulus: string,
  keyExponent: string,
  username: string,
  password: string,
  ssoChallenge: string
) {
  const publicKey = pki.rsa.setPublicKey(
    new jsbn.BigInteger(keyModulus, 16),
    new jsbn.BigInteger(keyExponent, 16)
  )
  return stringToHex(
    publicKey.encrypt(
      JSON.stringify({ userid: username, userpw: password, ssoChallenge })
    )
  )
}

function stringToHex(raw: string) {
  let result = ''
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16)
    result += hex.length === 2 ? hex : '0' + hex
  }
  return result.toUpperCase()
}
