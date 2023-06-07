import { Button, Form, Modal } from 'react-bootstrap'
import { RecommendationFormProps } from '../utils/constants'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  selectStartMonthState,
  selectDurationState,
  selectSitIncludedState,
  selectDescriptionState,
  setStartMonthState,
  setDurationState,
  setSitIncludedState,
  setDescriptionState,
  setShowRecommendationFormModalState,
  settersToInitialStates,
  selectShowRecommendationFormModalState,
} from '../slices/recommendationSlice'
import { useSelector, useDispatch } from 'react-redux'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { startOfMonth, format, isDate } from 'date-fns'
import { Database } from '../types/supabase'

export default function RecommendationForm(props: RecommendationFormProps) {
  const { housitterId, firstName, lastName, recommendedUserType } = props

  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const dispatch = useDispatch()

  const startMonth = useSelector(selectStartMonthState)
  const duration = useSelector(selectDurationState)
  const description = useSelector(selectDescriptionState)
  const sitIncluded = useSelector(selectSitIncludedState)

  const showRecommendationFormModal = useSelector(selectShowRecommendationFormModalState)

  function handleDatesChange(date: Date) {
    dispatch(setStartMonthState(date.toISOString())) // redux needs serializable value, hence string
  }

  function handleDurationChange(e: any) {
    e.preventDefault()
    const newValue = e.target.value
    if (newValue >= 0) {
      dispatch(setDurationState(newValue))
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault()

    const { error } = await supabaseClient.from('recommendations').upsert({
      recommended_user_id: housitterId,
      recommended_by: user!.id, // TODO: how to make sure i'll always have this value here as useUser is async
      start_month: new Date(startMonth),
      duration,
      recommended_user_type: recommendedUserType,
      sit_included: sitIncluded,
      description,
    } as Partial<Database['public']['Tables']['recommendations']>)

    if (error) {
      alert(`Failed upserting new recommendation. Error: ${error.message}`)
      debugger
      throw error
    }

    alert(`successfully submitted recommendation for ${firstName}`)

    // TODO: in this case its ok because its separate setters, but generally not good to set state in forEach, should create a new array and then set it.
    settersToInitialStates.forEach((attributeSetterAndInitialState) => {
      dispatch(
        attributeSetterAndInitialState.matchingSetter(attributeSetterAndInitialState.initialState)
      )
    })

    dispatch(setShowRecommendationFormModalState(false))
  }

  return (
    <div>
      <Button variant="warning" onClick={() => dispatch(setShowRecommendationFormModalState(true))}>
        Recommend
      </Button>
      {showRecommendationFormModal && (
        <Modal
          show={showRecommendationFormModal}
          onHide={() => dispatch(setShowRecommendationFormModalState(false))}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Recommend {firstName} {lastName}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              // Just select a month and a year
              <Form.Group controlId="start-date">
                <Form.Label>start date of sit</Form.Label>
                <DatePicker
                  selected={new Date()}
                  openToDate={new Date()}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  onChange={(date: any) => handleDatesChange(date)}
                  customInput={<Form.Control type="text" />}
                  value={format(startOfMonth(new Date(startMonth)), 'MM/yyyy')}
                />
              </Form.Group>
              <Form.Group controlId="duration">
                <Form.Label>how many days was it</Form.Label>
                <Form.Control
                  type="number"
                  value={duration}
                  placeholder="how many days was it"
                  onChange={(e) => {
                    handleDurationChange(e)
                  }}
                />
              </Form.Group>
              <Form.Group controlId="sit-included">
                <Form.Label>what did the sit include</Form.Label>
                <Form.Control
                  type="text"
                  value={sitIncluded}
                  onChange={(e) => {
                    dispatch(setSitIncludedState(e.target.value))
                  }}
                />
              </Form.Group>
              <Form.Group controlId="description"></Form.Group>
              <Form.Label>How was it?</Form.Label>
              <Form.Control
                className="text-end"
                size="sm"
                as="textarea"
                rows={5}
                value={description}
                onChange={(e) => {
                  dispatch(setDescriptionState(e.target.value))
                }}
              />
              <Button variant="success" type="submit" onClick={(e) => handleSubmit(e)}>
                Submit Recommendation
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </div>
  )
}
