import { NextApiRequest, NextApiResponse } from 'next'
import { apiRoute, s3 } from '../../../middleware/multer'
import { prisma } from '../../../utils/database'
interface IRequest extends NextApiRequest {
  file: any
}

const handler = apiRoute.post(
  async function (req:IRequest, res:NextApiResponse) {
    const { Navio_Id } = req.body
    const arquivo = req.file.Location
    const verificarArquivo = await prisma.navio_Sof_Armador.findFirst({
      where: {
        Navio_Id: parseInt(Navio_Id)
      }
    })
    if (verificarArquivo) {
      const nomeArquivo = verificarArquivo.arquivo.split('/').pop()
      s3.deleteObject({ Bucket: 'naviosofarmador', Key: String(nomeArquivo) }
        , () => {})
      const novoDocumento = await prisma.navio_Sof_Armador.update({
        data: {
          arquivo
        },
        where: {
          Id: verificarArquivo.Id
        }
      })
      await prisma.$disconnect()
      return res.json(novoDocumento)
    }
    const novoDocumento = await prisma.navio_Sof_Armador.create({
      data: {
        Navio_Id: parseInt(Navio_Id), arquivo
      }
    })
    await prisma.$disconnect()
    return res.json(novoDocumento)
  }
)
export const config = {
  api: {
    bodyParser: false
  }
}
export default handler
