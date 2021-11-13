import {
  Box,
  Checkbox,
  CircularProgress,
  Collapse,
  CssBaseline,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography
} from '@material-ui/core'
import { Form } from '@unform/web'
import Head from 'next/head'
import { useContext, useEffect, useRef, useState } from 'react'
import {
  MdAdd,
  MdChevronRight,
  MdDelete,
  MdEdit,
  MdExpandLess,
  MdExpandMore,
  MdMoreVert,
  MdRemoveRedEye
} from 'react-icons/md'
import {
  DefaultButton,
  GridButton,
  LargeButton
} from '../../../components/_button'
import { Input } from '../../../components/_form'
import { filterData, Grid, IFilter } from '../../../components/_grid'
import { Header, Td, Tr } from '../../../components/_grid/components'
import { Modal } from '../../../components/_modal'
import { TransferList } from '../../../components/_transferList'
import { AlertContext } from '../../../contexts/alert'
import { api } from '../../../utils/api'
import { getErrorMessage } from '../../../utils/error'

interface IPermissions {
  canDelete: boolean
  canInsert: boolean
  canUpdate: boolean
  canView: boolean
  group_id: number
  id: number
  route_id: number
}

type IGroup = {
  created_at: string
  id: number
  module_id: number
  name: string
  permissions: IPermissions[]
}

const columTitles = [{ name: 'name', label: 'Grupo' }]

function Groups() {
  const [data, setData] = useState<IGroup[]>([])
  const [filteredData, setFilteredData] = useState<IGroup[]>([])
  const [selectedFilters, setSelectedFilters] = useState<IFilter[]>([])

  const defaultData = useRef<IGroup[]>([])

  const [selectItem, setSelectItem] = useState<IGroup | null>(null)
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { createAlert } = useContext(AlertContext)

  async function getData() {
    setLoading(true)
    try {
      const { data }: { data: any[] } = await api.get('/groups')
      setData(data.slice(0, 6))
      setLoading(false)
    } catch (error) {
      setLoading(false)
      createAlert(getErrorMessage(error), 'error')
    }
  }

  const updateFilters = () => {
    const novoArray = filterData(selectedFilters, defaultData)

    setFilteredData(novoArray)
  }

  useEffect(() => {
    if (selectItem) setSidebarOpen(true)
  }, [selectItem])

  useEffect(() => {
    if (!sidebarOpen) setSelectItem(null)
  }, [sidebarOpen])

  useEffect(() => {
    getData()
  }, [])

  return (
    <Box sx={{ py: 8 }}>
      <Head>
        <title>Grupos</title>
      </Head>
      <CssBaseline />
      <Box
        sx={{
          width: 'calc(100vw - 8px * 10)',
          margin: 'auto'
        }}
      >
        <Header title='Gerenciar permissões'>
          <GridButton
            type='insert'
            color='success'
            onClick={() => setModal('create')}
          />
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
          {data.map((item, index) => {
            return (
              <Tr
                key={index}
                sx={{
                  ':hover': {
                    '.action-buttons': {
                      background:
                        'linear-gradient(90deg, transparent, #f5f5f5)',
                      opacity: 1,
                      right: 20
                    }
                  }
                }}
              >
                <Td sx={{ position: 'relative', overflow: 'hidden' }}>
                  <Checkbox
                    checked={selectItem?.id === item.id}
                    onClick={() => setSelectItem(item)}
                  />
                  {item.name}
                </Td>
              </Tr>
            )
          })}
        </Grid>
      </Box>
      <Modal open={modal === 'create'} onClose={() => setModal('')}>
        <FormIncluir fecharModal={() => setModal('')} atualizar={getData} />
      </Modal>
      <Modal open={modal === 'groups'} onClose={() => setModal('')}>
        {selectItem && <FormGroups selectItem={selectItem} />}
      </Modal>
      <Modal open={modal === 'permissions'} onClose={() => setModal('')}>
        {selectItem && <FormPermissions selectItem={selectItem} />}
      </Modal>
      {selectItem && (
        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          group={selectItem}
        />
      )}
    </Box>
  )
}

type iRoutes = {
  id: number
  application_id: number
  url: string
  name: string
  desc: string
}

type iGroupPerm = {
  canDelete: boolean
  canInsert: boolean
  canUpdate: boolean
  canView: boolean
  group_id: number
  id: number
  route_id: number
  routes: iRoutes
}

type iApps = {
  display_name: 'Módulos'
  routes: iRoutes[]
}

type iLoading = {
  id: number
}

interface ISideBar {
  open: boolean
  setOpen(value: any): void
  group: IGroup
}

function Sidebar({ open, setOpen, group }: ISideBar) {
  const [apps, setApps] = useState<iApps[]>([])
  const [usedApps, setUsedApps] = useState<iGroupPerm[]>([])
  const [appLoading, setAppLoading] = useState<iLoading | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<iRoutes | null>(null)

  const { createAlert } = useContext(AlertContext)

  const lastApps = useRef([])

  async function getRoutes() {
    try {
      const { data } = await api.get('/applications/routes')
      setApps(data)
    } catch (error) {
      createAlert(getErrorMessage(error), 'error')
    }
  }

  async function getApps() {
    try {
      const { data } = await api.get(
        `/applications/routes/group?group_id=${group?.id}`
      )
      setUsedApps(data)
      lastApps.current = data
    } catch (error) {}
  }

  function hasRoute(route: iRoutes): any {
    let result: any = {
      canDelete: false,
      canInsert: false,
      canView: false,
      canUpdate: false
    }
    for (const app of usedApps) {
      if (app.route_id === route.id) result = app
    }

    return result
  }

  async function handleUpdateAccess(route, type) {
    if (appLoading) return createAlert('Processando outra ação', 'warning')
    setAppLoading({ id: route.id })
    const body = {
      route_id: route.id
    }

    const [storagePermisson] = usedApps.filter(
      (item) => item.route_id === route.id
    )

    if (storagePermisson) {
      body[type] = !storagePermisson[type]
    } else {
      body[type] = true
    }

    try {
      const { data }: { data: any } = await api.put(
        `/applications/routes/group?group_id=${group?.id}`,
        body
      )
      const filteredApps = usedApps
        .slice(0)
        .filter((item) => item.id !== data.id)

      if (data) setUsedApps([...filteredApps, data])
      setAppLoading(null)
      createAlert('Acesso atualizado com sucesso', 'success')
    } catch (error) {
      setAppLoading(null)
      createAlert(getErrorMessage(error), 'error')
    }
  }

  async function handleAddAll(application: iApps) {
    const [{ application_id, id }] = application.routes
    if (appLoading) return createAlert('Processando outra ação', 'warning')
    setAppLoading({ id })
    try {
      const { data } = await api.put(
        `/applications?id=${application_id}&group=${group?.id}&action=add`
      )
      createAlert('Acesso concedido com sucesso!', 'success')

      const filteredApps = usedApps.map((app) => {
        if (
          app.routes.application_id === application_id &&
          app.group_id === group?.id
        ) {
          app.canView = true
          app.canUpdate = true
          app.canDelete = true
          app.canInsert = true
        }
        return app
      })
      if (data) setUsedApps([...filteredApps, ...data])

      setAppLoading(null)
    } catch (error) {
      console.log(error)
      createAlert(getErrorMessage(error), 'error')
      setAppLoading(null)
    }
  }

  async function removeAllAccess(application: iApps) {
    const [{ application_id, id }] = application.routes
    if (appLoading) return createAlert('Processando outra ação', 'warning')
    setAppLoading({ id })

    try {
      await api.put(
        `/applications?id=${application_id}&group=${group.id}&action=remove`
      )
      const filteredApps = usedApps.map((app) => {
        if (
          app.routes.application_id === application_id &&
          app.group_id === group.id
        ) {
          app.canView = false
          app.canUpdate = false
          app.canDelete = false
          app.canInsert = false
        }
        return app
      })

      setUsedApps(filteredApps)
      createAlert('Acesso removido com sucesso!', 'success')
      setAppLoading(null)
    } catch (error: any) {
      createAlert(getErrorMessage(error), 'error')
      setAppLoading(null)
    }
  }

  useEffect(() => {
    if (group) {
      getApps()
      getRoutes()
    }
  }, [group])

  const styles = {
    display: 'flex',
    justifyContent: 'space-between',
    border: 0,
    borderBottom: 1,
    borderColor: '#8f8f8f',
    borderStyle: 'solid',
    py: 1,
    mt: 1
  }

  return (
    <>
      <Paper
        sx={{
          zIndex: 9999,
          width: open ? 400 : 0,
          height: '100%',
          position: 'absolute',
          transition: 'all ease 250ms',
          right: 0,
          top: 0,
          padding: 1,
          overflowX: 'hidden',
          overflowY: 'scroll'
        }}
      >
        <IconButton onClick={() => setOpen(false)}>
          <MdChevronRight />
        </IconButton>
        <List>
          {apps.map((item, index) => {
            return (
              <AppItem
                key={index}
                item={item}
                handleAddAll={handleAddAll}
                handleRemoveAll={removeAllAccess}
                hasRoute={hasRoute}
                update={handleUpdateAccess}
                loading={appLoading}
                setSelectedRoute={setSelectedRoute}
              />
            )
          })}
        </List>
      </Paper>
      <Modal open={!!selectedRoute} onClose={() => setSelectedRoute(null)}>
        <Box sx={{ px: 2, py: 3, width: '100vw', maxWidth: 400 }}>
          <Typography variant='h6' fontWeight='bold'>
            Detalhes da rota
          </Typography>
          <Box sx={{ py: 1 }} />
          <Box sx={styles}>
            <Typography variant='body1' fontWeight='bold'>
              Titulo
            </Typography>
            <Typography variant='body1'>{selectedRoute?.name}</Typography>
          </Box>
          <Box sx={styles}>
            <Typography variant='body1' fontWeight='bold'>
              Rota
            </Typography>
            <Typography variant='body1'>{selectedRoute?.url}</Typography>
          </Box>
          <Box sx={{ ...styles, display: 'block', borderBottom: 0 }}>
            <Typography variant='body1' fontWeight='bold'>
              Descrição
            </Typography>
            <Box sx={{ py: 1 }} />
            <Typography variant='body1'>{selectedRoute?.desc}</Typography>
          </Box>
        </Box>
      </Modal>
    </>
  )
}

type AppItemProps = {
  item: iApps
  hasRoute(value): any
  update(item, type): any
  handleAddAll(application): any
  handleRemoveAll(application): any
  setSelectedRoute(route): any
  loading: iLoading | null
}

function AppItem({
  item,
  hasRoute,
  update,
  loading,
  handleRemoveAll,
  handleAddAll,
  setSelectedRoute
}: AppItemProps) {
  const [open, setOpen] = useState(false)

  const [anchorEl, setAnchorEl] = useState(null)

  const isOpen = Boolean(anchorEl)

  function isLoading() {
    const result = item.routes.filter((item) => loading?.id === item.id)

    if (result.length > 0) return true
    return false
  }

  const handleClick = (event) => {
    setAnchorEl(event.target)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <ListItem
          sx={{
            display: 'flex',
            justifyContent: 'space-between'
          }}
          button
          onClick={() => setOpen(!open)}
        >
          <Typography>{item.display_name}</Typography>
          <Box sx={{ display: 'flex' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {isLoading() && <CircularProgress size={18} color='inherit' />}
              {open ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
            </Box>
          </Box>
        </ListItem>
        <Box sx={{ position: 'relative' }}>
          <IconButton onClick={handleClick}>
            <MdMoreVert size={20} />
          </IconButton>
        </Box>
      </Box>
      <Collapse in={open} timeout='auto' unmountOnExit>
        {item.routes.map((item, index) => {
          const { canInsert, canDelete, canUpdate, canView } = hasRoute(item)

          return (
            <ListItem
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                zIndex: 9999999,
                pl: 4
              }}
              disablePadding
            >
              <Typography
                onClick={() => setSelectedRoute(item)}
                variant='caption'
                sx={{ textDecoration: 'underline', cursor: 'pointer' }}
              >
                {item.name}
              </Typography>
              <Box sx={{ display: 'flex' }}>
                <IconButton
                  onClick={() => update(item, 'canDelete')}
                  sx={{ color: 'success.main' }}
                >
                  <MdDelete
                    size={20}
                    color={canDelete ? 'inherit' : 'GrayText'}
                  />
                </IconButton>
                <IconButton
                  onClick={() => update(item, 'canInsert')}
                  sx={{ color: 'success.main' }}
                >
                  <MdAdd size={20} color={canInsert ? 'inherit' : 'GrayText'} />
                </IconButton>
                <IconButton
                  onClick={() => update(item, 'canUpdate')}
                  sx={{ color: 'success.main' }}
                >
                  <MdEdit
                    size={20}
                    color={canUpdate ? 'inherit' : 'GrayText'}
                  />
                </IconButton>
                <IconButton
                  onClick={() => update(item, 'canView')}
                  sx={{ color: 'success.main' }}
                >
                  <MdRemoveRedEye
                    size={20}
                    color={canView ? 'inherit' : 'GrayText'}
                  />
                </IconButton>
              </Box>
            </ListItem>
          )
        })}
      </Collapse>
      <Menu
        sx={{
          zIndex: 999999999
        }}
        id='basic-menu'
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            handleAddAll(item)
            handleClose()
          }}
        >
          Conceder acesso a todas as rotas
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleRemoveAll(item)
            handleClose()
          }}
        >
          Remover acesso a todas as rotas
        </MenuItem>
      </Menu>
    </>
  )
}

Groups.requireAuth = true

export default Groups

interface IFormInsert {
  atualizar(): void
  fecharModal(): void
}

function FormIncluir({ atualizar, fecharModal }: IFormInsert) {
  const [loading, setLoading] = useState(false)
  const { createAlert } = useContext(AlertContext)

  async function handleSubmit(props) {
    try {
      setLoading(true)
      await api.post('/groups', props)
      createAlert('Grupo inserido com sucesso!', 'success')
      setLoading(false)
      atualizar()
      fecharModal()
    } catch (error: any) {
      createAlert(`${error.response.data}`, 'error')
    }
  }

  return (
    <Box sx={{ paddingX: 2, paddingY: 4, width: '100vw', maxWidth: 450 }}>
      <Typography variant='h5' fontWeight='bold'>
        Novo grupo
      </Typography>
      <Form onSubmit={handleSubmit}>
        <Input type='text' name='name' label='Nome' required />
        <Box sx={{ width: '100%', marginTop: 4 }} />
        <LargeButton type='submit' loading={loading} title='Inserir' />
      </Form>
    </Box>
  )
}

function FormGroups({ selectItem }: { selectItem?: IGroup }) {
  const [loading, setLoading] = useState(false)
  const [leftList, setLeftList] = useState<any[]>([])
  const [rightList, setRightList] = useState<any[]>([])

  const { createAlert } = useContext(AlertContext)

  async function handleSubmit() {
    const idToAdd = rightList.slice(0).map((item) => item.id)
    const idToremove = leftList.slice(0).map((item) => item.id)
    try {
      setLoading(true)
      await api.put(`/groups/application?group_id=${selectItem?.id}`, {
        add: idToAdd,
        remove: idToremove
      })
      setLoading(false)
      createAlert('Acesso alterado com sucesso', 'success')
    } catch (error: any) {
      createAlert(`${error.response.data}`, 'error')
      setLoading(false)
    }
  }

  useEffect(() => {
    ;(async function () {
      try {
        const { data: groupApplications }: { data: any[] } = await api.get(
          `/groups/application?group_id=${selectItem?.id}`
        )
        const { data: applications }: { data: any[] } = await api.get(
          '/applications'
        )

        setRightList(groupApplications)

        const groupAppId = groupApplications.map((item) => item.id)
        const filteredApps = applications.filter(
          (item) => !groupAppId.includes(item.id)
        )
        setLeftList(filteredApps)
      } catch (error: any) {}
    })()
  }, [])

  return (
    <Box
      sx={{
        paddingX: 2,
        paddingTop: 4,
        height: '80vh',
        width: '100vw',
        maxWidth: 550,
        display: 'grid',
        gridTemplateRows: '50px calc(100% - 200px) 150px'
      }}
    >
      <Typography variant='h6' fontWeight='bold'>
        Permissões {selectItem?.name}{' '}
      </Typography>
      <TransferList
        leftList={leftList}
        rightList={rightList}
        setRightList={setRightList}
        setLeftList={setLeftList}
        getLabel={(item: any) => item.displayName}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          paddingBottom: 3
        }}
      >
        <DefaultButton loading={loading} onClick={handleSubmit}>
          Salvar alterações
        </DefaultButton>
      </Box>
    </Box>
  )
}

type IPermission = {
  id: number
  group_id: number
  canUpdate: boolean
  canInsert: boolean
  canDelete: boolean
  canView: boolean
  application_id: number
  applications: {
    id: number
    url: string
    displayName: string
  }
}

function FormPermissions({ selectItem }: { selectItem: IGroup }) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<IPermission[]>([])
  const [filteredData, setFilteredData] = useState<IPermission[]>([])
  const [selectedFilters, setSelectedFilters] = useState<IFilter[]>([])

  const defaultData = useRef<IPermission[]>([])
  const { createAlert } = useContext(AlertContext)

  const columTitles = [
    { name: 'application.displayName', label: 'Aplicação' },
    { name: 'application.url', label: 'Rota' },
    { name: 'perm', label: 'Permissões' }
  ]

  async function handleUpdateAccess(item: any) {
    try {
      await api.put(`/groups/permissions?id=${item.id}`, {
        data: {
          canInsert: item.canInsert,
          canUpdate: item.canUpdate,
          canDelete: item.canDelete,
          canView: item.canView
        }
      })
      const newArr = data.slice(0).map((value) => {
        if (value.id === item.id) {
          return item
        }
        return value
      })
      setData([...newArr])
      createAlert('Acesso atualizado com sucesso!', 'success')
    } catch (error: any) {
      createAlert(`${error.response.data}`, 'error')
    }
  }

  async function getData() {
    setLoading(true)
    try {
      const { data }: { data: any[] } = await api.get(
        `/groups/permissions?group_id=${selectItem.id}`
      )
      setData(data.slice(0, 6))
      setLoading(false)
    } catch (error) {
      setLoading(false)
      createAlert(getErrorMessage(error), 'error')
    }
  }

  const updateFilters = () => {
    const novoArray = filterData(selectedFilters, defaultData)

    setFilteredData(novoArray)
  }

  useEffect(() => {
    getData()
  }, [])

  return (
    <Box sx={{ width: '100vw', maxWidth: 750 }}>
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
        {data.map((item, index) => {
          return (
            <Tr key={index}>
              <Td>{item.applications.displayName}</Td>
              <Td>{item.applications.url}</Td>
              <Td sx={{ width: 200 }}>
                <Tooltip title='Inserir'>
                  <IconButton
                    sx={{ color: `${!item.canInsert ? '#dedede' : 'dark'}` }}
                    onClick={() =>
                      handleUpdateAccess({
                        ...item,
                        canInsert: !item.canInsert
                      })
                    }
                  >
                    <MdAdd />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Editar'>
                  <IconButton
                    sx={{ color: `${!item.canUpdate ? '#dedede' : 'dark'}` }}
                    onClick={() =>
                      handleUpdateAccess({
                        ...item,
                        canUpdate: !item.canUpdate
                      })
                    }
                  >
                    <MdEdit />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Deletar'>
                  <IconButton
                    sx={{ color: `${!item.canDelete ? '#dedede' : 'dark'}` }}
                    onClick={() =>
                      handleUpdateAccess({
                        ...item,
                        canDelete: !item.canDelete
                      })
                    }
                  >
                    <MdDelete />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Visualizar'>
                  <IconButton
                    sx={{ color: `${!item.canView ? '#dedede' : 'dark'}` }}
                    onClick={() =>
                      handleUpdateAccess({ ...item, canView: !item.canView })
                    }
                  >
                    <MdRemoveRedEye />
                  </IconButton>
                </Tooltip>
              </Td>
            </Tr>
          )
        })}
      </Grid>
    </Box>
  )
}
