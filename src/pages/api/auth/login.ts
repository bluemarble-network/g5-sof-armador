import { serialize } from 'cookie'
import jwt from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'
import { comparePassword, generateNewRefreshToken, generateNewSessionToken } from '../../../utils/auth'
import { prisma } from '../../../utils/database'
import { moment } from '../../../utils/moment'

async function handler (req: NextApiRequest, res: NextApiResponse): Promise<unknown> {
  const { login, password, remember } = req.body

  if (!login || !password) return res.status(400).send('Bad format')
  const storageUser = await prisma.users_suzanog5.findFirst({
    select: {
      name: true,
      login: true,
      password: true
    },
    where: {
      login
    }
  })

  await prisma.$disconnect()

  if (!storageUser) return res.status(404).send('Usuário não encontrado')

  const isPasswordCorret = await comparePassword(password, `${storageUser.password}`)

  if (!isPasswordCorret) return res.status(400).send('Senha incorreta')

  const hasDefaultGroup = await prisma.users_groups.findFirst({
    where: {
      groups: {
        modules: {
          name: 'main'
        }
      },
      AND: {
        user_id: login
      }
    }
  })
  await prisma.$disconnect()
  if (!hasDefaultGroup) return res.status(403).send('Usuário está inativo')

  const formattedUser = {
    name: storageUser.name || '',
    login: storageUser.login
  }

  const token = generateNewSessionToken({ user: formattedUser })
  const refreshToken = generateNewRefreshToken({ user: formattedUser })

  if (remember) {
    const rememberMeToken = jwt.sign({ data: { user: formattedUser, origin: req.headers.origin } }, `${process.env.JWT_SECRET}`, { expiresIn: '7days' })

    await prisma.remember_me_token.deleteMany({ where: { user_id: storageUser.login } })
    await prisma.remember_me_token.create({ data: { user_id: storageUser.login, token: rememberMeToken } })

    await prisma.$disconnect()

    return res
      .setHeader('Set-Cookie', [
        serialize('next-token', token, { path: '/', expires: moment().add(6, 'minutes').toDate() }),
        serialize('next-remember-me-token', rememberMeToken, { path: '/', expires: moment().add(7, 'days').toDate() }),
        serialize('next-refresh-token', refreshToken, { path: '/', expires: moment().add(60, 'minutes').toDate(), httpOnly: true })
      ]
      ).status(200)
      .send('Login feito com sucesso')
  }

  return res
    .setHeader('Set-Cookie', [
      serialize('next-token', token, { path: '/', expires: moment().add(6, 'minutes').toDate() }),
      serialize('next-refresh-token', refreshToken, { path: '/', expires: moment().add(60, 'minutes').toDate(), httpOnly: true })
    ]
    ).status(200)
    .send('Login feito com sucesso')
}

export default handler
