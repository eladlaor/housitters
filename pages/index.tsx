import type { NextPage } from 'next'
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { useSession, useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import Account from '../components/Account'
import Footer from '../components/Footer'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { HOUSEOWNERS_ROUTES, HOUSITTERS_ROUTES, USER_TYPE } from '../utils/constants'
import HousitterAccount from './housitters/HousitterAccount'
import Image from 'next/image'
import cuteDog from '../public/cuteDog.jpg'
import NewUserTeaser from '../components/Buttons/NewUserTeaser'

const Home: NextPage = () => {
  const router = useRouter()
  const user = useUser()

  /*
i can just use links with some ui lib for a button.
*/

  return (
    <>
      <div className="front-page-buttons">
        <Image src={cuteDog} alt="some-pic" layout="fill" objectFit="cover" />
        <div
          style={{
            marginRight: '30px',
          }}
        >
          <NewUserTeaser primaryUse={USER_TYPE.Housitter} />
        </div>
        <NewUserTeaser primaryUse={USER_TYPE.HouseOwner} />
      </div>
    </>
  )
}

export default Home
