import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  const { firstName } = router.query
  //   debugger
  return (
    <div>
      <h1>Hello {firstName}! Mazal tov on your upcoming vacation!</h1>
    </div>
  )
}
