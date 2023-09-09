import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'

import {
  selectUsersContactedState,
  setUsersContactedState,
  selectPrimaryUseState,
} from '../../slices/userSlice'

import { API_ROUTES, UserType } from '../../utils/constants'
import { MessageSenderProps } from '../../types/clientSide'

import { Button, Modal, Form, Spinner, Row, Col } from 'react-bootstrap'

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
    onUpdate,
  } = props

  const [showEmailModal, setShowEmailModal] = useState(false)
  const sittersContacted = useSelector(selectUsersContactedState)
  const userType = useSelector(selectPrimaryUseState)

  const [messageContent, setMessageContent] = useState('')

  const [isSendingInProgress, setIsSendingInProgress] = useState(false)

  function handleCloseEmailModal() {
    setShowEmailModal(false)
  }

  function handleOpenEmailModal() {
    setShowEmailModal(true)
  }

  async function handleSendEmail(e: any) {
    try {
      e.preventDefault()
      setIsSendingInProgress(true)

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

      if (response.status !== 200) {
        alert(
          `error when trying to send email. Status: ${response.status}. Message: ${response.data?.error}`
        )
        debugger
      }

      const { error: persistMessageError } = await supabaseClient.from('messages').upsert({
        [userType === UserType.Housitter ? 'landlord_id' : 'housitter_id']: recipientUserId,
        [userType === UserType.Housitter ? 'housitter_id' : 'landlord_id']: user!.id,
        message_content: messageContent,
        sent_by: userType,
        created_at: new Date(),
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
      setIsSendingInProgress(false)
      setShowEmailModal(false)

      onUpdate && onUpdate()
      alert(response.data.message)
    } catch (error) {
      setIsSendingInProgress(false)
      alert(`Failed sending email. Error: ${JSON.stringify(error)}`)
      debugger
      throw error
    }
  }

  return isChat ? (
    <Form>
      <Row>
        <Col>
          <Form.Group controlId="chat-message">
            <Form.Control
              size="lg"
              as="textarea"
              placeholder="Type your message here..."
              value={messageContent}
              onChange={(e) => {
                setMessageContent(e.target.value)
              }}
            />
          </Form.Group>
        </Col>
        <Col xs="auto">
          <Button
            style={{ width: 'auto', height: '100%' }}
            variant="success"
            type="submit"
            onClick={(e: any) => handleSendEmail(e)}
            disabled={isSendingInProgress}
          >
            {isSendingInProgress ? <Spinner animation="border" role="status"></Spinner> : 'Send'}
          </Button>
        </Col>
      </Row>
    </Form>
  ) : (
    <></>
  )
}
