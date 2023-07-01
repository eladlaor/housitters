import { useDispatch, useSelector } from 'react-redux'
import { setPrimaryUse } from '../../slices/userSlice'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { PageRoutes, USER_TYPE } from '../../utils/constants'

export default function SignupTeaser({ userType }: { userType: string }) {
  const dispatch = useDispatch()
  const message = userType === USER_TYPE.Housitter ? 'Find a house' : 'Find a housitter'

  const handleUserTypeSelection = () => {
    dispatch(setPrimaryUse(userType))
  }

  return (
    <div>
      <button
        type="button"
        className="btn btn-primary btn-lg"
        style={{ textDecoration: 'bold', color: 'white', width: '200px' }}
        onClick={handleUserTypeSelection}
      >
        <Link href={{ pathname: PageRoutes.Intro, query: { userType } }}>{message}</Link>
      </button>
    </div>
  )
}
