import { useUser, useSessionContext } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { PageRoutes, UserType } from '../../utils/constants'
import { useDispatch } from 'react-redux'

import { setAvatarUrl } from '../../slices/userSlice'

import { Form, Button, Modal } from 'react-bootstrap'
import PasswordInput from '../../components/Auth/PasswordInput'
import { useTranslation } from 'react-i18next'

export default function LoginPage() {
  const { isLoading, supabaseClient } = useSessionContext()
  const user = useUser()
  const userId = user?.id
  const { t } = useTranslation()

  const router = useRouter()
  const dispatch = useDispatch()
  const [showLoginErrorModal, setShowLoginErrorModal] = useState(false)
  const [loginErrorMessage, setLoginErrorMessage] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (!isLoading && userId) {
      const asyncWrapper = async () => {
        const { data, error } = await supabaseClient
          .from('profiles')
          .select(`avatar_url, primary_use`)
          .eq('id', userId)
          .single()
        if (error) {
          throw error
        }
        if (data) {
          dispatch(setAvatarUrl(data.avatar_url))
          router.push(
            `${
              data.primary_use === UserType.Housitter
                ? PageRoutes.HousitterRoutes.Home
                : PageRoutes.LandlordRoutes.Home
            }`
          )
        }
      }

      asyncWrapper()
    }
  }, [userId, isLoading])

  async function handleEmailLogin(e: any) {
    e.preventDefault()

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoginErrorMessage(error.message)
      setShowLoginErrorModal(true)
    } else {
      router.push('/')
    }
  }

  async function handleResetPassword() {
    router.push(PageRoutes.Auth.ForgotMyPassword)
  }

  const handleCloseLoginErrorModal = () => {
    setShowLoginErrorModal(false)
  }

  function renderLoginErrorHandler() {
    return (
      <>
        <Button variant="success" onClick={handleCloseLoginErrorModal}>
          {t('login.typos')}
        </Button>
        <Button variant="primary" onClick={() => router.push(PageRoutes.Auth.Signup)}>
          {t('login.signup')}
        </Button>
        <Button variant="danger" onClick={() => router.push(PageRoutes.Auth.ForgotMyPassword)}>
          {t('login.forgotPassword')}
        </Button>
      </>
    )
  }

  return !user ? (
    <>
      <div
        className="container d-flex flex-column justify-content-center align-items-center"
        style={{ height: '100vh', marginTop: '-10rem' }}
      >
        <img src="/logo.svg" style={{ marginBottom: '3rem', maxHeight: '28px' }} />
        <Form>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>{t('signup.email')}</Form.Label>
            <Form.Control
              autoFocus
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formBasicPassword" className="mt-2">
            <Form.Label> {t('login.password')}</Form.Label>
            <PasswordInput password={password} setPassword={setPassword} />
          </Form.Group>
          <Form.Group className="mt-3 d-flex justify-content-center align-items-center">
            <Button
              variant="primary"
              type="submit"
              style={{ width: '300px' }}
              onClick={(e) => handleEmailLogin(e)}
            >
              {t('login.login')}
            </Button>
          </Form.Group>
        </Form>

        <div>
          <Button variant="link" size="sm" onClick={handleResetPassword} className="mt-3 w-100">
            {t('login.forgotPassword')}
          </Button>
        </div>
      </div>
      <Modal show={showLoginErrorModal} onHide={handleCloseLoginErrorModal}>
        <Modal.Header>
          <Modal.Title className="text-center w-100">{t('login.loginError')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex justify-content-center">{loginErrorMessage}</Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          {renderLoginErrorHandler()}
        </Modal.Footer>
      </Modal>
    </>
  ) : (
    <></>
  )
}
