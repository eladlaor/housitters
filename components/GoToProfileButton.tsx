import Link from 'next/link'

export default function GoToProfileButton(props: any) {
  return (
    <div>
      <button>
        <Link href={props.accountRoute}>edit account</Link>
      </button>
    </div>
  )
}
