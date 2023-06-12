import { useDispatch, useSelector } from 'react-redux'
import { setPrimaryUse } from '../../slices/userSlice'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { PageRoutes, USER_TYPE } from '../../utils/constants'

// TODO: test doing this destructing inside other components too, to omit that additional line
export default function SignupTeaser({ userType }: { userType: string }) {
  const router = useRouter()
  const dispatch = useDispatch()

  const handleUserTypeSelection = () => {
    dispatch(setPrimaryUse(userType))
  }

  let message = ''

  // TODO: no need for that now
  let route = ''

  if (userType === USER_TYPE.Housitter) {
    message = 'find me a house'
    route = PageRoutes.Intro
  } else {
    message = 'find me a housitter'
    route = PageRoutes.Intro
  }

  return (
    <div className="front-page-buttons relative-position">
      <button
        type="button"
        className="btn btn-primary btn-lg"
        style={{ textDecoration: 'bold' }}
        onClick={handleUserTypeSelection}
      >
        <Link href={{ pathname: route, query: { userType } }}>{message}</Link>
      </button>
    </div>
  )
}
