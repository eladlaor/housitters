import { useUser, useSessionContext } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { USER_TYPE, PageRoutes } from '../utils/constants'
import { useDispatch, useSelector } from 'react-redux'
import {
  setIsLoggedState,
  setFirstName,
  setPrimaryUse,
  setGenderState,
  setAvatarUrl,
} from '../slices/userSlice'
import { Button, Form } from 'react-bootstrap'
import { FaGoogle } from 'react-icons/fa'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

export default function LoginPage() {
  const { error, supabaseClient } = useSessionContext()
  const user = useUser()
  const router = useRouter()
  const dispatch = useDispatch()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (!user) {
      return
    }

    if (error) {
      alert(`login error: ${error.message}`)
      return
    }

    async function loadUserData(userId: string) {
      try {
        let { data, error, status } = await supabaseClient
          .from('profiles')
          .select('first_name, primary_use, gender, avatar_url')
          .eq('id', userId)
          .single()

        // TODO: HyperText Transfer Protocol (HTTP) 406 Not Acceptable client error response code indicates that the server cannot produce a response matching the list of acceptable values defined in the request's proactive content negotiation headers, and that the server is unwilling to supply a default representatio
        // why 406
        if (error && status !== 406) {
          throw error
        }

        if (data) {
          const { first_name, primary_use, gender, avatar_url } = data

          dispatch(setIsLoggedState(true))
          dispatch(setFirstName(first_name))
          dispatch(setPrimaryUse(primary_use))
          dispatch(setGenderState(gender))
          dispatch(setAvatarUrl(avatar_url))

          // TODO: shouldnt route in a loadUserData func.
          if (primary_use === USER_TYPE.Housitter) {
            router.push(`${PageRoutes.HousitterRoutes.Home}`)
          } else if (primary_use === USER_TYPE.Landlord) {
            router.push(`${PageRoutes.LandlordRoutes.Home}`)
          }
        }
      } catch (e) {
        console.log('error: ', e)
        // TODO: should throw errors better
        throw e
      }
    }

    if (user) {
      loadUserData(user.id)
    }
  }, [user])

  async function handleEmailLogin(e: any) {
    e.preventDefault()

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.includes('invalid login credentials')) {
        alert(
          `${error.message}. A password recovery mecahnism will be added soon. In the meantime, try logging in via Google here above.`
        )
      } else {
        alert(`login error: ${error.message}`)
      }
    }
  }

  async function handleGoogleOAuthLogin(e: any) {
    supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      // TODO: configure in google cloud
      // options: {
      //   redirectTo: 'http://localhost:3000/Login',
      // },
    })
  }

  return !user ? (
    <div
      className="container d-flex flex-column justify-content-center align-items-center"
      style={{ height: '100vh' }}
    >
      <Form>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formBasicPassword" className="mt-2">
          <Form.Label>Password</Form.Label>
          <div className="input-group">
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              variant="info"
              type="button"
              className="password-toggle-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FontAwesomeIcon icon={faEyeSlash} />
              ) : (
                <FontAwesomeIcon icon={faEye} />
              )}
            </Button>
          </div>
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
    </div>
  ) : (
    <div>
      <p>loading dashboard</p>
    </div>
  )
}
