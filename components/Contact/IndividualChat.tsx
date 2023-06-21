import { Button, Modal } from 'react-bootstrap'
import MessageSender from './MessageSender'
import { Conversation } from '../../types/clientSide'
import { useEffect, useState } from 'react'

export default function IndividualChat({
  userFirstName,
  userLastName,
  conversation,
  recipientId,
  selectedConversationId,
  showConversationModal,
  setShowConversationModalStatesFromInbox,
  setShowConversationModalFromFoundUser,
  handleHideConversationModalFromInbox,
  handleHideConversationModalFromFoundUser,
}: {
  userFirstName: string
  userLastName: string
  conversation: Conversation
  recipientId: string
  selectedConversationId: string
  showConversationModal: Record<string, boolean> | boolean
  setShowConversationModalStatesFromInbox: Function | null
  setShowConversationModalFromFoundUser: Function | null
  handleHideConversationModalFromInbox: Function | null
  handleHideConversationModalFromFoundUser: Function | null
}) {
  function handleHideConversationModal(e: any, recipientId: string | null) {
    if (setShowConversationModalFromFoundUser) {
      setShowConversationModalFromFoundUser(false)
    } else {
      handleHideConversationModalFromInbox && handleHideConversationModalFromInbox(e, recipientId)
    }
  }

  return (
    <Modal
      show={
        typeof showConversationModal === 'boolean'
          ? showConversationModal
          : showConversationModal[recipientId]
      }
      //   onHide={handleHideConversationModal}
    >
      <Modal.Header>
        <Modal.Title>
          your convesation with{' '}
          {conversation && `${conversation.recipientFirstName} ${conversation.recipientLastName}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <MessageSender
          recipientFirstName={conversation.recipientFirstName}
          recipientLastName={conversation.recipientLastName}
          recipientUserId={recipientId}
          senderFirstName={userFirstName}
          senderLastName={userLastName}
          isChat={true}
        />
        <div className="chat-container">
          {recipientId === selectedConversationId &&
            conversation.pastMessages?.map((pastMessage, index) => (
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
        <Button variant="secondary" onClick={(e) => handleHideConversationModal(e, recipientId)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
