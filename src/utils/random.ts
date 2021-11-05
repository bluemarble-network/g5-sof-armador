import crypto from 'crypto'

export async function getRandomChar (size) {
  const result = await new Promise((resolve, reject) => {
    crypto.randomBytes(size, (err, hash) => {
      const filename = `${hash.toString('hex')}`
      if (err) reject(err)
      resolve(filename)
    })
  })
  return result
}
