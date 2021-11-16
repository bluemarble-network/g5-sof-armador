import { NextApiRequest, NextApiResponse } from 'next'
import { withRules } from '../../../../middleware/withRules'
import { prisma } from '../../../../utils/database'

function handler (req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getRoutesByApp()
    case 'PUT':
      return updateRoutesGroup()

    default:
      return res.status(400).send('No method provider')
  }

  async function getRoutesByApp () {
    const { group_id }: any = req.query

    if (!group_id || group_id === 'undefined') return res.status(400).send('grupo não enviado')

    const result = await prisma.group_permission.findMany({
      where: {
        group_id: parseInt(group_id)
      },
      include: {
        routes: true
      }
    })
    await prisma.$disconnect()

    return res.status(200).send(result)
  }

  async function updateRoutesGroup () {
    const { group_id }: any = req.query

    if (!group_id) return res.status(400).send('grupo não enviado')

    const { route_id, ...props } = req.body

    const storageGroupPermission = await prisma.group_permission.findFirst({
      where: {
        group_id: parseInt(group_id),
        AND: {
          route_id
        }
      }
    })

    if (storageGroupPermission) {
      const result = await prisma.group_permission.update({
        data: props,
        where: {
          id: storageGroupPermission.id
        },
        include: {
          routes: true
        }
      })
      await prisma.$disconnect()

      return res.status(200).send(result)
    } else {
      const newGroup = await prisma.group_permission.create({
        data: {
          group_id: parseInt(group_id),
          route_id,
          canDelete: false,
          canUpdate: false,
          canInsert: false,
          canView: false
        }
      })

      const response = await prisma.group_permission.update({
        data: props,
        where: {
          id: newGroup.id
        },
        include: {
          routes: true
        }
      })
      await prisma.$disconnect()

      return res.status(200).send(response)
    }
  }
}

export default withRules(handler)
