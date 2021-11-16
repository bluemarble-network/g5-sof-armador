import { NextApiRequest, NextApiResponse } from 'next'
import { hashPassword } from '../../../utils/auth'
import { prisma } from '../../../utils/database'

function handler(req: NextApiRequest, res: NextApiResponse) {
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

  async function GET() {
    const { login }: any = req.query

    if (login) {
      const dados = await prisma.users_suzanog5.findFirst({
        select: {
          name: true,
          login: true,
          role: true,
          users_groups: {
            select: {
              groups: {
                select: {
                  id: true,
                  name: true,
                  modules: true,
                  module_id: true,
                  display_name: true
                }
              }
            }
          }
        },
        where: {
          login
        }
      })

      const filteredGroups = dados?.users_groups.filter(
        (item) => item.groups.modules.slug === process.env.MODULE
      )
      const user = {
        ...dados,
        users_groups: filteredGroups
      }

      await prisma.$disconnect()

      return res.status(200).json(user)
    }

    const dados = await prisma.users_suzanog5.findMany({
      select: {
        name: true,
        login: true,
        role: true,
        users_groups: {
          select: {
            groups: {
              select: {
                id: true,
                name: true,
                modules: true,
                module_id: true,
                display_name: true
              }
            }
          }
        }
      }
    })

    await prisma.$disconnect()

    return res.status(200).json(dados)
  }

  async function POST() {
    const props = req.body

    if (props.password) props.password = await hashPassword(props.password)

    const dados = await prisma.users_suzanog5.create({
      data: props
    })

    await prisma.$disconnect()

    return res.status(201).json(dados)
  }

  async function PUT() {
    const { login }: any = req.query
    const props = req.body

    if (props.password) props.password = await hashPassword(props.password)

    const dados = await prisma.users_suzanog5.update({
      data: props,
      where: {
        login
      }
    })

    await prisma.$disconnect()

    return res.status(200).json(dados)
  }

  async function DELETE() {
    const { login }: any = req.query

    const dados = await prisma.users_suzanog5.deleteMany({
      where: {
        login: {
          in: login.split(',')
        }
      }
    })

    await prisma.$disconnect()

    return res.status(200).json(dados)
  }
}

export default handler
