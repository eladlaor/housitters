import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useUser, useSessionContext } from '@supabase/auth-helpers-react'
import { useEffect } from 'react'
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

export default function LoginPage() {
  const { error, supabaseClient } = useSessionContext()
  const user = useUser()
  const router = useRouter()
  const dispatch = useDispatch()

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

  // TODO: should get rid of this Auth component and make a better sign in.

  if (!user) {
    return (
      <div
        className="container d-flex flex-column justify-content-center align-items-center"
        style={{ height: '100vh' }}
      >
        <Auth
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'red',
                  inputBackground: 'white',
                  inputText: 'black',
                  defaultButtonBackground: 'white',
                  anchorTextColor: 'pink',
                  anchorTextHoverColor: 'blue',
                },
              },
            },
          }}
          theme="default"
          supabaseClient={supabaseClient}
          providers={['google']}
          socialLayout="horizontal"
        />
      </div>
    )
  }

  return (
    <>
      <p>loading dashboard</p>
    </>
  )
}
