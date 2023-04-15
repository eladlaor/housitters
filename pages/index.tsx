import type { NextPage } from 'next'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { USER_TYPE } from '../utils/constants'
import Image from 'next/image'
import cuteDog from '../public/cuteDog.jpg'
import NewUserTeaser from '../components/Buttons/NewUserTeaser'
import { selectPrimaryUseState, settersToInitialStates } from '../slices/userSlice'
import { settersToInitialStates as postSettersToInitialStates } from '../slices/postSlice'
import { useDispatch, useSelector } from 'react-redux'

import { settersToInitialStates as housitterSettersToInitialStates } from '../slices/housitterSlice'
import { settersToInitialStates as landlordSettersToInitialStates } from '../slices/landlordSlice'

const Home: NextPage = () => {
  const router = useRouter()
  const user = useUser()
  const supabaseClient = useSupabaseClient()
  const dispatch = useDispatch()
  const userType = useSelector(selectPrimaryUseState)

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
      const nonUserSetters =
        userType === 'housitter' ? housitterSettersToInitialStates : landlordSettersToInitialStates
      nonUserSetters.forEach((attributeSetterAndInitialState) => {
        dispatch(
          attributeSetterAndInitialState.matchingSetter(attributeSetterAndInitialState.initialState)
        )

        postSettersToInitialStates.forEach((postSetter) => {
          dispatch(postSetter.matchingSetter(postSetter.initialState))
        })
      })
    } else {
      supabaseClient.auth.signOut()
      userLogout()
      // TODO: go straight into action.
    }
  })

  return (
    <>
      <div className="front-page-buttons">
        <Image src={cuteDog} alt="some-pic" layout="fill" objectFit="cover" />
        <div
          style={{
            marginRight: '30px',
          }}
        >
          <NewUserTeaser userType={USER_TYPE.Housitter} />
        </div>
        <NewUserTeaser userType={USER_TYPE.Landlord} />
      </div>
      <button
        className="signinbutton"
        onClick={() => {
          router.push('/Login')
        }}
      >
        already registered? sign in
      </button>
    </>
  )
}

export default Home
