import axios from 'axios'
import { GetServerSideProps } from 'next'
import { PowerBi } from '../../components/powerbi'
import { getSessionContext } from '../../utils/auth'
import { prisma } from '../../utils/database'

Page.requireAuth = true

export default function Page({ dados }: any) {
  return (
    <PowerBi
      props={dados}
      page={5}
      preloader={
        'https://dev.bluemarble.com.br/sc/devel/conf/grp/CadastroEmpilhadeiras/img/bg/G5.gif'
      }
    />
  )
}

interface INavioOperando {
  navio: string
  armador: string
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { data } = await axios.get(
    'https://sb.bluemarble.com.br/blank_powerbi_token/?relatorio=G5_NAVIO_OPERANDO'
  )
  const session = await getSessionContext(ctx.req)

  const { data: navioOperando } = await axios.get<INavioOperando>(
    'https://adev.bluemarble.com.br/sc/app/SGI_SIG5/blank_dados_navio_operando'
  )
  const userGroups = await prisma.groups.findMany({
    where: {
      users_groups: {
        some: {
          user_id: session?.user.login
        }
      }
    }
  })

  await prisma.$disconnect()

  const encontrouArmador = userGroups?.some(
    (group) => group.name === navioOperando.armador
  )
  const isAdmin = userGroups?.some((group) => group.name === 'admin')

  if (encontrouArmador || isAdmin) {
    return { props: { dados: data } }
  }

  return {
    redirect: {
      permanent: true,
      destination: '/ship-not-found'
    }
  }
}
