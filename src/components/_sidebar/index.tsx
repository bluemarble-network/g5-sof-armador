import {
  Box,
  Collapse,
  Drawer,
  Fab,
  IconButton,
  List,
  ListItem,
  Typography,
  Skeleton
} from '@material-ui/core'
import Link from 'next/link'
import { useContext, useEffect, useState } from 'react'
import {
  MdExitToApp,
  MdExpandLess,
  MdExpandMore,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight
} from 'react-icons/md'
import * as Icons from 'react-icons/md'
import { AlertContext } from '../../contexts/alert'
import { AuthContext } from '../../contexts/auth'
import { api } from '../../utils/api'
import { getErrorMessage } from '../../utils/error'

type iSubMenu = {
  id: number
  display_name: string
  module_id: number
  icon: string
  url: string
}

type iMenu = {
  display_name: string
  icon: string
  id: number
  module_id: number
  url: string
  subs?: iSubMenu
}

const Sidebar = ({ drawerOpen, setDrawerOpen }: any) => {
  const [menuData, setMenuData] = useState<iMenu[]>([])
  const [loading, setLoading] = useState(false)

  const { createAlert } = useContext(AlertContext)
  const { SignOut } = useContext(AuthContext)

  async function getMenuData() {
    setLoading(true)
    try {
      const { data }: { data: any[] } = await api.get('/applications/menu')
      let subs = data.filter(
        (item) => item.display_name.split('/').length > 1 && item.visible
      )
      const menus = data.filter(
        (item) => item.display_name.split('/').length < 2 && item.visible
      )

      subs = subs.sort((a, b) => {
        return a.order - b.order || a.display_name.localeCompare(b.display_name)
      })

      let formattedMenu: any[] = []

      for (const index in menus) {
        const item = menus[index]
        let filteredSubs: any = subs.filter(
          (sub) => sub.display_name.split('/')[0] === item.display_name
        )
        filteredSubs = filteredSubs.map((item) => ({
          to: item.url,
          title: item.display_name.split('/')[1]
        }))

        if (filteredSubs.length > 0) item.subs = filteredSubs
        formattedMenu.push(item)
      }

      formattedMenu = formattedMenu.sort((a, b) => {
        return a.order - b.order || a.display_name.localeCompare(b.display_name)
      })

      setMenuData(formattedMenu)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      createAlert(getErrorMessage(error), 'error')
    }
  }

  useEffect(() => {
    getMenuData()
  }, [])

  return (
    <Box
      sx={{
        display: 'flex',
        position: 'fixed',
        zIndex: 10,
        width: 'fit-content'
      }}
    >
      <Drawer
        sx={{
          width: 72,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 230,
            boxSizing: 'border-box',
            border: 0,
            overflowX: 'hidden',
            backgroundColor: 'transparent'
          }
        }}
        variant='persistent'
        anchor='left'
        open={drawerOpen}
      >
        <Box
          sx={{
            position: 'absolute',
            borderRadius: '50%',
            top: 60,
            right: -30,
            width: 50,
            height: 50,
            boxShadow: '0 0 0 9999px #1976d2'
          }}
        ></Box>
        <List
          sx={{
            paddingY: 2,
            backgroundColor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            overflowY: 'scroll',
            '::-webkit-scrollbar': {
              display: 'none'
            }
          }}
        >
          <List>
            <List sx={{ marginTop: 10 }}>
              {menuData.map((item, index) => {
                const submenus: any = item?.subs

                if (submenus) {
                  return (
                    <SideMenuItem
                      setDrawerOpen={() => {}}
                      key={index}
                      title={item.display_name}
                      to={item.url}
                      icon={item.icon}
                      submenu={submenus}
                    />
                  )
                }

                return (
                  <SideMenuItem
                    setDrawerOpen={() => {}}
                    key={index}
                    title={item.display_name}
                    to={item.url}
                    icon={item.icon}
                  />
                )
              })}
              {loading && (
                <Box
                  sx={{
                    px: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Skeleton variant='circular' width={30} height={30} />
                    <Skeleton width='75%' height={45} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Skeleton variant='circular' width={30} height={30} />
                    <Skeleton width='75%' height={45} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Skeleton variant='circular' width={30} height={30} />
                    <Skeleton width='75%' height={45} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Skeleton variant='circular' width={30} height={30} />
                    <Skeleton width='75%' height={45} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Skeleton variant='circular' width={30} height={30} />
                    <Skeleton width='75%' height={45} />
                  </Box>
                </Box>
              )}
            </List>
          </List>
          <ListItem
            onClick={() => SignOut()}
            button
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'white'
            }}
          >
            <IconButton sx={{ color: 'white' }}>
              <MdExitToApp />
            </IconButton>
            <Typography component='p' variant='subtitle2'>
              Sign Out
            </Typography>
          </ListItem>
        </List>
      </Drawer>
      <Box
        sx={{
          position: 'absolute',
          transition: 'all ease 200ms',
          right: `${drawerOpen ? '-190px' : '40px'}`,
          top: 57,
          zIndex: 999999,
          padding: 1
        }}
      >
        <Fab
          size='small'
          sx={{ fontSize: '30px' }}
          color='primary'
          onClick={() => setDrawerOpen(!drawerOpen)}
        >
          {!drawerOpen ? <MdKeyboardArrowRight /> : <MdKeyboardArrowLeft />}
        </Fab>
      </Box>
    </Box>
  )
}

export { Sidebar }

type ISubMenu = {
  to: string
  title: string
}

type iProps = {
  to?: string
  title: string
  icon: any
  submenu?: ISubMenu[]
  setDrawerOpen(value: boolean): void
}

const SideMenuItem = ({
  to = '/',
  title,
  icon,
  submenu,
  setDrawerOpen
}: iProps) => {
  const [menuState, setMenuState] = useState(false)
  const Icon: any = Icons

  function handleOpenMenu() {
    setMenuState(!menuState)
  }

  const SetIcon = Icon[icon]

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {submenu ? (
          <ListItem
            onClick={() => handleOpenMenu()}
            button
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              justifyContent: 'space-between',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton sx={{ color: 'white' }}>
                <SetIcon />
              </IconButton>
              <Typography component='p' variant='subtitle2'>
                {title}
              </Typography>
            </Box>
            <IconButton sx={{ color: 'white' }}>
              {menuState ? <MdExpandLess /> : <MdExpandMore />}
            </IconButton>
          </ListItem>
        ) : (
          <Link href={`${to}`}>
            <a style={{ width: '100%' }}>
              <ListItem
                button
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  justifyContent: 'space-between',

                  color: 'white'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton sx={{ color: 'white' }}>
                    <SetIcon />
                  </IconButton>
                  <Typography component='p' variant='subtitle2'>
                    {title}
                  </Typography>
                </Box>
              </ListItem>
            </a>
          </Link>
        )}
      </Box>
      {submenu && (
        <Collapse in={menuState}>
          <List sx={{ paddingY: 0 }}>
            {submenu.map((item, index) => {
              return (
                <Link key={index} href={`${item.to}`}>
                  <a>
                    <ListItem sx={{ paddingLeft: 8, color: 'white' }} button>
                      <Typography component='p' variant='subtitle2'>
                        {item.title}
                      </Typography>
                    </ListItem>
                  </a>
                </Link>
              )
            })}
          </List>
        </Collapse>
      )}
    </>
  )
}
