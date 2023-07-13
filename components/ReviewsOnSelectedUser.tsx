import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { Button, Card, Modal } from 'react-bootstrap'
import Picture from './Picture'
import { TableNames, UserType } from '../utils/constants'
import { useSelector } from 'react-redux'
import { selectPrimaryUseState } from '../slices/userSlice'
import { ReviewsOnSelectedUserProps, SelectedUserReview } from '../types/clientSide'
import RecommendationSender from './RecommendationSender'
import { selectShowRecommendationFormModalState } from '../slices/recommendationSlice'

export default function ReviewsOnSelectedUser(props: ReviewsOnSelectedUserProps) {
  const supabaseClient = useSupabaseClient()

  const { selectedUserId, selectedUserFirstName, selectedUserLastName, selectedUserType } = props

  const [selectedUserReviews, setSelectedUserReviews] = useState([] as any[]) // TODO: type it
  const showRecommendationFormModalState = useSelector(selectShowRecommendationFormModalState)
  const currentUserType = useSelector(selectPrimaryUseState)
  const [isLoading, setIsLoading] = useState(false)
  const [showAllRecsModal, setShowAllRecsModal] = useState(false)

  useEffect(() => {
    if (!selectedUserId) {
      return
    }
    const asyncWrapper = async () => {
      let data

      if (currentUserType === UserType.Landlord) {
        const { error, data: housitterReviewsData } = await supabaseClient
          .from(TableNames.ReviewsOnHousitters)
          .select(
            `duration, sit_included, description, start_month, profiles!inner(
            id, first_name, last_name, avatar_url
        )`
          )
          .eq('recommended_user_id', selectedUserId)

        if (error) {
          alert(`error querying recommendations: ${error.message}`)
          debugger
          throw error
        }
        if (housitterReviewsData) {
          data = housitterReviewsData
        }
      } else if (currentUserType === UserType.Housitter) {
        const { error, data: landlordReviewsData } = await supabaseClient
          .from(TableNames.ReviewsOnLandlords)
          .select(
            `duration, sit_included, description, start_month, profiles!inner(
          id, first_name, last_name, avatar_url
      )`
          )
          .eq('recommended_user_id', selectedUserId)

        if (error) {
          alert(`error querying recommendations: ${error.message}`)
          debugger
          throw error
        }
        if (landlordReviewsData) {
          data = landlordReviewsData
        }
      }

      if (data) {
        const parsedRecs: any[] = []
        if (Array.isArray(data)) {
          // TODO: would be better to use map inside of defining a new array and pushing, though doesnt matter

          data.forEach((rec: any) => {
            const {
              duration,
              sit_included: sitIncluded,
              description,
              start_month: startMonth,
              profiles: {
                id: reviewerUserId,
                first_name: reviewerFirstName,
                last_name: reviewerLastName,
                avatar_url: reviewerAvatarUrl,
              },
            } = rec

            const startMonthAsLocaleString = startMonth.toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
            })

            parsedRecs.push({
              duration,
              sitIncluded,
              description,
              startMonth: startMonthAsLocaleString,
              reviewerUserId,
              reviewerFirstName,
              reviewerLastName,
              reviewerAvatarUrl,
            })
          })

          setSelectedUserReviews(parsedRecs)
        } else {
          alert(`data did get as array`)
        }
      }
    }

    asyncWrapper()
  }, [showRecommendationFormModalState, showAllRecsModal])

  function handleCloseModal() {
    setSelectedUserReviews([])
    setShowAllRecsModal(false)
  }

  return (
    <div>
      <Button variant="danger" onClick={() => setShowAllRecsModal(true)}>
        See reviews
      </Button>
      <div>
        {showAllRecsModal && (
          <Modal show={showAllRecsModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>
                all recommendations for {selectedUserFirstName} {selectedUserLastName}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedUserReviews.length === 0 ? (
                <div>
                  <p>no reviews yet</p>
                </div>
              ) : (
                selectedUserReviews.map((review: SelectedUserReview, index: number) => (
                  <div key={index}>
                    <Card bg="primary" style={{ width: '18rem' }} key={index}>
                      <Card.Body>
                        <Card.Title>
                          <div>
                            recommended by: <br />
                            {review.reviewerFirstName} {review.reviewerLastName}
                            <Picture
                              uid={review.reviewerUserId}
                              email="" // basically should use housitter email but it doesnt matter here as the filename is alreay saved
                              url={review.reviewerAvatarUrl}
                              isIntro={false}
                              primaryUse={UserType.Landlord}
                              size={100}
                              width={100} // should persist dimensions of image upon upload
                              height={100}
                              disableUpload={true}
                              bucketName="avatars"
                              isAvatar={true}
                              promptMessage=""
                              isRounded={false}
                            />
                          </div>
                        </Card.Title>
                        <hr />
                        <Card.Text>Sit included: {review.sitIncluded}</Card.Text>
                        <hr />
                        <Card.Text>description: {review.description}</Card.Text>
                        <hr />
                        <Card.Text>
                          month: {review.startMonth}. <br /> duration: {review.duration} days.
                        </Card.Text>
                        <hr />
                      </Card.Body>
                    </Card>
                    <br />
                    <br />
                  </div>
                ))
              )}
            </Modal.Body>
          </Modal>
        )}
      </div>
      {/* <RecommendationSender
        reviewedUserId={selectedUserId}
        reviewedUserFirstName={selectedUserFirstName}
        reviewedUserLastName={selectedUserLastName}
        reviewedUserType={selectedUserType}
      /> */}
    </div>
  )
}
