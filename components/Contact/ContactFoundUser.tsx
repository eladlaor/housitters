import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import {
  selectFirstNameState,
  selectLastNameState,
  selectPrimaryUseState,
  selectUsersContactedState,
} from '../../slices/userSlice'
import { USER_TYPE } from '../../utils/constants'
import { Conversation } from '../../types/clientSide'
import IndividualChat from './IndividualChat'

export default function ContactFoundUser({ recipientUserId }: { recipientUserId: string }) {
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const currentUserType = useSelector(selectPrimaryUseState)
  const userFirstName = useSelector(selectFirstNameState)
  const userLastName = useSelector(selectLastNameState)

  const sittersContacted = useSelector(selectUsersContactedState)

  const [conversation, setConversationState] = useState({} as Conversation)
  const [showConversationModal, setShowConversationModal] = useState(false)

  useEffect(() => {
    if (!user || !recipientUserId) {
      return
    }
    console.log(`value of show: ${showConversationModal}`)

    const loadSpecificConversation = async () => {
      let parsedConversation = {
        pastMessages: [],
      } as any

      if (currentUserType === USER_TYPE.Landlord) {
        const { error, data: messagesData } = await supabaseClient
          .from('messages')
          .select(`id, created_at, message_content, housitter_id, is_read_by_recipient, sent_by`)
          .eq('landlord_id', user?.id)
          .eq('housitter_id', recipientUserId)
          .order('created_at', { ascending: false })

        if (error) {
          alert(`error loading specific conversation: ${error}`)
          debugger
          return
        }

        if (messagesData && messagesData.length > 0) {
          parsedConversation.latestMessage = {
            messageContent: messagesData[0].message_content,
            sentAt: messagesData[0].created_at,
          }
          for (const message of messagesData) {
            const isReadByRecipient = message.is_read_by_recipient
            // adding a new message to the pastMessages array of an existing conversation object
            parsedConversation.pastMessages = [
              ...parsedConversation.pastMessages,
              {
                sentAt: new Date(message.created_at).toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                }),
                isReadByRecipient,
                messageContent: message.message_content,
                isSender: message.sent_by === currentUserType,
                id: message.id,
              },
            ] as Conversation['pastMessages']
          }
        } else {
          console.log('no messages')
        }
      } else if (currentUserType === USER_TYPE.Housitter) {
        const { error, data: messagesData } = await supabaseClient
          .from('messages')
          .select(`id, created_at, message_content, housitter_id, is_read_by_recipient, sent_by`)
          .eq('housitter_id', user?.id)
          .eq('landlord_id', recipientUserId)
          .order('created_at', { ascending: false })

        if (error) {
          alert(`error loading specific conversation: ${error}`)
          debugger
          return
        }

        if (messagesData && messagesData.length > 0) {
          parsedConversation.latestMessage = {
            messageContent: messagesData[0].message_content,
            sentAt: messagesData[0].created_at,
          }
          for (const message of messagesData) {
            const isReadByRecipient = message.is_read_by_recipient
            // adding a new message to the pastMessages array of an existing conversation object
            parsedConversation.pastMessages = [
              ...parsedConversation.pastMessages,
              {
                sentAt: new Date(message.created_at).toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                }),
                isReadByRecipient,
                messageContent: message.message_content,
                isSender: message.sent_by === currentUserType,
                id: message.id,
              },
            ] as Conversation['pastMessages']
          }

          // TODO:
          parsedConversation.recipientFirstName = 'test first name'
          parsedConversation.recipientLastName = 'test last name'
        } else {
          console.log('no messages')
        }
      }

      const { error: profilesError, data: recipientProfileData } = await supabaseClient
        .from('profiles')
        .select(`first_name, last_name, avatar_url`)
        .eq('id', recipientUserId)
        .single()

      if (profilesError) {
        alert(`error querying profiles: ${profilesError}`)
        debugger
        return
      }

      if (recipientProfileData) {
        parsedConversation.recipientFirstName = recipientProfileData.first_name
        parsedConversation.recipientLastName = recipientProfileData.last_name
        parsedConversation.recipientAvatarUrl = recipientProfileData.avatar_url
      }

      setConversationState(parsedConversation)
    }

    loadSpecificConversation()
  }, [user, showConversationModal, sittersContacted])

  function handleShowConversationModal() {
    setShowConversationModal(true)
  }

  function handleHideConversationModal() {
    setShowConversationModal(false)
  }

  return (
    <div>
      <Button variant="secondary" onClick={handleShowConversationModal}>
        Contact
      </Button>
      <IndividualChat
        userFirstName={userFirstName}
        userLastName={userLastName}
        conversation={conversation}
        recipientId={recipientUserId}
        selectedConversationId={recipientUserId}
        showConversationModal={showConversationModal}
        setShowConversationModalStatesFromInbox={null}
        setShowConversationModalFromFoundUser={setShowConversationModal}
        handleHideConversationModalFromInbox={null}
        handleHideConversationModalFromFoundUser={handleHideConversationModal}
      />
      {/* 
      <Modal show={showEmailModal} onHide={handleCloseEmailModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            Contact {recipientFirstName} {recipientLastName}
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
            <Button
              variant="success"
              type="submit"
              onClick={(e: any) => handleSendEmail(e)}
              disabled={isSendingInProgress}
            >
              {isSendingInProgress ? (
                <Spinner animation="border" role="status"></Spinner>
              ) : (
                ' Send the email'
              )}
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleCloseEmailModal}>Close</Button>
        </Modal.Footer>
      </Modal> */}
    </div>
  )
}