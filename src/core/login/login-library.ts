import { parseInputTagsFromHtml } from '../../utils/parse-html-string'
import { INFRA_ORIGIN, LIBRARY_ORIGIN } from '../constants'

export default async function loginLibrary(): Promise<void> {
  const data1 = await fetch1()
  const data2 = await fetch2(data1)
  await fetch3(data2)
  await fetch4()
  await fetch5()
}

async function fetch1() {
  const response = await fetch(`${LIBRARY_ORIGIN}/SSOLegacy.do`, {
    method: 'POST',
    body: new URLSearchParams({
      retUrl: '',
      failUrl: '',
      ssoGubun: 'Redirect',
      a: 'aaaa',
      b: 'bbbb',
    }),
    signal: AbortSignal.timeout(5000),
  })

  return parseInputTagsFromHtml(await response.text())
}

async function fetch2(data1: Record<string, string>) {
  const response = await fetch(`${INFRA_ORIGIN}/sso/PmSSOService`, {
    method: 'POST',
    body: new URLSearchParams({
      app_id: 'nlibraryYonsei',
      retUrl: 'https://library.yonsei.ac.kr:443',
      failUrl: 'https://library.yonsei.ac.kr:443',
      baseUrl: 'https://library.yonsei.ac.kr:443',
      S1: data1['S1'],
      loginUrl: '',
      ssoGubun: 'Redirect',
      refererUrl: 'https://library.yonsei.ac.kr/passni/spLogin.jsp',
      a: 'aaaa',
      b: 'bbbb',
    }),
    signal: AbortSignal.timeout(5000),
  })

  return parseInputTagsFromHtml(await response.text())
}

async function fetch3(data2: Record<string, string>) {
  await fetch(`${LIBRARY_ORIGIN}/SSOLegacy.do?pname=spLoginData`, {
    method: 'POST',
    redirect: 'manual',
    body: new URLSearchParams({
      app_id: 'nlibraryYonsei',
      retUrl: 'https://library.yonsei.ac.kr:443',
      failUrl: 'https://library.yonsei.ac.kr:443',
      baseUrl: 'https://library.yonsei.ac.kr:443',
      loginUrl: '',
      E3: data2['E3'],
      E4: data2['E4'],
      S2: data2['S2'],
      CLTID: data2['CLTID'],
      ssoGubun: 'Redirect',
      refererUrl: 'https://library.yonsei.ac.kr/passni/spLogin.jsp',
      a: 'aaaa',
      b: 'bbbb',
    }),
    signal: AbortSignal.timeout(5000),
  })
}

async function fetch4() {
  await fetch(`${LIBRARY_ORIGIN}/passni/spLoginProcess.jsp`, {
    signal: AbortSignal.timeout(5000),
  })
}

async function fetch5() {
  await fetch(`${LIBRARY_ORIGIN}/com/lgin/SsoCtr/j_login_sso.do`, {
    signal: AbortSignal.timeout(5000),
  })
}
