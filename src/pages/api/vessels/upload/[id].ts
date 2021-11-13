import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return post()
    default:
      return res.status(405).send('Invalid request method')
  }

  function post() {
    const props = req.body
  }
}
