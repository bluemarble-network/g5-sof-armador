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
import { formatToMoney } from '../../utils/formatToMoney'

type IDados = {
  id_sb_documentacao_aderencia_ciot : number
  semana : number
  competencia : string
  volume : number
  valor_volume : number
  emitidos : number
  valor_emitido : number
  autorizado : number
  valor_autorizado : number
  rejeitado : number
  valor_rejeitad : number
  nao_emitidos : number
  valor_nao_emitidos : number
  motivo_rejeicao : string
  porcentagem_emitidos : number
  porcentagem_rejeitados : number
  porcentagem_nao_emitidos : number
}

function Ciot () {
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
    const { data }: { data: any[] } = await api.get('/documentacao/ciot')
    setFilteredData(data)
    defaultData.current = data
    setData(data.slice(0, 6))
    setLoading(false)
  }

  const columTitles = [
    { label: 'Semana', name: 'semana' },
    { label: 'Competência', name: 'competencia' },
    { label: 'Volume', name: 'volume' },
    { label: 'Valor Volume', name: 'valor_volume' },
    { label: 'Emitidos', name: 'emitidos' },
    { label: 'Valor Emitido', name: 'valor_emitidos' },
    { label: 'Autorizado', name: 'autorizado' },
    { label: 'Valor Autorizado', name: 'valor_autorizado' },
    { label: 'Rejeitado', name: 'rejeitado' },
    { label: 'Valor Rejeitado', name: 'valor_rejeitado' },
    { label: 'Não Emitidos', name: 'nao_emitidos' },
    { label: 'Valor Não Emitidos', name: 'valor_nao_emitidos' },
    { label: 'Motivo rejeição', name: 'motivo_rejeicao' },
    { label: 'Porcentagem Emitidos', name: 'porcentagem_emitidos' },
    { label: 'Porcentagem Rejeitados', name: 'porcentagem_rejeitados' },
    { label: 'Porcentagem Não Emitidos', name: 'porcentagem_nao_emitidos' }

  ]

  async function handleSubmit (campos) {
    setLoading(true)
    try {
      await axios.post('https://dev.bluemarble.com.br/sc/app/SantosBrasil/blank_sb_ciot_excel/', campos, {
        onUploadProgress: (e: any) => {
          const total = Math.floor((e.loaded * 100) / e.total)
          setProgress(total)
        }
      })

      createAlert('Enviado com sucesso', 'success')
      getDados()
      setLoading(false)
      setProgress(0)
      setModal(false)
    } catch (error: any) {
      setLoading(false)
      createAlert(error.response, 'error')
      setProgress(0)
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
          <title>Documentação</title>
        </Head>
        <CssBaseline/>
        <Box
          sx={{
            width: 'calc(100vw - 8px * 10)',
            margin: 'auto'
          }}
        >
            <Header title = "CIOT">
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
                        {item.semana}
                      </Td>
                      <Td>
                        {new Date(item.competencia).toLocaleDateString()}
                      </Td>
                      <Td>
                        {item.volume}
                      </Td>
                      <Td>
                        {item.valor_volume > 0 ? formatToMoney(item.valor_volume) : 0}
                      </Td>
                      <Td>
                        {item.emitidos}
                      </Td>
                      <Td>
                        {item.valor_emitido > 0 ? formatToMoney(item.valor_emitido) : 0}
                      </Td>
                      <Td>
                        {item.autorizado}
                      </Td>
                      <Td>
                        {item.valor_autorizado > 0 ? formatToMoney(item.valor_autorizado) : 0}
                      </Td>
                      <Td>
                        {item.rejeitado}
                      </Td>
                      <Td>
                        {item.valor_rejeitad > 0 ? formatToMoney(item.valor_rejeitad) : 0}
                      </Td>
                      <Td>
                        {item.nao_emitidos}
                      </Td>
                      <Td>
                        {item.valor_nao_emitidos > 0 ? formatToMoney(item.valor_nao_emitidos) : 0}
                      </Td>
                      <Td>
                        {item.motivo_rejeicao}
                      </Td>
                      <Td>
                        {item.porcentagem_emitidos}
                      </Td>
                      <Td>
                        {item.porcentagem_rejeitados}
                      </Td>
                      <Td>
                        {item.porcentagem_nao_emitidos}
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
                <LargeButton title="Upload" loading = {loading} type="submit"/>
              </Form>
              </Box>
        </Modal>
      </Box>
  )
}

Ciot.requireAuth = true
export default Ciot
