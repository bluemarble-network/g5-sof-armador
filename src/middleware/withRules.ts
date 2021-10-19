import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '../utils/auth'
import { prisma } from '../utils/database'
import { IUserData } from './IUserData'

async function getRules (req: NextApiRequest, session: IUserData) {
  const rules = { canView: false, canUpdate: false, canDelete: false, canInsert: false }

  if (!req.headers.referer || !req.url) return rules
  const referrer = req.headers.referer.split('/').pop()

  const routeWithParams = req.url.split('/').pop() || ''
  const path = routeWithParams.split('?')[0]

  const idGroups: number[] = []
  let isDev = false

  const userGroups = await prisma.users_groups.findMany({
    where: {
      user_id: session.user.login
    },
    include: {
      groups: true
    }
  })
  userGroups.forEach((item) => {
    idGroups.push(item.group_id)
    if (item.groups.name === 'dev' || item.groups.name === 'desenvolvedor') isDev = true
  })

  const groupsRules = await prisma.group_permission.findMany({
    include: {
      routes: true
    },
    where: {
      group_id: { in: idGroups },
      AND: {
        routes: {
          url: path,
          AND: {
            applications: {
              url: `/${referrer}`
            }
          }
        }
      }
    }
  })

  await prisma.$disconnect()

  groupsRules.forEach(rule => {
    if (rule.canInsert) rules.canInsert = rule.canInsert
    if (rule.canUpdate) rules.canUpdate = rule.canUpdate
    if (rule.canDelete) rules.canDelete = rule.canDelete
    if (rule.canView) rules.canView = rule.canView
  })

  if (isDev) {
    rules.canInsert = true
    rules.canDelete = true
    rules.canUpdate = true
    rules.canView = true
  }

  return rules
}

const withRules = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const session = await getSession(req)

    if (!session) return res.status(401).send('Não foi possível validar o seu usuário')
    const rules = await getRules(req, session)
    if (!rules) return res.status(500).send('Erro ao verificar permissões')

    switch (req.method) {
      case 'GET':
        if (!rules.canView) return res.status(403).send('Você não tem permissão para vizualização')
        await prisma.log.create({ data: { user: session.user.name, url: `${req.url}`, method: `${req.method}`, body: 'Acesso' } })
        break
      case 'PUT':
        if (!rules.canUpdate) return res.status(403).send('Você não tem permissão para edição')
        await prisma.log.create({ data: { user: session.user.name, url: `${req.url}`, method: `${req.method}`, body: `${JSON.stringify(req.body)}` } })
        break
      case 'POST':
        if (!rules.canInsert) return res.status(403).send('Você não tem permissão para inserção')
        await prisma.log.create({ data: { user: session.user.name, url: `${req.url}`, method: `${req.method}`, body: `${JSON.stringify(req.body)}` } })
        break
      case 'DELETE':
        if (!rules.canDelete) return res.status(403).send('Você não tem permissão para deletar')
        await prisma.log.create({ data: { user: session.user.name, url: `${req.url}`, method: `${req.method}`, body: 'DELETAR' } })
        break
    }

    return handler(req, res)
  }
}

export { withRules }
