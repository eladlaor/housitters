import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { handleError } from '../utils/helpers'
import axios from 'axios'
import { API_ROUTES } from '../utils/constants'

export default function Footer() {
  const [showContactModal, setShowContactModal] = useState(false)
  const supabaseClient = useSupabaseClient()
  const user = useUser()

  const [messageContent, setMessageContent] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!user) {
      return
    }

    const getData = async () => {
      const { error, data } = await supabaseClient
        .from('profiles')
        .select(`email, first_name, last_name`)
        .eq('id', user.id)
        .single()
      if (error) {
        return handleError(error.message, 'footer.getData')
      }

      if (data) {
        setFirstName(data.first_name)
        setLastName(data.last_name)
        setEmail(data.email)
      }
    }

    getData()
  }, [user])

  const sendFeedbackEmail = async () => {
    debugger
    const request = {
      recipientEmail: 'eladlaor88@gmail.com',
      senderFirstName: firstName,
      senderLastName: lastName,
      message: messageContent,
      senderEmail: email,
    }

    const response = await axios.post(API_ROUTES.SEND_EMAILS, request)
    if (response.status !== 200) {
      alert(
        `error when trying to send email. Status: ${response.status}. Message: ${response.data?.error}`
      )
      debugger
    } else {
      alert('success')
      setShowContactModal(false)
    }
  }

  return (
    <div className="footer text-center text-sm">
      <div>
        This is a work in progress, we'd appreciate your feedback. {'  '}
        <strong
          onClick={() => setShowContactModal(true)}
          style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Contact us.
        </strong>
      </div>
      <Modal show={showContactModal} onHide={() => setShowContactModal(false)}>
        <Modal.Header className="d-flex justify-content-between" closeButton>
          <div className="flex-grow-1 text-center mt-1 mb-0">
            <h3>Let's be in touch</h3>
          </div>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                }}
              ></Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label className="mt-3">Last Name</Form.Label>
              <Form.Control
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value)
                }}
              ></Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label className="mt-3">Email</Form.Label>
              <Form.Control
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                }}
              ></Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label className="mt-3">Message</Form.Label>
              <Form.Control
                as="textarea"
                size="sm"
                rows={5}
                value={messageContent}
                onChange={(e) => {
                  setMessageContent(e.target.value)
                }}
              ></Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-start">
          <Button onClick={sendFeedbackEmail}>Send</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
