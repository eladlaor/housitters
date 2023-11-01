import { useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Form, Button, Alert, Spinner } from 'react-bootstrap'
import { RedirectUrls } from '../../utils/constants'
import { useTranslation } from 'react-i18next'

export default function ForgotMyPassword() {
  const supabaseClient = useSupabaseClient()
  const { t } = useTranslation()

  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailChange = (event: any) => {
    setEmail(event.target.value)
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault()
    setIsLoading(true)

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: RedirectUrls.RenewPassword,
    })

    setIsLoading(false)

    if (error) {
      setError(`Error sending password reset email: ${error.message}`)
      setMessage('')
    } else {
      setMessage('Password reset email sent successfully!')
      setError('')
    }
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100">
      <Form onSubmit={handleSubmit} className="w-25 mb-3">
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>{t('signup.email')}</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={handleEmailChange}
            required
          />
          <Form.Text className="text-muted">
            {t('forgotPassword.part1')} <br />
            {t('forgotPassword.part2')} <br />
            {t('forgotPassword.part3')}
          </Form.Text>
        </Form.Group>

        <div className="d-flex justify-content-center">
          <Button variant="primary" type="submit">
            {t('forgotPassword.send')}
          </Button>
        </div>
      </Form>

      {isLoading && <Spinner animation="border" role="status" />}
      {message && !isLoading && <Alert variant="success">{message}</Alert>}
      {error && !isLoading && <Alert variant="danger">{error}</Alert>}
    </div>
  )
}
