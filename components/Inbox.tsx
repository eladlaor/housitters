import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { NavDropdown } from 'react-bootstrap'

import { USER_TYPE } from '../utils/constants'

import {
  selectFirstNameState,
  selectIsLoggedState,
  selectLastNameState,
  selectPrimaryUseState,
  selectUsersContactedState,
} from '../slices/userSlice'
import {
  selectConversationsState,
  selectTotalUnreadMessagesState,
  setConversationsState,
  setTotalUnreadMessagesState,
} from '../slices/inboxSlice'

import Picture from './Picture'
import MessageSender from './Contact/MessageSender'

import Badge from 'react-bootstrap/Badge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelopeOpenText } from '@fortawesome/free-solid-svg-icons'
import IndividualChat from './Contact/IndividualChat'
import { Conversation, Conversations } from '../types/clientSide'

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

  const keyNameOfRecipientId =
    currentUserType === USER_TYPE.Housitter
      ? `${USER_TYPE.Landlord}_id`
      : `${USER_TYPE.Housitter}_id`

  useEffect(() => {
    if (!user || !isLogged) {
      return
    }

    async function loadInboxData() {
      let messagesData: any[] = []

      if (currentUserType === USER_TYPE.Landlord) {
        const { error, data } = await supabaseClient
          .from('messages')
          .select(`id, created_at, message_content, housitter_id, is_read_by_recipient, sent_by`)
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
          .select(`id, created_at, message_content, landlord_id, is_read_by_recipient, sent_by`)
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

          const isReadByRecipient = message.is_read_by_recipient

          if (message.sent_by !== currentUserType && !isReadByRecipient) {
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
              isReadByRecipient,
              messageContent: message.message_content,
              isSender: message.sent_by === currentUserType,
              id: message.id,
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
  }, [user, currentUserType, usersContacted])

  async function handleShowConversationModal(
    e: any,
    recipientId: string,
    conversation: Conversation
  ) {
    e.stopPropagation()
    setSelectedConversationId(recipientId)
    setShowConversationModalStates((previousState) => ({
      ...previousState,
      [recipientId]: true,
    }))

    dispatch(setTotalUnreadMessagesState(totalUnreadMessages - conversation.unreadMessages))

    const updatedConversations = {
      ...conversations,
      [recipientId]: {
        ...conversations[recipientId],
        unreadMessages: 0,
      } as Conversation,
    } as Conversations

    if (conversation.pastMessages) {
      for (const message of conversation.pastMessages) {
        if (!message.isSender && !message.isReadByRecipient) {
          const { error } = await supabaseClient.from('messages').upsert({
            is_read_by_recipient: true,
            id: message.id,
          })

          if (error) {
            alert(`failed upserting read message. Error: ${error.message}`)
            debugger
            throw error
          }
        }
      }
    }

    dispatch(setConversationsState(updatedConversations))
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
          onClick={(e) => handleShowConversationModal(e, recipientId, conversation)}
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
                isRounded={false}
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
              {conversation.latestMessage?.messageContent}
            </div>
          </div>
          {showConversationModalStates[recipientId] && (
            <IndividualChat
              userFirstName={userFirstName}
              userLastName={userLastName}
              conversation={conversation}
              recipientId={recipientId}
              selectedConversationId={selectedConversationId}
              showConversationModal={recipientId === selectedConversationId}
              setShowConversationModalStatesFromInbox={setShowConversationModalStates}
              setShowConversationModalFromFoundUser={null}
              handleHideConversationModalFromInbox={handleHideConversationModal}
              handleHideConversationModalFromFoundUser={null}
            />
          )}
        </NavDropdown.Item>
      ))}
    </NavDropdown>
  )
}
