import { useDispatch } from 'react-redux'
import { setPrimaryUse } from '../../slices/userSlice'
import { UserType } from '../../utils/constants'

export default function SignupTeaser({ userType }: { userType: string }) {
  const dispatch = useDispatch()
  const message = userType === UserType.Housitter ? 'See our houses' : 'Meet our sitters'

  const handleUserTypeSelection = () => {
    dispatch(setPrimaryUse(userType))
  }

  return (
    <div>
      {/* <button */}
      {/*   type="button" */}
      {/*   className="btn btn-primary btn-lg" */}
      {/*   style={{ textDecoration: 'bold', color: 'white', width: '200px' }} */}
      {/* > */}
      {/* <Button size="lg" href={{ pathname: PageRoutes.Intro, query: { userType } }}>{message}</Link> */}
      {/* </button> */}
    </div>
  )
}
