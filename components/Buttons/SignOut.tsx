import { useSessionContext } from '@supabase/auth-helpers-react'
import Link from 'next/link'

import { settersToInitialStates } from '../../slices/userSlice'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/router'

import { userLogout } from '../../utils/auth/userLogout'

export default function SignOut() {
  const { supabaseClient } = useSessionContext()
  const router = useRouter()
  const dispatch = useDispatch()

  return (
    <button
      onClick={async () => {
        const clearUserState = async () => {
          settersToInitialStates.forEach((attributeSetterAndInitialState) => {
            dispatch(
              attributeSetterAndInitialState.matchingSetter(
                attributeSetterAndInitialState.initialState
              )
            )
          })
        }

        await clearUserState()
        await supabaseClient.auth.signOut()
        router.push('/')
      }}
    >
      sign out
    </button>
  )
}
