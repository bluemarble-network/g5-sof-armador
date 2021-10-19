import { NextApiRequest, NextApiResponse } from 'next'
import { withRules } from '../../../../middleware/withRules'
import { prisma } from '../../../../utils/database'

function handler (req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getRoutesByApp()
    case 'POST':
      return
    case 'PUT':
      return
    case 'DELETE':
      return

    default:
      return res.status(400).send('No method provider')
  }

  async function getRoutesByApp () {
    const data = await prisma.applications.findMany({
      select: {
        routes: true,
        display_name: true
      },
      where: {
        modules: {
          slug: process.env.MODULE
        }
      }
    })

    await prisma.$disconnect()

    return res.status(200).send(data)
  }
}

export default withRules(handler)
