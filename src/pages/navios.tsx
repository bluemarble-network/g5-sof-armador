import { Box, IconButton, Tooltip, Typography } from '@material-ui/core'
import { EmbarqueSOF, Navio_Sof_Armador } from '@prisma/client'
import { Form } from '@unform/web'
import { useState, useRef, useEffect, useContext } from 'react'
import { MdPictureAsPdf, MdRemoveRedEye } from 'react-icons/md'
import { LargeButton } from '../components/_button'
import { InputFile } from '../components/_form'
import { filterData, Grid, IFilter } from '../components/_grid'
import { Td, Tr } from '../components/_grid/components'
import { Modal } from '../components/_modal'
import { AlertContext } from '../contexts/alert'
import { api } from '../utils/api'

interface IDados extends EmbarqueSOF{
  Navio_Sof_Armador:Navio_Sof_Armador[]
}

export default function Navio () {
  const [dados, setDados] = useState<IDados[]>([])
  const [loading, setLoading] = useState(false)
  const [dadosFiltrados, setDadosFiltrados] = useState<IDados[]>([])
  const [filtros, setfiltros] = useState<IFilter[]>([])
  const [modal, setModal] = useState('')
  const [progress, setProgress] = useState(0)
  const dadosOriginais = useRef<IDados[]>([])
  const [idNavio, setidNavio] = useState(0)
  const { createAlert } = useContext(AlertContext)
  const titulos = [
    { name: 'SOF_Number', label: 'Navio Viagem' },
    { name: 'Vessel', label: 'Navio' },
    { name: 'PDF', label: ' ' }
  ]
  async function AtualizarFiltros () {
    const dados = filterData(filtros, dadosOriginais)
    setDadosFiltrados(dados)
  }
  async function getdados () {
    setLoading(true)
    try {
      const { data } = await api.get('/navios')
      setDadosFiltrados(data)
      setDados(data.slice(0, 6))
      dadosOriginais.current = data
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }
  function handleUploadArquivo (item:IDados) {
    setModal('envio')
    setidNavio(item.Id)
  }
  function handleVerArquivo (item:IDados):string {
    if (item.Navio_Sof_Armador.length > 0) {
      return item.Navio_Sof_Armador[0].arquivo
    }
    return ''
  }
  async function handleSubmit (campos) {
    const Form = new FormData()
    Form.append('file', campos.arquivo)
    Form.append('Navio_Id', String(idNavio))
    setLoading(true)
    try {
      await api.post('/uploadArquivo', Form, {
        onUploadProgress: (event) => {
          const total = Math.floor(event.loaded * 100 / event.total)
          setProgress(total)
        }
      })
      setProgress(0)
      getdados()
      setLoading(false)
      createAlert('Upload Realizado', 'success')
      setModal('')
    } catch (error) {
      setLoading(false)
      setProgress(0)
    }
  }

  useEffect(() => {
    getdados()
  }, [])
  return (
        <Box sx={{ width: 'calc(100vw - 8px * 10)', margin: 'auto', py: 8 }}>
            <Grid
            columTitles={titulos}
            defaultData={dadosFiltrados}
            selectedFilters={filtros}
            setSelectedFilters={setfiltros}
            tableData={dados}
            setTableData={setDados}
            updateFilters={AtualizarFiltros}
            isLoading={loading}
            >
            {
              dados.map((item, index) => {
                return (
                  <Tr key={index}>
                    <Td>
                      {item.SOF_Number}
                    </Td>
                    <Td>
                      {item.Vessel}
                    </Td>
                    <Td width={100}>
                      <Box sx={{ display: 'flex' }}>
                      <Tooltip title='Enviar Documento'>
                      <IconButton onClick={() => handleUploadArquivo(item)}>
                        <MdPictureAsPdf></MdPictureAsPdf>
                      </IconButton>
                      </Tooltip>
                      <Tooltip title='Visualizar Documento'>
                      <IconButton sx={{ color: (handleVerArquivo(item) === '') ? 'text.disabled' : 'text.secondary' }} href={handleVerArquivo(item)}>
                        <MdRemoveRedEye color='inherit'></MdRemoveRedEye>
                      </IconButton>
                      </Tooltip>
                      </Box>
                    </Td>
                  </Tr>
                )
              })
            }
            </Grid>
            <Modal open={modal === 'envio'} onClose={() => setModal('')}>
              <Box sx={{ py: 3, px: 2, width: '100vw', maxWidth: '400px' }}>
              <Form onSubmit={handleSubmit}>
                <Typography variant='h6' fontWeight='bold'>Enviar Documento</Typography>
                <InputFile name='arquivo' label='Upload' type='File' progress={progress}></InputFile>
                <LargeButton type='submit' title='Enviar' loading={loading}></LargeButton>
              </Form>
              </Box>
            </Modal>
        </Box>
  )
}

Navio.requireAuth = true
