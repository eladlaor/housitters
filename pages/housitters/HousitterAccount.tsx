import { useRouter } from 'next/router'
import Account from '../../components/Account'

export default function HousitterAccount() {
  const router = useRouter()

  return (
    <div>
      <Account />
    </div>
  )
}
