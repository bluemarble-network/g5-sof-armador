import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../utils/database'

function handler (req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return pegarTodos()
    case 'POST':
      return criarStatus()
    case 'PUT':
      return atualizarStatus()
    case 'DELETE':
      return deletarStatus()
    default:
      return res.status(400).send('No method provider')
  }
  async function pegarTodos () {
    const dados = await prisma.sb_contratos_cadastros_status_contrato.findMany()
    await prisma.$disconnect()
    return res.status(200).send(dados)
  }

  async function criarStatus () {
    const dadosStatus = req.body

    if (!dadosStatus) return res.status(400).send('Status não enviado')

    const novoStatus = await prisma.sb_contratos_cadastros_status_contrato.create({ data: { ...dadosStatus } })
    await prisma.$disconnect()
    return res.status(200).send(novoStatus)
  }

  async function atualizarStatus () {
    let { id_sb_contratos_cadastros_status_contrato }:any = req.query
    const dadosStatus = req.body

    if (!dadosStatus) return res.status(400).send('Status não enviado')

    id_sb_contratos_cadastros_status_contrato = parseInt(id_sb_contratos_cadastros_status_contrato)
    const novoStatus = await prisma.sb_contratos_cadastros_status_contrato.update({ data: { ...dadosStatus }, where: { id_sb_contratos_cadastros_status_contrato } })
    await prisma.$disconnect()

    return res.status(200).json(novoStatus)
  }

  async function deletarStatus () {
    let { id_sb_contratos_cadastros_status_contrato }: any = req.query

    if (!id_sb_contratos_cadastros_status_contrato) return res.status(400).send('Status não enviado')

    id_sb_contratos_cadastros_status_contrato = id_sb_contratos_cadastros_status_contrato.split(',').map(item => parseInt(item))
    await prisma.sb_contratos_cadastros_status_contrato.delete({ where: { id_sb_contratos_cadastros_status_contrato } })
    await prisma.$disconnect()

    return res.status(200).send('Status deletado com sucesso')
  }
}

export default handler
