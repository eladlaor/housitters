import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  return (
    <div>
      <h1>Mazal tov on your upcoming vacation!</h1>
    </div>
  )
}
