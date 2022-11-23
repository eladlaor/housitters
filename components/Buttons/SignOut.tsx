import { useSessionContext } from '@supabase/auth-helpers-react'
import Link from 'next/link'

import { settersToInitialStates } from '../../slices/userSlice'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/router'

export default function SignOut() {
  const { supabaseClient } = useSessionContext()
  const router = useRouter()
  const dispatch = useDispatch()

  async function userLogout() {
    const clearUserState = async () => {
      settersToInitialStates.forEach((attributeSetterAndInitialState) => {
        console.log('hi')

        dispatch(
          attributeSetterAndInitialState.matchingSetter(attributeSetterAndInitialState.initialState)
        )
      })
    }

    await clearUserState()
    await supabaseClient.auth.signOut()
    router.push('/')
  }

  return (
    <button
      onClick={() => {
        userLogout()
      }}
    >
      sign out
    </button>
  )
}
