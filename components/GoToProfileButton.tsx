import { useRouter } from 'next/router'
import Link from 'next/link'

export default function GoToProfileButton(props: any) {
  return (
    <div>
      <button>
        <Link href={`${props.baseRoute}?firstName=${props.firstName}`}>go to account</Link>
      </button>
    </div>
  )
}
