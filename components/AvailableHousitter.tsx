import { Button, Form, Modal } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import { HousitterProps } from '../types/clientSide'
import Picture from './Picture'
import { API_ROUTES, EmailFormFields, USER_TYPE } from '../utils/constants'
import axios from 'axios'
import { useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import RecommendationForm from './RecommendationForm'
import Recommendations from './Recommendations'
import { useDispatch, useSelector } from 'react-redux'
import { selectSittersContactedState, setSittersContactedState } from '../slices/landlordSlice'

// TODO: should probably rename to Housitter in order to reuse in search results for specific sitter.
export default function AvailableHousitter({ props }: { props: HousitterProps }) {
  const [showEmailModal, setShowEmailModal] = useState(false)
  const supabaseClient = useSupabaseClient()
  const [showRecModal, setShowRecModal] = useState(false)
  const [showAllRecsModal, setShowAllRecsModal] = useState(false)
  const [recommendations, setRecommendations] = useState([] as any[]) // TODO: type it

  const user = useUser()
  const dispatch = useDispatch()
  const sittersContacted = useSelector(selectSittersContactedState)

  const [emailForm, setEmailForm] = useState({
    title: '',
    message: '',
    reciepientEmail: '',
  } as EmailFormFields)

  async function handleSendEmail(e: any) {
    e.preventDefault()
    setShowEmailModal(false)

    // in supabase database, I created a function which triggers after every new user signup, which creates a queryable public.users view
    // trigger name: on_new_user_created | function name: create_public_users_view
    const { error, data } = await supabaseClient
      .from('profiles')
      .select(`email`)
      .eq('id', props.housitterId)
      .single()

    if (error) {
      alert(`error trying to get housitter email: ${error.message}`)
      debugger
      throw error
    }

    if (!data || !data.email) {
      alert(`no email found for housitter id: ${props.housitterId}`)
      debugger
      throw new Error(`no email found for housitter id: ${props.housitterId}`)
    }

    const response = await axios.post(API_ROUTES.SEND_EMAILS, {
      title: emailForm.title,
      message: emailForm.message,
      recipientEmail: data.email,
    })

    if (response.status === 200) {
      alert(response.data.message)
    } else {
      alert(
        `error when trying to send email. Status: ${response.status}. Message: ${response.data?.error}`
      )
      debugger
    }

    const { error: persistMessageError } = await supabaseClient.from('communications').upsert({
      housitter_id: props.housitterId,
      landlord_id: user?.id, // TODO: make sure always
      title: emailForm.title,
      message: emailForm.message,
    })

    if (persistMessageError) {
      alert(`error persisting communication: ${persistMessageError}`)
      debugger
      throw persistMessageError
    }

    console.log('successfully persisted communication')
    // TODO: should have a redux slice of communications ready to always know which sitters have been clicked.

    dispatch(
      setSittersContactedState([
        ...sittersContacted,
        { housitterId: props.housitterId, lastContacted: new Date() },
      ])
    )
  }

  function handleCloseEmailModal() {
    setShowEmailModal(false)
  }

  function handleOpenEmailModal() {
    setShowEmailModal(true)
  }

  return (
    <div>
      <Card bg="success" style={{ width: '18rem' }}>
        <Card.Body>
          <Picture
            uid={props.housitterId}
            email="" // basically should use housitter email but it doesnt matter here as the filename is alreay saved
            url={props.avatarUrl}
            isIntro={false}
            primaryUse={USER_TYPE.Housitter}
            size={100}
            width={100} // should persist dimensions of image upon upload
            height={100}
            disableUpload={true}
            bucketName="avatars"
            isAvatar={true}
            promptMessage=""
          />
          <Card.Title>
            {props.firstName} {props.lastName}
            <hr />
          </Card.Title>
          {(() => {
            let foundSitter = sittersContacted.find(
              (sitter) => sitter.housitterId === props.housitterId
            )
            if (foundSitter) {
              const { lastContacted } = foundSitter
              return (
                <div>
                  <Card.Text>
                    Email Sent at:{' '}
                    {new Date(lastContacted).toLocaleString('heb-IL', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Card.Text>
                  <hr />
                </div>
              )
            } else {
              return null
            }
          })()}

          <Card.Text>{props.about_me}</Card.Text>
          <Button variant="secondary" onClick={handleOpenEmailModal}>
            Send Email
          </Button>
          <Modal show={showEmailModal} onHide={handleCloseEmailModal}>
            <Modal.Header closeButton>
              <Modal.Title>Send Email</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="title">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder=""
                    value={emailForm.title}
                    onChange={(e) => {
                      setEmailForm({
                        ...emailForm,
                        title: e.target.value,
                      })
                    }}
                  />
                </Form.Group>
                <Form.Group controlId="message">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder=""
                    value={emailForm.message}
                    onChange={(e) => {
                      setEmailForm({
                        ...emailForm,
                        message: e.target.value,
                      })
                    }}
                  />
                </Form.Group>
                <Button variant="success" type="submit" onClick={handleSendEmail}>
                  Send the email
                </Button>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={handleCloseEmailModal}>Close</Button>
            </Modal.Footer>
          </Modal>
          <Button variant="warning" onClick={() => setShowRecModal(true)}>
            Recommend
          </Button>

          {showRecModal && (
            <RecommendationForm
              housitterId={props.housitterId}
              firstName={props.firstName}
              lastName={props.lastName}
              recommendedUserType={USER_TYPE.Housitter}
              recommendedUserAvatarUrl={props.avatarUrl as string}
              showRecModal={showRecModal}
              setShowRecModal={setShowRecModal}
            />
          )}
          <Button variant="info" onClick={() => setShowAllRecsModal(true)}>
            See recommendations
          </Button>
          {showAllRecsModal && (
            <Recommendations
              firstName={props.firstName}
              lastName={props.lastName}
              housitterId={props.housitterId}
              showAllRecsModal={showAllRecsModal}
              setShowAllRecsModal={setShowAllRecsModal}
              recommendations={recommendations}
              setRecommendations={setRecommendations}
            />
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
