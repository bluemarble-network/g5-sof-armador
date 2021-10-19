
import { CssBaseline, Typography } from '@material-ui/core'
import { Box } from '@material-ui/system'
import { serialize } from 'cookie'
import jwt from 'jsonwebtoken'
import { GetServerSidePropsContext } from 'next'
import Head from 'next/head'

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
        <title>404: Variável ambiente não encontrada</title>
      </Head>
      <Typography component="h1" variant="h1" fontSize={8 * 3} fontWeight="100" >
        <strong>404</strong>
      </Typography>
      <Box sx={{ width: '1px', height: 45, background: '#000', mx: 1.5 }} />
      <Typography component="span" fontSize={8 * 2} > Variável ambiente não encontrada.</Typography>
    </Box>
  )
}

export async function getServerSideProps (ctx: GetServerSidePropsContext) {
  if (process.env.ENVIRONMENT === 'DEV') {
    const token = jwt.sign({ user: { name: 'Julio Levi', login: 'levi' } }, `${process.env.JWT_SECRET}`, { expiresIn: '30days' })

    const authCookies = serialize('next-token', token, { path: '/' })
    const header = { Location: '/', 'Set-Cookie': authCookies }
    ctx.res.writeHead(302, header).end()
  }

  return {
    props: {}
  }
}
