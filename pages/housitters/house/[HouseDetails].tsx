import React from 'react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store'

import ReviewsOnSelectedUser from '../../../components/ReviewsOnSelectedUser'
import MessageSender from '../../../components/MessageSender'
import Picture from '../../../components/Picture'

import {
  selectAvailabilityState,
  selectFirstNameState,
  selectIsLoggedState,
  selectLastNameState,
  selectPrimaryUseState,
} from '../../../slices/userSlice'
import { selectClosedSitsState, setClosedSitsState } from '../../../slices/landlordSlice'
import availablePostsSlice, {
  selectAvailablePostsState,
  selectImagesUrlsState,
  selectDescriptionState,
  selectTitleState,
  selectLandlordAvatarUrlState,
  selectLocationState,
  selectDogsState,
  selectCatsState,
  selectLandlordFirstNameState,
  selectLandlordLastNameState,
  setLandlordAvatarUrlState,
} from '../../../slices/availablePostsSlice'

import { USER_TYPE } from '../../../utils/constants'
import { ImageData, ClosedSit } from '../../../types/clientSide'
import { countDays } from '../../../utils/dates'

import { Button, ListGroup, Modal, Badge } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faCalendarCheck } from '@fortawesome/free-solid-svg-icons'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

export default function HouseDetails() {
  const supabaseClient = useSupabaseClient()
  const dispatch = useDispatch()
  const router = useRouter()

  const { HouseDetails: landlordId } = router.query as { HouseDetails: string }
  if (!landlordId) {
    return null
  }

  const isLogged = useSelector(selectIsLoggedState)
  const userType = useSelector(selectPrimaryUseState)
  let userFirstName: string = useSelector(selectFirstNameState)
  let userLastName: string = useSelector(selectLastNameState)
  const availability = useSelector(selectAvailabilityState)

  const closedSits = useSelector(selectClosedSitsState)

  const availablePosts = useSelector(selectAvailablePostsState)

  const landlordAvatarUrl = useSelector((state: RootState) =>
    selectLandlordAvatarUrlState(state, landlordId as string)
  )

  const imagesData = useSelector((state: RootState) => selectImagesUrlsState(state, landlordId))

  const description = useSelector((state: RootState) => selectDescriptionState(state, landlordId))
  const title = useSelector((state: RootState) => selectTitleState(state, landlordId))
  const location = useSelector((state: RootState) => selectLocationState(state, landlordId))
  const dogs = useSelector((state: RootState) => selectDogsState(state, landlordId))
  const cats = useSelector((state: RootState) => selectCatsState(state, landlordId))
  const landlordFirstName = useSelector((state: RootState) =>
    selectLandlordFirstNameState(state, landlordId)
  )
  const landlordLastName = useSelector((state: RootState) =>
    selectLandlordLastNameState(state, landlordId)
  )

  // TODO: maybe better differentiate between the sitter/lord use cases, specifically for userFirstName
  const [postPicturesFullUrl, setPostPicturesFullUrl] = useState([] as ImageData[])
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

    downloadPostImagesAndSetPostPicturesPreview(landlordId, imagesData)
  }, [landlordId, closedSits])

  // TODO: duplicated in Picture.tsx
  // TODO: this is a bad mixup of getter and setter, a getter should not set.
  async function downloadPostImagesAndSetPostPicturesPreview(
    landlordId: string,
    imagesUrls: ImageData[]
  ) {
    try {
      if (!isLogged) {
        return
      }

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
      alert('error in downloadPostImagesAndSetPostPicturesPreview: ' + error)
      debugger
    }
  }

  function isClosedPeriod(currentPeriodStartDate: string) {
    return closedSits.find((closedSit) => closedSit.startDate === currentPeriodStartDate)
  }

  async function handleMySitterCancelled(
    e: any,
    props: {
      housitterId: string
      landlordId: string
      startDate: string
    }
  ) {
    const { housitterId, landlordId, startDate } = props

    const { error } = await supabaseClient
      .from('closed_sits')
      .delete()
      .eq('housitter_id', housitterId)
      .eq('landlord_id', landlordId)
      .eq('start_date', startDate)

    if (error) {
      alert(`error removing closed sit from db: ${error.message}`)
      debugger
      throw error
    }

    const modifiedClosedSits = [...closedSits]
    const indexOfRemovedSit = modifiedClosedSits.findIndex(
      (closedSit) => closedSit.startDate === startDate
    )

    modifiedClosedSits.splice(indexOfRemovedSit, 1)
    dispatch(setClosedSitsState(modifiedClosedSits))

    // TODO: add logic to send an email to housitters.com with the reason for cancellation, and if you feel it is too short notice and irresponsible we give the sitter a yellow card
  }

  console.log(`images: ${JSON.stringify(imagesData)}`)

  return (
    <div>
      <Card bg="light" style={{ width: '18rem' }}>
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          {postPicturesFullUrl[0] && postPicturesFullUrl[0].url ? (
            <Image src={postPicturesFullUrl[0].url} alt="Thumbnail" height={100} width={100} />
          ) : (
            'Loading Title Image'
          )}
          <>
            {postPicturesFullUrl.length > 1 ? (
              <Button onClick={handleModalOpen}>See More Pictures</Button>
            ) : (
              <Button disabled={true}>No Other Pictures</Button>
            )}
          </>

          <Modal show={showModal} onHide={handleModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>Additional Pictures</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row className="justify-content-center">
                {postPicturesFullUrl.map((imageData: ImageData, index: number) => (
                  <Col md={4} className="mb-4" key={index}>
                    <Image src={imageData.url} width={100} height={100} key={index} />
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
            {availability.map((period, index) => (
              <React.Fragment key={index}>
                <ListGroup>
                  <ListGroup.Item>
                    {userType === USER_TYPE.Landlord &&
                      (() => {
                        const closedPeriodIfExists = isClosedPeriod(period.startDate)
                        return closedPeriodIfExists ? (
                          <>
                            <Card.Text>
                              <Badge bg="success">Closed</Badge>
                              <FontAwesomeIcon icon={faCalendarCheck} style={{ color: 'green' }} />
                              <br />
                              This sit is set!
                              <br />
                              Your sitter: {closedPeriodIfExists.housitterFirstName}{' '}
                              {closedPeriodIfExists.housitterLastName}
                            </Card.Text>

                            {closedPeriodIfExists.housitterAvatarUrl && (
                              <Picture
                                isIntro={false}
                                uid={closedPeriodIfExists.housitterId}
                                primaryUse={USER_TYPE.Housitter}
                                url={closedPeriodIfExists.housitterAvatarUrl}
                                size={100}
                                width={100} // should persist dimensions of image upon upload
                                height={100}
                                disableUpload={true}
                                bucketName="avatars"
                                isAvatar={true}
                                promptMessage=""
                                email=""
                                isRounded={false}
                              />
                            )}
                            <br />
                            <Button
                              variant="danger"
                              onClick={(e) =>
                                handleMySitterCancelled(e, {
                                  housitterId: closedPeriodIfExists.housitterId,
                                  landlordId: landlordId,
                                  startDate: closedPeriodIfExists.startDate,
                                })
                              }
                            >
                              my sitter cancelled
                            </Button>
                          </>
                        ) : (
                          <>
                            <Badge bg="danger">Open</Badge>
                            <FontAwesomeIcon icon={faCalendar} style={{ color: 'grey' }} />
                            This sit is still open
                            <br />
                          </>
                        )
                      })()}

                    {`${period.startDate} - ${period.endDate}`}
                    <br />
                    {`total days: ${countDays(period.startDate, period.endDate)}`}
                    <br />
                  </ListGroup.Item>
                </ListGroup>
              </React.Fragment>
            ))}
            <hr />
          </div>
          {userType === USER_TYPE.Housitter && (
            <div>
              {landlordId && landlordAvatarUrl && (
                <>
                  <Card.Text>post by: {landlordFirstName}</Card.Text>
                  <Picture
                    isAvatar={true}
                    url={
                      landlordAvatarUrl ? landlordAvatarUrl : 'no landlord avatar url - not valid'
                    }
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
                    isRounded={true}
                  />
                </>
              )}
              <ReviewsOnSelectedUser
                selectedUserId={landlordId}
                selectedUserFirstName={landlordFirstName}
                selectedUserLastName={landlordLastName}
                selectedUserType={USER_TYPE.Landlord}
              />
              <MessageSender
                recipientFirstName={landlordFirstName}
                recipientLastName={landlordLastName}
                recipientUserId={landlordId}
                senderFirstName={userFirstName}
                senderLastName={userLastName}
                isChat={false}
              />
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
