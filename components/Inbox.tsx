import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Container, Row, Col } from 'react-bootstrap'

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
import { propTypes } from 'react-bootstrap/esm/Image'

export default function Inbox() {
  const user = useUser()
  const supabaseClient = useSupabaseClient()

  const dispatch = useDispatch()

  const currentUserType = useSelector(selectPrimaryUseState)
  const isLogged = useSelector(selectIsLoggedState)
  const usersContacted = useSelector(selectUsersContactedState)
  const totalUnreadMessages = useSelector(selectTotalUnreadMessagesState)
  const conversations = useSelector(selectConversationsState)
  const [selectedConversationId, setSelectedConversationId] = useState('')

  const userFirstName = useSelector(selectFirstNameState)
  const userLastName = useSelector(selectLastNameState)

  useEffect(() => {
    if (!user || !isLogged) {
      console.log('running useEffect of inbox: no user')
      return
    }

    console.log('running useEffect of inbox')

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
        console.log(`messagesData lenght: ${messagesData.length}`)

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
              latestMessage: message, // due to the order {ascending: false} clause in the db query
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

  return (
    <div>
      <br />
      <br />
      <br />
      <br />
      <Container fluid className="inbox">
        <Col md={4}>
          {Object.entries(conversations).map(([id, conversation], index: number) => (
            <Row
              key={index}
              onClick={() => setSelectedConversationId(id)}
              className={selectedConversationId === id ? 'selected-conversation' : ''}
            >
              <Col className="inbox-column" md={4}>
                <div key={index}>
                  {conversation.recipientFirstName} {conversation.recipientLastName}
                  <Picture
                    isIntro={false}
                    uid="" // currently not needed. if needed: {Object.keys(conversations)[index]}
                    primaryUse={USER_TYPE.Housitter}
                    url={conversation.recipientAvatarUrl}
                    size={50}
                    width={50} // should persist dimensions of image upon upload
                    height={50}
                    disableUpload={true}
                    bucketName="avatars"
                    isAvatar={true}
                    promptMessage=""
                    email=""
                  />
                </div>
              </Col>
            </Row>
          ))}
        </Col>

        <Col md={8}>
          {Object.entries(conversations).map(
            ([id, conversation], index) =>
              selectedConversationId &&
              selectedConversationId === id && (
                <Row className="chat-container">
                  {conversation.pastMessages.map((pastMessage, index) => (
                    <div
                      key={index}
                      className={pastMessage.isSender ? 'sender-message' : 'recipient-message'}
                    >
                      <div className="message-content">{pastMessage.messageContent}</div>
                      <div className="message-sent-at">{pastMessage.sentAt}</div>
                    </div>
                  ))}
                  {selectedConversationId && (
                    <MessageSender
                      recipientFirstName={conversation.recipientFirstName}
                      recipientLastName={conversation.recipientLastName}
                      recipientUserId={id}
                      senderFirstName={userFirstName}
                      senderLastName={userLastName}
                    />
                  )}
                  <hr />
                </Row>
              )
          )}
        </Col>
      </Container>
      <br />
      <br />
      <br />
      <br />
    </div>
  )
}
