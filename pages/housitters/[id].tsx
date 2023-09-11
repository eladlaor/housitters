import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { LocationDescriptions, UserType, TableNames } from '../../utils/constants'
import ContactFoundUser from '../../components/Contact/ContactFoundUser'
import { getUrlFromSupabase } from '../../utils/helpers'
import { Card, Container, Row, Col, Spinner } from 'react-bootstrap'
import DateDisplayer from '../../components/utils/DateDisplayer'
import RecommendationSender from '../../components/RecommendationSender'

export default function PublicProfile() {
  const router = useRouter()

  const supabaseClient = useSupabaseClient()
  const { id } = router.query as { id: string }

  const [profile, setProfile] = useState({} as any)
  const [reviews, setReviews] = useState([] as any[])
  const [availability, setAvailbility] = useState([] as any[])
  const [wasNewReviewSubmitted, setWasNewReviewSubmitted] = useState(false)

  useEffect(() => {
    const asyncWrapper = async () => {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      const { data: sitter } = await supabaseClient
        .from('housitters')
        .select('*')
        .eq('user_id', id)
        .single()
      setProfile({ ...profile, ...sitter })

      const { data: dates } = await supabaseClient
        .from('available_dates')
        .select('*')
        .eq('user_id', id)
      setAvailbility(dates as any[])

      // Get reviews
      const { data: reviews } = await supabaseClient
        .from(TableNames.ReviewsOnHousitters)
        .select('*, recommended_by_user_id!inner(*)')
        .eq('recommended_user_id', id)
      setReviews(reviews as any[])
    }

    asyncWrapper()
  }, [id, wasNewReviewSubmitted])

  return (
    <div>
      <Container>
        <Row>
          <Col xs={12} md={9}>
            <Row className="mb-4">
              <Col xs={1}>
                {profile.avatar_url ? (
                  <img
                    src={getUrlFromSupabase(profile.avatar_url, 'avatars')}
                    style={{
                      width: 65,
                      height: 65,
                      borderRadius: 1000,
                    }}
                  />
                ) : (
                  <Spinner />
                )}
              </Col>
              <Col xs={4}>
                <h1 style={{ margin: 0, fontWeight: 'bold' }}>
                  {profile.first_name} {profile.last_name}
                </h1>
                <span>👤 Member since {profile?.created_at?.substring(0, 10)}</span>
              </Col>
              <Col>
                <Row className="pt-2">
                  <Col>
                    <dt>💪 Experience</dt>
                    <dd>{profile.experience} years</dd>
                  </Col>
                  <Col>
                    <dt>🔗 Social media</dt>
                    <dd>
                      {profile.social_media_url ? (
                        <a href={profile.social_media_url}>
                          {profile.social_media_url.split('/')[2]}
                        </a>
                      ) : (
                        'Unavailable'
                      )}
                    </dd>
                  </Col>
                </Row>
              </Col>
            </Row>
            <h3>About</h3>
            <p>
              {profile.about_me ? profile.about_me : 'The user did not complete their profile yet.'}
            </p>

            <h3>Availablity</h3>
            <ul>
              {availability &&
                availability.map((period, index) => (
                  <li key={index}>
                    <DateDisplayer startDate={period.start_date} endDate={period.end_date} />
                  </li>
                ))}
            </ul>

            <h3>Reviews</h3>
            {reviews && reviews.length === 0 && (
              <p>There are currently no reviews for this sitter.</p>
            )}
            {reviews &&
              reviews.map((review, index) => (
                <Row key={index} style={{ marginTop: '1rem' }}>
                  <Col xs="auto">
                    <img
                      src={getUrlFromSupabase(review.recommended_by_user_id.avatar_url, 'avatars')}
                      style={{
                        width: 45,
                        height: 45,
                        borderRadius: 1000,
                      }}
                    />
                  </Col>
                  <Col>
                    <h6>
                      <strong>
                        {review.recommended_by_user_id.first_name}{' '}
                        {review.recommended_by_user_id.last_name}
                      </strong>
                      , {review.created_at.substring(0, 10)}
                    </h6>
                    <p>{review.description}</p>
                    <p>{review.sit_included}</p>
                  </Col>
                </Row>
              ))}
            <RecommendationSender
              reviewedUserId={id}
              reviewedUserFirstName={profile.first_name}
              reviewedUserLastName={profile.last_name}
              reviewedUserType={UserType.Housitter}
              setWasNewReviewSubmitted={setWasNewReviewSubmitted}
            />
          </Col>
          <Col xs={12} md={3}>
            <Card>
              <Card.Body>
                <ContactFoundUser
                  className="w-100 mb-3"
                  size="lg"
                  recipientUserId={profile.user_id}
                />
                <br />
                <h6 style={{ fontWeight: 'bold' }}>Locations</h6>
                <p>
                  {profile.locations &&
                    profile.locations.map((location: string, index: number) => (
                      <div key={index}>
                        ✅ <span>{LocationDescriptions[location]}</span>
                        <br />
                      </div>
                    ))}
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/*  */}
      {/* <Picture */}
      {/*   isIntro={false} */}
      {/*   uid={userId} */}
      {/*   primaryUse={primaryUse} */}
      {/*   url={avatarUrl} */}
      {/*   size={80} */}
      {/*   width={50} */}
      {/*   height={50} */}
      {/*   disableUpload={true} */}
      {/*   bucketName={'avatars'} */}
      {/*   isAvatar={true} */}
      {/*   promptMessage={''} */}
      {/*   email={email ? email : ''} */}
      {/*   isRounded={false} */}
      {/* /> */}
      {/* <hr /> */}
      {/* <h3> */}
      {/*   {firstName} {lastName} */}
      {/* </h3> */}
      {/* <hr /> */}
      {/* {aboutMe ? aboutMe : `${firstName} didn't write a bio yet.`} */}
      {/* <MessageSender */}
      {/*   recipientFirstName={firstName} */}
      {/*   recipientLastName={lastName} */}
      {/*   recipientUserId={userId} */}
      {/*   senderFirstName={currentUserFirstName} */}
      {/*   senderLastName={currentUserLastName} */}
      {/*   isChat={false} */}
      {/* /> */}
      {/* <hr /> */}
      {/* <ReviewsOnSelectedUser */}
      {/*   selectedUserId={userId} */}
      {/*   selectedUserFirstName={firstName} */}
      {/*   selectedUserLastName={lastName} */}
      {/*   selectedUserType={primaryUse} */}
      {/* /> */}
      {/* <RecommendationSender */}
      {/*   reviewedUserId={userId} */}
      {/*   reviewedUserFirstName={firstName} */}
      {/*   reviewedUserLastName={lastName} */}
      {/*   reviewedUserType={primaryUse} */}
      {/* />{' '} */}
    </div>
  )
}
