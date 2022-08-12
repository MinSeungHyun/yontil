import axios from 'axios'
import cookie from 'cookie'
import { JSDOM } from 'jsdom'

const LEARNUS_URL = 'https://www.learnus.org/'
const YONSEI_API_URL = 'https://infra.yonsei.ac.kr/'

const loginLearnUs = async (id: string, pw: string) => {
  // Request 1
  const res1 = await axios.get(LEARNUS_URL)
  const session = cookie.parse(res1.headers['set-cookie']?.at(0) ?? '')[
    'MoodleSession'
  ]

  // Request 2
  const res2 = await axios.post(
    `${LEARNUS_URL}passni/sso/coursemosLogin.php`,
    {
      data: {
        ssoGubun: 'Login',
        type: 'popup_login',
        username: id,
        password: pw,
      },
    },
    { headers: { Cookie: `MoodleSession=${session}` } }
  )
  const dom = new JSDOM(res2.data)
  const s1 = getValueFromInputElement(dom, 'S1')

  // Request 3
  const res3 = await axios.post(
    `${YONSEI_API_URL}sso/PmSSOService`,
    new URLSearchParams({
      app_id: 'ednetYonsei',
      retUrl: 'https://www.learnus.org',
      failUrl: 'https://www.learnus.org/login/index.php',
      baseUrl: 'https://www.learnus.org',
      S1: s1,
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
  const jSessionId = cookie.parse(res3.headers['set-cookie']?.at(3) ?? '')[
    'JSESSIONID_SSO'
  ]
  const dom2 = new JSDOM(res3.data)
  const ssoChallenge = getValueFromInputElement(dom2, 'ssoChallenge')
  const keyModules = getValueFromInputElement(dom2, 'keyModulus')

  // Request 4
  const res4 = await axios.post(
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
      keyModulus: keyModules,
      keyExponent: '10001',
      ssoGubun: 'Login',
      refererUrl: 'https://www.learnus.org/',
      test: 'SSOAuthLogin',
      username: id,
      password: pw,
    }),
    {
      headers: {
        Cookie: `MoodleSession=${session}`,
      },
    }
  )
  const dom3 = new JSDOM(res4.data)
  const s1Second = getValueFromInputElement(dom3, 'S1')

  // Request 5
  const json = JSON.stringify({
    userid: id,
    userpw: pw,
    ssoChallenge: ssoChallenge,
  })
  const RSAKey = require('./utils/rsa.js')
  const rsa = new RSAKey()
  rsa.setPublic(keyModules, '10001')
  const e2 = rsa.encrypt(json)
  const res5 = await axios.post(
    `${YONSEI_API_URL}sso/PmSSOAuthService`,
    new URLSearchParams({
      app_id: 'ednetYonsei',
      retUrl: 'https://www.learnus.org',
      failUrl: 'https://www.learnus.org/login/index.php',
      baseUrl: 'https://www.learnus.org',
      S1: s1Second,
      loginUrl: 'https://www.learnus.org/passni/sso/coursemosLogin.php',
      ssoGubun: 'Login',
      refererUrl: 'https://www.learnus.org/',
      test: 'SSOAuthLogin',
      loginType: 'invokeID',
      E2: e2,
      username: id,
      password: pw,
    }),
    { headers: { Cookie: `JSESSIONID_SSO=${jSessionId}` } }
  )
  const dom4 = new JSDOM(res5.data)
  const e3 = getValueFromInputElement(dom4, 'E3')
  const e4 = getValueFromInputElement(dom4, 'E4')
  const s2 = getValueFromInputElement(dom4, 'S2')
  const cltid = getValueFromInputElement(dom4, 'CLTID')

  // Request 6
  const res6 = await axios.post(
    `${LEARNUS_URL}passni/sso/spLoginData.php`,
    new URLSearchParams({
      app_id: 'ednetYonsei',
      retUrl: 'https://www.learnus.org',
      failUrl: 'https://www.learnus.org/login/index.php',
      baseUrl: 'https://www.learnus.org',
      loginUrl: 'https://www.learnus.org/passni/sso/coursemosLogin.php',
      E3: e3,
      E4: e4,
      S2: s2,
      CLTID: cltid,
      ssoGubun: 'Login',
      refererUrl: 'https://www.learnus.org/',
      test: 'SSOAuthLogin',
      username: id,
      password: pw,
    }),
    { headers: { Cookie: `MoodleSession=${session}` } }
  )

  // Request 7
  const res7 = await axios.get(`${LEARNUS_URL}passni/spLoginProcess.php`, {
    headers: { Cookie: `MoodleSession=${session}` },
  })
  return cookie.parse(res7.headers['set-cookie']?.at(0) ?? '')['MoodleSession']
}

export default loginLearnUs

function getValueFromInputElement(dom: JSDOM, id: string) {
  const input = dom.window.document.getElementById(id) as HTMLInputElement
  return input.value
}
