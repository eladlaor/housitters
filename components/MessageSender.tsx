import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { API_ROUTES, EmailFormFields, USER_TYPE } from '../utils/constants'
import { selectSittersContactedState, setSittersContactedState } from '../slices/landlordSlice'

// TODO: probably a better way to type the props, lets find out.
export default function MessageSender({
  props,
}: {
  props: {
    firstName: string
    lastName: string
    housitterId: string
  }
}) {
  const supabaseClient = useSupabaseClient()
  const user = useUser()

  const dispatch = useDispatch()

  const [showEmailModal, setShowEmailModal] = useState(false)
  const sittersContacted = useSelector(selectSittersContactedState)

  const [emailForm, setEmailForm] = useState({
    title: '',
    message: '',
    reciepientEmail: '',
  } as EmailFormFields)

  function handleCloseEmailModal() {
    setShowEmailModal(false)
  }

  function handleOpenEmailModal() {
    setShowEmailModal(true)
  }

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

    const { error: persistMessageError } = await supabaseClient.from('messages').upsert({
      housitter_id: props.housitterId,
      landlord_id: user?.id, // TODO: make sure always
      title: emailForm.title,
      message_content: emailForm.message,
    })

    if (persistMessageError) {
      alert(`error persisting communication: ${persistMessageError}`)
      debugger
      throw persistMessageError
    }

    console.log('successfully persisted communication')

    dispatch(
      setSittersContactedState([
        ...sittersContacted,
        {
          housitterId: props.housitterId,
          lastContacted: new Date().toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        },
      ])
    )
  }

  return (
    <div>
      <Button variant="secondary" onClick={handleOpenEmailModal}>
        Send Email
      </Button>
      <Modal show={showEmailModal} onHide={handleCloseEmailModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            Send Email to {props.firstName} {props.lastName}
          </Modal.Title>
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
    </div>
  )
}
