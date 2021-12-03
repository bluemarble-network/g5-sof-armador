import axios from 'axios'
import { PowerBi } from '../../components/powerbi'

Page.requireAuth = true

export default function Page({ dados }: any) {
  return (
    <PowerBi
      props={dados}
      page={2}
      preloader={
        'https://dev.bluemarble.com.br/sc/devel/conf/grp/CadastroEmpilhadeiras/img/bg/G5.gif'
      }
    />
  )
}

export async function getServerSideProps() {
  const { data } = await axios.get(
    'https://dev.bluemarble.com.br/sc/app/SantosBrasil/blank_powerbi_token/?relatorio=G5_NAVIO_OPERANDO'
  )
  return { props: { dados: data } }
}
