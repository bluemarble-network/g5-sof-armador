import { serialize } from 'cookie'
import { NextApiRequest, NextApiResponse } from 'next'
import { getCookieParser } from 'next/dist/next-server/server/api-utils'
import { generateNewRefreshToken, generateNewSessionToken, validateJwt } from '../../../utils/auth'
import { moment } from '../../../utils/moment'

function handler (req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getNewToken()
    case 'POST':
      return
    case 'PUT':
      return
    case 'DELETE':
      return

    default:
      return res.status(400).send('No method provider')
  }

  async function getNewToken () {
    const refreshToken = getCookieParser(req)()['next-refresh-token']
    const rememberMeToken = getCookieParser(req)()['next-remember-me-token']
    if (refreshToken) {
      const isRefreshTokenValid = await validateJwt(refreshToken)

      if (!isRefreshTokenValid) return res.status(403).send('Refresh token inválido')
      const newSessionToken = generateNewSessionToken({ user: isRefreshTokenValid.user })
      return res.status(200).setHeader('Set-Cookie', [
        serialize('next-token', newSessionToken, {
          path: '/',
          expires: moment().add(6, 'minutes').toDate()
        })
      ]).end()
    } else if (rememberMeToken) {
      const isRememberMeTokenValid = await validateJwt(rememberMeToken)

      if (!isRememberMeTokenValid) return res.status(403).send('Remember-me token token inválido')

      const newRefreshToken = generateNewRefreshToken({ user: isRememberMeTokenValid.user })
      const newSessionToken = generateNewSessionToken({ user: isRememberMeTokenValid.user })

      return res.status(200).setHeader('Set-Cookie', [
        serialize('next-token', newSessionToken, {
          path: '/',
          expires: moment().add(6, 'minutes').toDate()
        }),
        serialize('next-token', newRefreshToken, {
          path: '/',
          expires: moment().add(60, 'minutes').toDate()
        })
      ]).end()
    }

    return res.status(404).send('Nenhum token fornecido')
  }
}

export default handler
