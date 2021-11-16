/* eslint-disable react-hooks/exhaustive-deps */
import { Alert, Snackbar } from '@material-ui/core'
import { FC, useContext, useEffect, useState } from 'react'
import { AlertContext } from '../contexts/alert'

const Toast:FC = () => {
  const { message, type, setMessage } = useContext(AlertContext)
  const [visible, setVisible] = useState(false)

  function handleClose () {
    setVisible(false)
    setTimeout(() => setMessage(''), 100)
  }

  useEffect(() => {
    setVisible(true)
  }, [message])

  return (
        <>

            <Snackbar
                open={!!((visible && message))}
                onClose={handleClose}
                sx={{ zIndex: 9999999999 }}
                autoHideDuration={6000}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={type} elevation={2}>{message}</Alert>
            </Snackbar>
        </>
  )
}

export { Toast }
