import { useRouter } from 'next/router'
import SignOut from '../../components/Buttons/SignOut'
import GoToProfileButton from '../../components/GoToProfileButton'
import { useSelector } from 'react-redux'
import { selectFirstNameState } from '../../slices/userSlice'

export default function Home() {
  const router = useRouter()
  const firstName = useSelector(selectFirstNameState)

  return (
    <div>
      <h1>Hello {firstName}! Let's find you a cute pet to feel at home with.</h1>
      <GoToProfileButton baseRoute="/housitters/HousitterAccount" />
      <SignOut />
    </div>
  )
}
