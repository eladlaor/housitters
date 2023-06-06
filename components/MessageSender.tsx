import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'

import {
  selectUsersContactedState,
  setUsersContactedState,
  selectPrimaryUseState,
} from '../slices/userSlice'

import { API_ROUTES, MessageSenderProps, USER_TYPE } from '../utils/constants'

import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
// import { Input } from 'react-chat-elements'

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
    isChat,
  } = props

  const [showEmailModal, setShowEmailModal] = useState(false)
  const sittersContacted = useSelector(selectUsersContactedState)
  const userType = useSelector(selectPrimaryUseState)

  const [messageContent, setMessageContent] = useState('')

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
      message: messageContent,
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
      message_content: messageContent,
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

    setMessageContent('')
  }

  return isChat ? (
    <div>
      {/*might want to use the Input component from react-chat */}
      <Form>
        <Form.Group controlId="chat-message">
          <Form.Label>New Message</Form.Label>
          <Form.Control
            size="lg"
            as="textarea"
            placeholder="type message"
            value={messageContent}
            onChange={(e) => {
              setMessageContent(e.target.value)
            }}
            // this is a fix to the strange fact that the onChange handler - in this case only (not when !isChat) - is not triggered when the space key is pressed.
            onKeyDown={(e) => {
              if (e.key === ' ') {
                setMessageContent(messageContent + ' ')
              }
            }}
          />
        </Form.Group>
        <Button variant="success" type="submit" onClick={(e: any) => handleSendEmail(e)}>
          Send that shit
        </Button>
      </Form>
    </div>
  ) : (
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
                size="lg"
                as="textarea"
                placeholder=""
                value={messageContent}
                onChange={(e) => {
                  setMessageContent(e.target.value)
                }}
              />
            </Form.Group>
            <Button variant="success" type="submit" onClick={(e: any) => handleSendEmail(e)}>
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
