function difDatas (data):number {
  const now = new Date() // Data Atual
  const past = new Date(data) // Data do passado
  const diff = Math.abs(now.getTime() - past.getTime()) // Subtrai uma data pela outra
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) // Divide o total pelo total de milisegundos correspondentes a 1 dia. (1000 milisegundos = 1 segundo).

  // Mostra a diferença em dias
  // console.log('Entre 07/07/2014 até agora já se passaram ' + days + ' dias');
  return days - 1
}

export { difDatas }
