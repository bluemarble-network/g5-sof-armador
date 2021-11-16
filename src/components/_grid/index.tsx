import { TableContainer, Paper, Table, TableBody, Tooltip, IconButton, Box, TablePagination, Popover, Autocomplete, Typography, Chip, LinearProgress, TextField } from '@material-ui/core'
import { ChangeEventHandler, FC, memo, ReactElement, useEffect, useMemo, useRef, useState } from 'react'
import { MdClose, MdFilterList, MdSearch, MdViewAgenda, MdViewStream } from 'react-icons/md'
import { LargeButton } from '../_button'
import { CustomTableHead, Notification } from './components'

export interface ITitles {
  name: string
  label: string
  type?: string
  transformer?: (value: string | number | Date) => string
}

export interface IFilter {
  column: string
  value: string
  transformer?: (value: string | number | Date) => string
}

interface IGridProps {
  columTitles: ITitles[]
  defaultData: any[]
  tableData: any[]
  rowOptions?: number[]
  footer?: ReactElement
  customButtons?: ReactElement
  isLoading?: boolean
  selectedFilters: IFilter[]
  setSelectedFilters(value: any[]): void
  setTableData(value: any[]): void
  updateFilters(value: any[]): void
}

export function filterData (filters: IFilter[], defaultData: { current: any[] }): any[] {
  if (filters.length === 0) return defaultData.current

  const filteredArray = defaultData.current.slice(0).filter(item => {
    let satisfiedFilter = 0
    filters.forEach(sub => {
      let currentValue = item[sub.column]
      if (sub.transformer) currentValue = sub.transformer(currentValue)
      if (String(currentValue) === String(sub.value)) satisfiedFilter += 1
    })

    if (satisfiedFilter === filters.length) return true
    return false
  })

  return filteredArray
}

const CustomTable:FC <IGridProps> = ({ children, ...props }) => {
  const {
    columTitles = [],
    defaultData,
    rowOptions = [6, 12, 24],
    setTableData,
    tableData,
    updateFilters = () => {},
    footer,
    customButtons,
    isLoading,
    selectedFilters = [],
    setSelectedFilters
  } = props

  const [order, setOrder] = useState<any>(undefined)
  const [orderBy, setOrderBy] = useState<string>('')
  const [tableSize, setTableSize] = useState<'medium' | 'small'>('small')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(rowOptions[0])
  const [selectedTitle, setSelectedTitle] = useState<string | undefined>(undefined)
  const [selectedFilterValue, setSelectedFilterValue] = useState<string | undefined>(undefined)
  const [valuesToFilter, setValuesToFilter] = useState<string[]>([])

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [searchText, setSearchText] = useState<string>('')
  const [openSearch, setOpenSearch] = useState(false)
  const searchAnchorEl = useRef<HTMLElement | null>(null)

  const countRows = useMemo(() => {
    if (searchText.length > 0) {
      const array = handleFilterBySearch(searchText)
      return array.length
    } else {
      return defaultData.length
    }
  }, [searchText, tableData])

  const handleChangeRowsPerPage: ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    setRowsPerPage(parseInt(target.value))
    const maxPage = Math.floor(countRows / rowsPerPage)
    if (page > maxPage) setPage(maxPage)
  }

  function handleSort (data: any[]): any[] {
    const sortable = data.slice(0)
    if (order === undefined) return sortable
    sortable.sort((a, b) => {
      const x = a[orderBy]
      const y = b[orderBy]

      return x < y ? -1 : x > y ? 1 : 0
    })
    return (order === 'asc') ? sortable : sortable.reverse()
  }

  function handleAddFilter () {
    const [column] = columTitles.filter(item => (item.label === selectedTitle))
    const newFilter = { column: column.name, value: selectedFilterValue, transformer: column.transformer }

    const filterAlreadyExists = selectedFilters.some(filter => (filter.column === column.name && filter.value === selectedFilterValue))
    if (filterAlreadyExists) return
    setSelectedFilters([...selectedFilters, newFilter])
  }

  function handleCloseFilter (item: IFilter) {
    const filterToDelete = selectedFilters.find(filter => (filter.column === item.column && filter.value === item.value))
    if (!filterToDelete) return

    const filteredSelectedFilters = selectedFilters.filter((filter, index) => selectedFilters.indexOf(filterToDelete) !== index)

    setSelectedFilters([...filteredSelectedFilters])
  }

  function handleFilterBySearch (text: string) {
    const newArray = defaultData.filter(item => {
      for (const [, value] of Object.entries(item)) {
        if (`${value}`.includes(text)) return true
      }
      return false
    })

    return newArray
  }

  useEffect(() => {
    const maxPage = Math.floor(countRows / rowsPerPage)
    if (page > maxPage) setPage(maxPage - 1)
  }, [countRows])

  useEffect(() => {
    if (order) {
      const newArray = (searchText.length > 0) ? handleFilterBySearch(searchText) : defaultData
      const sortedArray = handleSort(newArray)
      const data = sortedArray.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      setTableData(data)
    } else {
      const newArray = (searchText.length > 0) ? handleFilterBySearch(searchText) : defaultData
      const data = newArray.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      setTableData(data)
    }
  }, [defaultData])

  useEffect(() => {
    const newArray = (searchText.length > 0) ? handleFilterBySearch(searchText) : defaultData
    const sortedArray = handleSort(newArray)
    const paginatedArray = sortedArray.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    setTableData(paginatedArray)
  }, [order, orderBy])

  useEffect(() => {
    if (order) {
      const newArray = (searchText.length > 0) ? handleFilterBySearch(searchText) : defaultData
      const sortedArray = handleSort(newArray)
      const dados = sortedArray.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      setTableData(dados)
    } else {
      const newArray = (searchText.length > 0) ? handleFilterBySearch(searchText) : defaultData
      const dados = newArray.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      setTableData(dados)
    }
  }, [page, rowsPerPage])

  useEffect(() => {
    setValuesToFilter([])
    setSelectedFilterValue(undefined)
    if (selectedTitle) {
      const values: string[] = []
      const [prop] = columTitles.filter(item => (item.label === selectedTitle))
      const newArray = (searchText.length > 0) ? handleFilterBySearch(searchText) : defaultData
      newArray.forEach(item => {
        const value = (prop.transformer) ? prop.transformer(item[prop.name]) : String(item[prop.name])
        if (!values.includes(value)) values.push(value)
      })
      setValuesToFilter(values)
    }
  }, [selectedTitle])

  useEffect(() => {
    if (order) {
      const newArray = handleFilterBySearch(searchText)
      const sortedArray = handleSort(newArray)
      const dados = sortedArray.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      setTableData(dados)
    } else {
      const newArray = handleFilterBySearch(searchText)
      const dados = newArray.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

      setTableData(dados)
    }
  }, [searchText])

  useEffect(() => {
    updateFilters(selectedFilters)
  }, [selectedFilters])

  return (
    <Paper>
        {
          isLoading &&
          <LinearProgress />
        }
        <Box ref={searchAnchorEl} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ pl: 1 }}>
            {
              selectedFilters.map((item, index) => {
                return <Chip key={index} label={item.value} onDelete={() => handleCloseFilter(item)}/>
              })
            }
          </Box>
          <Box>
            {customButtons}
            <Tooltip title={(tableSize === 'small') ? 'Aumentar tabela' : 'Diminuir tabela'}>
              <IconButton onClick={() => setTableSize((tableSize === 'small') ? 'medium' : 'small')}>
                {
                  (tableSize === 'small')
                    ? <MdViewStream size={8 * 3} />
                    : <MdViewAgenda size={8 * 3} />
                }
              </IconButton>
            </Tooltip>
            <Tooltip title="Buscar">
              <IconButton onClick={() => setOpenSearch(true)}>
                <Notification visible={searchText.length > 0} sx={{ position: 'absolute', right: 8, top: 10 }} />
                <MdSearch size={8 * 3} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Filtrar">
              <IconButton sx={{ position: 'relative' }} onClick={({ currentTarget }) => setAnchorEl(currentTarget)}>
                <Notification visible={selectedFilters.length > 0} sx={{ position: 'absolute', right: 8, top: 10 }} />
                <MdFilterList size={8 * 3} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      <TableContainer>
        <Table className="table" aria-label="a dense table" size={tableSize}>
          <CustomTableHead titles={columTitles} order={order} orderBy={orderBy} setOrder={setOrder} setOrderBy={setOrderBy}/>
          <TableBody>
            {children}
            {footer}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        page={page}
        component="div"
        rowsPerPage={rowsPerPage}
        labelRowsPerPage="Linhas por página"
        rowsPerPageOptions={rowOptions}
        count={countRows}
        labelDisplayedRows={({ from, to, count, page }) => `${page + 1} de ${Math.floor(countRows / rowsPerPage) + 1}`}
        onPageChange={(event, newPage) => {
          setPage(newPage)
        }}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Popover
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
      >
        <Box sx={{ minWidth: 300, padding: 2 }}>
          <Typography fontWeight="bold" variant="body1" >Filtrar por:</Typography>
             <Autocomplete
              value={selectedTitle}
              onChange={ ({ target }: any) => { (!target.innerHTML.includes('path')) ? setSelectedTitle(target.innerHTML) : setSelectedTitle(undefined) } }
              options={columTitles.map((title) => title.label)}
              renderInput={(params) => <TextField variant="standard" margin="dense" {...params} label="Coluna" />}
            />
            <Autocomplete
              value={selectedFilterValue}
              onChange={ ({ target }: any) => { (!target.innerHTML.includes('path')) ? setSelectedFilterValue(target.innerHTML) : setSelectedFilterValue(undefined) } }
              disabled={valuesToFilter.length < 1}
              options={valuesToFilter.map((title) => title)}
              renderInput={(params) => <TextField variant="standard" margin="dense" {...params} label="Valor" />}
            />
            <Box sx={{ py: 1 }} />
          <LargeButton disabled={!selectedFilterValue} onClick={handleAddFilter} loading={false} title="Adicionar filtro" />
        </Box>
      </Popover>
      <Popover
          anchorEl={searchAnchorEl.current}
          open={openSearch}
          onClose={() => setOpenSearch(false)}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
      >
        <Box sx={{ minWidth: 300, px: 2, pb: 1, display: 'grid', gridTemplateColumns: '1fr 30px', alignItems: 'flex-end' }}>
            <TextField variant="standard" margin="dense" label="Buscar" value={searchText} onChange={({ currentTarget }) => setSearchText(currentTarget.value)} />
            <Box>
              <IconButton onClick={() => {
                setSearchText('')
                setOpenSearch(false)
              }}>
                <MdClose size={8 * 3} />
              </IconButton>
            </Box>
        </Box>
      </Popover>
    </Paper>
  )
}

export const Grid = memo(CustomTable) as FC<IGridProps>
