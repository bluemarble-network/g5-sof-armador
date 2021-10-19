import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '../../../utils/auth'
import { prisma } from '../../../utils/database'

function handler (req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getMenuItems()

    default:
      return res.status(400).send('No method provider')
  }

  async function getMenuItems () {
    const session = await getSession(req)
    if (!session) return res.status(400).send('Usuário não encontrado')
    const groups = await prisma.users_groups.findMany({
      where: {
        user_id: session.user.login
      },
      include: {
        groups: true
      }
    })

    const groupIds = groups.map(item => item.groups.id)
    const isDev = groups.some(group => group.groups.name === 'dev')

    if (isDev) {
      const apps = await prisma.applications.findMany({
        where: {
          modules: {
            slug: process.env.MODULE
          }
        }
      })

      await prisma.$disconnect()

      return res.status(200).send(apps)
    }

    const apps = await prisma.applications.findMany({
      where: {
        modules: {
          slug: process.env.MODULE
        },
        AND: {
          routes: {
            some: {
              group_permission: {
                some: {
                  group_id: { in: groupIds },
                  AND: {
                    canView: true
                  }
                }
              }
            }
          }
        }
      }
    })

    await prisma.$disconnect()

    return res.status(200).send(apps)
  }
}

export default handler
