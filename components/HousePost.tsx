import { Button, Carousel, Modal } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useSessionContext } from '@supabase/auth-helpers-react'
import Picture from './Picture'
import SignOut from './Buttons/SignOut'
import Image from 'next/image'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
// can maybe type as HousePostInput
export default function HousePost({
  landlordId,
  title,
  text,
  location,
  dogs,
  cats,
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
  const [showModal, setShowModal] = useState(false)

  function handleModalOpen() {
    setShowModal(true)
  }

  function handleModalClose() {
    setShowModal(false)
  }

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
          {postPicturesFullUrl[0] && (
            <Image src={postPicturesFullUrl[0]} alt="Thumbnail" height={100} width={100} />
          )}
          <div>
            {postPicturesFullUrl.length > 1 ? (
              <Button onClick={handleModalOpen}>See More Pictures</Button>
            ) : (
              <Button disabled={true}>No Other Pictures</Button>
            )}
          </div>

          <Modal show={showModal} onHide={handleModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>Additional Pictures</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row className="justify-content-center">
                {postPicturesFullUrl.map((picUrl, index) => (
                  <Col md={4} className="mb-4" key={index}>
                    <Image src={picUrl} width={100} height={100} key={index} />
                  </Col>
                ))}
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={handleModalClose}>Close</Button>
            </Modal.Footer>
          </Modal>

          {/*           
          {postPicturesFullUrl.map((picUrl, index) => (
            <Image src={picUrl} alt="post pic" height={100} width={100} key={index} />
          ))} */}

          <Card.Text>location: {location}</Card.Text>
          <Card.Text>
            dogs: {dogs} cats: {cats}
          </Card.Text>
          <Card.Text>{text}</Card.Text>
          <Card.Text>{moment(new Date()).format('YYYY-MM-DD')} - 2023-03-10</Card.Text>
          <Card.Text>can also show total day count</Card.Text>
          <Card.Text>post by: {landlordFirstName}</Card.Text>
          <Picture
            uid={landlordId ? landlordId : 'testing'}
            url={landlordAvatarUrl}
            size={100}
            onUpload={() => {}}
            disableUpload={true}
            bucketName="avatars"
          />
          <Button variant="secondary">Send {landlordFirstName} a message</Button>
        </Card.Body>
      </Card>
    </div>
  )
}
