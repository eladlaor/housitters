import { Button, Modal } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import { useEffect, useState } from 'react'
import { useSessionContext } from '@supabase/auth-helpers-react'
import Image from 'next/image'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import React from 'react'
import { countDays } from '../utils/dates'
import { useSelector } from 'react-redux'
import { selectPrimaryUseState } from '../slices/userSlice'
import { API_ROUTES, USER_TYPE } from '../utils/constants'
import { ImageData } from '../types/clientSide'
import PictureBetter from './PictureBetter'
import axios from 'axios'
import { blobToBuffer } from '../utils/files'

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
  imagesData,
}: {
  landlordId: string
  title: string
  description: string
  location: string
  availability: { startDate: string; endDate: string }[]
  dogs: number
  cats: number
  imagesData: ImageData[]
}) {
  const [landlordFirstName, setLandlordFirstName] = useState('')
  const [landlordAvatarUrl, setLandlordAvatarUrl] = useState('')

  const [postPicturesFullUrl, setPostPicturesFullUrl] = useState([] as ImageData[])

  const { session, error, supabaseClient } = useSessionContext()
  const [showModal, setShowModal] = useState(false)
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
      } catch (e: any) {
        // TODO: fix type
        alert(e.message)
      }
    }

    loadLandlordData(landlordId)
    downloadPostImagesAndSetPostPicturesPreview(landlordId, imagesData)
  }, [landlordId, imagesData])

  // TODO: duplicated in Picture.tsx
  // TODO: this is a bad mixup of getter and setter, a getter should not set.
  async function downloadPostImagesAndSetPostPicturesPreview(
    landlordId: string,
    imagesData: ImageData[]
  ) {
    try {
      const downloadPromises = imagesData.map(async (imageData: ImageData) => { 

        const { data: downloadData, error: downloadError } = await supabaseClient.storage
          .from('posts')
          .download(imageData.url)

          if (downloadError) {
            throw downloadError
          }
  
          if (downloadData) {
            const objectUrl = URL.createObjectURL(downloadData)
  
            // TODO: there was a reason i did it with object, should return it...
            return { url: objectUrl, id: imageData.id }
          }

            // const response = await axios.get(API_ROUTES.picture, { params: {
            //   bucketName: 'posts',
            //   imageName: imageData.url,
            // },        
            // responseType: 'blob' }) 
    
            // if (response.status === 200) {
              
            //   const buffer = await blobToBuffer(response.data)
            //   // conveting to the url format needed to display the preview image

            //   const previewDataUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`
    
            //   return { url: fullUrl, id: imageData.id };
            // } else {
            //   alert('Bad response');
            //   debugger;
            // }
    }) 

    const fullUrlsForPreview = await Promise.all(downloadPromises)
    
    setPostPicturesFullUrl(fullUrlsForPreview as ImageData[])

  } catch (error) {
      alert('error in downloadPostImagesAndSetPostPicturesPreview' + error) 
      throw error
    }
  }

  return (
    <div>
      <Card bg="light" style={{ width: '18rem' }}>
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          {postPicturesFullUrl[0] ? (
            <Image src={postPicturesFullUrl[0].url} alt='Thumbnail' height={100} width={100} />
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
                  {`${period.startDate} - ${period.endDate}`}
                  <br />
                  {`total days: ${countDays(period.startDate, period.endDate)}`}
                  <br />
                </React.Fragment>
              ))}
            </Card.Text>
            <hr />
          </div>
          {primaryUse === USER_TYPE.Housitter && (
            <div>
              {' '}
              <Card.Text>post by: {landlordFirstName}</Card.Text>
              <PictureBetter
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
