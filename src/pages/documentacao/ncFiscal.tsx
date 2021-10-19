import { Box, CssBaseline } from '@material-ui/core'
import { Form } from '@unform/web'
import axios from 'axios'
import Head from 'next/head'
import { useContext, useEffect, useState, useRef } from 'react'
import { GridButton, LargeButton } from '../../components/_button'
import { InputFile } from '../../components/_form'
import { filterData, Grid, IFilter } from '../../components/_grid'
import { Header, Td, Tr } from '../../components/_grid/components'
import { Modal } from '../../components/_modal'
import { AlertContext } from '../../contexts/alert'
import { api } from '../../utils/api'
import { getErrorMessage } from '../../utils/error'

interface IDados {
  id_sb_documentacao_nc_emissao_fiscal : number
  mes : string
  cliente : string
  documentos_emitidos : number
  processos_anulacao_complementar : number
  valor_incorreto : number
  valor_modificado : number
  impacto_financeiro_valor : number
  impacto_volumetria_porc : number
  impacto_financeiro_porc : number
  causal : string
  detalhamento : string
}

function NcFiscal () {
  const [data, setData] = useState<IDados[]>([])
  const [filteredData, setFilteredData] = useState<IDados[]>([])
  const [selectedFilters, setSelectedFilters] = useState<IFilter[]>([])

  const defaultData = useRef<IDados[]>([])

  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(false)
  const [progress, setProgress] = useState(0)
  const { createAlert } = useContext(AlertContext)

  async function getDados () {
    setLoading(true)
    const { data } = await api.get('/documentacao/ncFiscal')
    setFilteredData(data)
    defaultData.current = data
    setData(data.slice(0, 6))
    setLoading(false)
  }

  const columTitles = [
    { label: 'Mês', name: 'mes' },
    { label: 'Cliente', name: 'cliente' },
    { label: 'Doc. Emitidos', name: 'documentos_emitidos' },
    { label: 'Proc. Anulação Complementar', name: 'processos_anulacao_complementar' },
    { label: 'Valor Incorreto', name: 'valor_incorreto' },
    { label: 'Valor Modificado', name: 'valor_modificado' },
    { label: 'Impacto Financeiro Valor', name: 'impacto_financeiro_valor' },
    { label: 'Impacto Volumetria %', name: 'impacto_volumetria_porc' },
    { label: 'Impacto Financeiro', name: 'impacto_financeiro_porc' },
    { label: 'Causa', name: 'causal' },
    { label: 'Detalhamento', name: 'detalhamento' }

  ]

  // const ignore = [
  //   'documentos_emitidos',
  //   'processos_anulacao_complementar',
  //   'valor_incorreto',
  //   'valor_modificado',
  //   'impacto_financeiro_valor',
  //   'impacto_volumetria_porc',
  //   'impacto_financeiro_porc'
  // ]

  async function handleSubmit (campos) {
    setProgress(0)
    try {
      const response = await axios.post('https://dev.bluemarble.com.br/sc/app/SantosBrasil/blank_sb_nc_emissao_fiscal/', campos, {
        onUploadProgress: (e: any) => {
          const total = Math.floor((e.loaded * 100) / e.total)
          setProgress(total)
        }
      })
      if (response.data.includes('Fatal error')) {
        return createAlert('Erro ao realizar o Upload, favor verificar o arquivo anexado.', 'error')
      } else {
        createAlert('enviado com sucesso', 'success')
        getDados()
        setModal(false)
        setProgress(0)
      }
    } catch (error) {
      createAlert(getErrorMessage(error), 'error')
    }
  }

  const updateFilters = () => {
    const novoArray = filterData(selectedFilters, defaultData)

    setFilteredData(novoArray)
  }

  useEffect(() => {
    getDados()
  }, [])

  return (
      <Box sx={{ py: 8 }}>
        <Head>
          <title>Nota fiscal</title>
        </Head>
        <CssBaseline/>
        <Box
          sx={{
            width: 'calc(100vw - 8px * 10)',
            margin: 'auto'
          }}
        >
            <Header title = "NC's Fiscais">
            <GridButton title="Upload de Dados" color="primary" onClick={() => { setModal(true) }}/>
            </Header>
            <Grid
              columTitles={columTitles}
              defaultData={filteredData}
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              tableData={filteredData}
              setTableData={setData}
              updateFilters={updateFilters}
              isLoading={loading}
            >
              {
                data.map((item, index) => {
                  return (
                    <Tr key = {index}>
                      <Td>
                        {new Date(item.mes).toLocaleDateString('pt-BR', { timeZone: 'Europe/Madrid' })}
                      </Td>
                      <Td>
                        {item.cliente}
                      </Td>
                      <Td>
                        {item.documentos_emitidos}
                      </Td>
                      <Td>
                        {item.processos_anulacao_complementar}
                      </Td>
                      <Td>
                        {item.valor_incorreto}
                      </Td>
                      <Td>
                        {item.valor_modificado}
                      </Td>
                      <Td>
                        {item.impacto_financeiro_valor}
                      </Td>
                      <Td>
                        {item.impacto_volumetria_porc}
                      </Td>
                      <Td>
                        {item.impacto_financeiro_porc}
                      </Td>
                      <Td>
                        {item.causal}
                      </Td>
                      <Td>
                        {item.detalhamento}
                      </Td>
                    </Tr>
                  )
                })
              }
            </Grid>
        </Box>
        <Modal open={modal} onClose={setModal} >
          <Box sx={{ paddingX: 2, paddingY: 4, width: '100vw', maxWidth: '451px' }}>
              <Form onSubmit={handleSubmit} >
                <InputFile name="arquivo" label="Upload" type="file" progress={progress}/>
                <LargeButton title="Upload" loading = {false} type="submit"/>
              </Form>
              </Box>
        </Modal>
      </Box>
  )
}

NcFiscal.requireAuth = true

export default NcFiscal
