import { useRouter } from 'next/router'

export default function HousitterAccount() {
  const router = useRouter()
  const { firstName } = router.query

  return <h1>this is the housitter account page for {firstName}</h1>
}
