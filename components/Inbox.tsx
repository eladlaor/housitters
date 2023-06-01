import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Container, Row, Col } from 'react-bootstrap'
import { selectPrimaryUseState } from '../slices/userSlice'
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

  const primaryUse = useSelector(selectPrimaryUseState)

  const totalUnreadMessages = useSelector(selectTotalUnreadMessagesState)
  const conversations = useSelector(selectConversationsState)

  useEffect(() => {
    if (!user) {
      console.log('running useEffect of inbox: no user')
      return
    }

    console.log('running useEffect of inbox')

    async function loadInboxData() {
      if (primaryUse === USER_TYPE.Landlord) {
        const { error, data: messagesData } = await supabaseClient
          .from('messages')
          .select(`created_at, message_content, housitter_id, title, is_read_by_recipient`)
          .eq('landlord_id', user?.id)

        if (error) {
          alert(`error loading inbox data: ${error.message}`)
          debugger
          throw error
        }

        // a separate call because cant inner join becaue: error loading inbox data: Could not embed because more than one relationship was found for 'messages' and 'profiles'

        if (messagesData.length > 0) {
          console.log(`messagesData lenght: ${messagesData.length}`)

          let totalUnreadMessages = 0

          let modifiedConversations = {} as any

          for (const message of messagesData) {
            // adding a new converstaion key if needed
            if (!modifiedConversations[message.housitter_id]) {
              modifiedConversations[message.housitter_id] = {
                unreadMessages: 0,
                pastMessages: [] as unknown as Conversation['pastMessages'],
              } as Partial<Conversation>
            }

            if (!message.is_read_by_recipient) {
              modifiedConversations[message.housitter_id].unreadMessages =
                modifiedConversations[message.housitter_id].unreadMessages + 1

              totalUnreadMessages = totalUnreadMessages + 1
            }

            // adding a new message to the pastMessages array of an existing conversation object
            modifiedConversations[message.housitter_id].pastMessages = [
              ...modifiedConversations[message.housitter_id].pastMessages,
              {
                sentAt: message.created_at,
                messageContent: message.message_content,
              } as unknown as Conversation['pastMessages'],
            ]
          }

          const recipientIds = Object.keys(modifiedConversations)

          for (const recipientId of recipientIds) {
            const { error: recipientProfileError, data: recipientProfileData } =
              await supabaseClient
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
              modifiedConversations[recipientId].recipientFirstName =
                recipientProfileData.first_name
              modifiedConversations[recipientId].recipientLastName = recipientProfileData.last_name
              modifiedConversations[recipientId].recipientAvatarUrl =
                recipientProfileData.avatar_url
            }
          }

          dispatch(setTotalUnreadMessagesState(totalUnreadMessages))
          dispatch(setConversationsState(modifiedConversations))
        }
      }
    }

    loadInboxData()

    // sortMessagesByConvesation() including getting last messages
  }, [user])

  return (
    <div>
      <br />
      <br />
      <br />
      <br />
      <Container fluid className="inbox">
        <Row>Unread messages: {totalUnreadMessages}</Row>
        <hr />
        <Row>
          <Col className="inbox-column" md={4}>
            <>
              <>
                {Object.values(conversations).map((conversation, index) => (
                  <div key={index}>
                    {conversation.recipientFirstName} {conversation.recipientLastName}
                    <Picture
                      isIntro={false}
                      uid="" // not needed
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
                    <hr />
                  </div>
                ))}
              </>
            </>
          </Col>
          <Col className="inbox-column" md={8}>
            Selected Conversation/Messages
          </Col>
        </Row>
      </Container>
      <br />
      <br />
      <br />
      <br />
    </div>
  )
}
