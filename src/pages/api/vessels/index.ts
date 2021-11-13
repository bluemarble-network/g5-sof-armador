import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '../../../utils/auth'
import { prisma } from '../../../utils/database'

function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return get()
    case 'PUT':
      return update()

    default:
      return res.status(400).send('no method provider')
  }
  async function get() {
    const session = await getSession(req)
    if (!session) return res.status(401).end()

    const usuario = await prisma.users_suzanog5.findUnique({
      where: {
        login: session.user.login
      },
      select: {
        users_groups: {
          select: {
            groups: true
          }
        }
      }
    })

    if (usuario?.users_groups.some((group) => group.groups.name === 'admin')) {
      const dados = await prisma.embarqueSOF.findMany({
        include: {
          Navio_Sof_Armador: true
        },
        orderBy: {
          Id: 'desc'
        }
      })

      await prisma.$disconnect()
      return res.status(200).send(dados)
    }

    const dados = await prisma.embarqueSOF.findMany({
      include: {
        Navio_Sof_Armador: true
      },
      where: {
        armador: String(usuario?.users_groups[0].groups.name)
      },
      orderBy: {
        Id: 'desc'
      }
    })

    await prisma.$disconnect()
    return res.status(200).send(dados)
  }

  async function update() {
    const { id }: any = req.query
    const props = req.body

    const newVessel = await prisma.embarqueSOF.update({
      data: props,
      where: {
        Id: parseInt(id)
      }
    })

    await prisma.$disconnect()

    return res.json(newVessel)
  }
}

export default handler
