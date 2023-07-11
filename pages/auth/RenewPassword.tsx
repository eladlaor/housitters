import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap'
import PasswordInput from '../../components/Auth/PasswordInput'
import { useRouter } from 'next/router'
import { PageRoutes } from '../../utils/constants'

export default function RenewPassword() {
  const [password, setPassword] = useState('')
  const [retypedPassword, setRetypedPassword] = useState('')
  const [message, setMessage] = useState('')
  const supabaseClient = useSupabaseClient()
  const router = useRouter()

  const handleSubmit = async (event: any) => {
    event.preventDefault()

    if (password !== retypedPassword) {
      setMessage("Passwords don't match")
      return
    }

    const { error } = await supabaseClient.auth.updateUser({ password })

    if (error) {
      setMessage(`Error updating password: ${error.message}`)
    } else {
      setMessage('Password updated successfully!')
      setTimeout(() => {
        router.push(PageRoutes.Auth.Login)
      }, 1000)
    }
  }

  return (
    <Container className="d-flex align-items-center justify-content-center vh-100">
      <Row>
        <Col>
          <Form onSubmit={handleSubmit} className="text-center">
            <Form.Group controlId="formBasicPassword">
              <Form.Label>new password</Form.Label>

              <PasswordInput password={password} setPassword={setPassword} />
            </Form.Group>
            <Form.Group controlId="formBasicRetypedPassword">
              <Form.Label className="mt-4">retype</Form.Label>
              <PasswordInput password={retypedPassword} setPassword={setRetypedPassword} />
            </Form.Group>
            <Form.Group className="d-flex justify-content-center">
              <Button variant="primary" type="submit" className="mt-3">
                Submit
              </Button>
            </Form.Group>
          </Form>
          {message && (
            <Alert
              variant={message.startsWith('Error') ? 'danger' : 'success'}
              className="mt-3 text-center"
            >
              {message}
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  )
}
