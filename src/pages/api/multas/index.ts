import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../utils/database'

function handler (req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return pegarTodos()
    case 'POST':
      return CadastrarNovaMulta()
    case 'PUT':
      return
    case 'DELETE':
      return

    default:
      return res.status(400).send('No method provider')
  }

  async function pegarTodos () {
    const dados = await prisma.$queryRaw(
           `SELECT 
               id_sb_multas,
               placa,
               frota,
               centro_custo,
               ait,
               IF(data_infracao = '0000-00-00', '1999-12-31', data_infracao) AS data_infracao,
               IF(data_recebimento_notificacao = '0000-00-00', '1999-12-31', data_recebimento_notificacao) AS data_recebimento_notificacao,
               condutor,
               IF(data_envio_setor_responsavel = '0000-00-00', '1999-12-31', data_envio_setor_responsavel) AS data_envio_setor_responsavel,
               IF(data_final_receber_area_responsavel = '0000-00-00', '1999-12-31', data_final_receber_area_responsavel) AS data_final_receber_area_responsavel,
               IF(data_retorno_area_responsavel = '0000-00-00', '1999-12-31', data_retorno_area_responsavel) AS data_retorno_area_responsavel,
               IF(data_prazo_indicacao = '0000-00-00', '1999-12-31', data_prazo_indicacao) AS data_prazo_indicacao,
               indicado_em,
               responsabilidade,
               IF(encaminhado_recurso = '0000-00-00', '1999-12-31', encaminhado_recurso) AS encaminhado_recurso,
               resposta_recurso,
               codigo_desdor,
               descricao_infracao,
               valor,
               periodo_lancamento_indicadores,
               sp,
               IF(envio_rh_documento_assinado = '0000-00-00', '1999-12-31', envio_rh_documento_assinado) AS envio_rh_documento_assinado,
               multa_abonada,
               observacao,
               cash_back,
               valor_cashback,
               data_cashback,
               numero_ndeo,
               condutor_ligacao
           FROM sb_multas `
    )
    await prisma.$disconnect()
    return res.status(200).send(dados)
  }

  async function CadastrarNovaMulta () {

  }
}

export default handler
