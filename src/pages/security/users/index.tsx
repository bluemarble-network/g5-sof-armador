import { Box, Checkbox, CssBaseline, IconButton, Tooltip, Typography } from '@material-ui/core'
import { Form } from '@unform/web'
import Head from 'next/head'
import { useContext, useEffect, useRef, useState } from 'react'
import { MdDelete, MdEdit, MdPeople } from 'react-icons/md'
import { DefaultButton, GridButton, LargeButton } from '../../../components/_button'
import { Dialog } from '../../../components/_dialog'
import { Input } from '../../../components/_form'
import { filterData, Grid, IFilter } from '../../../components/_grid'
import { Header, Td, Tr } from '../../../components/_grid/components'
import { Modal } from '../../../components/_modal'
import { TransferList } from '../../../components/_transferList'
import { AlertContext } from '../../../contexts/alert'
import { api } from '../../../utils/api'
import { getErrorMessage } from '../../../utils/error'

type IGroups = {
  id: number
  name: string
  module_id: number
  display_name: string
}

interface IDados {
  name: string
  login: string
  email: string
  funcao: string
  users_groups: {
    groups: IGroups[]
  }
}

const columTitles = [
  { name: 'user.login', label: 'Nome login' },
  { name: 'group.name', label: 'Grupo' }
]

function Users () {
  const [data, setData] = useState<IDados[]>([])
  const [filteredData, setFilteredData] = useState<IDados[]>([])
  const [selectedFilters, setSelectedFilters] = useState<IFilter[]>([])

  const defaultData = useRef<IDados[]>([])

  const [loadingAction, setLoadingAction] = useState(false)
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState('')
  const [itensSelecionados, setItensSelecionados] = useState<IDados[]>([])
  const { createAlert } = useContext(AlertContext)

  function handleEditGroups (item: any) {
    setItensSelecionados([item])
    setModal('group')
  }

  const handleOpenModalEditar = () => {
    if (itensSelecionados.length >= 2) return createAlert('Só é possível editar um item por vez', 'warning')
    setModal('update')
  }

  const handleSelectItem = (item: IDados) => {
    const itemJaExiste = itensSelecionados.find(itemSelecionado => itemSelecionado.login === item.login)

    if (itemJaExiste) {
      const novoArray = itensSelecionados.filter(sub => sub.login !== itemJaExiste.login)
      return setItensSelecionados(novoArray)
    }

    setItensSelecionados([...itensSelecionados, item])
  }

  const handleDeleteItems = async () => {
    setLoadingAction(true)
    try {
      const ids = itensSelecionados.map(item => item.login)
      await api.delete(`/users?login=${ids.join(',')}`)
      await getDados()
      createAlert('Item deletado com sucesso!', 'success')
      setLoadingAction(false)
      setModal('')
      setItensSelecionados([])
    } catch (error) {
      createAlert(getErrorMessage(error), 'error')
      setLoadingAction(false)
    }
  }

  async function getDados () {
    setLoading(true)
    try {
      const { data }: { data: any[]} = await api.get('/users')
      setFilteredData(data)
      defaultData.current = data
      setData(data.slice(0, 6))
      setLoading(false)
    } catch (error) {
      setLoading(false)
      createAlert(getErrorMessage(error), 'error')
    }
  }

  const isSelected = (item: IDados) => {
    return itensSelecionados.some(itemSelecionado => itemSelecionado.login === item.login)
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
            <title>Usuários</title>
          </Head>
        <CssBaseline/>
           <Box
             sx={{
               width: 'calc(100vw - 8px * 10)',
               margin: 'auto'
             }}
           >
               <Header title='Usuários'>
                   <GridButton color="success" type="insert" onClick={() => setModal('insert')} />
               </Header>
               <Grid
                  customButtons={<ActionButtons handleOpenModalEditar={handleOpenModalEditar} items={itensSelecionados} setModal={setModal} />}
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
                          <Tr
                              sx={{
                                backgroundColor: isSelected(item) ? '#00aa4a3d!important' : 'inherit',
                                ':hover': {
                                  backgroundColor: isSelected(item) ? '#00aa4a3d!important' : 'inherit'
                                }
                              }}
                              key={index}
                            >
                                   <Td sx={{ position: 'relative', overflow: 'hidden' }}>
                                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Checkbox checked={isSelected(item)} onChange={() => handleSelectItem(item)} size="small" />
                                        <Typography variant="body2">{item.name}</Typography>
                                      </Box>
                                    </Td>
                                   <Td sx={{ width: 50 }}>
                                       <IconButton onClick={() => handleEditGroups(item)} >
                                           <MdPeople size={20} />
                                       </IconButton>
                                   </Td>
                               </Tr>
                         )
                       })
                   }
               </Grid>
            </Box>
            <Dialog
                loading={loadingAction}
                open={modal === 'delete'}
                title="Atenção"
                body={`Tem certeza que quer deletar o usuário ${itensSelecionados[0]?.name}?`}
                options={[
                  { label: 'Apagar', focus: true, cb: () => handleDeleteItems() },
                  { label: 'Manter', focus: false, cb: () => setModal('') }
                ]} />
            <Modal open={modal === 'insert'} onClose={() => setModal('')}>
                <FormInsert fecharModal={() => setModal('')} atualizar={getDados} />
            </Modal>
            <Modal open={modal === 'update'} onClose={() => setModal('')}>
              <FormEdit itemSelecionado={itensSelecionados[0]} fecharModal={() => setModal('')} atualizar={getDados} />
            </Modal>
            <Modal open={modal === 'group'} onClose={() => setModal('')}>
              <Groups ItemSelecionado={itensSelecionados[0]} />
            </Modal>
        </Box>
  )
}

Users.requireAuth = true

export default Users

interface IFormInsert {
  fecharModal(): void
  atualizar(): void
}

function FormInsert ({ fecharModal, atualizar }: IFormInsert) {
  const { createAlert } = useContext(AlertContext)
  const [loading, setLoading] = useState(false)

  async function handleSubmit (campos) {
    try {
      setLoading(true)
      await api.post('/users', campos)
      setLoading(false)
      fecharModal()
      atualizar()
    } catch (error: any) {
      createAlert(`${error.response.data}`, 'error')
      setLoading(false)
    }
  }

  return (
        <Box sx={{ paddingX: 2, paddingY: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }} >Novo usuário</Typography>
            <Form onSubmit={handleSubmit}>
                <Input name="name" type="text" label="Nome" />
                <Input name="login" type="text" label="Login" />
                <Input name="pswd" type="password" label="Senha" />
                <Box sx={{ width: '100%', marginTop: 2 }}>
                    <LargeButton type="submit" loading={loading} title="Inserir" />
                </Box>
            </Form>
        </Box>
  )
}

interface IGrupos {
  ItemSelecionado: IDados
}

function Groups ({ ItemSelecionado }: IGrupos) {
  const [loading, setLoading] = useState(false)
  const [leftList, setLeftList] = useState<any[]>([{ id: 1, name: 'Carregando' }])
  const [rightList, setRightList] = useState<any[]>([{ id: 1, name: 'Carregando' }])
  const { createAlert } = useContext(AlertContext)

  async function handleSubmit () {
    setLoading(true)
    try {
      const add = rightList.map(item => item.id)
      const remove = leftList.map(item => item.id)
      await api.put(`/groups?user_id=${ItemSelecionado.login}`, { add, remove })
      createAlert('Grupo atualizado com sucesso!', 'success')
      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      createAlert(`${error.response.data}`, 'error')
    }
  }

  useEffect(() => {
    (async function () {
      try {
        setLoading(true)
        const { data: groups }: { data: any[] } = await api.get('/groups')
        const { data: user }: { data: any } = await api.get(`/users?login=${ItemSelecionado.login}`)
        const selectedGroups = user.users_groups.map(item => item.groups)
        setRightList(selectedGroups)
        const selectedGroupsNames = selectedGroups.map(item => item.name)
        const nonSelected = groups.filter(item => (!selectedGroupsNames.includes(item.name)))
        setLeftList(nonSelected)
        setLoading(false)
      } catch (error) {
        setLoading(false)
        createAlert(getErrorMessage(error), 'error')
      }
    })()
  }, [])

  return (
        <Box sx={{ paddingX: 2, paddingTop: 4, maxWidth: 550 }}>
            <Typography variant="h6" fontWeight="bold" >Grupos de {ItemSelecionado.name}  </Typography>
            <TransferList leftList={leftList} rightList={rightList} setRightList={setRightList} setLeftList={setLeftList} getLabel={(item: IDados) => item.name} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2, marginBottom: 3 }}>
                <DefaultButton loading={loading} onClick={handleSubmit}>Salvar alterações</DefaultButton>
            </Box>
        </Box>
  )
}

interface IFormUpdate extends IFormInsert{
  itemSelecionado: IDados
}

function FormEdit ({ fecharModal, atualizar, itemSelecionado }: IFormUpdate) {
  const { createAlert } = useContext(AlertContext)
  const [loading, setLoading] = useState(false)

  async function handleSubmit (campos) {
    try {
      setLoading(true)
      await api.put(`/users?login=${itemSelecionado.login}`, campos)
      setLoading(false)
      atualizar()
      fecharModal()
    } catch (error: any) {
      createAlert(getErrorMessage(error), 'error')
      setLoading(false)
    }
  }

  return (
        <Box sx={{ paddingX: 2, paddingY: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }} >Novo usuário</Typography>
            <Form onSubmit={handleSubmit} initialData={itemSelecionado}>
                <Input name="name" type="text" label="Nome" />
                <Input name="login" type="text" label="Login" defaultValue={`${itemSelecionado.login}`}/>
                <Input name="pswd" type="password" label="Nova senha" />
                <Box sx={{ width: '100%', marginTop: 2 }}>
                    <LargeButton type="submit" loading={loading} title="Atualizar" />
                </Box>
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
