import jwt from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'
import { getCookieParser } from 'next/dist/next-server/server/api-utils'
import { getSession } from '../../../utils/auth'

function handler (req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getLoginToken()

    default:
      return res.status(400).send('No method provider')
  }

  async function getLoginToken () {
    const session = await getSession(req)
    const rememberMeToken = getCookieParser(req)()['next-remember-me-token']
    let decodedToken

    if (rememberMeToken) decodedToken = jwt.decode(rememberMeToken)

    if (!session) return res.status(401).send('Não autorizado')
    const { user } = session
    if (decodedToken) {
      const token = jwt.sign({ origin: decodedToken.data.origin, user }, `${process.env.JWT_SECRET}`)
      return res.status(200).send(token)
    }

    const token = jwt.sign({ user }, `${process.env.JWT_SECRET}`)
    return res.status(200).send(token)
  }
}

export default handler
