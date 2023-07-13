import { useUser, useSessionContext } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { UserType, PageRoutes } from '../../utils/constants'
import { useDispatch } from 'react-redux'
import Image from 'next/image'

import {
  setIsLoggedState,
  setFirstName,
  setPrimaryUse,
  setGenderState,
  setAvatarUrl,
  setIsOngoingOAuthState,
} from '../../slices/userSlice'

import logo from '../../public/images/logoRegularSize.jpg'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { FaGoogle } from 'react-icons/fa'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import PasswordInput from '../../components/Auth/PasswordInput'

export default function LoginPage() {
  const { error, supabaseClient } = useSessionContext()
  const user = useUser()
  console.log(`user in Login exists? ${user ? 'yes' : 'no'}`)

  const router = useRouter()
  const dispatch = useDispatch()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // const [loadingDots, setLoadingDots] = useState('')
  // const [isLoading, setIsLoading] = useState(false)

  // for the sole purpose of the loadingDots state change
  // useEffect(() => {
  //   console.log('first use effect of login')
  //   const interval = setInterval(() => {
  //     if (isLoading) {
  //       setLoadingDots((previousState) => (previousState === '...' ? '' : previousState + '.'))
  //     }
  //   }, 500)

  //   return () => {
  //     clearInterval(interval)
  //   }
  // }, [isLoading])

  useEffect(() => {
    console.log('second use effect of login')

    if (!user) {
      return
    }

    if (error) {
      alert(`login error: ${error.message}`)
      debugger
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
          if (primary_use === UserType.Housitter) {
            router.push(`${PageRoutes.HousitterRoutes.Home}`)
          } else if (primary_use === UserType.Landlord) {
            router.push(`${PageRoutes.LandlordRoutes.Home}`)
          }
        }
      } catch (e) {
        alert(`error during login: ${e}`)
        debugger
        return
      }
    }

    loadUserData(user.id)
  }, [user])

  async function handleEmailLogin(e: any) {
    e.preventDefault()
    // setIsLoading(true)

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

  async function handleResetPassword() {
    router.push(PageRoutes.Auth.ForgotMyPassword)
  }

  async function handleGoogleOAuthLogin(e: any) {
    dispatch(setIsOngoingOAuthState(true))
    supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      // TODO: configure in google cloud
      // options: {
      //   redirectTo: 'http://localhost:3000/auth/Login',
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
        <Button variant="danger" size="sm" onClick={handleResetPassword} className="mt-3 w-100">
          forgot my password
        </Button>
      </div>
    </div>
  ) : (
    <div className="d-flex flex-column vh-100 justify-content-center align-items-center">
      {/* <h5>Loading{loadingDots}</h5> */}
      <Image src={logo} width="150" height="150" className="rotate" />
    </div>
  )
}
