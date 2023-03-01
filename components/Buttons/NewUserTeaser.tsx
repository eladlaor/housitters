import { USER_TYPE } from '../../utils/constants.ts'

import { useDispatch, useSelector } from 'react-redux'
import { selectPrimaryUseState, setPrimaryUse } from '../../slices/userSlice.ts'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Link from 'next/link'

/*

a function for a housitter
a function for a landlord

a functional component that 
    receives:
        enum value housitter/owner`

    does:
        according to the enum,
        runs the corresponding function (sitter/owner), which:
            1. navigates to a relevant short flow:
                where
                when
            
            2. directs the user to the signup page.
*/

export default function NewUserTeaser({ primaryUse }: { primaryUse: string }) {
  const router = useRouter()

  const dispatch = useDispatch()
  dispatch(setPrimaryUse(primaryUse))

  let message = ''
  let route = ''

  if (primaryUse === USER_TYPE.Housitter) {
    message = 'I am a sitter, find me a house'
    route = '/housitters/Intro'
  } else {
    message = 'I am going away, find me a sitter'
    route = '/house-owners/Intro'
  }

  return (
    <div className="front-page-buttons">
      <div className="link-test">
        <button type="button" className="btn btn-primary btn-lg">
          <Link href={route}>{message}</Link>
        </button>
      </div>
    </div>
  )
}
