import { useRouter } from 'next/router'
import SignOut from '../../components/Buttons/SignOut'
import GoToProfileButton from '../../components/GoToProfileButton'
import { useSelector } from 'react-redux'
import { selectFirstNameState } from '../../slices/userSlice'
import { HOUSITTERS_ROUTES } from '../../utils/constants'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function Home() {
  const router = useRouter()
  const firstName = useSelector(selectFirstNameState)
  const supabase = useSupabaseClient()

  return (
    <div>
      <h1>Hello {firstName}! Let's find you a cute pet to feel at home with.</h1>
      <GoToProfileButton accountRoute={HOUSITTERS_ROUTES.ACCOUNT} />
      <SignOut />
      <button
        onClick={async () => {
          let { data: housitters, error } = await supabase.from('housitters').select('locations')
          if (error) {
            alert(error.message)
          } else {
          }
        }}
      >
        get locations
      </button>
    </div>
  )
}
