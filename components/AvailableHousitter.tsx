import { Button, Form, Modal } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import { HousitterProps } from '../types/clientSide'
import PictureBetter from './PictureBetter'
import { API_ROUTES, EMAIL_FORM_FIELDS, USER_TYPE } from '../utils/constants'
import axios from 'axios'
import { useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function AvailableHousitter({ props }: { props: HousitterProps }) {
  const [showEmailModal, setShowEmailModal] = useState(false)
  const supabaseClient = useSupabaseClient()

  const [emailForm, setEmailForm] = useState({
    [EMAIL_FORM_FIELDS.TITLE]: '',
    [EMAIL_FORM_FIELDS.MESSAGE]: '',
    [EMAIL_FORM_FIELDS.RECIPIENT_EMAIL]: '',
  })

  function setEmailFormField(field: string, value: string) {
    setEmailForm({
      ...emailForm,
      [field]: value,
    })
  }

  async function handleSendEmail(e: any) {
    e.preventDefault()
    setShowEmailModal(false)

    // in supabase database, I created a function which triggers after every new user signup, which creates a queryable public.users view
    // trigger name: on_new_user_created | function name: create_public_users_view
    const { error, data } = await supabaseClient
      .from('users')
      .select(`email`)
      .eq('id', props.housitterId)
      .single()

    if (error) {
      alert(`error trying to get housitter email: ${error.message}`)
      debugger
      throw error
    }

    if (!data || !data.email) {
      alert(`no email found for housitter id: ${props.housitterId}`)
      debugger
      throw new Error(`no email found for housitter id: ${props.housitterId}`)
    }

    const response = await axios.post(API_ROUTES.SEND_EMAILS, {
      [EMAIL_FORM_FIELDS.TITLE]: emailForm[EMAIL_FORM_FIELDS.TITLE],
      [EMAIL_FORM_FIELDS.MESSAGE]: emailForm[EMAIL_FORM_FIELDS.MESSAGE],
      recipientEmail: data.email,
    })

    if (response.status === 200) {
      debugger
      console.log(response.data.message)
    } else {
      alert(
        `error when trying to send email. Status: ${response.status}. Message: ${response.data?.error}`
      )
      debugger
    }
  }

  function handleCloseEmailModal() {
    setShowEmailModal(false)
  }

  function handleOpenEmailModal() {
    setShowEmailModal(true)
  }

  return (
    <div>
      <Card bg="success" style={{ width: '18rem' }}>
        <Card.Body>
          <PictureBetter
            uid={props.housitterId}
            email="" // basically should use housitter email but it doesnt matter here as the filename is alreay saved
            url={props.avatarUrl}
            isIntro={false}
            primaryUse={USER_TYPE.Housitter}
            size={100}
            width={100} // should persist dimensions of image upon upload
            height={100}
            disableUpload={true}
            bucketName="avatars"
            isAvatar={true}
            promptMessage=""
          />
          <Card.Title>
            {props.firstName} {props.lastName}
          </Card.Title>
          <Card.Text>{props.about_me}</Card.Text>
          <Button variant="secondary" onClick={handleOpenEmailModal}>
            Send Email
          </Button>
          <Modal show={showEmailModal} onHide={handleCloseEmailModal}>
            <Modal.Header closeButton>
              <Modal.Title>Send Email</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="title">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder=""
                    value={emailForm[EMAIL_FORM_FIELDS.TITLE]}
                    onChange={(e) => {
                      setEmailFormField(EMAIL_FORM_FIELDS.TITLE, e.target.value)
                    }}
                  />
                </Form.Group>
                <Form.Group controlId={EMAIL_FORM_FIELDS.MESSAGE}>
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder=""
                    value={emailForm[EMAIL_FORM_FIELDS.MESSAGE]}
                    onChange={(e) => {
                      setEmailFormField(EMAIL_FORM_FIELDS.MESSAGE, e.target.value)
                    }}
                  />
                </Form.Group>
                <Button variant="success" type="submit" onClick={handleSendEmail}>
                  Send the email
                </Button>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={handleCloseEmailModal}>Close</Button>
            </Modal.Footer>
          </Modal>
        </Card.Body>
      </Card>
    </div>
  )
}
