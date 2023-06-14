import Button from 'react-bootstrap/Button'
import { useSessionContext } from '@supabase/auth-helpers-react'

import {
  settersToInitialStates as userSettersToInitialStates,
  SettersToInitialStates,
  selectPrimaryUseState,
  setIsLoggedState,
} from '../../slices/userSlice'
import { settersToInitialStates as postSettersToInitialStates } from '../../slices/createPostSlice'
import { settersToInitialStates as housitterSettersToInitialStates } from '../../slices/housitterSlice'
import { settersToInitialStates as landlordSettersToInitialStates } from '../../slices/landlordSlice'
import { settersToInitialStates as inboxSettersToInitialStates } from '../../slices/inboxSlice'
import {
  settersToInitialStates as availablePostsSettersToInitialStates,
  setAvailablePosts,
} from '../../slices/availablePostsSlice'

import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'

import { USER_TYPE } from '../../utils/constants'
import { SignOutElementTypes } from '../../utils/constants'
import Link from 'next/link'
import { SignOutProps } from '../../types/clientSide'

export default function SignOut({ elementType }: SignOutProps) {
  const { supabaseClient } = useSessionContext()
  const router = useRouter()
  const dispatch = useDispatch()

  const userType = useSelector(selectPrimaryUseState)

  const clearState = async (settersToInitialState: SettersToInitialStates) => {
    for (const attributeSetterAndInitialState of settersToInitialState) {
      dispatch(
        attributeSetterAndInitialState.matchingSetter(attributeSetterAndInitialState.initialState)
      )
    }
  }

  async function handleSignOutClick() {
    dispatch(setIsLoggedState(false))

    if (userType === USER_TYPE.Housitter) {
      await clearState(housitterSettersToInitialStates)
    } else {
      await clearState(landlordSettersToInitialStates)
    }
    await clearState(userSettersToInitialStates)
    await clearState(postSettersToInitialStates)
    await clearState(inboxSettersToInitialStates)

    dispatch(setAvailablePosts([]))

    await supabaseClient.auth.signOut()
    router.push('/')
  }

  return (
    <>
      {elementType === SignOutElementTypes.Button ? (
        <Button onClick={handleSignOutClick} variant="danger">
          sign out
        </Button>
      ) : (
        <Link href="/">
          <a onClick={handleSignOutClick}>sign out</a>
        </Link>
      )}
    </>
  )
}
