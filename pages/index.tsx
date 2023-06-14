import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { NavbarItems, USER_TYPE } from '../utils/constants'
import Image from 'next/image'
import cuteDog from '../public/cuteDog.jpg'
import SignupTeaser from '../components/Buttons/SignupTeaser'
import {
  selectPrimaryUseState,
  settersToInitialStates as userSettersToInitialStates,
} from '../slices/userSlice'
import { settersToInitialStates as postSettersToInitialStates } from '../slices/createPostSlice'
import { useDispatch, useSelector } from 'react-redux'

import { settersToInitialStates as housitterSettersToInitialStates } from '../slices/housitterSlice'
import { settersToInitialStates as landlordSettersToInitialStates } from '../slices/landlordSlice'
import { settersToInitialStates as inboxSettersToInitialStates } from '../slices/inboxSlice'
import { settersToInitialStates as recommendationsSettersToInitialStates } from '../slices/recommendationSlice'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Accordion from 'react-bootstrap/Accordion'
import Carousel from 'react-bootstrap/Carousel'
import Button from 'react-bootstrap/Button'
import IntroNavbar from '../components/IntroNavbar'

export default function Home() {
  const router = useRouter()
  const user = useUser()
  const supabaseClient = useSupabaseClient()
  const dispatch = useDispatch()
  const userType = useSelector(selectPrimaryUseState)

  async function userLogout() {
    const clearUserState = async () => {
      for (const attributeSetterAndInitialState of userSettersToInitialStates) {
        dispatch(
          attributeSetterAndInitialState.matchingSetter(attributeSetterAndInitialState.initialState)
        )
      }
    }

    await clearUserState()
    await supabaseClient.auth.signOut()
  }

  useEffect(() => {
    if (!user) {
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
      supabaseClient.auth.signOut()
      userLogout()
    }
  }, [user])

  return (
    <div>
      <IntroNavbar navbarItems={NavbarItems} />
      <Row
        className="d-flex align-items-center justify-content-center"
        style={{ position: 'relative', height: '100vh' }}
      >
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
          <Button
            variant="lg"
            className="signin-button"
            onClick={() => {
              router.push('/Login')
            }}
          >
            already registered? sign in
          </Button>
        </div>
      </Row>
      <Row
        className="d-flex justify-content-center"
        style={{ position: 'relative', height: 'auto' }}
      ></Row>
    </div>
  )
}

/*

[design this as a circle of love... \ light]

a WIN WIN WIN circle of light:

pet-parents get to spread their WINgs and travel with peace of mind, 
knowing their loved ones are in caring hands, getting personal treatment.

pets get a WINdfall of fresh-smelling love, while staying at their safe and 
comfortable environment (and usually some cool new pics:)

housitters get a WINdow to a new experience of heart-warming pets and a gratifying lifestyle,
closing a circle






*/
