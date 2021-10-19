export default function Index () {
  return <div />
}

export function getServerSideProps () {
  return {
    redirect: {
      destination: '/documentacao/dashboard?topBar=hidden'
    }
  }
}
