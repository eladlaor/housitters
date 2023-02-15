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
      onClick={() => {
        userLogout()
      }}
    >
      sign out
    </button>
  )
}
