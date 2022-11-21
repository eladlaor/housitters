import type { NextPage } from 'next'
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { useSession, useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import Account from '../components/Account'
import Footer from '../components/Footer'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { HOUSEOWNERS_ROUTES, HOUSITTERS_ROUTES, USER_TYPE } from '../utils/constants'
import HousitterAccount from './housitters/HousitterAccount'


const Home: NextPage = () => {
  const router = useRouter()
  const session = useSession()
  const supabase = useSupabaseClient()
  const user = useUser()

  /*

todo:

read and do tutorial of redux.
because the problem is: sharing state between different pages.
  it simply saves some db calls, and saves the data on the browser's local storage.
  what you indeed would NOT want to do?
    to pass a lot of data as props (not scalable)
    to pass a lot of data as query params (not secure, not scalabe, bad)
  you would want to use redux to "remember" the data about the user.

useEffect - you can do as many as you want.
the good practice is only to use for external api calls, like for the database.

create a separate page for login, make it easier to redirect there.

you can use router.push.



*/

  // it's just that we have some race condition here between the two useEffects so we negated user in both.
  useEffect(() => {
    // TODO: this would be a bad practice.
    if (!user) {
      router.push('test/something')
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      return
    }
    const goToPersonalizedHomePageIfLoggedIn = async () => {
      // to only run once i have a real user, cause useUser runs asyncly.
      try {
        let { data, error, status } = await supabase
          .from('profiles')
          .select('first_name, primary_use')
          .eq('id', user?.id)
          .single()
        if (error && status !== 406) {
          throw error
        }

        if (data) {
          const { first_name, primary_use } = data
          if (primary_use === USER_TYPE.Housitter) {
            router.push(
              `${HOUSITTERS_ROUTES.HOME}?firstName=${first_name}&session=${JSON.stringify(
                session
              )}&user=${JSON.stringify(user)}
                `
            )
            // return <HousitterAccount session={session} firstName={first_name} />
          } else if (primary_use === USER_TYPE.HouseOwner) {
            router.push(
              `${HOUSEOWNERS_ROUTES}?firstName=${first_name}&session=${JSON.stringify(session)}`
            )
          }
        }
      } catch (error) {
        alert('Error loading user data')
        console.log(error)
      }
    }

    goToPersonalizedHomePageIfLoggedIn()
  }, [user, session]) // TODO: once user changes (i.e, actually gets the user), then rerun useEffect.

  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      {!session ? (
        <div className="row">
          <div className="col-6">
            <h1 className="header">The best housitting website ever!</h1>
            <p>Coming Soon :)</p>
          </div>
          <div className="col-6 auth-widget">
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme="dark" />
          </div>

          <div>
            <button>
              <Link href="test/something">jumping to a page</Link>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* <h3>Account</h3>
          <Account session={session} /> */}
        </>
      )}

      <Footer />
    </div>
  )
}

export default Home
