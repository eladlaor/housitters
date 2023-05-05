/* Should probably move to api routes and configure accordinaly */

import { settersToInitialStates } from '../../slices/userSlice'
import { useRouter } from 'next/router'
import { SupabaseClient, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useDispatch } from 'react-redux'

export async function userLogout({
  supabaseClient,
}: {
  supabaseClient: SupabaseClient<any, 'public', any>
}) {
  // const supabaseClient = useSupabaseClient()
  const router = useRouter()
  const dispatch = useDispatch()
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
