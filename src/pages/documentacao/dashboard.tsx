import axios from 'axios'
import { PowerBi } from '../../components/powerbi'

function Page ({ dados }:any) {
  return (
    <>
      <PowerBi props={dados} page={0} />
    </>
  )
}

Page.requireAuth = true
export default Page

export async function getServerSideProps (ctx) {
  const { data } = await axios.get('https://dev.bluemarble.com.br/sc/app/SantosBrasil/blank_powerbi_token/?relatorio=SB_DOCUMENTACAO')
  const { topBar } = ctx.query
  if (!topBar) {
    return {
      redirect: {
        destination: '/documentacao?topBar=hidden'
      }
    }
  }

  return { props: { dados: data } }
}
