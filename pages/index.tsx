import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { persistor } from '../store'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { PageRoutes, UserType } from '../utils/constants'
import cuteDog from '../public/images/leika.jpg'
import {
  selectPrimaryUseState,
  setPrimaryUse,
  settersToInitialStates as userSettersToInitialStates,
} from '../slices/userSlice'
import { settersToInitialStates as postSettersToInitialStates } from '../slices/createPostSlice'
import { useDispatch, useSelector } from 'react-redux'

import { settersToInitialStates as housitterSettersToInitialStates } from '../slices/housitterSlice'
import { settersToInitialStates as landlordSettersToInitialStates } from '../slices/landlordSlice'
import { settersToInitialStates as inboxSettersToInitialStates } from '../slices/inboxSlice'
import { settersToInitialStates as recommendationsSettersToInitialStates } from '../slices/recommendationSlice'

import { Button, Row, Col, Container } from 'react-bootstrap'
import Footer from '../components/Footer'
import { useTranslation } from 'react-i18next'
import localizedIntroText from '../components/utils/LocalizedIntroText'

export default function Home() {
  const router = useRouter()
  const user = useUser()
  const userId = user?.id
  const { t } = useTranslation()
  const { locale } = router

  const supabaseClient = useSupabaseClient()
  const dispatch = useDispatch()
  const userType = useSelector(selectPrimaryUseState)

  async function clearUserState() {
    await persistor.purge()

    for (const attributeSetterAndInitialState of userSettersToInitialStates) {
      dispatch(
        attributeSetterAndInitialState.matchingSetter(attributeSetterAndInitialState.initialState)
      )
    }

    const nonUserSetters =
      userType === UserType.Housitter
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
    if (userId) {
      const asyncWrapper = async () => {
        let query = await supabaseClient
          .from('profiles')
          .select(`primary_use`)
          .eq('id', userId)
          .single()

        let { data, error } = await query

        if (error) {
          console.log('error when querying user type: ' + error.message)
        }

        if (data) {
          dispatch(setPrimaryUse(data.primary_use))
          router.push({
            pathname:
              data.primary_use === UserType.Housitter
                ? PageRoutes.HousitterRoutes.Home
                : PageRoutes.LandlordRoutes.Home,
            query: { userType: data.primary_use },
          })
        }
      }

      asyncWrapper()
    } else {
      clearUserState()
    }
  }, [userId])

  function handleFind(isHousitter: boolean) {
    if (userId) {
      router.push(isHousitter ? PageRoutes.HousitterRoutes.Home : PageRoutes.LandlordRoutes.Home)
    } else {
      router.push({
        pathname: PageRoutes.Intro,
        query: { userType: isHousitter ? UserType.Housitter : UserType.Landlord },
      })
    }
  }

  return (
    <div
      className="d-flex flex-column vh-100"
      style={{
        marginTop: '-1.5rem',
        backgroundImage: `url("${cuteDog.src}")`,
        backgroundSize: 'cover',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        backgroundBlendMode: 'lighten',
      }}
    >
      <Container className="d-flex flex-column justify-content-center vh-100">
        <Row>
          <Col xs={12} md={9}>
            {localizedIntroText(locale)}
          </Col>
        </Row>
        <Row className="d-flex mt-2">
          <Col xs={12} md={3}>
            <Button size="lg" className="w-100" onClick={() => handleFind(false)}>
              {t('index.findSitter')}
            </Button>
          </Col>
          <Col xs={12} md={3}>
            <Button size="lg" className="w-100" onClick={() => handleFind(true)}>
              {t('index.findHouse')}
            </Button>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  )
}
