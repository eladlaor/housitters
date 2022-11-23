import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { useUser, useSessionContext } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { Router, useRouter } from 'next/router'
import Link from 'next/link'
import { HOUSEOWNERS_ROUTES, HOUSITTERS_ROUTES, USER_TYPE } from '../utils/constants'
import { useDispatch, useSelector } from 'react-redux'
import { selectIsLoggedState, setIsLoggedState, setFirstName } from '../slices/userSlice'

const LoginPage = () => {
  const { isLoading, session, error, supabaseClient } = useSessionContext()
  const user = useUser()
  const router = useRouter()
  const dispatch = useDispatch()
  const isLoggedState = useSelector(selectIsLoggedState)

  useEffect(() => {
    if (!user) {
      return
    }

    async function loadUserData(userId: string) {
      try {
        let { data, error, status } = await supabaseClient
          .from('profiles')
          .select('first_name, primary_use')
          .eq('id', userId)
          .single()

        // TODO: check what is 406
        if (error && status !== 406) {
          throw error
        }

        if (data) {
          const { first_name, primary_use } = data

          dispatch(setIsLoggedState(true))
          dispatch(setFirstName(first_name))

          if (primary_use === USER_TYPE.Housitter) {
            router.push(`${HOUSITTERS_ROUTES.HOME}`)
          } else if (primary_use === USER_TYPE.HouseOwner) {
            router.push(`${HOUSEOWNERS_ROUTES.HOME}`)
          }
        }
      } catch (e) {
        console.log('error: ', e)
        // TODO: throw errors in a nicer way
        throw e
      }
    }

    if (user) {
      loadUserData(user.id)
    }
  }, [user])

  if (!user) {
    return (
      <div className="container" style={{ padding: '50px 0 100px 0' }}>
        <>
          <pre>{user ? user : 'user is indeed not logged in, yaani not authenticated'}</pre>
          {error && <p>{error.message}</p>}
          <div className="col-6 auth-widget">
            <Auth
              appearance={{ theme: ThemeSupa }}
              theme="dark"
              supabaseClient={supabaseClient}
              providers={['google', 'github']}
              socialLayout="horizontal"
            />
          </div>
        </>
      </div>
    )
  }
  /* Auth is just a component. it makes the user - from useUser - become authenticated,
            instead of undefined. you can check the docs in the readme file of the node modules of
            it. but you can control the behavior, by checking for defined or undefined user. I'm
            sure you can also just define a button here, if you really want, simply using the
            supabaseClient.auth.signinWith... */
  return (
    <>
      <p>login page</p>
    </>
  )
}

export default LoginPage
