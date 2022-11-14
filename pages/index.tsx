import type { NextPage } from 'next'
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Account from '../components/Account'
import Footer from '../components/Footer'
import Link from 'next/link'

const Home: NextPage = () => {
  const session = useSession()
  const supabase = useSupabaseClient()

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
          <h3>Account</h3>
          <Account session={session} />
        </>
      )}

      <Footer />
    </div>
  )
}

export default Home
