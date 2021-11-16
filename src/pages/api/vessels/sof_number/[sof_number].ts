import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '../../../../utils/auth'
import { prisma } from '../../../../utils/database'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return get()

    default:
      return res.status(405).send('invalid request method')
  }
  async function get() {
    const session = await getSession(req)
    const { sof_number } = req.query as { [key: string]: string }

    if (!session) return res.status(401).send('Sessão não encontrada')

    const groups = await prisma.groups.findMany({
      where: {
        users_groups: {
          some: {
            user_id: session.user.login
          }
        }
      }
    })

    if (!groups.some((group) => group.name === 'admin')) return res.json([])

    const data = await prisma.embarqueSOF_Arquivos.findMany({
      select: {
        idEmbarqueSOF_Arquivos: true,
        NomeDocumentoFinal: true,
        sof_number: true
      },
      where: {
        sof_number
      }
    })

    await prisma.$disconnect()

    return res.json(data)
  }
}
