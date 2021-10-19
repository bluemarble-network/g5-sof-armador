import { Box, Checkbox, Container, CssBaseline, FormControlLabel, Paper, Typography } from '@material-ui/core'
import { Form } from '@unform/web'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useContext, useState } from 'react'
import { LargeButton } from '../components/_button'
import { Input } from '../components/_form'
import { AlertContext } from '../contexts/alert'
import { api } from '../utils/api'
import { getErrorMessage } from '../utils/error'

function Login () {
  const [loading, setLoading] = useState(false)
  const { createAlert } = useContext(AlertContext)
  const router = useRouter()

  async function handleSubmit (campos) {
    try {
      setLoading(true)
      const response = await api.post('/auth/login', campos)
      setLoading(false)
      createAlert(`${response.data}`, 'success')
      router.reload()
    } catch (error) {
      setLoading(false)

      createAlert(getErrorMessage(error), 'error')
    }
  }

  return (
    <Box component="main" sx={{ paddingTop: 10, maxWidth: 350, margin: 'auto' }} >
       <CssBaseline />
       <Paper sx={{ paddingX: 3, paddingTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="bold">SIG5-SUZANO</Typography>
          </Box>
          <Form onSubmit={handleSubmit}>
            <Input
              id="login"
              label="Login"
              name="login"
              required
              autoFocus
              />
            <Input
              name="password"
              label="Senha"
              type="password"
              id="password"
              required
              autoComplete="current-password"
            />
            <Box sx={{ my: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <FormControlLabel name="remember" control={<Checkbox />} label="Lembrar-me"/>
            </Box>
            <LargeButton type="submit" title="Entrar" loading={loading} />
            <Box sx={{ py: 1 }} />
          </Form>
       </Paper>
    </Box>
  )
}

export default function Page () {
  return (
    <Container sx={{ width: '100%', height: '100%' }} >
      <Head>
        <title>Fazer Login</title>
      </Head>
      <Login/>
    </Container>
  )
}

export async function getServerSideProps ({ req }) {
  const { cookie } = req.headers

  if (!cookie) return { props: {} }
  if (cookie.includes('next-token') || cookie.includes('next-refresh-token') || cookie.includes('next-remember-me-token')) {
    return {
      redirect: {
        destination: '/documentacao'
      }
    }
  } else {
    return { props: {} }
  }
}
