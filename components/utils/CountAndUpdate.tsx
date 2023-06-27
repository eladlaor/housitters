import Form from 'react-bootstrap/Form'
import { useDispatch } from 'react-redux'

export default function CountAndUpdate({
  valueToCount,
  reduxReducer,
}: {
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
    <Form.Group>
      <Form.Control
        type="number"
        value={valueToCount !== null && valueToCount !== undefined ? valueToCount : 0}
        onChange={handleChange}
      />
    </Form.Group>
  )
}
