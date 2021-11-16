import { CssBaseline } from '@material-ui/core'
import dynamic from 'next/dynamic'

const DynamicComponentWithNoSSR = dynamic(
  () => import('./iframe'),
  { ssr: false }
)

const PowerBi = ({ props, preloader = 'https://dev.bluemarble.com.br/sc/devel/conf/grp/SantosBrasil/img/bg/SB-2.gif', page = 0, filters = [] }: any) => {
  return (
      <>
        <CssBaseline />
        <DynamicComponentWithNoSSR props={props} preloader={preloader} page={page} filters={filters} />
      </>
  )
}

export { PowerBi }
