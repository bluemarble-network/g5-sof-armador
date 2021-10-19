import { Box, Checkbox, CssBaseline, IconButton, Tooltip, Typography } from '@material-ui/core'
import { Form } from '@unform/web'
import Head from 'next/head'
import { useState, useContext, useEffect, useRef } from 'react'
import { MdEdit, MdDelete } from 'react-icons/md'
import { GridButton, LargeButton } from '../../../components/_button'
import { Dialog } from '../../../components/_dialog'
import { Input } from '../../../components/_form'
import { filterData, Grid, IFilter } from '../../../components/_grid'
import { Header, Td, Tr } from '../../../components/_grid/components'
import { Modal } from '../../../components/_modal'
import { AlertContext } from '../../../contexts/alert'
import { api } from '../../../utils/api'

type IDados = {
    id_sb_contratos_cadastros_area_responsavel : number
    area_responsavel : string
}

const columTitles = [
  { name: 'area_responsavel', label: 'Área Responsável' }
]

function AreaResponsavel () {
  const [dadosFiltrados, setDadosFiltrados] = useState<IDados[]>([])
  const [dadosPaginados, setDadosPaginados] = useState<IDados[]>([])
  const [filtrosSelecionados, setFiltrosSelecionados] = useState<IFilter[]>([])
  const [itensSelecionados, setItensSelecionados] = useState<IDados[]>([])

  const dadosOriginais = useRef<IDados[]>([])

  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState('')
  const [modalInsert, setModalInsert] = useState(false)

  const { createAlert } = useContext(AlertContext)

  async function getData () {
    setLoading(true)
    try {
      const { data } = await api.get('/contratos/cadastros/area_responsavel')
      dadosOriginais.current = data
      setDadosFiltrados(data)
      setDadosPaginados(data.slice(0, 6))
      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      createAlert(`${error.response.data}`, 'error')
    }
  }

  async function deleteRegister () {
    const ids = itensSelecionados.map(item => item.id_sb_contratos_cadastros_area_responsavel)
    setLoading(true)
    try {
      await api.delete(`/contratos/cadastros/area_responsavel?id_sb_contratos_cadastros_area_responsavel=${ids.join(',')}`)
    } catch (error: any) {
      setLoading(false)
      createAlert(`${error.response.data}`, 'error')
    }
  }

  const handleOpenModalEditar = () => {
    if (itensSelecionados.length >= 2) return createAlert('Só é possível editar um item por vez', 'warning')
    setModal('update')
  }

  const isSelected = (item: IDados) => {
    return itensSelecionados.some(sub => sub.id_sb_contratos_cadastros_area_responsavel === item.id_sb_contratos_cadastros_area_responsavel)
  }

  const handleSelectItem = (item: IDados) => {
    const itemJaExiste = itensSelecionados.find(itemSelecionado => itemSelecionado.id_sb_contratos_cadastros_area_responsavel === item.id_sb_contratos_cadastros_area_responsavel)

    if (itemJaExiste) {
      const novoArray = itensSelecionados.filter(sub => sub.id_sb_contratos_cadastros_area_responsavel !== itemJaExiste.id_sb_contratos_cadastros_area_responsavel)
      return setItensSelecionados(novoArray)
    }

    setItensSelecionados([...itensSelecionados, item])
  }

  const atualizarFiltros = () => {
    const novoArray = filterData(filtrosSelecionados, dadosOriginais)

    setDadosFiltrados(novoArray)
  }

  useEffect(() => {
    getData()
  }, [])

  return (
      <Box sx={{ py: 8 }}>
        <Head>
          <title>Área responsável</title>
        </Head>
        <CssBaseline/>
           <Box
            sx={{
              width: 'calc(100vw - 8px * 10)',
              margin: 'auto'
            }}
           >
               <Header title='Área Responsável'>
                   <GridButton color="success" type="insert" onClick={() => setModalInsert(true)} />
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
                         return (
                               <Tr key={index}>
                                   <Td width = "150px">
                                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <Checkbox checked={isSelected(item)} onChange={() => handleSelectItem(item)} size="small" />
                                            <Typography variant="body2">{item.area_responsavel}</Typography>
                                      </Box>
                                   </Td>
                               </Tr>
                         )
                       })
                   }
               </Grid>
            </Box>
            <Modal open = {modal === 'update'} onClose = {() => setModal('true')}>
                <FormEdit getDados={getData} fechaModal={setModal} selectItem = {itensSelecionados[0]}/>
            </Modal>
            <Modal open={modalInsert} onClose={() => setModalInsert(true)}>
                <FormInsert getDados={getData} fechaModal={setModalInsert}/>
            </Modal>
            <Dialog
                loading={loading}
                open={modal === 'delete'}
                title="Atenção"
                body={`Tem certeza que quer deletar a Área responsável ${itensSelecionados[0]?.area_responsavel}?`}
                options={[
                  { label: 'Apagar', focus: true, cb: () => deleteRegister() },
                  { label: 'Manter', focus: false, cb: () => setModal('') }
                ]} />
        </Box>
  )
}

AreaResponsavel.requireAuth = true
export default AreaResponsavel

function FormInsert ({ getDados, fechaModal }) {
  const { createAlert } = useContext(AlertContext)
  const [loading, setLoading] = useState(false)

  async function handleSubmit (campos) {
    try {
      setLoading(true)
      const response = await api.post('/contratos/cadastros/area_responsavel', campos)

      getDados()
      setLoading(false)
      fechaModal(false)

      console.log(response.data)
    } catch (error: any) {
      createAlert(`${error.response.data}`, 'error')
      setLoading(false)
    }
  }

  return (
        <Box sx={{ paddingX: 2, paddingY: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }} >Cadastrar Área Resposável</Typography>
            <Form onSubmit={handleSubmit}>
            <Input name="area_responsavel" label="Área Responsável" type="text"/>
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

  async function handleSubmit (campos) {
    try {
      setLoading(true)
      const response = await api.put(`/contratos/cadastros/area_responsavel?id_sb_contratos_cadastros_area_responsavel=${selectItem.id_sb_contratos_cadastros_area_responsavel}`, campos)

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
        <Box sx={{ paddingX: 2, paddingY: 4, maxWidth: 450 }} >
            <Typography variant="h5" sx={{ fontWeight: 'bold' }} >Editar Área Resposável: {selectItem.area_responsavel}</Typography>
            <Form onSubmit = {handleSubmit}>
                <Input name="area_responsavel" label="Área Responsável" type="text" defaultValue={selectItem.area_responsavel} />
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
