import { useDispatch, useSelector } from 'react-redux'
import { setPrimaryUse } from '../../slices/userSlice'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { HOUSITTERS_ROUTES, LANDLORDS_ROUTES, USER_TYPE } from '../../utils/constants'

export default function NewUserTeaser({ userType }: { userType: string }) {
  const router = useRouter()
  const dispatch = useDispatch()

  const handleUserTypeSelection = () => {
    dispatch(setPrimaryUse(userType))
  }

  let message = ''
  let route = ''

  if (userType === USER_TYPE.Housitter) {
    message = '\nfind me a house'
    route = HOUSITTERS_ROUTES.INTRO
  } else {
    message = 'find me a housitter'
    route = LANDLORDS_ROUTES.INTRO
  }

  return (
    <div className="front-page-buttons">
      <div className="relative-position">
        <button
          type="button"
          className="btn btn-primary btn-lg "
          style={{ textDecoration: 'bold' }}
          onClick={handleUserTypeSelection}
        >
          <Link href={route}>{message}</Link>
        </button>
      </div>
    </div>
  )
}
