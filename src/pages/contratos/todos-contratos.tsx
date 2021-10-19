import { Box, CssBaseline, IconButton, Typography, Checkbox, Tooltip, Autocomplete } from '@material-ui/core'
import { Form } from '@unform/web'
import Head from 'next/head'
import { useState, useContext, useEffect, useRef } from 'react'
import { MdEdit, MdDelete } from 'react-icons/md'
import { GridButton, LargeButton } from '../../components/_button'
import { Dialog } from '../../components/_dialog'
import { Input } from '../../components/_form'
import { filterData, Grid, IFilter } from '../../components/_grid'
import { Header, Td, Tr } from '../../components/_grid/components'
import { Modal } from '../../components/_modal'
import { AlertContext } from '../../contexts/alert'
import { api } from '../../utils/api'
import { getErrorMessage } from '../../utils/error'
import { moment } from '../../utils/moment'

interface IDados {
  id_sb_contratos : number
  fornecedor : string
  contrato_sap : string
  objeto_do_contrato : string
  vigencia_inicio : string
  vigencia_termino : string
  data_para_renovacao : string
  prazo_de_vencimento : number
  status_contrato : string
  area_responsavel : string
  gestor : string
  email_contato : string
  observacoes : string
}

const columTitles = [
  { name: 'fornecedor', label: 'Fornecedor' },
  { name: 'contrato_sap', label: 'Contrato SAP' },
  { name: 'objeto_do_contrato', label: 'Obj. Contrato' },
  { name: 'vigencia_inicio', label: 'Inicio Vigência' },
  { name: 'vigencia_termino', label: 'Termino Vigência' },
  { name: 'data_para_renovacao', label: 'Data Renovação' },
  { name: 'prazo_de_vencimento', label: 'Prazo de Vencimento' },
  { name: 'status_contrato', label: 'Status' },
  { name: 'area_responsavel', label: 'Área Responsável' },
  { name: 'gestor', label: 'Gestor' }
]

function Contratos () {
  const [dadosFiltrados, setDadosFiltrados] = useState<IDados[]>([])
  const [dadosPaginados, setDadosPaginados] = useState<IDados[]>([])
  const [filtrosSelecionados, setFiltrosSelecionados] = useState<IFilter[]>([])
  const [itensSelecionados, setItensSelecionados] = useState<IDados[]>([])

  const dadosOriginais = useRef<IDados[]>([])

  const [loading, setLoading] = useState(false)
  const { createAlert } = useContext(AlertContext)

  const [modal, setModal] = useState('')
  const [modalInsert, setModalInsert] = useState(false)

  async function getData () {
    setLoading(true)
    try {
      const { data }: { data: any[] } = await api.get('/contratos')

      dadosOriginais.current = data
      setDadosFiltrados(data)
      setDadosPaginados(data.slice(0, 6))
      setLoading(false)
    } catch (error) {
      createAlert(getErrorMessage(error), 'error')
      setLoading(false)
    }
  }

  useEffect(() => {
    getData()
  }, [])

  async function deleteRegister () {
    const ids = itensSelecionados.map(item => item.id_sb_contratos)

    setLoading(true)
    try {
      await api.delete(`/contratos?id_sb_contratos=${ids.join(',')}`)
      setModal('')
      setLoading(false)
      getData()
      setItensSelecionados([])
    } catch (error: any) {
      setLoading(false)
      createAlert(getErrorMessage(error), 'error')
    }
  }

  const handleOpenModalEditar = () => {
    if (itensSelecionados.length >= 2) return createAlert('Só é possível editar um item por vez', 'warning')
    setModal('update')
  }

  const isSelected = (item: IDados) => {
    return itensSelecionados.some(sub => sub.id_sb_contratos === item.id_sb_contratos)
  }

  const handleSelectItem = (item: IDados) => {
    const itemJaExiste = itensSelecionados.find(itemSelecionado => itemSelecionado.id_sb_contratos === item.id_sb_contratos)

    if (itemJaExiste) {
      const novoArray = itensSelecionados.filter(sub => sub.id_sb_contratos !== itemJaExiste.id_sb_contratos)
      return setItensSelecionados(novoArray)
    }

    setItensSelecionados([...itensSelecionados, item])
  }

  const atualizarFiltros = () => {
    const novoArray = filterData(filtrosSelecionados, dadosOriginais)

    setDadosFiltrados(novoArray)
  }

  return (
    <Box sx={{ py: 8 }}>
      <Head>
        <title>Contratos</title>
      </Head>
    <CssBaseline/>
    <Box
      sx={{
        width: 'calc(100vw - 8px * 10)',
        margin: 'auto'
      }}
    >
    <Header title = "Contratos">
      <GridButton color="success" type="insert" onClick={() => setModalInsert(true)}/>
    </Header>
    <Grid
      customButtons={<ActionButtons handleOpenModalEditar={handleOpenModalEditar} items={itensSelecionados} setModal={setModal} />}
      columTitles={columTitles}
      defaultData={dadosFiltrados}
      selectedFilters={filtrosSelecionados}
      setSelectedFilters={setFiltrosSelecionados}
      tableData={dadosPaginados}
      setTableData={setDadosPaginados}
      updateFilters={atualizarFiltros}
      isLoading={loading}
    >
    {
      dadosPaginados.map((item, index) => {
        const now = moment(new Date())
        const past = moment(new Date(item.vigencia_termino))
        const duration = moment.duration(past.diff(now))

        // Mostra a diferença em dias
        const dias = duration.asDays()

        let status_contrato = ''
        if (item.vigencia_termino) {
          if (status_contrato !== 'EM PROCESSO DE RENOVAÇÂO') {
            if (dias >= 90) {
              status_contrato = 'VIGENTE'
            } else if (dias < 90 && dias >= 0) {
              status_contrato = 'A VENCER'
            } else {
              status_contrato = 'VENCIDO'
            }
          }
        } else {
          status_contrato = 'VIGÊNCIA INDETERMINADA'
        }

        return (
          <Tr
            sx={{
              backgroundColor: isSelected(item) ? '#00aa4a3d!important' : 'inherit',
              ':hover': {
                backgroundColor: isSelected(item) ? '#00aa4a3d!important' : 'inherit'
              }
            }}
            key={index}
          >
            <Td>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Checkbox checked={isSelected(item)} onChange={() => handleSelectItem(item)} size="small" />
                <Typography variant="body2">{item.fornecedor}</Typography>
              </Box>
            </Td>
            <Td>{item.contrato_sap}</Td>
            <Td>{item.objeto_do_contrato}</Td>
            <Td>{moment(item.vigencia_inicio).utc().format('DD/MM/YYYY')}</Td>
            <Td>{moment(item.vigencia_termino).utc().format('DD/MM/YYYY')}</Td>
            <Td>{moment(item.data_para_renovacao).utc().format('DD/MM/YYYY')}</Td>
            <Td>{parseInt(String(dias))}</Td>
            <Td>{status_contrato}</Td>
            <Td>{item.area_responsavel}</Td>
            <Td>{item.gestor}</Td>
          </Tr>
        )
      })
      }
      </Grid>
      </Box>
      <Modal open={modal === 'update'} onClose={() => setModal('true')} >
        <FormEdit getDados={getData} fechaModal={setModal} selectItem={itensSelecionados[0]} />
      </Modal>
      <Modal open={modalInsert} onClose={() => setModalInsert(false)} >
        <FormInsert getDados={getData} fechaModal={setModalInsert} />
      </Modal>
      <Dialog
        loading={loading}
        open={modal === 'delete'}
        title="Atenção"
        body={`Tem certeza que quer deletar o contrato ${itensSelecionados[0]?.objeto_do_contrato}?`}
        options={[
          { label: 'Apagar', focus: true, cb: () => deleteRegister() },
          { label: 'Manter', focus: false, cb: () => setModal('') }
        ]}
      />
      </Box>
  )
}

Contratos.requireAuth = true
export default Contratos

interface IStatusContrato {
  id_sb_contratos_cadastros_status_contrato: number
  status_contrato: string
}

interface IAreaResponsavel {
  area_responsavel: string
  id_sb_contratos_cadastros_area_responsavel: number
}

function FormInsert ({ getDados, fechaModal }) {
  const { createAlert } = useContext(AlertContext)
  const [loading, setLoading] = useState(false)
  const [statusContrato, setStatusContrato] = useState<IStatusContrato[]>([])
  const [areaResponsavel, setAreaResponsavel] = useState<IAreaResponsavel[]>([])

  async function handleSubmit (campos) {
    try {
      setLoading(true)
      const response = await api.post('/contratos', campos)
      getDados()
      setLoading(false)
      fechaModal(false)

      console.log(response.data)
    } catch (error: any) {
      createAlert(getErrorMessage(error), 'error')
      setLoading(false)
    }
  }

  const getStatusContrato = async () => {
    try {
      const { data: statusContrato } = await api.get('/contratos/cadastros/status_contrato')
      const { data: areaResponsavel } = await api.get('/contratos/cadastros/area_responsavel')
      setStatusContrato(statusContrato)
      setAreaResponsavel(areaResponsavel)
    } catch (error) {
      createAlert(getErrorMessage(error), 'error')
    }
  }

  useEffect(() => {
    getStatusContrato()
  }, [])

  return (
        <Box sx={{ paddingX: 2, paddingY: 4, width: 600 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }} >Cadastrar Contrato</Typography>
          <Form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Input name="fornecedor" label="Fornecedor" type="text"/>
              <Input name="contrato_sap" label="Contrato SAP" type="text"/>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Input name="objeto_do_contrato" label="Objeto Do Contrato" type="text"/>
              <Autocomplete
                options={statusContrato}
                getOptionLabel={option => option.status_contrato}
                disablePortal
                fullWidth
                renderInput={ props => <Input {...props} name="status_contrato" label="Status Contrato" />}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Autocomplete
                options={areaResponsavel}
                getOptionLabel={option => option.area_responsavel}
                disablePortal
                fullWidth
                renderInput={ props => <Input {...props} name="area_responsavel" label="Área Responsável" />}
              />
              <Input name="gestor" label="Gestor" type="text"/>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Input name="vigencia_inicio" label="Vigência Início" type="date" InputLabelProps={{ shrink: true }}/>
              <Input name="vigencia_termino" label="Vigência Término" type="date" InputLabelProps={{ shrink: true }}/>
              <Input name="data_para_renovacao" label="Data p/ Renovação" type="date" InputLabelProps={{ shrink: true }}/>
            </Box>
              <Input name="email_contato" label="E-mail" type="text"/>
              <Input name="observacoes" label="Observações" type="text"/>

            <Box sx={{ width: '100%', marginTop: 2 }}>
              <LargeButton type="submit" loading={loading} title="Inserir" />
            </Box>
          </Form>
        </Box>
  )
}

function FormEdit ({ getDados, fechaModal, selectItem }) {
  const { createAlert } = useContext(AlertContext)
  const [loading, setLoading] = useState(false)
  const [statusContrato, setStatusContrato] = useState<IStatusContrato[]>([])
  const [areaResponsavel, setAreaResponsavel] = useState<IAreaResponsavel[]>([])

  const getStatusContrato = async () => {
    try {
      const { data: statusContrato } = await api.get('/contratos/cadastros/status_contrato')
      const { data: areaResponsavel } = await api.get('/contratos/cadastros/area_responsavel')
      setStatusContrato(statusContrato)
      setAreaResponsavel(areaResponsavel)
    } catch (error) {
      createAlert(getErrorMessage(error), 'error')
    }
  }

  useEffect(() => {
    getStatusContrato()
  }, [])

  async function handleSubmit (campos) {
    try {
      setLoading(true)
      const response = await api.put(`/contratos?id_sb_contratos=${selectItem.id_sb_contratos}`, campos)

      setLoading(false)
      fechaModal(false)
      getDados()

      console.log(response.data)
    } catch (error: any) {
      createAlert(`${error.response.data}`, 'error')
      setLoading(false)
    }
  }

  return (
          <Box sx={{ paddingX: 2, paddingY: 4, width: 600 }} >
            <Typography variant="h5" sx={{ fontWeight: 'bold' }} >Editar Contrato: {selectItem.objeto_do_contrato}</Typography>
            <Form onSubmit = {handleSubmit} initialData={selectItem}>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Input name="fornecedor" label="Fornecedor" type="text" defaultValue={selectItem.fornecedor}/>
                <Input name="contrato_sap" label="Contrato SAP" type="text" defaultValue={selectItem.contrato_sap}/>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Input name="objeto_do_contrato" label="Objeto Do Contrato" type="text" defaultValue={selectItem.objeto_do_contrato}/>
                <Autocomplete
                  options={statusContrato}
                  getOptionLabel={option => option.status_contrato}
                  disablePortal
                  fullWidth
                  defaultValue={{ id_sb_contratos_cadastros_status_contrato: 0, status_contrato: selectItem.status_contrato }}
                  renderInput={ props => <Input {...props} name="status_contrato" label="Status Contrato" />}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Autocomplete
                  options={areaResponsavel}
                  getOptionLabel={option => option.area_responsavel}
                  disablePortal
                  fullWidth
                  defaultValue={{ id_sb_contratos_cadastros_area_responsavel: 0, area_responsavel: selectItem.area_responsavel }}
                  renderInput={ props => <Input {...props} name="area_responsavel" label="Área Responsável" />}
                />
                <Input name="gestor" label="Gestor" type="text" defaultValue={selectItem.gestor}/>
              </Box>
              <Box sx={{ display: 'flex', gridGap: 3 }}>
                <Input name="vigencia_inicio" label="Vigência Início" type="date" InputLabelProps={{ shrink: true }} defaultValue={`${new Date(selectItem.vigencia_inicio).toLocaleString('pt-BR', { timeZone: 'Europe/Madrid' }).split(' ')[0].split('/').reverse().join('-')}`}/>
                <Input name="vigencia_termino" label="Vigência Término" type="date" InputLabelProps={{ shrink: true }} defaultValue={`${new Date(selectItem.vigencia_termino).toLocaleString('pt-BR', { timeZone: 'Europe/Madrid' }).split(' ')[0].split('/').reverse().join('-')}`}/>
                <Input name="data_para_renovacao" label="Data p/ Renovação" type="date" InputLabelProps={{ shrink: true }} defaultValue={`${new Date(selectItem.data_para_renovacao).toLocaleString('pt-BR', { timeZone: 'Europe/Madrid' }).split(' ')[0].split('/').reverse().join('-')}`}/>
              </Box>
              <Input name="email_contato" label="E-mail" type="text"/>
              <Input name="observacoes" label="Observações" type="text"/>
              <LargeButton title ="Salvar" loading = {loading} type="submit"/>
            </Form>
          </Box>
  )
}

interface IActionButtons {
  items: IDados[]
  setModal(value: string): void
  handleOpenModalEditar(): void
}

function ActionButtons ({ items, setModal, handleOpenModalEditar }: IActionButtons) {
  if (items.length < 1) return <></>

  return (
    <>
      <Tooltip title="Editar">
        <IconButton onClick={() => handleOpenModalEditar()}>
          <MdEdit />
        </IconButton>
      </Tooltip>
      <Tooltip title="Deletar">
        <IconButton onClick={() => setModal('delete')}>
          <MdDelete />
        </IconButton>
      </Tooltip>
    </>
  )
}
