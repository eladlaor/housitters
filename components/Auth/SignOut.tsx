import Button from 'react-bootstrap/Button'
import { useSessionContext } from '@supabase/auth-helpers-react'

import {
  settersToInitialStates as userSettersToInitialStates,
  SettersToInitialStates,
  selectPrimaryUseState,
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

import { UserType } from '../../utils/constants'
import { SignOutElementTypes } from '../../utils/constants'
import { SignOutProps } from '../../types/clientSide'
import { NavDropdown } from 'react-bootstrap'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export default function SignOut({ elementType }: SignOutProps) {
  const { supabaseClient } = useSessionContext()
  const router = useRouter()
  const dispatch = useDispatch()

  const { t } = useTranslation()
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

    if (userType === UserType.Housitter) {
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
      {(() => {
        switch (elementType) {
          case SignOutElementTypes.Button:
            return (
              <Button onClick={handleSignOutClick} variant="danger" id="signout-via-dropdown">
                {t('homeNavbar.signOut')}
              </Button>
            )
          case SignOutElementTypes.NavDropdownItem:
            return (
              <NavDropdown.Item href="#" onClick={handleSignOutClick} id="signout-via-dropdown">
                {t('homeNavbar.signOut')}
              </NavDropdown.Item>
            )
          default:
            return (
              <Link href="#" onClick={handleSignOutClick} id="signout-via-dropdown">
                {t('homeNavbar.signOut')}
              </Link>
            )
        }
      })()}
    </div>
  )
}
