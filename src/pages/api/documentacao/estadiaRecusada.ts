import { NextApiRequest, NextApiResponse } from 'next'
import { withRules } from '../../../middleware/withRules'
import { prisma } from '../../../utils/database'

function handler (req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return pegarTodos()
    case 'POST':
      return
    case 'PUT':
      return
    case 'DELETE':
      return

    default:
      return res.status(400).send('No method provider')
  }

  async function pegarTodos () {
    const dados = await prisma.sb_documentacao_estadia_recusadas.findMany()
    await prisma.$disconnect()
    return res.status(200).send(dados)
  }
}

export default withRules(handler)
