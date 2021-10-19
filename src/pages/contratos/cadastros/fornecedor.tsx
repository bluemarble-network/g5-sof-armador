import { Box, Checkbox, CssBaseline, IconButton, Tooltip, Typography } from '@material-ui/core'
import { Form } from '@unform/web'
import Head from 'next/head'
import { useState, useContext, useEffect, useRef } from 'react'
import { MdDelete, MdEdit } from 'react-icons/md'
import { GridButton, LargeButton } from '../../../components/_button'
import { Dialog } from '../../../components/_dialog'
import { Input } from '../../../components/_form'
import { filterData, Grid, IFilter } from '../../../components/_grid'
import { Header, Td, Tr } from '../../../components/_grid/components'
import { Modal } from '../../../components/_modal'
import { AlertContext } from '../../../contexts/alert'
import { api } from '../../../utils/api'
import { getErrorMessage } from '../../../utils/error'

interface IDados {
    id_sb_contratos_cadastros_fornecedor : number
    fornecedor : string
    decricao : string
}

const columTitles = [
  { name: 'fornecedor', label: 'Forncedor' },
  { name: 'decricao', label: 'Descrição' }
]

function Fornecedor () {
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
      const { data } = await api.get('/contratos/cadastros/fornecedor')
      dadosOriginais.current = data
      setDadosFiltrados(data)
      setDadosPaginados(data.slice(0, 6))
      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      createAlert(getErrorMessage(error), 'error')
    }
  }

  useEffect(() => {
    getData()
  }, [])

  async function deleteRegister () {
    const ids = itensSelecionados.map(item => item.id_sb_contratos_cadastros_fornecedor)
    setLoading(true)
    try {
      await api.delete(`/contratos/cadastros/fornecedor?id_sb_contratos_cadastros_fornecedor=${ids.join(',')}`)
      setModal('')
      setLoading(false)
      getData()
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
    return itensSelecionados.some(sub => sub.id_sb_contratos_cadastros_fornecedor === item.id_sb_contratos_cadastros_fornecedor)
  }

  const handleSelectItem = (item: IDados) => {
    const itemJaExiste = itensSelecionados.find(itemSelecionado => itemSelecionado.id_sb_contratos_cadastros_fornecedor === item.id_sb_contratos_cadastros_fornecedor)

    if (itemJaExiste) {
      const novoArray = itensSelecionados.filter(sub => sub.id_sb_contratos_cadastros_fornecedor !== itemJaExiste.id_sb_contratos_cadastros_fornecedor)
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
          <title>Fornecedor</title>
        </Head>
        <CssBaseline/>
           <Box
            sx={{
              width: 'calc(100vw - 8px * 10)',
              margin: 'auto'
            }}
           >
               <Header title='Fornecedor'>
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
                                   <Td>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Checkbox checked={isSelected(item)} onChange={() => handleSelectItem(item)} size="small" />
                                        <Typography variant="body2">{item.fornecedor}</Typography>
                                    </Box>
                                   </Td>
                                   <Td>{item.decricao}</Td>
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
                body={`Tem certeza que quer deletar o Fornecedor ${itensSelecionados[0]?.fornecedor}?`}
                options={[
                  { label: 'Apagar', focus: true, cb: () => deleteRegister() },
                  { label: 'Manter', focus: false, cb: () => setModal('') }
                ]} />
        </Box>
  )
}

// export default AreaResponsavel

Fornecedor.requireAuth = true
export default Fornecedor

function FormInsert ({ getDados, fechaModal }) {
  const { createAlert } = useContext(AlertContext)
  const [loading, setLoading] = useState(false)

  async function handleSubmit (campos) {
    try {
      setLoading(true)
      const response = await api.post('/contratos/cadastros/fornecedor', campos)
      getDados()
      setLoading(false)
      fechaModal(false)

      console.log(response.data)
    } catch (error: any) {
      createAlert(getErrorMessage(error), 'error')
      setLoading(false)
    }
  }

  return (
        <Box sx={{ paddingX: 2, paddingY: 4, width: 450 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }} >Cadastrar Fornecedor</Typography>
            <Form onSubmit={handleSubmit}>
            <Input name="fornecedor" label="Fornecedor" type="text"/>
            <Input name="decricao" label="Descrição" type="text"/>
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
      const response = await api.put(`/contratos/cadastros/fornecedor?id_sb_contratos_cadastros_fornecedor=${selectItem.id_sb_contratos_cadastros_fornecedor}`, campos)

      setLoading(false)
      fechaModal(false)
      getDados()

      console.log(response.data)
    } catch (error: any) {
      createAlert(getErrorMessage(error), 'error')
      setLoading(false)
    }
  }

  return (
        <Box sx={{ paddingX: 2, paddingY: 4, width: 450 }} >
            <Typography variant="h5" sx={{ fontWeight: 'bold' }} >Editar Fornecedor: {selectItem.area_responsavel}</Typography>
            <Form onSubmit = {handleSubmit}>
                <Input name="fornecedor" label="Fornecedor" type="text" defaultValue={selectItem.fornecedor} />
                <Input name="decricao" label="Descrição" type="text" defaultValue={selectItem.decricao} />
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
