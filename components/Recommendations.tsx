import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { Card, Modal } from 'react-bootstrap'

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
            first_name, last_name, avatar_url
        )`
        )
        .eq('recommended_user_id', housitterId)

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
              profiles: { first_name: firstName },
            } = rec

            modifiedRecs.push({
              duration,
              sitIncluded,
              description,
              startMonth,
              firstName,
              lastName,
            })
          })

          setRecommendations(modifiedRecs)
        } else {
          const {
            duration,
            sit_included: sitIncluded,
            description,
            start_month: startMonth,
            profiles: { first_name: firstName, last_name: lastName },
          } = data

          setRecommendations([
            {
              duration,
              sitIncluded,
              description,
              startMonth,
              firstName,
              lastName,
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
        <Modal.Title>all recommendations</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {recommendations.map((rec: any, index: number) => (
          <Card key={index}>
            <Card.Body>
              <Card.Text>
                description: {rec.description}. by: {rec.firstName}
              </Card.Text>
            </Card.Body>
          </Card>
        ))}
      </Modal.Body>
    </Modal>
  )
}
