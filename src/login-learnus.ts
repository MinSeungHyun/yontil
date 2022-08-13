import axios from 'axios'
import fetchAdapter from '@vespaiach/axios-fetch-adapter'
import * as htmlparser2 from 'htmlparser2'
import { decode, encode } from './utils/encoding'

const LEARNUS_URL = 'https://www.learnus.org/'
const YONSEI_API_URL = 'https://infra.yonsei.ac.kr/'
const loginCycleMinutes = 60

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const body = details.requestBody?.formData
    const username = body?.username?.at(0)
    const password = body?.password?.at(0)

    if (username && password) {
      const json = JSON.stringify({
        username,
        password,
      })
      chrome.storage.sync.set({
        yontilAuthData: encode(json),
      })
    }
  },
  {
    urls: [`${LEARNUS_URL}passni/sso/coursemosLogin.php`],
  },
  ['requestBody']
)

chrome.tabs.onUpdated.addListener(
  async (
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ) => {
    if (
      !tab.url?.includes('learnus.org') ||
      tab.url.includes('learnus.org/login') ||
      changeInfo.status !== 'loading'
    ) {
      return
    }

    await loginProcess(tabId)
  }
)

async function loginProcess(tabId: number) {
  const storage = await chrome.storage.session.get()
  if (
    new Date(storage.lastLogin) >
    new Date(Date.now() - 1000 * 60 * loginCycleMinutes)
  ) {
    return
  }

  chrome.cookies.remove({ url: LEARNUS_URL, name: 'MOODLE_SESSSION' })
  chrome.cookies.remove({ url: YONSEI_API_URL, name: 'JSESSIONID_SSO' })

  const { yontilAuthData } = await chrome.storage.sync.get('yontilAuthData')
  const { username, password } = JSON.parse(decode(yontilAuthData))
  await loginLearnUs(username, password)

  chrome.storage.session.set({ lastLogin: new Date().toString() })
  chrome.tabs.reload(tabId)
}

const loginLearnUs = async (id: string, pw: string): Promise<void> => {
  const instacne = axios.create({
    adapter: fetchAdapter,
  })

  // Request 1
  const res1 = await instacne.post(
    `${LEARNUS_URL}passni/sso/coursemosLogin.php`,
    {
      data: {
        ssoGubun: 'Login',
        type: 'popup_login',
        username: id,
        password: pw,
      },
    }
  )
  const values1 = parseInputValues(res1.data)

  // Request 2
  const res2 = await instacne.post(
    `${YONSEI_API_URL}sso/PmSSOService`,
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
  const res3 = await instacne.post(
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
  const res4 = await instacne.post(
    `${YONSEI_API_URL}sso/PmSSOAuthService`,
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
  await instacne.post(
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
  await instacne.get(`${LEARNUS_URL}passni/spLoginProcess.php`)
}

export default loginLearnUs

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
