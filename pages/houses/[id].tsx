import React from 'react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { getUrlFromSupabase } from '../../utils/helpers'

import { LocationDescriptions, TableNames, UserType } from '../../utils/constants'
import { Card, Container, Row, Col } from 'react-bootstrap'
import DateDisplayer from '../../components/utils/DateDisplayer'
import ContactFoundUser from '../../components/Contact/ContactFoundUser'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import RecommendationSender from '../../components/RecommendationSender'

export default function HouseDetails() {
  const supabaseClient = useSupabaseClient()
  const router = useRouter()

  const { id: landlordId } = router.query as { id: string }
  const [availability, setAvailbility] = useState([] as any[])
  const [post, setPost] = useState({} as any)
  const [reviews, setReviews] = useState([] as any[])
  const [wasNewReviewSubmitted, setWasNewReviewSubmitted] = useState(false)

  useEffect(() => {
    if (!landlordId) {
      return
    }

    // TODO: maybe better differentiate between the sitter/lord use cases, specifically for userFirstName
    const loadData = async () => {
      setPost(
        (
          await supabaseClient
            .from('posts')
            .select(
              `landlord_id, title, description, images_urls, landlords!inner (
            location, profiles!inner (
              first_name, last_name, avatar_url, available_dates (start_date, end_date), pets!inner (
                dogs, cats
              )
            )
        )`
            )
            .eq('landlord_id', landlordId)
            .single()
        ).data
      )

      const { data: dates } = await supabaseClient
        .from('available_dates')
        .select('*')
        .eq('user_id', landlordId)
      setAvailbility(dates as any[])

      // Get reviews
      const { data: reviews } = await supabaseClient
        .from(TableNames.ReviewsOnLandlords)
        .select(
          `duration, sit_included, description, start_month, profiles!inner(
            id, first_name, last_name, avatar_url
        )`
        )
        .eq('recommended_user_id', landlordId)
      setReviews(reviews as any[])
    }

    loadData()
  }, [wasNewReviewSubmitted])

  return (
    <Container>
      <Row className="mt-4">
        <Col xs={12} md={9}>
          <h1 style={{ fontWeight: 'bold' }}>{post?.title}</h1>
          <Row className="mb-4">
            <Col xs={1}>
              <img
                src={getUrlFromSupabase(post?.landlords?.profiles?.avatar_url, 'avatars')}
                style={{
                  width: 65,
                  height: 65,
                  borderRadius: 1000,
                }}
              />
            </Col>
            <Col>
              <h4>
                Hosted by{' '}
                <em>
                  {post?.landlords?.profiles?.first_name} {post?.landlords?.profiles?.last_name}
                </em>
              </h4>
              <p>{post?.description}</p>
            </Col>
          </Row>
          <Row>
            {post?.images_urls && (
              <ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 750: 3, 900: 4 }}>
                <Masonry>
                  {post.images_urls.map((url: string, index: number) => (
                    <div
                      style={{ paddingRight: '1rem', paddingBottom: '1rem', paddingLeft: '1rem' }}
                      key={index}
                    >
                      <img
                        style={{ maxWidth: '100%', borderRadius: '1rem' }}
                        src={getUrlFromSupabase(landlordId + '-' + url, 'posts')}
                      />
                    </div>
                  ))}
                </Masonry>
              </ResponsiveMasonry>
            )}
          </Row>

          <h3>Reviews</h3>
          {reviews?.length === 0 && <p>There are currently no reviews for this house.</p>}
          <RecommendationSender
            reviewedUserId={landlordId}
            reviewedUserFirstName={post?.landlords?.profiles?.first_name}
            reviewedUserLastName={post?.landlords?.profiles?.last_name}
            reviewedUserType={UserType.Landlord}
            setWasNewReviewSubmitted={setWasNewReviewSubmitted}
          />
          {reviews?.map((review) => (
            <Row key={review.id} style={{ marginTop: '1rem' }}>
              <Col xs="auto">
                <img
                  src={getUrlFromSupabase(review.profiles.avatar_url, 'avatars')}
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 1000,
                  }}
                />
              </Col>
              <Col>
                <h6>
                  <b>
                    {review.profiles.first_name} {review.profiles.last_name}
                  </b>
                  , {review.start_month}, {review.duration} days
                </h6>
                <p>{review.description}</p>
                <p>{review.sit_included}</p>
              </Col>
            </Row>
          ))}
        </Col>
        <Col xs={12} md={3}>
          <Card>
            <Card.Body>
              <ContactFoundUser className="w-100 mb-2" size="lg" recipientUserId={landlordId} />
              <strong>Availability</strong>
              <ul>
                {availability?.map((period, index) => (
                  <li key={index}>
                    <DateDisplayer startDate={period.start_date} endDate={period.end_date} />
                  </li>
                ))}
              </ul>
              <dl style={{ marginTop: '1rem' }}>
                <dt>Location</dt>
                <dd>{LocationDescriptions[post?.landlords?.location]}</dd>

                {!!post?.landlords?.profile?.pets?.dogs && (
                  <>
                    <dt>Dogs</dt>
                    <dd>{post?.landlords?.profile?.pets?.dogs}</dd>
                  </>
                )}

                {!!post?.landlords?.profile?.pets?.cats && (
                  <>
                    <dt>Cats</dt>
                    <dd>{post?.landlords?.profile?.pets?.cats}</dd>
                  </>
                )}
              </dl>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
