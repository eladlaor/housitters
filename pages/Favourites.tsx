import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

export default function Favourites() {
  const supabaseClient = useSupabaseClient()
  const user = useUser()

  return <Row></Row>
}
