import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../utils/database'

function handler (req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return GET()
    case 'POST':
      return POST()
    case 'PUT':
      return PUT()
    case 'DELETE':
      return DELETE()

    default:
      return res.status(400).send('No method provider')
  }

  async function GET () {
    const dados = await prisma.groups.findMany({
      where: {
        modules: {
          slug: process.env.MODULE
        }
      }
    })

    await prisma.$disconnect()

    return res.status(200).json(dados)
  }

  async function POST () {
    const props = req.body

    const groups = await prisma.groups.create({
      data: {
        module_id: 1,
        ...props
      }
    })

    await prisma.$disconnect()

    return res.status(201).send(groups)
  }

  async function DELETE () {
    const { group_id }: any = req.query

    await prisma.groups.delete({
      where: {
        id: parseInt(group_id)
      }
    })

    await prisma.$disconnect()

    return res.status(200).end()
  }

  async function PUT () {
    const { user_id }: any = req.query
    let { add, remove } = req.body

    if (!user_id) return res.status(400).send('usuário não enviado')
    if (remove.length > 0) {
      await prisma.users_groups.deleteMany({ where: { group_id: { in: [...remove] } } })
    }

    const storageGroups = await prisma.users_groups.findMany({
      where: {
        user_id
      }
    })

    const storageGroupsId = storageGroups.map(item => item.group_id)

    add = add.filter(item => !storageGroupsId.includes(item))
    const items:any = []
    for (let x = 0; x < add.length; x++) {
      items.push({ user_id, group_id: add[x] })
    }
    const result = await prisma.users_groups.createMany({ data: items })
    await prisma.$disconnect()

    return res.status(200).send(result)
  }
}

export default handler
