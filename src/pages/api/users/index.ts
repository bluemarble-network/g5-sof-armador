import { NextApiRequest, NextApiResponse } from 'next'
import { hashPassword } from '../../../utils/auth'
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
    const { login }: any = req.query

    if (login) {
      const dados = await prisma.sec_users.findFirst({
        select: {
          name: true,
          login: true,
          email: true,
          funcao: true,
          users_groups: {
            select: {
              groups: true
            },
            where: {
              groups: {
                modules: {
                  slug: process.env.MODULE
                }
              }
            }
          }
        },
        where: {
          login
        }
      })

      await prisma.$disconnect()

      return res.status(200).json(dados)
    }

    const dados = await prisma.sec_users.findMany({
      select: {
        name: true,
        login: true,
        email: true,
        funcao: true,
        users_groups: {
          select: {
            groups: true
          }
        }
      }
    })

    await prisma.$disconnect()

    return res.status(200).json(dados)
  }

  async function POST () {
    const props = req.body

    const dados = await prisma.sec_users.create({
      data: props
    })

    if (props.pswd) props.pswd = await hashPassword(props.pswd)

    await prisma.$disconnect()

    return res.status(201).json(dados)
  }

  async function PUT () {
    const { login }: any = req.query
    const props = req.body

    if (props.pswd) props.pswd = await hashPassword(props.pswd)

    const dados = await prisma.sec_users.update({
      data: props,
      where: {
        login
      }
    })

    await prisma.$disconnect()

    return res.status(200).json(dados)
  }

  async function DELETE () {
    const { login }: any = req.query

    const dados = await prisma.sec_users.deleteMany({
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
