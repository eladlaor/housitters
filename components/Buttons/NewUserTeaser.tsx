import { USER_TYPE } from '../../utils/constants'

import { useDispatch, useSelector } from 'react-redux'
import { selectPrimaryUseState, setPrimaryUse } from '../../slices/userSlice'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Link from 'next/link'

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
    route = '/landlords/Intro'
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
