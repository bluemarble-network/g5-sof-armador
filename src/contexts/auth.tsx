/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, CircularProgress, CssBaseline } from '@material-ui/core'
import jwt from 'jsonwebtoken'
import { useRouter } from 'next/router'
import { parseCookies } from 'nookies'
import { createContext, FC, useContext, useEffect, useState } from 'react'
import { api } from '../utils/api'
import { getErrorMessage } from '../utils/error'
import { AlertContext } from './alert'

type iGroups = {
  id: number
  name: string
}

type iUser = {
    id: number
    name: string
    role: string
    groups: iGroups[]
}

type iAuthProps = {
    isAuthenticated: boolean
    user: iUser | null
    SignOut(): void
}

export const AuthContext = createContext({} as iAuthProps)

export const AuthProvider: FC = ({ children }) => {
  const [user, setUser] = useState(null)
  const { createAlert } = useContext(AlertContext)
  const router = useRouter()

  async function SignOut () {
    await api.get('/auth/logout')
    router.push('/')
  }

  useEffect(() => {
    api.interceptors.response.use(response => response, async (error) => {
      if (error.response.status === 401) {
        const { config } = error
        try {
          await api.get('/auth/refreshToken')
          const defaultResponse = await api(config)
          return Promise.resolve(defaultResponse)
        } catch (error) {
          const cookies = parseCookies()
          const token = cookies['next-token']
          const decodedToken: any = jwt.decode(token)

          if (decodedToken) {
            const user = decodedToken.data.user
            setUser(user)
          } else {
            SignOut()
          }

          return Promise.reject(error)
        }
      }
      return Promise.reject(error)
    })
  }, [user])

  async function getNewToken () {
    try {
      await api.get('/auth/refreshToken')
    } catch (error) {
      createAlert(getErrorMessage(error), 'error')
      router.push('/')
    }
  }

  useEffect(() => {
    const cookies = parseCookies()
    const token = cookies['next-token']
    const decodedToken: any = jwt.decode(token)

    if (!decodedToken) {
      getNewToken()
    } else {
      setUser(decodedToken.user)
    }
  }, [])

  return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, SignOut }}>
            {
                !user
                  ? <Loading />
                  : <>{children}</>
            }
        </AuthContext.Provider>
  )
}

export const Loading: FC = () => {
  return (
        <>
            <CssBaseline/>
            <Box sx={{
              backgroundColor: '#fff',
              color: 'black',
              width: '100vw',
              height: '100vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
                <CircularProgress color="inherit" />
            </Box>
        </>
  )
}
