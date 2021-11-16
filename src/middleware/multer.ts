import aws from 'aws-sdk'
import multer from 'multer'
import s3Storage from 'multer-sharp-s3'
import { NextApiResponse } from 'next'
import nextConnect from 'next-connect'
import { getRandomChar } from '../utils/random'

aws.config.update({
  secretAccessKey: process.env.AWS_SECRETKEY,
  accessKeyId: process.env.AWS_ACCESSKEY,
  region: process.env.AWSREGION
})

export const s3 = new aws.S3()

const apiRoute = nextConnect({
  onNoMatch(req, res: NextApiResponse) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` })
  }
})

const upload = multer({
  storage: s3Storage({
    s3,
    Bucket: process.env.AWS_BUCKET || '',
    ACL: 'public-read',
    Key: async function (_, file, cb) {
      const randomName = await getRandomChar(16)
      const hashedName = `${randomName}-${file.originalname}`
      cb(null, hashedName)
    }
    // resize: {
    //   width: 150,
    //   options: {
    //     fit: 'cover'
    //   }
    // }
  })
})

apiRoute.use(upload.single('file'))

export { apiRoute }
