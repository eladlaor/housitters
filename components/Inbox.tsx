import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Container, Row, Col } from 'react-bootstrap'
import { selectIsLoggedState, selectPrimaryUseState } from '../slices/userSlice'
import { USER_TYPE } from '../utils/constants'
import {
  Conversation,
  selectConversationsState,
  selectTotalUnreadMessagesState,
  setConversationsState,
  setTotalUnreadMessagesState,
} from '../slices/inboxSlice'
import Picture from './Picture'

export default function Inbox() {
  const user = useUser()
  const supabaseClient = useSupabaseClient()

  const dispatch = useDispatch()

  const currentUserType = useSelector(selectPrimaryUseState)

  const totalUnreadMessages = useSelector(selectTotalUnreadMessagesState)
  const conversations = useSelector(selectConversationsState)

  const isLogged = useSelector(selectIsLoggedState)

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
              isSender: keyNameOfRecipientId.startsWith(currentUserType),
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
  }, [user, currentUserType])

  return (
    <div>
      <br />
      <br />
      <br />
      <br />
      <Container fluid className="inbox">
        <Row>Unread messages: {totalUnreadMessages}</Row>
        <hr />

        {Object.values(conversations).map((conversation, index) => (
          <Row key={index}>
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
            <Col className="chat-container" md={8}>
              {conversation.pastMessages.map((pastMessage, index) => (
                <div
                  key={index}
                  className={pastMessage.isSender ? 'sender-message' : 'recipient-message'}
                >
                  <div className="message-content">{pastMessage.messageContent}</div>
                  <div className="message-sent-at">{pastMessage.sentAt}</div>
                </div>
              ))}
            </Col>
            <hr />
          </Row>
        ))}
      </Container>
      <br />
      <br />
      <br />
      <br />
    </div>
  )
}
