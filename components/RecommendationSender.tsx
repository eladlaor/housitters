import { Button, Form, Modal } from 'react-bootstrap'
import { TableNames, USER_TYPE } from '../utils/constants'
import { RecommendationFormProps } from '../types/clientSide'
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
import { startOfMonth, format } from 'date-fns'
import { Database } from '../types/supabase'
import { useState } from 'react'
import CountAndUpdate from './utils/CountAndUpdate'

export default function RecommendationSender(props: RecommendationFormProps) {
  const { reviewedUserId, reviewedUserFirstName, reviewedUserLastName, reviewedUserType } = props

  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const dispatch = useDispatch()

  const startMonth = useSelector(selectStartMonthState)
  const duration = useSelector(selectDurationState)
  const description = useSelector(selectDescriptionState)
  const sitIncluded = useSelector(selectSitIncludedState)
  const showRecommendationFormModal = useSelector(selectShowRecommendationFormModalState)

  const [selectedUserToRecommendId, setSelectedUserToRecommendId] = useState('')

  function handleStartMonthChange(date: Date) {
    dispatch(setStartMonthState(date.toISOString())) // redux needs serializable value, hence string
  }

  // TODO: i can now use CountAndUpdate instead, as a component.

  async function handleSubmit(e: any) {
    e.preventDefault()

    if (reviewedUserType === USER_TYPE.Housitter) {
      const { error } = await supabaseClient.from(TableNames.ReviewsOnHousitters).upsert({
        recommended_user_id: reviewedUserId,
        recommended_by_user_id: user!.id, // TODO: how to make sure i'll always have this value here as useUser is async
        start_month: new Date(startMonth),
        duration,
        sit_included: sitIncluded,
        description,
      } as Partial<Database['public']['Tables']['reviews_on_housitters']>)

      if (error) {
        alert(`Failed upserting new recommendation. Error: ${error.message}`)
        debugger
        throw error
      }
    } else if (reviewedUserType === USER_TYPE.Landlord) {
      const { error } = await supabaseClient.from(TableNames.ReviewsOnLandlords).upsert({
        recommended_user_id: reviewedUserId,
        recommended_by_user_id: user!.id, // TODO: how to make sure i'll always have this value here as useUser is async
        start_month: new Date(startMonth),
        duration,
        sit_included: sitIncluded,
        description,
      } as Partial<Database['public']['Tables']['reviews_on_housitters']>)

      if (error) {
        alert(`Failed upserting new recommendation. Error: ${error.message}`)
        debugger
        throw error
      }
    }

    alert(`successfully submitted recommendation for ${reviewedUserFirstName}`)

    for (const attributeSetterAndInitialState of settersToInitialStates) {
      dispatch(
        attributeSetterAndInitialState.matchingSetter(attributeSetterAndInitialState.initialState)
      )
    }

    setSelectedUserToRecommendId('')
    dispatch(setShowRecommendationFormModalState(false))
  }

  function handleSelectedUserToRecommend(e: any) {
    setSelectedUserToRecommendId(e.target.value as string)
    dispatch(setShowRecommendationFormModalState(true))
  }

  function handleCloseModal() {
    setSelectedUserToRecommendId('')
    dispatch(setShowRecommendationFormModalState(false))
  }

  return (
    <div>
      <Button variant="warning" value={reviewedUserId} onClick={handleSelectedUserToRecommend}>
        Recommend
      </Button>
      {showRecommendationFormModal && selectedUserToRecommendId === reviewedUserId && (
        <Modal show={showRecommendationFormModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              Recommend {reviewedUserFirstName} {reviewedUserLastName}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="start-date">
                <Form.Label>when was it?</Form.Label>
                <DatePicker
                  selected={new Date()}
                  openToDate={new Date()}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  onChange={(date: any) => handleStartMonthChange(date)}
                  customInput={<Form.Control type="text" />}
                  value={format(startOfMonth(new Date(startMonth)), 'MM/yyyy')}
                />
              </Form.Group>

              {reviewedUserType === USER_TYPE.Housitter && (
                <CountAndUpdate
                  placeholderMessage="how many days was it"
                  valueToCount={duration}
                  reduxReducer={setDurationState}
                />
              )}
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
