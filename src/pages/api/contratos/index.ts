import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../utils/database'

function handler (req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return pegarTodos()
    case 'POST':
      return criarContrato()
    case 'PUT':
      return atualizarContrato()
    case 'DELETE':
      return deletarContrato()

    default:
      return res.status(400).send('No method provider')
  }
  async function pegarTodos () {
    const dados = await prisma.sb_contratos.findMany()
    await prisma.$disconnect()
    return res.status(200).send(dados)
  }

  async function criarContrato () {
    const contrato = req.body

    if (!contrato) return res.status(404).send('Contrato não enviado.')

    contrato.vigencia_inicio = new Date(contrato.vigencia_inicio)
    contrato.vigencia_termino = new Date(contrato.vigencia_termino)
    contrato.data_para_renovacao = new Date(contrato.data_para_renovacao)

    const novoContrato = await prisma.sb_contratos.create({ data: { ...contrato } })

    await prisma.$disconnect()
    return res.status(200).send(novoContrato)
  }

  async function atualizarContrato () {
    const { id_sb_contratos }: any = req.query
    const dadosContrato = req.body

    dadosContrato.vigencia_inicio = new Date(dadosContrato.vigencia_inicio)
    dadosContrato.vigencia_termino = new Date(dadosContrato.vigencia_termino)
    dadosContrato.data_para_renovacao = new Date(dadosContrato.data_para_renovacao)

    if (!dadosContrato) return res.status(404).send('Contrato não enviado.')

    const resposta = await prisma.sb_contratos.update({
      data: { ...dadosContrato },
      where: {
        id_sb_contratos: parseInt(id_sb_contratos)
      }
    })
    await prisma.$disconnect()
    return res.status(200).send(resposta)
  }

  async function deletarContrato () {
    let { id_sb_contratos }: any = req.query

    if (!id_sb_contratos) return res.status(400).send('Contrato não enviado')

    id_sb_contratos = id_sb_contratos.split(',').map(item => parseInt(item))
    await prisma.sb_contratos.deleteMany({
      where: {
        id_sb_contratos: {
          in: id_sb_contratos
        }
      }
    })
    await prisma.$disconnect()

    return res.status(200).send('Contrato deletado com sucesso')
  }
}

export default handler
//   export default withRules(handler)
