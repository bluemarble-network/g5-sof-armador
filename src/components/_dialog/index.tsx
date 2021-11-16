import { Box, Button, CircularProgress, Dialog as DefaultDialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core'
import { FC } from 'react'

interface IOptions {
  label: string
  focus: boolean
  cb(value): void
}

interface IProps {
  open: boolean
  title: string
  body: string
  options: IOptions[]
  loading: boolean
}

const Dialog: FC<IProps> = ({ open, title, body, options, loading }) => {
  return (
        <DefaultDialog open={open}>
            <Box sx={{ padding: 1 }}>
                <DialogTitle sx={{ fontWeight: 'bold' }} >{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {body}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    {
                        options.map((item, index) => {
                          return (
                                <Button
                                    key={index}
                                    onClick={ () => item.cb(item.label)}
                                    variant={ item.focus ? 'contained' : 'text'}
                                    sx={{
                                      fontWeight: item.focus ? 'bold' : 'normal',
                                      color: item.focus ? '#fff' : 'primary.main'
                                    }}
                                    disableElevation
                                >
                                    {
                                        (loading && item.focus)
                                          ? <CircularProgress size={25} color="inherit" />
                                          : <>{item.label}</>
                                    }
                                </Button>
                          )
                        })
                    }
                </DialogActions>
            </Box>
        </DefaultDialog>
  )
}

export { Dialog }
