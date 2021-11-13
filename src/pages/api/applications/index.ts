import { NextApiRequest, NextApiResponse } from 'next'
import { withRules } from '../../../middleware/withRules'
import { prisma } from '../../../utils/database'

function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getAllApplications()
    case 'PUT':
      return updateAllRoutesByApp()
    default:
      return res.status(400).send('No method provider')
  }

  async function getAllApplications() {
    const applications = await prisma.applications.findMany({
      where: {
        modules: {
          slug: process.env.MODULE
        }
      }
    })
    await prisma.$disconnect()

    return res.status(200).send(applications)
  }

  async function updateAllRoutesByApp() {
    const { id, group, action }: any = req.query

    if (!id || !group || !action)
      return res.status(400).send('Formato da requisição inválido')

    if (action === 'remove') {
      const routes = await prisma.routes.findMany({
        where: {
          application_id: parseInt(id)
        }
      })

      const routeIds = routes.map((item) => item.id)

      await prisma.group_permission.updateMany({
        data: {
          canDelete: false,
          canInsert: false,
          canUpdate: false,
          canView: false
        },
        where: {
          group_id: parseInt(group),
          route_id: { in: routeIds }
        }
      })

      await prisma.$disconnect()

      return res.status(200).end()
    } else {
      const routes = await prisma.routes.findMany({
        where: {
          application_id: parseInt(id)
        }
      })

      const routeIds = routes.map((item) => item.id)

      const routesAlreadyCreated = await prisma.group_permission.findMany({
        where: {
          group_id: parseInt(group),
          route_id: { in: routeIds }
        }
      })
      const routesAlreadyCreatedIds = routesAlreadyCreated.map(
        (item) => item.route_id
      )

      const routeIdsToCreate = routeIds.filter(
        (item) => !routesAlreadyCreatedIds.includes(item)
      )

      const items = routeIdsToCreate.map((item) => ({
        canDelete: true,
        canInsert: true,
        canUpdate: true,
        canView: true,
        group_id: parseInt(group),
        route_id: item
      }))

      await prisma.group_permission.createMany({
        data: items
      })

      const updatedRoutes = await prisma.group_permission.updateMany({
        data: {
          canDelete: true,
          canInsert: true,
          canUpdate: true,
          canView: true
        },
        where: {
          group_id: parseInt(group),
          route_id: { in: routesAlreadyCreatedIds }
        }
      })

      await prisma.$disconnect()
      if (items.length > 0) return res.status(200).send(updatedRoutes)
      return res.status(200).end()
    }
  }
}

export default handler
