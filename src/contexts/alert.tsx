import { AlertColor } from '@material-ui/core'
import { createContext, useState, FC } from 'react'

interface IAlertContextType {
    message: string
    type: AlertColor | undefined
    createAlert(message: string, type: string): void
    setMessage(message: string): void
}

export const AlertContext = createContext({ } as IAlertContextType)

const AlertProvider:FC = ({ children }) => {
  const [type, setType] = useState()
  const [message, setMessage] = useState('')

  function createAlert (newMessage: string, type: any) {
    setMessage(newMessage)
    setType(type)
  }

  return (
        <AlertContext.Provider value={{ message: message, type, createAlert, setMessage }} >
            { children }
        </AlertContext.Provider>
  )
}

export { AlertProvider }
