import { useRouter } from 'next/router'

const Test: any = () => {
  const router = useRouter()
  const { testparam } = router.query

  return <p className="testing"> This is the query param: {testparam} </p>
}

export default Test
