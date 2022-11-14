import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  const { firstName } = router.query
  //   debugger
  return (
    <div>
      <h1>Hello {firstName}! Let's find you a cute pet to feel at home with.</h1>
    </div>
  )
}
