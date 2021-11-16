
export function getErrorMessage (error: any): string {
  if (error.response) {
    const { data } = error.response
    if (typeof data === 'string') return data
    if (typeof error.response === 'string') return error.response

    return 'Erro desconhecido'
  }

  if (typeof error === 'string') return error

  return 'Erro desconhecido'
}
