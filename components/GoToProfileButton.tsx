import { useRouter } from 'next/router'
import Link from 'next/link'

export default function GoToProfileButton(props: any) {
  const sessionAsString = JSON.stringify(props.session)
  const userAsString = JSON.stringify(props.user)
  return (
    <div>
      <button>
        <Link
          href={`${props.baseRoute}?firstName=${props.firstName}&session=${sessionAsString}&user=${userAsString}`}
        >
          go to account
        </Link>
      </button>
    </div>
  )
}
