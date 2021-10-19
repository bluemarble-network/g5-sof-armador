function Cadastros () {
  return (
        <></>
  )
}

export function getServerSideProps () {
  return {
    redirect: { destination: '/contratos/cadastros/area_responsavel' }
  }
}

export default Cadastros
