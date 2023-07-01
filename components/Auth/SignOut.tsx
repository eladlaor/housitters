import Button from 'react-bootstrap/Button'
import { useSessionContext } from '@supabase/auth-helpers-react'

import {
  settersToInitialStates as userSettersToInitialStates,
  SettersToInitialStates,
  selectPrimaryUseState,
  setIsLoggedState,
  selectIsLoggedState,
} from '../../slices/userSlice'
import { settersToInitialStates as postSettersToInitialStates } from '../../slices/createPostSlice'
import { settersToInitialStates as housitterSettersToInitialStates } from '../../slices/housitterSlice'
import { settersToInitialStates as landlordSettersToInitialStates } from '../../slices/landlordSlice'
import { settersToInitialStates as inboxSettersToInitialStates } from '../../slices/inboxSlice'
import { setAvailablePosts } from '../../slices/availablePostsSlice'
import { setAllFavouriteUsers } from '../../slices/favouritesSlice'

import { useSelector, useDispatch } from 'react-redux'
import { persistor } from '../../store'
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

  const clearState = (settersToInitialState: SettersToInitialStates) => {
    for (const attributeSetterAndInitialState of settersToInitialState) {
      dispatch(
        attributeSetterAndInitialState.matchingSetter(attributeSetterAndInitialState.initialState)
      )
    }
  }

  async function handleSignOutClick() {
    await persistor.purge()
    await supabaseClient.auth.signOut()
    dispatch(setIsLoggedState(false))

    if (userType === USER_TYPE.Housitter) {
      clearState(housitterSettersToInitialStates)
    } else {
      clearState(landlordSettersToInitialStates)
    }
    clearState(userSettersToInitialStates)
    clearState(postSettersToInitialStates)
    clearState(inboxSettersToInitialStates)

    dispatch(setAvailablePosts([]))
    dispatch(setAllFavouriteUsers([]))

    router.push('/')
  }

  return (
    <div>
      {elementType === SignOutElementTypes.Button ? (
        <Button onClick={handleSignOutClick} variant="danger" id="signout-via-dropdown">
          Sign out
        </Button>
      ) : (
        <Link href="#">
          <a id="signout-via-dropdown" onClick={handleSignOutClick}>
            Sign out
          </a>
        </Link>
      )}
    </div>
  )
}
