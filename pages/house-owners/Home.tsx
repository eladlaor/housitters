import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import GoToProfileButton from '../../components/GoToProfileButton'
import { selectFirstNameState } from '../../slices/userSlice'
import { HOUSEOWNERS_ROUTES } from '../../utils/constants'

export default function Home() {
  const router = useRouter()
  const firstName = useSelector(selectFirstNameState)

  return (
    <div>
      <h1>Mazal tov {firstName} on your upcoming vacation!</h1>
      <GoToProfileButton baseRoute={HOUSEOWNERS_ROUTES.ACCOUNT} />
    </div>
  )
}
