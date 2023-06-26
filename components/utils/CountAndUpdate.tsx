import Form from 'react-bootstrap/Form'
import { useDispatch } from 'react-redux'

export default function CountAndUpdate({
  placeholderMessage,
  valueToCount,
  reduxReducer,
}: {
  placeholderMessage: string
  valueToCount: number
  reduxReducer: Function
}) {
  const dispatch = useDispatch()

  function handleChange(e: any) {
    e.preventDefault()
    const newValue = e.target.value
    if (newValue >= 0) {
      dispatch(reduxReducer(newValue))
    }
  }

  return (
    <Form.Control
      type="number"
      placeholder={placeholderMessage}
      value={valueToCount}
      onChange={handleChange}
    />
  )
}
