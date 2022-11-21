import { useRouter } from 'next/router'
import Account from '../../components/Account'

export default function HousitterAccount() {
  const router = useRouter()
  const { firstName, session, user } = router.query
  const sessionObj = JSON.parse(session as string)
  const userObj = JSON.parse(user as string)

  return (
    <div>
      <h1>this is the housitter account page for {firstName}</h1>
      <Account session={sessionObj} userFromQuery={userObj} />
    </div>
  )
}
