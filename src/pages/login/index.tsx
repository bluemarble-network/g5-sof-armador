import { serialize } from 'cookie'
import moment from 'moment'
import { Loading } from '../../contexts/auth'
import { generateNewRefreshToken, generateNewRememberMeToken, generateNewSessionToken, validateJwt } from '../../utils/auth'

export default function AutoLogin () {
  return (
        <Loading />
  )
}
export async function getServerSideProps (ctx) {
  const { token } = ctx.query

  const decodedToken:any = await validateJwt(token)

  if (!decodedToken) return { props: { } }
  const newToken = generateNewSessionToken(decodedToken.user)
  const refreshToken = generateNewRefreshToken(decodedToken.user)

  if (decodedToken.origin) {
    const rememberMeToken = generateNewRememberMeToken({ user: decodedToken.user, origin: decodedToken.origin })

    const cookies:any = [
      serialize('next-refresh-token', refreshToken, { path: '/', expires: moment().add(6, 'minutes').toDate(), httpOnly: true }),
      serialize('next-remember-me-token', rememberMeToken, { path: '/', expires: moment().add(60, 'minutes').toDate() }),
      serialize('next-token', newToken, { path: '/', expires: moment().add(7, 'days').toDate() })
    ]

    ctx.res.writeHead(302, {
      Location: '/',
      'Set-Cookie': [...cookies]
    }).end()

    return { }
  } else if (decodedToken) {
    const cookies:any = [
      serialize('next-refresh-token', refreshToken, { path: '/', expires: moment().add(6, 'minutes').toDate(), httpOnly: true }),
      serialize('next-token', newToken, { path: '/', expires: moment().add(7, 'days').toDate() })
    ]

    ctx.res.writeHead(302, {
      Location: '/',
      'Set-Cookie': [...cookies]
    }).end()

    return { }
  }

  return {
    props: { }
  }
}
