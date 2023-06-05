import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { API_ROUTES, EmailFormFields, MessageSenderProps, USER_TYPE } from '../utils/constants'
import {
  selectUsersContactedState,
  setUsersContactedState,
  selectPrimaryUseState,
} from '../slices/userSlice'

// TODO: probably a better way to type the props, lets find out.
export default function MessageSender(props: MessageSenderProps) {
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const dispatch = useDispatch()

  const {
    recipientFirstName,
    recipientLastName,
    recipientUserId,
    senderFirstName,
    senderLastName,
  } = props

  const [showEmailModal, setShowEmailModal] = useState(false)
  const sittersContacted = useSelector(selectUsersContactedState)
  const userType = useSelector(selectPrimaryUseState)

  const [emailForm, setEmailForm] = useState({
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

    const { error, data } = await supabaseClient
      .from('profiles')
      .select(`email`)
      .eq('id', recipientUserId)
      .single()

    if (error) {
      alert(`error trying to get housitter email: ${error.message}`)
      debugger
      throw error
    }

    if (!data || !data.email) {
      alert(`no email found for housitter id: ${recipientUserId}`)
      debugger
      throw new Error(`no email found for housitter id: ${recipientUserId}`)
    }

    const response = await axios.post(API_ROUTES.SEND_EMAILS, {
      message: emailForm.message,
      recipientEmail: data.email,
      senderFirstName,
      senderLastName,
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
      [userType === USER_TYPE.Housitter ? 'landlord_id' : 'housitter_id']: recipientUserId,
      [userType === USER_TYPE.Housitter ? 'housitter_id' : 'landlord_id']: user!.id,
      message_content: emailForm.message,
      sent_by: userType,
    })

    if (persistMessageError) {
      alert(`error persisting communication: ${persistMessageError}`)
      debugger
      throw persistMessageError
    }

    console.log('successfully persisted communication')

    dispatch(
      setUsersContactedState([
        ...sittersContacted,
        {
          userId: recipientUserId,
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
            Send Email to {recipientFirstName} {recipientLastName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="message">
              <Form.Label>Message</Form.Label>
              <Form.Control
                className="text-end"
                size="lg"
                as="textarea"
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
