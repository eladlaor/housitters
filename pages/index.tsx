import type { NextPage } from 'next'
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { useSession, useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import Account from '../components/Account'
import Footer from '../components/Footer'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { HOUSEOWNERS_ROUTES, HOUSITTERS_ROUTES, USER_TYPE } from '../utils/constants'
const Home: NextPage = () => {
  const router = useRouter()
  const session = useSession()
  const supabase = useSupabaseClient()
  const user = useUser()

  useEffect(() => {
    const getWhatIWant = async () => {
      if (user) {
        // to only run once i have a real user, cause useUser runs asyncly.
        try {
          let { data, error, status } = await supabase
            .from('profiles')
            .select('first_name, primary_use')
            .eq('id', user.id)
            .single()
          if (error && status !== 406) {
            // TODO: what 406
            throw error
          }

          if (data) {
            const { first_name, primary_use } = data
            if (primary_use === USER_TYPE.Housitter) {
              router.push(`${HOUSITTERS_ROUTES.HOME}?firstName=${first_name}`)
            } else if (primary_use === USER_TYPE.HouseOwner) {
              router.push(`${HOUSEOWNERS_ROUTES}?firstName=${first_name}`)
            }
          }
        } catch (error) {
          alert('Error loading user data')
          console.log(error)
        }
      }
    }

    getWhatIWant()
  }, [user]) // TODO: once user changes (i.e, actually gets the user), then rerun useEffect.

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

          {/* <div>
            <button>
              <Link href="test/something">jumping to a page</Link>
            </button>
          </div> */}
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
