import '../styles/globals.css'
import { ThemeProvider } from '@material-ui/core'
import { Toast } from '../components/_toast'
import { TopBar } from '../components/_topbar'
import { AlertProvider } from '../contexts/alert'
import { AuthProvider } from '../contexts/auth'
import { standardTheme } from '../styles/theme'

function MyApp ({ Component, pageProps }: any) {
  return (
  <ThemeProvider theme={standardTheme}>
      <AlertProvider>
        <Toast/>
            {
              Component.requireAuth
                ? <AuthProvider>
                <>
                  <TopBar/>
                  <Component {...pageProps} />
                </>
              </AuthProvider>

                : <Component {...pageProps} />
            }
      </AlertProvider>
  </ThemeProvider>
  )
}

export default MyApp
