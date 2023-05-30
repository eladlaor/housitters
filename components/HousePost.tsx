import { Button, ListGroup, Modal, Badge } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faCalendarCheck } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Image from 'next/image'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import React from 'react'
import { countDays } from '../utils/dates'
import { useSelector } from 'react-redux'
import { selectPrimaryUseState } from '../slices/userSlice'
import { USER_TYPE, ClosedSit } from '../utils/constants'
import { ImageData } from '../types/clientSide'
import Picture from './Picture'

/*
  if no active posts: allow create new post

*/

// can maybe type as HousePostInput
export default function HousePost({
  landlordId,
  title,
  description,
  location,
  availability,
  dogs,
  cats,
  imagesUrls,
}: {
  landlordId: string
  title: string
  description: string
  location: string
  availability: { startDate: string; endDate: string }[]
  dogs: number
  cats: number
  imagesUrls: ImageData[]
}) {
  const supabaseClient = useSupabaseClient()

  const [landlordFirstName, setLandlordFirstName] = useState('')
  const [landlordAvatarUrl, setLandlordAvatarUrl] = useState('')
  const [postPicturesFullUrl, setPostPicturesFullUrl] = useState([] as ImageData[])
  const [showModal, setShowModal] = useState(false)
  const [closedSits, setClosedSits] = useState([] as ClosedSit[])

  const primaryUse = useSelector(selectPrimaryUseState)

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

        let { data: closedSitsData, error: closedSitsError } = await supabaseClient
          .from('closed_sits')
          .select(
            `housitter_id, start_date, profiles!inner (
          first_name, last_name, avatar_url
        )`
          )
          .eq('landlord_id', landlordId)

        if (closedSitsError) {
          alert(`error querying db for closed sits: ${closedSitsError.message}`)
          debugger
          throw closedSitsError
        }

        if (closedSitsData) {
          let modifiedClosedSits: ClosedSit[] = []

          closedSitsData.forEach((closedSit) => {
            modifiedClosedSits.push({
              housitterId: closedSit.housitter_id,
              housitterFirstName: Array.isArray(closedSit.profiles)
                ? closedSit.profiles[0].first_name
                : closedSit.profiles?.first_name,
              housitterLastName: Array.isArray(closedSit.profiles)
                ? closedSit.profiles[0].last_name
                : closedSit.profiles?.last_name,
              housitterAvatarUrl: Array.isArray(closedSit.profiles)
                ? closedSit.profiles[0].avatar_url
                : closedSit.profiles?.avatar_url,
              startDate: closedSit.start_date,
            })
          })

          setClosedSits(modifiedClosedSits)
        }
      } catch (e: any) {
        alert(e)
        debugger
        throw e
      }
    }

    loadLandlordData(landlordId)
    downloadPostImagesAndSetPostPicturesPreview(landlordId, imagesUrls)
  }, [landlordId, imagesUrls])

  // TODO: duplicated in Picture.tsx
  // TODO: this is a bad mixup of getter and setter, a getter should not set.
  async function downloadPostImagesAndSetPostPicturesPreview(
    landlordId: string,
    imagesUrls: ImageData[]
  ) {
    try {
      const downloadPromises = imagesUrls.map(async (imageUrl: ImageData) => {
        const { data: downloadData, error: downloadError } = await supabaseClient.storage
          .from('posts')
          .download(`${landlordId}-${imageUrl.url}`)
        if (downloadError) {
          throw downloadError
        }

        if (downloadData) {
          const fullUrl = URL.createObjectURL(downloadData)

          // TODO: there was a reason i did it with object, should return it...
          return { url: fullUrl, id: imageUrl.id }
        }
      })

      const fullUrlsForPreview = await Promise.all(downloadPromises)
      setPostPicturesFullUrl(fullUrlsForPreview as ImageData[])
    } catch (error) {
      alert('error in downloadPostImagesAndSetPostPicturesPreview' + error)
      debugger
    }
  }

  function isClosedPeriod(startDate: string) {
    return closedSits.map((closedSit) => closedSit.startDate).includes(startDate)
  }

  return (
    <div>
      <Card bg="light" style={{ width: '18rem' }}>
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          {postPicturesFullUrl[0] ? (
            <Image src={postPicturesFullUrl[0].url} alt="Thumbnail" height={100} width={100} />
          ) : (
            'Loading Title Image'
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
                    <Image src={picUrl.url} width={100} height={100} key={index} />
                  </Col>
                ))}
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={handleModalClose}>Close</Button>
            </Modal.Footer>
          </Modal>

          <Card.Text>location: {location}</Card.Text>
          <hr />
          <Card.Text>
            dogs: {dogs} cats: {cats}
          </Card.Text>
          <hr />
          <Card.Text>{description}</Card.Text>
          <hr />
          <div>
            <h3>dates:</h3>
            <Card.Text>
              {availability.map((period, index) => (
                <React.Fragment key={index}>
                  <ListGroup>
                    <ListGroup.Item>
                      {isClosedPeriod(period.startDate) ? (
                        <>
                          <Badge bg="success">Closed</Badge>
                          <FontAwesomeIcon icon={faCalendarCheck} style={{ color: 'green' }} />
                          This sit is complete
                          <br />
                        </>
                      ) : (
                        <>
                          <Badge bg="danger">Open</Badge>
                          <FontAwesomeIcon icon={faCalendar} style={{ color: 'grey' }} />
                          This sit is still open
                          <br />
                        </>
                      )}

                      {`${period.startDate} - ${period.endDate}`}
                      <br />
                      {`total days: ${countDays(period.startDate, period.endDate)}`}
                      <br />
                    </ListGroup.Item>
                  </ListGroup>
                </React.Fragment>
              ))}
            </Card.Text>
            <hr />
          </div>
          {primaryUse === USER_TYPE.Housitter && (
            <div>
              {' '}
              <Card.Text>post by: {landlordFirstName}</Card.Text>
              <Picture
                isAvatar={true}
                url={landlordAvatarUrl}
                email=""
                promptMessage=""
                isIntro={false}
                disableUpload={true}
                primaryUse={USER_TYPE.Landlord}
                uid={landlordId ? landlordId : 'no landlord uid - not valid'}
                size={100}
                width={100}
                height={100}
                bucketName="avatars"
              />
              <Button variant="secondary">Send {landlordFirstName} a message</Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
