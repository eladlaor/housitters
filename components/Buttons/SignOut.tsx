import { useSessionContext } from '@supabase/auth-helpers-react'
import Link from 'next/link'

export default function SignOut() {
  const { supabaseClient } = useSessionContext()

  return (
    <button
      onClick={() => {
        supabaseClient.auth.signOut()
      }}
    >
      <Link href="/">sign out</Link>
    </button>
  )
}
