import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { Card, Modal } from 'react-bootstrap'
import Picture from './Picture'
import { USER_TYPE } from '../utils/constants'

export default function Recommendations(props: any) {
  // TODO:
  const supabaseClient = useSupabaseClient()

  const {
    housitterId,
    firstName,
    lastName,
    showAllRecsModal,
    setShowAllRecsModal,
    recommendations,
    setRecommendations,
  } = props

  useEffect(() => {
    const asyncWrapper = async () => {
      const { error, data } = await supabaseClient
        .from('recommendations')
        .select(
          `duration, sit_included, description, start_month, profiles!inner(
            id, first_name, last_name, avatar_url
        )`
        )
        .eq('recommended_user_id', housitterId)
      /* recommendations table has only one foreign key relation to profiles table - recommender_user_id. 
        thats why the inner join will apply only for landlords, and that why the first_name last_name etc refers to landlords. 

        */
      if (error) {
        alert(`error querying recommendations: ${error.message}`)
        debugger
        throw error
      }

      if (data) {
        const modifiedRecs: any[] = []
        if (Array.isArray(data)) {
          // TODO: would be better to use map inside of defining a new array and pushing, though doesnt matter
          data.forEach((rec: any) => {
            const {
              duration,
              sit_included: sitIncluded,
              description,
              start_month: startMonth,
              profiles: {
                id: landlordId,
                first_name: landlordFirstName,
                last_name: landlordLastName,
                avatar_url: landlordAvatarUrl,
              },
            } = rec

            modifiedRecs.push({
              duration,
              sitIncluded,
              description,
              startMonth,
              landlordId,
              landlordFirstName,
              landlordLastName,
              landlordAvatarUrl,
            })
          })

          setRecommendations(modifiedRecs)
        } else {
          const {
            duration,
            sit_included: sitIncluded,
            description,
            start_month: startMonth,
            profiles: {
              id: landlordId,
              first_name: landlordFirstName,
              last_name: landlordLastName,
              avatar_url: landlordAvatarUrl,
            },
          } = data

          setRecommendations([
            {
              duration,
              sitIncluded,
              description,
              startMonth,
              landlordId,
              landlordFirstName,
              landlordLastName,
              landlordAvatarUrl,
            },
          ])
        }
      }
    }

    asyncWrapper()
  }, [])

  function handleCloseModal() {
    setRecommendations([])
    setShowAllRecsModal(false)
  }

  return (
    <Modal show={showAllRecsModal} onHide={handleCloseModal}>
      <Modal.Header closeButton>
        <Modal.Title>
          all recommendations for {firstName} {lastName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {recommendations.map((rec: any, index: number) => (
          <div key={index}>
            <Card bg="primary" style={{ width: '18rem' }} key={index}>
              <Card.Body>
                <Card.Title>
                  <div>
                    {rec.landlordFirstName} {rec.landlordLastName}
                    <Picture
                      uid={rec.landlordId}
                      email="" // basically should use housitter email but it doesnt matter here as the filename is alreay saved
                      url={rec.landlordAvatarUrl}
                      isIntro={false}
                      primaryUse={USER_TYPE.Landlord}
                      size={100}
                      width={100} // should persist dimensions of image upon upload
                      height={100}
                      disableUpload={true}
                      bucketName="avatars"
                      isAvatar={true}
                      promptMessage=""
                    />
                  </div>
                </Card.Title>
                <hr />
                <Card.Text>Sit included: {rec.sitIncluded}</Card.Text>
                <hr />
                <Card.Text>
                  description: {rec.description}. by: {rec.firstName}
                </Card.Text>
                <hr />
                <Card.Text>
                  month: {rec.startMonth}. <br /> duration: {rec.duration} days.
                </Card.Text>
                <hr />
              </Card.Body>
            </Card>
            <br />
            <br />
          </div>
        ))}
      </Modal.Body>
    </Modal>
  )
}
