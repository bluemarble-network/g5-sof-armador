import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../utils/database'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return arquivosNavio()
    default:
      break
  }
  async function arquivosNavio() {
    const { id_arquivo } = req.query as { id_arquivo: string }

    const dados = await prisma.embarqueSOF_Arquivos.findUnique({
      select: {
        NomeDocumentoFinal: true,
        sof_number: true,
        ArquivoDocumentoFinal: true
      },
      where: { idEmbarqueSOF_Arquivos: parseInt(id_arquivo) }
    })

    if (!dados || !dados.ArquivoDocumentoFinal) {
      return res.status(404).send('arquivo não encontrado')
    }
    const buffer = Buffer.from(dados.ArquivoDocumentoFinal).toString('base64')

    await prisma.$disconnect()
    return res.status(200).json({
      NomeDocumentoFinal: dados.NomeDocumentoFinal,
      sof_number: dados.sof_number,
      ArquivoDocumentoFinal: buffer
    })
  }
}
