import { Button } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useSessionContext } from '@supabase/auth-helpers-react'
import Avatar from './Avatar'

// can maybe type as HousePostInput
export default function HousePost({
  landlordId,
  title,
  text,
  location,
  startDate,
  endDate,
  dogs,
  cats,
}: {
  landlordId: string
  title: string
  text: string
  location: string
  startDate: Date
  endDate: Date
  dogs: number
  cats: number
}) {
  // const totalDays = endDate.getTime() - startDate.getTime()
  // debugger

  const [landlordFirstName, setLandlordFirstName] = useState('')
  const [landlordAvatarUrl, setLandlordAvatarUrl] = useState('')

  const { isLoading, session, error, supabaseClient } = useSessionContext()

  useEffect(() => {
    if (!landlordId) {
      return
    }
    async function loadLandlordData(landlordId: string) {
      try {
        let { data: landlordData, error: landlordError } = await supabaseClient
          .from('profiles')
          .select('first_name, avatar_url')
          .eq('id', landlordId)
          .single()
        if (landlordError) {
          alert(landlordError.message)
        } else if (landlordData) {
          setLandlordFirstName(landlordData.first_name)
          setLandlordAvatarUrl(landlordData.avatar_url)
        }
      } catch (e: any) {
        // TODO: fix type
        alert(e.message)
      }
    }

    loadLandlordData(landlordId)
  })

  return (
    <Card bg="light" style={{ width: '18rem' }}>
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>{text}</Card.Text>
        <Button variant="secondary">Send message</Button>
        <Card.Text>{location}</Card.Text>
        <Card.Text>{moment(new Date()).format('YYYY-MM-DD')} - 2023-03-10</Card.Text>
        <Card.Text>can also show total days</Card.Text>
        <Card.Text>post by: {landlordFirstName}</Card.Text>
        <Avatar
          uid={landlordId ? landlordId : 'testing'}
          url={landlordAvatarUrl}
          size={100}
          onUpload={() => {}}
          disableUpload={true}
        />
      </Card.Body>
    </Card>
  )
}
