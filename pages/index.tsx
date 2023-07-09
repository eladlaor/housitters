import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { persistor } from '../store'

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { NavbarItems, PageRoutes, USER_TYPE } from '../utils/constants'
import Image from 'next/image'
import cuteDog from '../public/images/cuteDog.jpg'
import SignupTeaser from '../components/Auth/SignupTeaser'
import {
  selectIsOngoingOAuthState,
  selectPrimaryUseState,
  setIsOngoingOAuthState,
  setPrimaryUse,
  settersToInitialStates as userSettersToInitialStates,
} from '../slices/userSlice'
import { settersToInitialStates as postSettersToInitialStates } from '../slices/createPostSlice'
import { useDispatch, useSelector } from 'react-redux'

import { settersToInitialStates as housitterSettersToInitialStates } from '../slices/housitterSlice'
import { settersToInitialStates as landlordSettersToInitialStates } from '../slices/landlordSlice'
import { settersToInitialStates as inboxSettersToInitialStates } from '../slices/inboxSlice'
import { settersToInitialStates as recommendationsSettersToInitialStates } from '../slices/recommendationSlice'

import Button from 'react-bootstrap/Button'
import Footer from '../components/Footer'

export default function Home() {
  const router = useRouter()
  const user = useUser()
  const supabaseClient = useSupabaseClient()
  const dispatch = useDispatch()
  const userType = useSelector(selectPrimaryUseState)
  const isOngoingOAuth = useSelector(selectIsOngoingOAuthState)

  async function userClearState() {
    await persistor.purge()

    for (const attributeSetterAndInitialState of userSettersToInitialStates) {
      dispatch(
        attributeSetterAndInitialState.matchingSetter(attributeSetterAndInitialState.initialState)
      )
    }

    const nonUserSetters =
      userType === USER_TYPE.Housitter
        ? housitterSettersToInitialStates
        : landlordSettersToInitialStates

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
  }

  useEffect(() => {
    const handleSuccessfulOAuth = async (userId: string) => {
      const { error, data } = await supabaseClient
        .from('profiles')
        .select('primary_use')
        .eq('id', userId)
        .single()
      if (error) {
        alert(`error while querying user profile after fresh login: ${error.message}`)
        debugger
        return
      }
      if (data) {
        dispatch(setPrimaryUse(data.primary_use))
        dispatch(setIsOngoingOAuthState(false))
        if (userType === USER_TYPE.Housitter) {
          router.push(`${PageRoutes.HousitterRoutes.Home}`)
        } else {
          router.push(`${PageRoutes.LandlordRoutes.Home}`)
        }
      }
    }

    if (user) {
      if (isOngoingOAuth) {
        handleSuccessfulOAuth(user.id)
      } else {
        supabaseClient.auth.signOut()
        userClearState()
      }
    }
  }, [])

  return (
    <div className="d-flex flex-column vh-100">
      <div className="d-flex align-items-center justify-content-center vh-100">
        <Image src={cuteDog} alt="some-pic" layout="fill" objectFit="cover" />
        <div className="position-relative">
          <div className="text-center d-flex justify-content-between mx-auto signup-teasers-container">
            <div className="w-50 pr-2">
              <SignupTeaser userType={USER_TYPE.Housitter} />
            </div>
            <div className="w-50 pl-2">
              <SignupTeaser userType={USER_TYPE.Landlord} />
            </div>
          </div>
          <Button
            className="d-flex align-items-center justify-content-center mt-4 signin-button"
            variant="lg"
            onClick={() => {
              router.push('/Login')
            }}
          >
            already registered? sign in
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
