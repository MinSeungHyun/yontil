import axios from 'axios'
import fetchAdapter from '@vespaiach/axios-fetch-adapter'
import * as htmlparser2 from 'htmlparser2'
import { decode } from './utils/encoding'
import { LEARNUS_URL, PORTAL_URL, INFRA_URL } from './const'

export const refreshSession = async (): Promise<void> => {
  await chrome.cookies.remove({ url: LEARNUS_URL, name: 'MoodleSession' })
  await chrome.cookies.remove({ url: INFRA_URL, name: 'JSESSIONID_SSO' })

  const { yontilAuthData } = await chrome.storage.sync.get('yontilAuthData')
  if (!yontilAuthData) return

  const { username, password } = JSON.parse(decode(yontilAuthData))
  if (!username || !password) return

  await login(username, password)
}

async function login(id: string, pw: string): Promise<void> {
  await loginLearnUs(id, pw)
  await loginPortal()
}

async function loginLearnUs(id: string, pw: string): Promise<void> {
  const instance = axios.create({ adapter: fetchAdapter })

  // Request 1
  const res1 = await instance.post(`${LEARNUS_URL}passni/sso/coursemosLogin.php`, {
    data: {
      ssoGubun: 'Login',
      type: 'popup_login',
      username: id,
      password: pw,
    },
  })
  const values1 = parseInputValues(res1.data)

  // Request 2
  const res2 = await instance.post(
    `${INFRA_URL}sso/PmSSOService`,
    new URLSearchParams({
      app_id: 'ednetYonsei',
      retUrl: 'https://www.learnus.org',
      failUrl: 'https://www.learnus.org/login/index.php',
      baseUrl: 'https://www.learnus.org',
      S1: values1.get('S1') ?? '',
      loginUrl: 'https://www.learnus.org/passni/sso/coursemosLogin.php',
      ssoGubun: 'Login',
      refererUrl: 'https://www.learnus.org',
      test: 'SSOAuthLogin',
      loginType: 'invokeID',
      E2: '',
      username: id,
      password: pw,
    })
  )
  const values2 = parseInputValues(res2.data)
  const ssoChallenge = values2.get('ssoChallenge') ?? ''
  const keyModulus = values2.get('keyModulus') ?? ''

  // Request 3
  const res3 = await instance.post(
    `${LEARNUS_URL}passni/sso/coursemosLogin.php`,
    new URLSearchParams({
      app_id: 'ednetYonsei',
      retUrl: 'https://www.learnus.org',
      failUrl: 'https://www.learnus.org/login/index.php',
      baseUrl: 'https://www.learnus.org',
      loginUrl: 'https://www.learnus.org/passni/sso/coursemosLogin.php',
      ssoChallenge: ssoChallenge,
      loginType: 'invokeID',
      returnCode: '',
      returnMessage: '',
      keyModulus: keyModulus,
      keyExponent: '10001',
      ssoGubun: 'Login',
      refererUrl: 'https://www.learnus.org/',
      test: 'SSOAuthLogin',
      username: id,
      password: pw,
    })
  )
  const values3 = parseInputValues(res3.data)

  // Request 4
  const json = JSON.stringify({
    userid: id,
    userpw: pw,
    ssoChallenge: ssoChallenge,
  })
  const RSAKey = require('./utils/rsa.js')
  const rsa = new RSAKey()
  rsa.setPublic(keyModulus, '10001')
  const e2 = rsa.encrypt(json)
  const res4 = await instance.post(
    `${INFRA_URL}sso/PmSSOAuthService`,
    new URLSearchParams({
      app_id: 'ednetYonsei',
      retUrl: 'https://www.learnus.org',
      failUrl: 'https://www.learnus.org/login/index.php',
      baseUrl: 'https://www.learnus.org',
      S1: values3.get('S1') ?? '',
      loginUrl: 'https://www.learnus.org/passni/sso/coursemosLogin.php',
      ssoGubun: 'Login',
      refererUrl: 'https://www.learnus.org/',
      test: 'SSOAuthLogin',
      loginType: 'invokeID',
      E2: e2,
      username: id,
      password: pw,
    })
  )
  const values4 = parseInputValues(res4.data)

  // Request 5
  await instance.post(
    `${LEARNUS_URL}passni/sso/spLoginData.php`,
    new URLSearchParams({
      app_id: 'ednetYonsei',
      retUrl: 'https://www.learnus.org',
      failUrl: 'https://www.learnus.org/login/index.php',
      baseUrl: 'https://www.learnus.org',
      loginUrl: 'https://www.learnus.org/passni/sso/coursemosLogin.php',
      E3: values4.get('E3') ?? '',
      E4: values4.get('E4') ?? '',
      S2: values4.get('S2') ?? '',
      CLTID: values4.get('CLTID') ?? '',
      ssoGubun: 'Login',
      refererUrl: 'https://www.learnus.org/',
      test: 'SSOAuthLogin',
      username: id,
      password: pw,
    })
  )

  // Request 6
  await instance.get(`${LEARNUS_URL}passni/spLoginProcess.php`)
}

async function loginPortal(): Promise<void> {
  const instance = axios.create({ adapter: fetchAdapter })

  // Request 1
  const res1 = await instance.post(
    `${PORTAL_URL}main/SSOLegacy.do`,
    new URLSearchParams({
      retUrl: '',
      failUrl: '',
      ssoGubun: 'Redirect',
      test: 'SSOLogin',
      loginProcUrl: '/main/index.jsp',
    })
  )
  const values1 = parseInputValues(res1.data)

  // Request 2
  const res2 = await instance.post(
    `${INFRA_URL}sso/PmSSOService`,
    new URLSearchParams({
      app_id: 'nportalYonsei',
      retUrl: 'https://portal.yonsei.ac.kr:443/main',
      failUrl: 'https://portal.yonsei.ac.kr:443/main',
      baseUrl: 'https://portal.yonsei.ac.kr:443',
      S1: values1.get('S1') ?? '',
      loginUrl: 'https://portal.yonsei.ac.kr/main/index.jsp',
      ssoGubun: 'Redirect',
      refererUrl: 'https://portal.yonsei.ac.kr/main/',
      test: 'SSOLogin',
      loginProcUrl: '/main/index.jsp',
    })
  )
  const values2 = parseInputValues(res2.data)

  // Request 3
  await instance.post(
    `${PORTAL_URL}main/SSOLegacy.do?pname=spLoginData`,
    new URLSearchParams({
      app_id: 'nportalYonsei',
      retUrl: 'https://portal.yonsei.ac.kr:443/main',
      failUrl: 'https://portal.yonsei.ac.kr:443/main',
      baseUrl: 'https://portal.yonsei.ac.kr:443',
      loginUrl: 'https://portal.yonsei.ac.kr/main/index.jsp',
      E3: values2.get('E3') ?? '',
      E4: values2.get('E4') ?? '',
      S2: values2.get('S2') ?? '',
      CLTID: values2.get('CLTID') ?? '',
      ssoGubun: 'Redirect',
      refererUrl: 'https://portal.yonsei.ac.kr/main',
      test: 'SSOLogin',
      loginProcUrl: '/main/index.jsp',
    })
  )
}

function parseInputValues(html: string) {
  const values = new Map<string, string>()
  const parser = new htmlparser2.Parser({
    onopentag: (name, attrubutes) => {
      if (name === 'input') {
        values.set(attrubutes.id, attrubutes.value)
      }
    },
  })
  parser.write(html)
  parser.end()
  return values
}
