export default function Index () {
  return <div />
}

export function getServerSideProps () {
  return {
    redirect: {
      destination: '/contratos/todos-contratos'
    }
  }
}
