import { useSessionContext } from '@supabase/auth-helpers-react'
import Link from 'next/link'

import {
  settersToInitialStates as userSettersToInitialStates,
  SettersToInitialStates,
  selectPrimaryUseState,
} from '../../slices/userSlice'
import { settersToInitialStates as housitterSettersToInitialStates } from '../../slices/housitterSlice'
import { settersToInitialStates as landlordSettersToInitialStates } from '../../slices/landlordSlice'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'

import { userLogout } from '../../utils/auth/userLogout'
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
    <button
      onClick={async () => {
        if (userType === USER_TYPE.Housitter) {
          await clearState(housitterSettersToInitialStates)
        } else {
          await clearState(landlordSettersToInitialStates)
        }
        await clearState(userSettersToInitialStates)

        await supabaseClient.auth.signOut()
        router.push('/')
      }}
    >
      sign out
    </button>
  )
}
