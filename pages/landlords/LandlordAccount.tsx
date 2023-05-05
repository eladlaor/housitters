import { useRouter } from 'next/router'
import Account from '../../components/Account'

export default function landlordAccount() {
  const router = useRouter()

  return (
    <div>
      <Account />
    </div>
  )
}
