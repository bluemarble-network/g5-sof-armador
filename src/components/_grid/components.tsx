import { TableCell, TableCellProps, TableHead, TableRow, TableRowProps, TableSortLabel, Typography } from '@material-ui/core'
import { Box, BoxProps } from '@material-ui/system'
import { FC, memo } from 'react'
import { ITitles } from './index'

interface ICustomTableHead {
  titles?: ITitles[]
  orderBy: string
  order: 'desc' | 'asc' | undefined
  setOrder(value: string | undefined): void
  setOrderBy(value: string): void
}

const Trow:FC<TableRowProps> = (props) => {
  const { children, ...rest } = props
  return (
      <TableRow {...rest}>
          {children}
      </TableRow>
  )
}

export const Tr = memo(Trow)

interface ITd extends TableCellProps {

}

export const Td: FC<ITd> = ({ children, ...props }) => {
  return (
      <TableCell {...props}>
          {children}
      </TableCell>
  )
}

interface IHeaderProps extends BoxProps {
  title: string
}

export const Header:FC<IHeaderProps> = ({ title, children, ...props }) => {
  return (
      <Box component="header" sx={{ marginBottom: 2 }} {...props}>
          <Typography fontWeight="bold" component="h1" variant="h5" >{title}</Typography>
          <Box sx={{ display: 'flex', gap: 2, paddingTop: 1 }}>
              {children}
          </Box>
      </Box>
  )
}

const Head: FC<ICustomTableHead> = ({ titles = [], order, orderBy, setOrder, setOrderBy }) => {
  function onRequestSort (title: string) {
    if (title !== orderBy) {
      setOrderBy(title)
      return setOrder('desc')
    }

    switch (order) {
      case 'desc':
        setOrder('asc')
        setOrderBy(title)
        break
      case 'asc':
        setOrder(undefined)
        setOrderBy('')
        break
      default:
        setOrder('desc')
        setOrderBy(title)
        break
    }
  }

  return (
    <TableHead>
      <Tr sx={{ backgroundColor: 'background.default' }}>
        {
          titles.map((title, index) => {
            return (
              <Td
                key={index}
                sortDirection={orderBy === title.name ? order : false}
              >
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                  <TableSortLabel
                    onClick={() => onRequestSort(title.name)}
                    active={orderBy === title.name}
                    direction={orderBy === title.name ? order : 'asc'}
                  >
                    <Typography fontWeight="bold" component="p" variant='subtitle2'>
                      {title.label}
                    </Typography>
                  </TableSortLabel>
                </Box>
              </Td>
            )
          })
        }
      </Tr>
    </TableHead>
  )
}

export const CustomTableHead = memo(Head)

interface INotificationProps extends BoxProps {
  visible: boolean
}

export const Notification:FC<INotificationProps> = ({ visible, ...props }) => {
  if (!visible) return <></>

  return (
    <Box {...props}>
      <Box sx={{
        borderRadius: '50%',
        width: 8,
        height: 8,
        zIndex: 9999,
        background: '#009cb4',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }} />
    </Box>
  )
}
