import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../utils/database'

function handler (req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return pegarTodos()
    case 'POST':
      return criarFornecedor()
    case 'PUT':
      return atualizarFornecedor()
    case 'DELETE':
      return deleteUser()
    default:
      return res.status(400).send('No method provider')
  }
  async function pegarTodos () {
    const dados = await prisma.sb_contratos_cadastros_fornecedor.findMany()
    await prisma.$disconnect()
    return res.status(200).send(dados)
  }

  async function criarFornecedor () {
    const dadosFornecedor = req.body

    if (!dadosFornecedor) return res.status(400).send('Fornecedor não enviado')

    const novoFornecedor = await prisma.sb_contratos_cadastros_fornecedor.create({ data: { ...dadosFornecedor } })
    await prisma.$disconnect()

    return res.status(200).send(novoFornecedor)
  }

  async function atualizarFornecedor () {
    let { id_sb_contratos_cadastros_fornecedor }:any = req.query
    const dadosFornecedor = req.body

    if (!dadosFornecedor) return res.status(400).send('Fornecedor não enviado')

    id_sb_contratos_cadastros_fornecedor = parseInt(id_sb_contratos_cadastros_fornecedor)
    const novoFornecedor = await prisma.sb_contratos_cadastros_fornecedor.update({ data: { ...dadosFornecedor }, where: { id_sb_contratos_cadastros_fornecedor } })
    await prisma.$disconnect()

    return res.status(200).json(novoFornecedor)
  }

  async function deleteUser () {
    let { id_sb_contratos_cadastros_fornecedor }: any = req.query

    if (!id_sb_contratos_cadastros_fornecedor) return res.status(400).send('Fornecedor não enviado')

    id_sb_contratos_cadastros_fornecedor = id_sb_contratos_cadastros_fornecedor.split(',').map(item => parseInt(item))
    await prisma.sb_contratos_cadastros_fornecedor.deleteMany({ where: { id_sb_contratos_cadastros_fornecedor: { in: id_sb_contratos_cadastros_fornecedor } } })
    await prisma.$disconnect()

    return res.status(200).send('Fornecedor deletado com sucesso')
  }
}

export default handler
