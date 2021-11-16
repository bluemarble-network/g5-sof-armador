import { Box, IconButton, Tooltip, Typography } from '@material-ui/core'
import {
  EmbarqueSOF,
  Navio_Sof_Armador,
  EmbarqueSOF_Arquivos
} from '@prisma/client'
import { Form } from '@unform/web'
import { GetServerSidePropsContext } from 'next'
import { useState, useRef, useEffect, useContext } from 'react'
import {
  MdFileDownload,
  MdFindInPage,
  MdRemoveRedEye,
  MdFileUpload
} from 'react-icons/md'
import { LargeButton } from '../../components/_button'
import { InputFile } from '../../components/_form'
import { filterData, Grid, IFilter } from '../../components/_grid'
import { Td, Tr } from '../../components/_grid/components'
import { Modal } from '../../components/_modal'
import { AlertContext } from '../../contexts/alert'
import { api } from '../../utils/api'
import { getSessionContext } from '../../utils/auth'
import { prisma } from '../../utils/database'
import { getErrorMessage } from '../../utils/error'

interface IDados extends EmbarqueSOF {
  Navio_Sof_Armador: Navio_Sof_Armador[]
}

export default function Navio({ role }) {
  const [dados, setDados] = useState<IDados[]>([])
  const [loading, setLoading] = useState(false)
  const [dadosFiltrados, setDadosFiltrados] = useState<IDados[]>([])
  const [filtros, setfiltros] = useState<IFilter[]>([])
  const [modal, setModal] = useState('')
  const [progress, setProgress] = useState(0)
  const dadosOriginais = useRef<IDados[]>([])
  const [idNavio, setidNavio] = useState(0)
  const [selectedItem, setSelectedItem] = useState<IDados | null>(null)
  const { createAlert } = useContext(AlertContext)

  const titulos = [
    { name: 'SOF_Number', label: 'Navio Viagem' },
    { name: 'Vessel', label: 'Navio' },
    { name: 'PDF', label: ' ' }
  ]
  async function AtualizarFiltros() {
    const dados = filterData(filtros, dadosOriginais)
    setDadosFiltrados(dados)
  }
  async function getdados() {
    setLoading(true)
    try {
      const { data } = await api.get('/vessels')
      setDadosFiltrados(data)
      setDados(data.slice(0, 6))
      dadosOriginais.current = data
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }
  function handleUploadArquivo(item: IDados) {
    setModal('envio')
    setidNavio(item.Id)
  }
  async function handleSubmit(campos) {
    const Form = new FormData()
    Form.append('file', campos.arquivo)
    Form.append('Navio_Id', String(idNavio))
    setLoading(true)
    try {
      await api.post('/uploadArquivo', Form, {
        onUploadProgress: (event) => {
          const total = Math.floor((event.loaded * 100) / event.total)
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

  function handleOpenModalArchive(item: IDados) {
    setSelectedItem(item)
    setModal('archive')
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
        {dados.map((item, index) => {
          return (
            <Tr key={index}>
              <Td>{item.SOF_Number}</Td>
              <Td>{item.Vessel}</Td>
              <Td width={50}>
                <Box sx={{ display: 'flex' }}>
                  {role === 'admin' && (
                    <Tooltip
                      title={
                        item.Navio_Sof_Armador[0]
                          ? 'Upload document again'
                          : 'Upload document'
                      }
                    >
                      <IconButton onClick={() => handleUploadArquivo(item)}>
                        <MdFileUpload
                          color={
                            !item.Navio_Sof_Armador[0] ? '#ddd' : 'inherit'
                          }
                        />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title='See documents'>
                    <IconButton onClick={() => handleOpenModalArchive(item)}>
                      <MdFindInPage />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Td>
            </Tr>
          )
        })}
      </Grid>
      <Modal open={modal === 'archive'} onClose={() => setModal('')}>
        <Box sx={{ width: '100vw', maxWidth: 700 }}>
          {selectedItem?.SOF_Number && (
            <GridModalArquivosVessel
              armador={selectedItem?.Navio_Sof_Armador[0]}
              sof_number={selectedItem?.SOF_Number}
            />
          )}
        </Box>
      </Modal>
      <Modal open={modal === 'envio'} onClose={() => setModal('')}>
        <Box sx={{ py: 3, px: 2, width: '100vw', maxWidth: '400px' }}>
          <Form onSubmit={handleSubmit}>
            <Typography variant='h6' fontWeight='bold'>
              Enviar Documento
            </Typography>
            <InputFile
              name='arquivo'
              label='Upload'
              type='File'
              progress={progress}
            ></InputFile>
            <LargeButton
              type='submit'
              title='Enviar'
              loading={loading}
            ></LargeButton>
          </Form>
        </Box>
      </Modal>
    </Box>
  )
}

Navio.requireAuth = true

interface IGridModalArquivosVesselProps {
  sof_number: number
  armador?: Navio_Sof_Armador
}

const GridModalArquivosVessel = ({
  sof_number,
  armador
}: IGridModalArquivosVesselProps) => {
  const [data, setData] = useState<EmbarqueSOF_Arquivos[]>([])
  const [filteredData, setFilteredData] = useState<EmbarqueSOF_Arquivos[]>([])
  const [filters, setFilters] = useState<IFilter[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUrl, setSelectedUrl] = useState('')
  const [selectedTitle, setSelectedTitle] = useState('')
  const [pdfVisible, setPdfVisible] = useState(false)

  const titles = [{ label: 'File name', name: 'nomeArquivo' }]
  const defaultData = useRef<EmbarqueSOF_Arquivos[]>([])

  const { createAlert } = useContext(AlertContext)

  const updateFilter = () => {
    const array = filterData(filters, defaultData)
    setFilteredData(array)
  }

  const getData = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/vessels/sof_number/${sof_number}`)
      setLoading(false)
      setData(data)
    } catch (error) {
      createAlert(getErrorMessage(error), 'error')
    }
  }

  async function handleSelect(id: number) {
    try {
      const { data } = await api.get(`/vessels/archives/${id}`)
      setSelectedUrl(data.ArquivoDocumentoFinal)
      setSelectedTitle(data.NomeDocumentoFinal)
      setPdfVisible(true)
    } catch (error) {
      createAlert(getErrorMessage(error), 'error')
    }
  }

  function handleCloseModal() {
    setPdfVisible(false)
    setSelectedUrl('')
  }

  useEffect(() => {
    getData()
  }, [])

  return (
    <>
      <Grid
        columTitles={titles}
        defaultData={filteredData}
        selectedFilters={filters}
        setSelectedFilters={setFilters}
        tableData={data}
        setTableData={setData}
        updateFilters={updateFilter}
        isLoading={loading}
      >
        {data.map((item, index) => {
          return (
            <Tr key={index}>
              <Td>
                <Box
                  sx={{
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box>{item.NomeDocumentoFinal}</Box>
                  <Tooltip title='View File'>
                    <IconButton
                      onClick={() => handleSelect(item.idEmbarqueSOF_Arquivos)}
                    >
                      <MdRemoveRedEye />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Td>
            </Tr>
          )
        })}
        {armador && (
          <Tr>
            <Td>
              <Box
                sx={{
                  height: 20,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                {armador.arquivo.split('/').pop()}
                <IconButton
                  title='View File'
                  href={String(armador.arquivo)}
                  download
                  target='_blank'
                >
                  <MdFileDownload />
                </IconButton>
              </Box>
            </Td>
          </Tr>
        )}
      </Grid>
      {pdfVisible && (
        <Modal open={pdfVisible} onClose={() => handleCloseModal()}>
          <PdfViewer url={selectedUrl} title={selectedTitle} />
        </Modal>
      )}
    </>
  )
}

function PdfViewer({ url, title }) {
  const [isTooLarge, setIsTooLarge] = useState(false)

  useEffect(() => {
    const size = Buffer.byteLength(url)
    if (size > 1000000) setIsTooLarge(true)
  }, [])

  return (
    <Box sx={{ backgroundColor: 'white', width: '90vw', height: '90vh' }}>
      {!isTooLarge && (
        <embed
          width='100%'
          height='100%'
          src={`data:application/pdf;base64,${url}`}
        />
      )}
      {isTooLarge && (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          File exceeds the size limit for viewing, click download.
          <a download={title} href={`data:application/pdf;base64,${url}`}>
            <IconButton>
              <MdFileDownload />
            </IconButton>
            Download
          </a>
        </Box>
      )}
    </Box>
  )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getSessionContext(ctx.req)
  if (!session) return { props: {} }
  const groups = await prisma.groups.findMany({
    where: {
      users_groups: {
        some: {
          users_suzanog5: {
            login: session.user.login
          }
        }
      }
    }
  })
  const isAdmin = groups.some((group) => group.name === 'admin')
  if (isAdmin) return { props: { role: 'admin' } }
  const role = groups[0].name
  return { props: { role } }
}
