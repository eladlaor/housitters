import Button from 'react-bootstrap/Button'
import { useSessionContext } from '@supabase/auth-helpers-react'

import {
  settersToInitialStates as userSettersToInitialStates,
  SettersToInitialStates,
  selectPrimaryUseState,
  selectIsLoggedState,
  setIsLoggedState,
} from '../../slices/userSlice'
import { settersToInitialStates as postSettersToInitialStates } from '../../slices/postSlice'

import { settersToInitialStates as housitterSettersToInitialStates } from '../../slices/housitterSlice'
import { settersToInitialStates as landlordSettersToInitialStates } from '../../slices/landlordSlice'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'

import { USER_TYPE } from '../../utils/constants'

export default function SignOut() {
  const { supabaseClient } = useSessionContext()
  const router = useRouter()
  const dispatch = useDispatch()

  const userType = useSelector(selectPrimaryUseState)

  const clearState = async (settersToInitialState: SettersToInitialStates) => {
    settersToInitialState.forEach((attributeSetterAndInitialState) => {
      dispatch(
        attributeSetterAndInitialState.matchingSetter(attributeSetterAndInitialState.initialState)
      )
    })
  }

  return (
    <Button
      onClick={async () => {
        dispatch(setIsLoggedState(false))

        if (userType === USER_TYPE.Housitter) {
          await clearState(housitterSettersToInitialStates)
        } else {
          await clearState(landlordSettersToInitialStates)
        }
        await clearState(userSettersToInitialStates)
        await clearState(postSettersToInitialStates)

        await supabaseClient.auth.signOut()
        router.push('/')
      }}
      variant="danger"
    >
      sign out
    </Button>
  )
}
