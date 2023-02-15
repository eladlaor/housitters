import type { NextPage } from 'next'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { USER_TYPE } from '../utils/constants'
import Image from 'next/image'
import cuteDog from '../public/cuteDog.jpg'
import NewUserTeaser from '../components/Buttons/NewUserTeaser'
import { settersToInitialStates } from '../slices/userSlice'
import { useDispatch } from 'react-redux'

import { userLogout } from '../utils/auth/userLogout'

const Home: NextPage = () => {
  const router = useRouter()
  const user = useUser()
  const supabaseClient = useSupabaseClient()

  const dispatch = useDispatch()

  async function userLogout() {
    const clearUserState = async () => {
      settersToInitialStates.forEach((attributeSetterAndInitialState) => {
        dispatch(
          attributeSetterAndInitialState.matchingSetter(attributeSetterAndInitialState.initialState)
        )
      })
    }

    await clearUserState()
    await supabaseClient.auth.signOut()
    router.push('/')
  }

  useEffect(() => {
    if (!user) {
      userLogout()
    } else {
      // TODO: go straight into action.
      debugger
    }
  })

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
