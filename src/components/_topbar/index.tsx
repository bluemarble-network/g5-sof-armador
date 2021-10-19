import { AppBar, Box, Breadcrumbs, CssBaseline, Toolbar, Typography, Skeleton } from '@material-ui/core'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import { Sidebar } from '../_sidebar'
import { AlertContext } from '../../contexts/alert'
import { api } from '../../utils/api'
import { getErrorMessage } from '../../utils/error'

interface IApps {
  display: string
  fullURL: string
}

export const TopBar = () => {
  const [loading, setLoading] = useState(true)
  const [path, setPath] = useState<any[]>([])
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [apps, setApps] = useState<IApps[]>([])
  const { createAlert } = useContext(AlertContext)
  const { topBar } = router.query

  async function getApps () {
    setLoading(true)
    try {
      const { data }: { data: any[] } = await api.get('/applications')
      const appFormattedObject: any[] = []

      data.forEach(app => {
        appFormattedObject[`/${app.url.split('/').pop()}`] = {
          display: app.display_name.split('/').pop(),
          fullURL: app.url
        }
      })

      setApps(appFormattedObject)
      setLoading(false)
    } catch (error) {
      createAlert(getErrorMessage(error), 'error')
      setLoading(false)
    }
  }

  useEffect(() => {
    getApps()
    const newPath:any[] = router.pathname.slice(0).split('/').filter((x) => x)
    setPath(newPath)
  }, [router])

  return (
    <>
        {
            (topBar !== 'hidden') &&
            <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                  transition: 'all ease 200ms',
                  width: { sm: `calc(100% - ${drawerOpen ? '230px' : '0px'})` },
                  backgroundColor: 'white',
                  color: 'GrayText'
                }}
                elevation={1}
            >
                <Toolbar variant="dense" >
                    <Breadcrumbs>
                    {
                        path.map((value, index) => {
                          const last = index === path.length - 1
                          const to = `/${value}`

                          if (last) {
                            return (
                                  <Box key={index}>
                                    {
                                      loading
                                        ? (
                                        <Skeleton width={60} />
                                          )
                                        : <Typography color="MenuText" fontWeight="bold" variant="subtitle2">
                                          {apps[to]?.display}
                                      </Typography>
                                    }
                                  </Box>
                            )
                          }
                          return (
                                  <Box key={index}>
                                  {
                                    loading
                                      ? <Skeleton width={60} />
                                      : <Link href={`${apps[to]?.fullURL}`}>
                                          <a>
                                          <Typography color="GrayText" sx={{ textDecoration: 'none' }} variant="subtitle2">
                                              {apps[to]?.display}
                                          </Typography>
                                          </a>
                                      </Link>
                                  }
                                  </Box>
                          )
                        })
                        }
                    </Breadcrumbs>
                </Toolbar>
            </AppBar>
        </Box>}
        <Sidebar drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
    </>
  )
}
