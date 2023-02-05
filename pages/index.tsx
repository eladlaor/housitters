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
import Image from 'next/image'
import cuteDog from '../public/cuteDog.jpg'
import Button from '../components/ui/Button'

const Home: NextPage = () => {
  const router = useRouter()
  const user = useUser()

  return (
    <>
      <div
        style={{
          zIndex: 0,
          position: 'fixed',
          width: '100vw',
          height: '100vh',
        }}
      >
        <Image src={cuteDog} alt="some-pic" layout="fill" objectFit="cover" />
        <button style={{ position: 'relative' }}>test</button>
      </div>
    </>
  )
}

export default Home
