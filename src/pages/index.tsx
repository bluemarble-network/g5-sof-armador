import { Box, CssBaseline, Typography } from '@material-ui/core'
import Head from 'next/head'
import { getSession } from '../utils/auth'

export default function Page () {
  return (
    <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#fff'
    }}
  >
    <CssBaseline />
    <Head>
      <title>401: Erro de permissão</title>
    </Head>
    <Typography component="h1" variant="h1" fontSize={8 * 3} fontWeight="100" >
      <strong>401</strong>
    </Typography>
    <Box sx={{ width: '1px', height: 45, background: '#000', mx: 1.5 }} />
    <Typography component="span" fontSize={8 * 2} >Você não tem permissão de acesso.</Typography>
  </Box>
  )
}

export async function getServerSideProps (context) {
  const user = await getSession(context.req)

  if (user) {
    return {
      redirect: {
        destination: '/documentacao'
      }
    }
  }

  return {
    props: {}
  }
}
