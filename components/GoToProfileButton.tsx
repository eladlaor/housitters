import Link from 'next/link'

export default function GoToProfileButton(props: any) {
  return (
    <div>
      <button>
        <Link href={props.baseRoute}>go to account</Link>
      </button>
    </div>
  )
}
