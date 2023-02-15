/* Should probably move to api routes and configure accordinaly */

import { settersToInitialStates } from '../../slices/userSlice'
import { useRouter } from 'next/router'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useDispatch } from 'react-redux'

const supabaseClient = useSupabaseClient()
const router = useRouter()
const dispatch = useDispatch()

export async function userLogout() {
  const clearUserState = async () => {
    settersToInitialStates.forEach((attributeSetterAndInitialState) => {
      dispatch(
        attributeSetterAndInitialState.matchingSetter(attributeSetterAndInitialState.initialState)
      )
    })
  }

  await clearUserState()
  await supabaseClient.auth.signOut()
  router.push('/')
}
