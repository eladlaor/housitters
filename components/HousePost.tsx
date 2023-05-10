import { Button } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useSessionContext } from '@supabase/auth-helpers-react'
import Picture from './Picture'
import SignOut from './Buttons/SignOut'
import Image from 'next/image'

// can maybe type as HousePostInput
export default function HousePost({
  landlordId,
  title,
  text,
  location,
  imagesUrls,
}: {
  landlordId: string
  title: string
  text: string
  location: string
  startDate: Date
  endDate: Date
  dogs: number
  cats: number
  imagesUrls: string[]
}) {
  const [landlordFirstName, setLandlordFirstName] = useState('')
  const [landlordAvatarUrl, setLandlordAvatarUrl] = useState('')

  const [postPicturesFullUrl, setPostPicturesFullUrl] = useState([] as string[])

  const { session, error, supabaseClient } = useSessionContext()

  useEffect(() => {
    if (!landlordId) {
      return
    }
    async function loadLandlordData(landlordId: string) {
      console.log('INSIDE loadLandlordData')
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
    downloadPostImages(landlordId, imagesUrls)
  }, [landlordId, imagesUrls])

  // TODO: duplicated in Picture.tsx
  async function downloadPostImages(landlordId: string, imagesUrls: string[]) {
    try {
      const downloadPromises = imagesUrls.map(async (imageUrl) => {
        const { data: downloadData, error: downloadError } = await supabaseClient.storage
          .from('posts')
          .download(`${landlordId}-${imageUrl}`)
        if (downloadError) {
          throw downloadError
        }

        if (downloadData) {
          const fullUrl = URL.createObjectURL(downloadData)
          return fullUrl
        }
      })

      const fullUrlsForPreview = await Promise.all(downloadPromises)
      setPostPicturesFullUrl(fullUrlsForPreview as string[])
    } catch (error) {
      alert('error in downloadPostImages' + error)
    }
  }

  return (
    <div>
      <Card bg="light" style={{ width: '18rem' }}>
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          {postPicturesFullUrl.map((picUrl, index) => (
            <Image src={picUrl} alt="post pic" height={100} width={100} key={index} />
          ))}
          <Card.Text>{text}</Card.Text>
          <Button variant="secondary">Send message</Button>
          <Card.Text>{location}</Card.Text>
          <Card.Text>{moment(new Date()).format('YYYY-MM-DD')} - 2023-03-10</Card.Text>
          <Card.Text>can also show total days</Card.Text>
          <Card.Text>post by: {landlordFirstName}</Card.Text>
          <Picture
            uid={landlordId ? landlordId : 'testing'}
            url={landlordAvatarUrl}
            size={100}
            onUpload={() => {}}
            disableUpload={true}
            bucketName="avatars"
          />
        </Card.Body>
      </Card>
    </div>
  )
}
