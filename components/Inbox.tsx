import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { NavDropdown, Modal, Button } from 'react-bootstrap'

import { USER_TYPE } from '../utils/constants'

import {
  selectFirstNameState,
  selectIsLoggedState,
  selectLastNameState,
  selectPrimaryUseState,
  selectUsersContactedState,
} from '../slices/userSlice'
import {
  Conversation,
  selectConversationsState,
  selectTotalUnreadMessagesState,
  setConversationsState,
  setTotalUnreadMessagesState,
} from '../slices/inboxSlice'

import Picture from './Picture'
import MessageSender from './MessageSender'

import Badge from 'react-bootstrap/Badge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelopeOpenText } from '@fortawesome/free-solid-svg-icons'

export default function Inbox() {
  const user = useUser()
  const supabaseClient = useSupabaseClient()

  const dispatch = useDispatch()

  const currentUserType = useSelector(selectPrimaryUseState)
  const isLogged = useSelector(selectIsLoggedState)
  const usersContacted = useSelector(selectUsersContactedState)
  const totalUnreadMessages = useSelector(selectTotalUnreadMessagesState)
  const conversations = useSelector(selectConversationsState)
  const [selectedConversationId, setSelectedConversationId] = useState('') // add States to the name
  const [showConversationModalStates, setShowConversationModalStates] = useState<
    Record<string, boolean>
  >({})

  const userFirstName = useSelector(selectFirstNameState)
  const userLastName = useSelector(selectLastNameState)

  useEffect(() => {
    if (!user || !isLogged) {
      return
    }

    async function loadInboxData() {
      let messagesData: any[] = []

      if (currentUserType === USER_TYPE.Landlord) {
        const { error, data } = await supabaseClient
          .from('messages')
          .select(`created_at, message_content, housitter_id, title, is_read_by_recipient, sent_by`)
          .eq('landlord_id', user?.id)
          .order('created_at', { ascending: false })

        if (error) {
          alert(`error loading inbox data: ${error.message}`)
          debugger
          throw error
        } else if (data) {
          messagesData = data
        }
      } else {
        const { error, data } = await supabaseClient
          .from('messages')
          .select(`created_at, message_content, landlord_id, title, is_read_by_recipient, sent_by`)
          .eq('housitter_id', user?.id)
          .order('created_at', { ascending: false })

        if (error) {
          alert(`error loading inbox data: ${error.message}`)
          debugger
          throw error
        } else if (data) {
          messagesData = data
        }
      }

      // a separate call because cant inner join becaue: error loading inbox data: Could not embed because more than one relationship was found for 'messages' and 'profiles'

      if (messagesData.length > 0) {
        let totalUnreadMessages = 0

        let parsedConversations = {} as any

        for (const message of messagesData) {
          const keyNameOfRecipientId =
            currentUserType === USER_TYPE.Housitter
              ? `${USER_TYPE.Landlord}_id`
              : `${USER_TYPE.Housitter}_id`

          // adding a new converstaion key if needed
          if (!parsedConversations[message[keyNameOfRecipientId]]) {
            parsedConversations[message[keyNameOfRecipientId]] = {
              recipientFirstName: '',
              recipientLastName: '',
              recipientAvatarUrl: '',
              latestMessage: {
                messageContent: message.message_content,
                sentAt: message.created_at,
              } as Conversation['latestMessage'], // due to the order {ascending: false} clause in the db query
              pastMessages: [] as unknown as Conversation['pastMessages'],
              unreadMessages: 0,
            } as Conversation
          }

          parsedConversations[message[keyNameOfRecipientId]]

          if (message.sent_by !== currentUserType && !message.is_read_by_recipient) {
            parsedConversations[message[keyNameOfRecipientId]].unreadMessages =
              parsedConversations[message[keyNameOfRecipientId]].unreadMessages + 1

            totalUnreadMessages = totalUnreadMessages + 1
          }

          // adding a new message to the pastMessages array of an existing conversation object
          parsedConversations[message[keyNameOfRecipientId]].pastMessages = [
            ...parsedConversations[message[keyNameOfRecipientId]].pastMessages,
            {
              sentAt: new Date(message.created_at).toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              }),

              messageContent: message.message_content,
              isSender: message.sent_by === currentUserType,
            },
          ] as Conversation['pastMessages']
        }

        const recipientIds = Object.keys(parsedConversations)

        for (const recipientId of recipientIds) {
          const { error: recipientProfileError, data: recipientProfileData } = await supabaseClient
            .from('profiles')
            .select(`first_name, last_name, avatar_url`)
            .eq('id', recipientId)
            .single()
          if (recipientProfileError) {
            alert(
              `failed getting profile data for conversation recipient: ${recipientProfileError.message}`
            )
            debugger
            throw recipientProfileError
          }

          if (recipientProfileData) {
            parsedConversations[recipientId].recipientFirstName = recipientProfileData.first_name
            parsedConversations[recipientId].recipientLastName = recipientProfileData.last_name
            parsedConversations[recipientId].recipientAvatarUrl = recipientProfileData.avatar_url
          }
        }

        dispatch(setTotalUnreadMessagesState(totalUnreadMessages))
        dispatch(setConversationsState(parsedConversations))
      }
    }

    loadInboxData()

    // sortMessagesByConvesation() including getting last messages
  }, [user, currentUserType, usersContacted])

  function handleShowConversationModal(e: any, recipientId: string) {
    e.stopPropagation()
    setSelectedConversationId(recipientId)
    setShowConversationModalStates((previousState) => ({
      ...previousState,
      [recipientId]: true,
    }))
  }

  function handleHideConversationModal(e: any, recipientId: string) {
    e.stopPropagation()
    setSelectedConversationId('')
    setShowConversationModalStates((previousState) => ({
      ...previousState,
      [recipientId]: false,
    }))
  }

  return (
    <NavDropdown
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FontAwesomeIcon
            icon={faEnvelopeOpenText}
            style={{ marginRight: '10px', marginLeft: '5px' }}
          />
          Inbox
          <Badge pill bg="primary" style={{ marginLeft: '5px' }}>
            {totalUnreadMessages}
          </Badge>
        </div>
      }
      id="basic-nav-dropdown"
    >
      {Object.entries(conversations).map(([recipientId, conversation], index) => (
        <NavDropdown.Item
          href="#"
          key={`${recipientId}-${index}`}
          style={{ width: '100%' }}
          onClick={(e) => handleShowConversationModal(e, recipientId)}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              minWidth: '0',
            }}
            key={`${recipientId}-${index}`}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1,
                marginRight: '10px',
              }}
            >
              <Picture
                isIntro={false}
                uid=""
                primaryUse={currentUserType}
                url={conversation.recipientAvatarUrl}
                size={30}
                width={30}
                height={30}
                disableUpload={true}
                bucketName={'avatars'}
                isAvatar={true}
                promptMessage=""
                email=""
              />
              <div style={{ marginLeft: '10px' }}>
                {conversation.recipientFirstName} {conversation.recipientLastName}
                {conversation.unreadMessages > 0 ? (
                  <Badge pill bg="primary" style={{ marginLeft: '10px' }}>
                    {conversation.unreadMessages}
                  </Badge>
                ) : null}
              </div>
            </div>
            <div
              style={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                textAlign: 'right',
              }}
            >
              {conversation.latestMessage.messageContent}
            </div>
          </div>
          {showConversationModalStates[recipientId] && (
            <Modal
              show={showConversationModalStates[recipientId]}
              onHide={() =>
                setShowConversationModalStates((previousState) => ({
                  ...previousState,
                  [recipientId]: false,
                }))
              }
            >
              <Modal.Header>
                <Modal.Title>
                  your convesation with{' '}
                  {conversation &&
                    `${conversation.recipientFirstName} ${conversation.recipientLastName}`}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <MessageSender
                  recipientFirstName={conversation.recipientFirstName}
                  recipientLastName={conversation.recipientLastName}
                  recipientUserId={recipientId}
                  senderFirstName={userFirstName}
                  senderLastName={userLastName}
                />
                <div className="chat-container">
                  {recipientId === selectedConversationId &&
                    conversation.pastMessages.map((pastMessage, index) => (
                      <div
                        key={`${recipientId}-${index}`}
                        className={pastMessage.isSender ? 'sender-message' : 'recipient-message'}
                      >
                        <div className="message-content">{pastMessage.messageContent}</div>
                        <div className="message-sent-at">{pastMessage.sentAt}</div>
                      </div>
                    ))}
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={(e) => handleHideConversationModal(e, recipientId)}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          )}
        </NavDropdown.Item>
      ))}
    </NavDropdown>
  )
}
