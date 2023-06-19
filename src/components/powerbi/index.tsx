import { CssBaseline } from '@material-ui/core'
import dynamic from 'next/dynamic'

const DynamicComponentWithNoSSR = dynamic(() => import('./iframe'), {
  ssr: false
})

const PowerBi = ({
  props,
  preloader = 'https://adev.bluemarble.com.br/sc/app/SGI_SIG5/_lib/libraries/sys/PowerBI/preloader/G5.gif',
  page = 0,
  filters = []
}: any) => {
  return (
    <>
      <CssBaseline />
      <DynamicComponentWithNoSSR
        props={props}
        preloader={preloader}
        page={page}
        filters={filters}
      />
    </>
  )
}

export { PowerBi }
