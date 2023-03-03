import { useDispatch, useSelector } from 'react-redux'
import { setPrimaryUse } from '../../slices/userSlice'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { HOUSITTERS_ROUTES, LANDLORDS_ROUTES, USER_TYPE } from '../../utils/constants'

export default function NewUserTeaser({ userType }: { userType: string }) {
  const router = useRouter()
  const dispatch = useDispatch()
  // dispatch(setPrimaryUse(USER_TYPE.Landlord))

  const handleUserTypeSelection = () => {
    dispatch(setPrimaryUse(userType))
  }

  let message = ''
  let route = ''

  if (userType === USER_TYPE.Housitter) {
    message = 'I am a sitter, find me a house'
    route = HOUSITTERS_ROUTES.INTRO
  } else {
    message = 'I am going away, find me a sitter'
    route = LANDLORDS_ROUTES.INTRO
  }

  return (
    <div className="front-page-buttons">
      <div className="link-test">
        <button type="button" className="btn btn-primary btn-lg" onClick={handleUserTypeSelection}>
          <Link href={route}>{message}</Link>
        </button>
      </div>
    </div>
  )
}
