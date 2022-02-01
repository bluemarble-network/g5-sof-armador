import { Box, Typography, CssBaseline } from '@material-ui/core'
import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { MdDirectionsBoat } from 'react-icons/md'
import { LargeButton as Button } from '../../components/_button'
import { api } from '../../utils/api'

const Page: NextPage = () => {
  const router = useRouter()

  async function handleLogout() {
    await api.get('/auth/logout')
    router.push('/')
  }

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <Head>
        <title>Ship not found</title>
      </Head>
      <CssBaseline />
      <MdDirectionsBoat size={8 * 5}/>
      <Typography variant="h4" fontWeight="bold">Ship not found</Typography>
      <Box>
        <Button title="Logout" loading={false} onClick={handleLogout} />
      </Box>
    </Box>
  )
}

export default Page
