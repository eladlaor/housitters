import { USER_TYPE } from '../../utils/constants.ts'

import { useDispatch, useSelector } from 'react-redux'
import { selectPrimaryUseState, setPrimaryUse } from '../../slices/userSlice.ts'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

/*

a function for a housitter
a function for a houseowner

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
  let action

  useEffect(() => {
    console.log('hi')
  }, [message])

  async function housitterIntro() {
    console.log('activating SITTER flow')

    router.push('/housitters/Intro')
  }

  async function houseOwnerIntro() {
    console.log('activating OWNER flow')
    router.push('/house-owners/Intro')
  }

  if (primaryUse === USER_TYPE.Housitter) {
    message = 'I am a sitter, find me a house'
    action = housitterIntro
  } else {
    message = 'I am going away, find me a sitter'
    action = houseOwnerIntro
  }

  return (
    <div className="front-page-buttons">
      <div style={{ position: 'relative' }}>
        <button onClick={action}>{message}</button>
      </div>
    </div>
  )
}
