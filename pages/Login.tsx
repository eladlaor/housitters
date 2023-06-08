import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useUser, useSessionContext } from '@supabase/auth-helpers-react'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { LANDLORDS_ROUTES, HOUSITTERS_ROUTES, USER_TYPE } from '../utils/constants'
import { useDispatch, useSelector } from 'react-redux'
import { setIsLoggedState, setFirstName, setPrimaryUse, setGenderState } from '../slices/userSlice'

export default function LoginPage() {
  const { error, supabaseClient } = useSessionContext()
  const user = useUser()
  const router = useRouter()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!user) {
      return
    }

    async function loadUserData(userId: string) {
      try {
        let { data, error, status } = await supabaseClient
          .from('profiles')
          .select('first_name, primary_use, gender')
          .eq('id', userId)
          .single()

        // TODO: HyperText Transfer Protocol (HTTP) 406 Not Acceptable client error response code indicates that the server cannot produce a response matching the list of acceptable values defined in the request's proactive content negotiation headers, and that the server is unwilling to supply a default representatio
        // why 406
        if (error && status !== 406) {
          throw error
        }

        if (data) {
          const { first_name, primary_use, gender } = data

          dispatch(setIsLoggedState(true))
          dispatch(setFirstName(first_name))
          dispatch(setPrimaryUse(primary_use))
          dispatch(setGenderState(gender))

          // TODO: shouldnt route in a loadUserData func.
          if (primary_use === USER_TYPE.Housitter) {
            router.push(`${HOUSITTERS_ROUTES.HOME}`)
          } else if (primary_use === USER_TYPE.Landlord) {
            router.push(`${LANDLORDS_ROUTES.HOME}`)
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
      <div className="container" style={{ padding: '50px 0 100px 0' }}>
        <>
          <p>sign in using one of the methods below:</p>
          {error && <p>{error.message}</p>}
          <div className="col-6 auth-widget">
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
              providers={['google', 'facebook', 'apple']}
              socialLayout="horizontal"
            />
          </div>
        </>
      </div>
    )
  }
  /* Auth is just a component. it makes the user - which is retrireved from useUser() - become authenticated,
            instead of undefined. you can check the docs in the readme file of the node modules of
            it. but you can control the behavior, by checking for defined or undefined user. I'm
            sure you can also just define a button here, if you really want, simply using the
            supabaseClient.auth.signinWith... */
  return (
    <>
      <p>loading dashboard</p>
    </>
  )
}
