import { InputAdornment, StandardTextFieldProps, TextField, Box, Typography, CircularProgress } from '@material-ui/core'
import { useField } from '@unform/core'
import moment from 'moment'
import { useEffect, useRef, FC, useCallback, useState } from 'react'
import { MdAttachFile, MdAttachMoney } from 'react-icons/md'

interface IInputProps extends StandardTextFieldProps {
  name: string
  maxLength?: number
}

export const Input: FC<IInputProps> = ({ name, maxLength = 99999999, sx, ...rest }) => {
  const inputRef = useRef(null)
  const { fieldName, registerField, defaultValue }: any = useField(name)

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'node.value',
      getValue: (ref) => {
        switch (ref.type) {
          case 'number':
            return parseFloat(ref.value)
          case 'date':
            return new Date(ref.value)
          case 'datetime-local':
            return new Date(ref.value)
        }
        return ref.value
      }
    })
  }, [fieldName, registerField])

  const getDefaultValue = (value) => {
    if (rest.type === 'date') {
      return moment(value).format('YYYY-MM-DD')
    } else if (rest.type === 'datetime-local') {
      return moment(value).format('YYYY-MM-DDTHH:mm')
    }
    return value
  }

  return (
    <TextField
      variant="standard"
      sx={{
        width: '100%',
        ...sx
      }}
      margin="normal"
      inputRef={inputRef}
      name={name}
      inputProps={{ maxLength }}
      defaultValue={getDefaultValue(defaultValue)}
      {...rest}
    />
  )
}

interface IInputMaskProps extends IInputProps {
  maximumFractionDigits?: number
  maskType?: 'money' | 'decimal'
}

export const InputMask: FC<IInputMaskProps> = ({ name, maskType = 'decimal', maximumFractionDigits = 2, maxLength = 99999999, sx, ...rest }) => {
  const inputRef = useRef(null)
  const { fieldName, registerField, defaultValue }: any = useField(name)

  const formatToMoney = (e: any) => {
    let value = e.target.value.replace(/\./g, '').replace(/,/g, '.')
    value = parseFloat(value).toLocaleString('pt-br', { maximumFractionDigits })
    if (e.target.value.split('').pop() === ',' && e.target.value.length > 1) {
      e.target.value = `${value},`
    } else if (value !== 'NaN') {
      e.target.value = value
    } else {
      e.target.value = e.target.value.replace(/\D+/g, '')
    }
  }

  const formatToDecimal = (e: any) => {
    let value = e.target.value.replace(/(?:,)|(?:\D+)/g, '')
    value = parseFloat(value).toLocaleString('pt-br', { maximumFractionDigits: 0 })
    if (value !== 'NaN') {
      e.target.value = value
    }
  }

  const handleKeyUp = useCallback((e: any) => {
    if (maskType === 'decimal') {
      formatToDecimal(e)
    } else {
      formatToMoney(e)
    }
  }, [])

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'node.value',
      getValue: (ref) => parseFloat(`${ref.value}`.replace(/,/g, '.'))
    })
  }, [fieldName, registerField])

  return (
    <TextField
      onKeyUpCapture={(e) => handleKeyUp(e)}
      variant="standard"
      sx={{
        width: '100%',
        ...sx
      }}
      InputProps={(maskType === 'decimal')
        ? {}
        : {
            startAdornment: (
          <InputAdornment position="start">
            <MdAttachMoney />
          </InputAdornment>
            )
          } }
      margin="normal"
      inputRef={inputRef}
      name={name}
      inputProps={{ maxLength }}
      defaultValue={defaultValue ? defaultValue.replace(/\./, ',') : ''}
      {...rest}
    />
  )
}

interface IInputFileProps extends IInputProps {
  progress: number
}

export const InputFile: FC<IInputFileProps> = ({ progress, name, ...rest }: IInputFileProps) => {
  const [textFile, setTextFile] = useState('')
  const fileInput = useRef<HTMLInputElement>()

  const { fieldName, registerField, defaultValue }: any = useField(name)

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: fileInput.current,
      path: 'files[0]'
    })
  }, [fieldName, registerField])

  function handleChange () {
    if (fileInput.current && fileInput.current.value) {
      const name = fileInput.current.value.split('\\')
      setTextFile(`${name[name.length - 1]}`)
    } else {
      setTextFile('')
    }
  }

  return (
    <Box sx={{ position: 'relative', marginY: 2 }}>
      <Box component="label"
        htmlFor={name}
        sx={{
          cursor: 'pointer',
          ':hover': {
            ':before': {
              borderBottom: '2px solid rgba(0, 0, 0, 0.87)'
            }
          },
          ':before': {
            borderBottom: '1px solid rgba(0, 0, 0, 0.42)',
            left: 0,
            bottom: 0,
            right: 0,
            content: "' '",
            position: 'absolute',
            WebkitTransition: 'border-bottom-color 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
          },
          ':after': {
            borderBottom: '2px solid #00aa4a',
            left: 0,
            bottom: 0,
            right: 0,
            transform: `${textFile ? 'scaleX(1)' : 'scaleX(0)'}`,
            content: "' '",
            position: 'absolute',
            WebkitTransition: 'border-bottom-color 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
          }
        }}
        >
          <Box sx={{
            display: 'grid',
            gap: 1,
            paddingBottom: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
            gridTemplateColumns: '20px calc(100% - 60px) 20px'
          }}>
            <Box>
              <MdAttachFile size={20} />
            </Box>
            <Typography
              sx={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
            >
              { textFile || 'Selecionar arquivo'}
            </Typography>
            <CircularProgress size={20} variant="determinate" color="primary" value={progress || 0} />
          </Box>
          <TextField defaultValue={defaultValue} inputRef={fileInput} style={{ display: 'none' }} onChange={() => handleChange()} id={name} {...rest}/>
        </Box>
    </Box>
  )
}
