import Link from 'next/link'
import Button from 'react-bootstrap/Button'

export default function GoToProfileButton(props: any) {
  return (
    <div>
      <Button variant="info">
        <Link style={{ textDecoration: 'none' }} href={props.accountRoute}>
          edit account
        </Link>
      </Button>
    </div>
  )
}
