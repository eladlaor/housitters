import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  const { username, firstName } = router.query
  const somestring = 'somestring'
  debugger
  // TODO: get rid of the fragment below and type this correctly
  return (
    <div>
      <h1>
        Hello dear housitter!
        <p>
          <>
            Name: {firstName}. Username: {username}
          </>
        </p>
      </h1>
    </div>
  )
}
