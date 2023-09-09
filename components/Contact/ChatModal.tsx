import { useSelector } from 'react-redux'
import MessageSender from './MessageSender'
import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react'
import Modal from 'react-bootstrap/Modal'
import { selectPrimaryUseState } from '../../slices/userSlice'
import { MessageType } from 'react-chat-elements'

export default function ChatModal({ recipientId, update }: { recipientId: string; update: any }) {
  const { session } = useSessionContext() // why preferred using session and not user?
  const supabaseClient = useSupabaseClient()
  const currentUserType = useSelector(selectPrimaryUseState)

  const [userFirstName, setUserFirstName] = useState('')
  const [userLastName, setUserLastName] = useState('')
  const [recipientFirstName, setRecipientFirstName] = useState('')
  const [recipientLastName, setRecipientLastName] = useState('')
  const [conversation, setConversation] = useState<Array<any>>([])

  const handleClose = () => update(0)

  const getMessages = async () => {
    const { error, data } = await supabaseClient
      .from('messages')
      .select(`id, created_at, message_content, sent_by`)
      .in('landlord_id', [recipientId, session?.user.id])
      .in('housitter_id', [recipientId, session?.user.id])
      .order('created_at', { ascending: false })

    if (error) {
      console.log(`error in getMessages. Error: ${error}`)
      debugger
      return
    }

    if (data) {
      setConversation(data)
    }
  }

  useEffect(() => {
    if (recipientId) {
      const setNames = async () => {
        const { error, data } = await supabaseClient
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', session?.user.id)
          .single()

        if (error) {
          console.log(`error in getMessages. Error: ${error}`)
          debugger
          return
        }

        if (data) {
          setUserFirstName(data?.first_name)
          setUserLastName(data?.last_name)
        }

        const { error: recipientError, data: recipientData } = await supabaseClient
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', recipientId)
          .single()

        if (error) {
          console.log(`error in getMessages. Error: ${error}`)
          debugger
          return
        }

        if (data) {
          setRecipientFirstName(data?.first_name)
          setRecipientLastName(data?.last_name)
        }
      }

      const updateRead = async () => {
        await supabaseClient
          .from('messages')
          .update({ is_read_by_recipient: true })
          .in('landlord_id', [recipientId, session?.user.id])
          .in('housitter_id', [recipientId, session?.user.id])
          .neq('sent_by', currentUserType)
      }

      setNames()
      getMessages()
      updateRead()
    }
  }, [recipientId])

  return (
    <Modal show={!!recipientId} onHide={handleClose}>
      <Modal.Header>
        <Modal.Title>
          Chat with {recipientFirstName} {recipientLastName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <MessageSender
          recipientFirstName={recipientFirstName}
          recipientLastName={recipientLastName}
          recipientUserId={recipientId}
          senderFirstName={userFirstName}
          senderLastName={userLastName}
          isChat={true}
          onUpdate={getMessages}
        />
        <div className="chat-container">
          {conversation.map((message, i) => (
            <div
              key={`${recipientId}-${i}`}
              className={
                message.sent_by === currentUserType ? 'sender-message' : 'recipient-message'
              }
            >
              <div className="message-content">{message.message_content}</div>
              <div className="message-sent-at">
                {new Date(message.created_at).toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </div>
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
