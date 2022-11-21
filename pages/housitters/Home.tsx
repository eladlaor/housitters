import { useRouter } from 'next/router'
import GoToProfileButton from '../../components/GoToProfileButton'

export default function Home() {
  const router = useRouter()
  const { firstName, session, user } = router.query
  const sessionObj = JSON.parse(session as string)
  const userObj = JSON.parse(user as string)

  return (
    <div>
      <h1>Hello {firstName}! Let's find you a cute pet to feel at home with.</h1>
      <GoToProfileButton
        baseRoute="/housitters/HousitterAccount"
        firstName={firstName}
        session={sessionObj}
        user={userObj}
      />
    </div>
  )
}
