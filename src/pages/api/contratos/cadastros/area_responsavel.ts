import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../utils/database'

function handler (req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return pegarTodos()
    case 'POST':
      return criarAreaResponsavel()
    case 'PUT':
      return atualizarAreaResponsavel()
    case 'DELETE':
      return deletarAreaResponsavel()
    default:
      return res.status(400).send('No method provider')
  }
  async function pegarTodos () {
    const dados = await prisma.sb_contratos_cadastros_area_responsavel.findMany()
    await prisma.$disconnect()
    return res.status(200).send(dados)
  }

  async function criarAreaResponsavel () {
    const dados = req.body

    if (!dados) return res.status(400).send('Área Responsável não enviada')

    console.log(dados)
    const novoAreaResponsavel = await prisma.sb_contratos_cadastros_area_responsavel.create({ data: { ...dados } })
    await prisma.$disconnect()
    return res.status(200).send(novoAreaResponsavel)
  }

  async function atualizarAreaResponsavel () {
    let { id_sb_contratos_cadastros_area_responsavel }:any = req.query
    const fields = req.body

    console.log(fields)
    if (!fields) return res.status(400).send('Área Responsável não enviada')

    id_sb_contratos_cadastros_area_responsavel = parseInt(id_sb_contratos_cadastros_area_responsavel)
    console.log('chegou no UPDATE')
    console.log(fields)
    const novoAreaResponsavel = await prisma.sb_contratos_cadastros_area_responsavel.update({ data: { ...fields }, where: { id_sb_contratos_cadastros_area_responsavel } })
    await prisma.$disconnect()

    return res.status(200).json(novoAreaResponsavel)
  }

  async function deletarAreaResponsavel () {
    let { id_sb_contratos_cadastros_area_responsavel } : any = req.query

    if (!id_sb_contratos_cadastros_area_responsavel) return res.status(400).send('Área Responsável não enviado')

    id_sb_contratos_cadastros_area_responsavel = id_sb_contratos_cadastros_area_responsavel.split(',').map(item => parseInt(item))
    await prisma.sb_contratos_cadastros_area_responsavel.deleteMany({ where: { id_sb_contratos_cadastros_area_responsavel: { in: id_sb_contratos_cadastros_area_responsavel } } })
    await prisma.$disconnect()

    return res.status(200).send('Área Responsável deletado com sucesso')
  }
}

export default handler
