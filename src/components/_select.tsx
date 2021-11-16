import { FormControl, MenuItem, Select as DefaultSelect, StandardTextFieldProps } from '@material-ui/core'
import { useField } from '@unform/core'
import { useEffect, useRef } from 'react'

interface IProps extends StandardTextFieldProps {
    loading?: boolean
    name: string
}

export function Select ({ loading = false, name, children, ...props }: IProps) {
  const inputRef = useRef(null)

  const { fieldName, registerField } = useField(name)
  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'node.value'
    })
  }, [fieldName, registerField])

  return (
        <FormControl variant="standard">
            <DefaultSelect
              inputRef={inputRef}
              sx={{ width: '100%' }}
              variant="standard"
            >
                {
                    loading && <MenuItem value="Carregando">Carregando</MenuItem>
                }
                {
                    children
                }
            </DefaultSelect>
        </FormControl>
  )
}
