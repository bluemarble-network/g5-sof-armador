import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '../../utils/auth'
import { prisma } from '../../utils/database'

function handler (req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return get()
    case 'POST':
      return
    case 'PUT':
      return
    case 'DELETE':
      return

    default:
      return res.status(400).send('No method provider')
  }
  async function get () {
    const session = await getSession(req)
    if (!session) return res.status(401).end()
    const usuario = await prisma.users_suzanog5.findUnique({
      where: {
        login: session.user.login
      }
    })

    const dados = await prisma.embarqueSOF.findMany({
      include: {
        Navio_Sof_Armador: true
      },
      orderBy: {
        Id: 'desc'
      },
      where: {
        armador: usuario?.armador
      }
    })

    await prisma.$disconnect()
    return res.status(200).send(dados)
  }
}

export default handler
