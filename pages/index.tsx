import type { NextPage } from 'next'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { USER_TYPE } from '../utils/constants'
import Image from 'next/image'
import cuteDog from '../public/cuteDog.jpg'
import SignupTeaser from '../components/Buttons/SignupTeaser'
import {
  selectPrimaryUseState,
  settersToInitialStates as userSettersToInitialStates,
} from '../slices/userSlice'
import { settersToInitialStates as postSettersToInitialStates } from '../slices/postSlice'
import { useDispatch, useSelector } from 'react-redux'

import { settersToInitialStates as housitterSettersToInitialStates } from '../slices/housitterSlice'
import { settersToInitialStates as landlordSettersToInitialStates } from '../slices/landlordSlice'
import { settersToInitialStates as inboxSettersToInitialStates } from '../slices/inboxSlice'
import { settersToInitialStates as recommendationsSettersToInitialStates } from '../slices/recommendationSlice'

const Home: NextPage = () => {
  const router = useRouter()
  const user = useUser()
  const supabaseClient = useSupabaseClient()
  const dispatch = useDispatch()
  const userType = useSelector(selectPrimaryUseState)

  async function userLogout() {
    const clearUserState = async () => {
      userSettersToInitialStates.forEach((attributeSetterAndInitialState) => {
        dispatch(
          attributeSetterAndInitialState.matchingSetter(attributeSetterAndInitialState.initialState)
        )
      })
    }

    await clearUserState()
    await supabaseClient.auth.signOut()
  }

  useEffect(() => {
    if (!user) {
      console.log('reached index: no authenticated user')
      const nonUserSetters =
        userType === 'housitter' ? housitterSettersToInitialStates : landlordSettersToInitialStates

      for (const attributeSetterAndInitialState of nonUserSetters) {
        dispatch(
          attributeSetterAndInitialState.matchingSetter(attributeSetterAndInitialState.initialState)
        )
      }

      for (const postSetter of postSettersToInitialStates) {
        dispatch(postSetter.matchingSetter(postSetter.initialState))
      }

      for (const inboxSetter of inboxSettersToInitialStates) {
        dispatch(inboxSetter.matchingSetter(inboxSetter.initialState))
      }

      for (const recommendationSetter of recommendationsSettersToInitialStates) {
        dispatch(recommendationSetter.matchingSetter(recommendationSetter.initialState))
      }

      userLogout()
    } else {
      console.log('reached index: yes there is an authenticated user')
      supabaseClient.auth.signOut()
      userLogout()
    }
  }, [user])

  return (
    <div style={{ position: 'relative' }}>
      <div className="front-page-buttons">
        <Image src={cuteDog} alt="some-pic" layout="fill" objectFit="cover" />
        <div
          style={{
            marginRight: '30px',
          }}
        >
          <SignupTeaser userType={USER_TYPE.Housitter} />
        </div>
        <SignupTeaser userType={USER_TYPE.Landlord} />
        <button
          className="signin-button"
          onClick={() => {
            router.push('/Login')
          }}
        >
          already registered? sign in
        </button>
      </div>
      <div>
        <h1>Contact us</h1>
      </div>
    </div>
  )
}

export default Home
