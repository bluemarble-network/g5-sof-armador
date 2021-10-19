import crypto from 'crypto'
import { IncomingMessage } from 'http'
import jwt from 'jsonwebtoken'
import { NextApiRequest } from 'next'
import { getCookieParser } from 'next/dist/next-server/server/api-utils'
import { IUserData } from '../middleware/IUserData'

export interface IRequest {
  headers: {
    cookies: string
    referer: string
  }
  url: string
}

export function getCookie (req: NextApiRequest, name: string): string | null {
  if (!req.headers.cookie) return null
  const cookies = req.headers.cookie.split('; ')

  for (const x in cookies) {
    if (cookies[x].includes(name)) { return cookies[x].split('=')[1] }
  }

  return null
}

export interface IToken extends IUserData{
  origin?: string
}

export async function getSession (req: NextApiRequest): Promise<IToken | null> {
  const token = getCookieParser(req)()['next-token']
  if (!token) return null
  try {
    const result = await validateJwt(token)
    if (result) return result
    return null
  } catch (error) {
    return null
  }
}

export async function getSessionContext (req: IncomingMessage): Promise<IToken | null> {
  const token = getCookieParser(req)()['next-token']

  if (!token) return null
  try {
    const result = await validateJwt(token)
    if (result) return result
    return null
  } catch (error) {
    return null
  }
}

export const generateNewSessionToken = (user: IUserData): string => {
  const token = jwt.sign({ user }, `${process.env.JWT_SECRET}`, { expiresIn: '6mins' })
  return token
}

export const generateNewRefreshToken = (user: IUserData): string => {
  const token = jwt.sign({ user }, `${process.env.JWT_SECRET}`, { expiresIn: '60mins' })
  return token
}

interface IGenerateTokenProps {
  user: IUserData
  origin: string
}

export const generateNewRememberMeToken = ({ user, origin }: IGenerateTokenProps): string => {
  const token = jwt.sign({ user, origin }, `${process.env.JWT_SECRET}`, { expiresIn: '7days' })
  return token
}

export const hashPassword = async (password: string): Promise<string> => {
  const hash = crypto.createHash('sha512')
  const hashedPassword = hash.update(password, 'utf-8').digest('hex')

  return hashedPassword
}

export const comparePassword = async (password: string, storagePassword: string): Promise<boolean> => {
  const hash = crypto.createHash('sha512')
  const hashedPassword = hash.update(password, 'utf-8').digest('hex')

  return hashedPassword === storagePassword
}

export const validateJwt = async (token: string): Promise<IToken | null> => {
  const result: any = await new Promise((resolve, reject) => {
    jwt.verify(token, `${process.env.JWT_SECRET}`, (err, result) => {
      if (err) reject(err)
      if (!result) return resolve(null)
      resolve({ ...result })
    })
  })
  if (result) return result

  return null
}
