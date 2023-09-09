import { useUser, useSessionContext } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { PageRoutes } from '../../utils/constants'
import { useDispatch } from 'react-redux'
import Image from 'next/image'

import { setIsLoggedState, setAvatarUrl } from '../../slices/userSlice'

import logo from '../../public/images/logoRegularSize.jpg'
import { Form, Button, Modal } from 'react-bootstrap'
import PasswordInput from '../../components/Auth/PasswordInput'

export default function LoginPage() {
  const { error, isLoading, supabaseClient } = useSessionContext()
  const user = useUser()

  const router = useRouter()
  const dispatch = useDispatch()
  const [showLoginErrorModal, setShowLoginErrorModal] = useState(false)
  const [loginErrorMessage, setLoginErrorMessage] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (!isLoading && user) {
      const asyncWrapper = async () => {
        const { data, error } = await supabaseClient
          .from('profiles')
          .select(`avatar_url`)
          .eq('id', user.id)
          .single()
        if (error) {
          throw error
        }
        if (data) {
          dispatch(setAvatarUrl(data.avatar_url))
        }
      }

      asyncWrapper()

      router.push('/')
    }
  }, [user, isLoading])

  async function handleEmailLogin(e: any) {
    e.preventDefault()
    // setIsLoading(true)

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

  // async function handleGoogleOAuthLogin(e: any) {
  //   dispatch(setIsOngoingOAuthState(true))
  //   supabaseClient.auth.signInWithOAuth({
  //     provider: 'google',
  //     // TODO: configure in google cloud
  //     // options: {
  //     //   redirectTo: 'http://localhost:3000/auth/Login',
  //     // },
  //   })
  // }

  const handleCloseLoginErrorModal = () => {
    setShowLoginErrorModal(false)
  }

  function renderLoginErrorHandler(loginErrorMessage: string) {
    return (
      <>
        <Button variant="success" onClick={handleCloseLoginErrorModal}>
          Check Typos
        </Button>
        <Button variant="primary" onClick={() => router.push(PageRoutes.Auth.Signup)}>
          Sign Up
        </Button>
        <Button variant="danger" onClick={() => router.push(PageRoutes.Auth.ForgotMyPassword)}>
          Forgot Password
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
            <Form.Label>Email address</Form.Label>
            <Form.Control
              autoFocus
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formBasicPassword" className="mt-2">
            <Form.Label>Password</Form.Label>
            <PasswordInput password={password} setPassword={setPassword} />
          </Form.Group>
          <Form.Group className="mt-3 d-flex justify-content-center align-items-center">
            <Button
              variant="primary"
              type="submit"
              style={{ width: '300px' }}
              onClick={(e) => handleEmailLogin(e)}
            >
              Log in
            </Button>
          </Form.Group>
        </Form>
        {/* <h3 className=" mt-3 d-flex justify-content-center align-items-center">or</h3>
      <Button
        className="my-google-button mt-3 d-flex justify-content-center align-items-center"
        variant="outline-dark"
        onClick={(e) => handleGoogleOAuthLogin(e)}
      >
        <div className="space-between w-100">
          log in with Google <br />
          <FaGoogle />
        </div>
      </Button> */}
        <div>
          <Button variant="link" size="sm" onClick={handleResetPassword} className="mt-3 w-100">
            forgot my password
          </Button>
        </div>
      </div>
      <Modal show={showLoginErrorModal} onHide={handleCloseLoginErrorModal}>
        <Modal.Header>
          <Modal.Title className="text-center w-100">Login Error</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex justify-content-center">{loginErrorMessage}</Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          {renderLoginErrorHandler(loginErrorMessage)}
        </Modal.Footer>
      </Modal>
    </>
  ) : (
    <div className="d-flex flex-column vh-100 justify-content-center align-items-center">
      {/* <h5>Loading{loadingDots}</h5> */}
      <Image src={logo} width="150" height="150" className="rotate" />
    </div>
  )
}
