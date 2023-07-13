import React from 'react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'

import ReviewsOnSelectedUser from '../components/ReviewsOnSelectedUser'
import Picture from '../components/Picture'
import ImageCarousel from '../components/ImageCarousel'

import {
  selectAvailabilityState,
  selectFirstNameState,
  selectIsLoggedState,
  selectLastNameState,
  selectPrimaryUseState,
} from '../slices/userSlice'
import { selectClosedSitsState, setClosedSitsState } from '../slices/landlordSlice'
import {
  selectImagesUrlsState,
  selectDescriptionState,
  selectTitleState,
  selectLandlordAvatarUrlState,
  selectLocationState,
  selectDogsState,
  selectCatsState,
  selectLandlordFirstNameState,
  selectLandlordLastNameState,
} from '../slices/availablePostsSlice'

import { LocationDescriptions, UserType } from '../utils/constants'
import { ImageData, ClosedSit } from '../types/clientSide'

import { Button, ListGroup, Modal, Badge } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faCalendarCheck, faCat, faDog } from '@fortawesome/free-solid-svg-icons'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import DateDisplayer from '../components/utils/DateDisplayer'
import ContactFoundUser from '../components/Contact/ContactFoundUser'
import AddToFavourites from '../components/Contact/AddToFavourites'

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
  const availability = useSelector(selectAvailabilityState)

  const closedSits = useSelector(selectClosedSitsState)

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

  return (
    <div className="house-page">
      <Row>
        <ImageCarousel imagesData={postPicturesFullUrl} title={title} />
      </Row>
      <Row>
        <Col>
          <h1>{LocationDescriptions[location]}</h1>
        </Col>
        <Col>
          <div>
            {availability.map((period, index) => (
              <React.Fragment key={index}>
                <ListGroup>
                  <ListGroup.Item>
                    {userType === UserType.Landlord &&
                      (() => {
                        const closedPeriodIfExists = isClosedPeriod(period.startDate)
                        return closedPeriodIfExists ? (
                          <>
                            <Badge bg="success">Closed</Badge>
                            <FontAwesomeIcon icon={faCalendarCheck} style={{ color: 'green' }} />
                            <br />
                            This sit is set!
                            <br />
                            Your sitter: {closedPeriodIfExists.housitterFirstName}{' '}
                            {closedPeriodIfExists.housitterLastName}
                            {closedPeriodIfExists.housitterAvatarUrl && (
                              <Picture
                                isIntro={false}
                                uid={closedPeriodIfExists.housitterId}
                                primaryUse={UserType.Housitter}
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
                              variant="success"
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
                            <FontAwesomeIcon icon={faCalendar} style={{ color: 'grey' }} />
                            <Badge bg="success">Available</Badge>
                            <br />
                          </>
                        )
                      })()}

                    <DateDisplayer startDate={period.startDate} endDate={period.endDate} />

                    <br />
                  </ListGroup.Item>
                </ListGroup>
              </React.Fragment>
            ))}
          </div>
        </Col>
        <Col>
          <AddToFavourites favouriteUserId={landlordId} favouriteUserType={UserType.Landlord} />
        </Col>
      </Row>
      <hr />
      <Row>
        <Col>
          <FontAwesomeIcon icon={faDog} /> {dogs}
        </Col>
        <Col>
          <FontAwesomeIcon icon={faCat} /> {cats}
        </Col>
      </Row>
      <hr />
      <Row>{description}</Row>
      <hr />
      <Row>
        <Col>
          {' '}
          {landlordId && landlordAvatarUrl && (
            <>
              post by: {landlordFirstName}
              <Picture
                isAvatar={true}
                url={landlordAvatarUrl ? landlordAvatarUrl : 'no landlord avatar url - not valid'}
                email=""
                promptMessage=""
                isIntro={false}
                disableUpload={true}
                primaryUse={UserType.Landlord}
                uid={landlordId ? landlordId : 'no landlord uid - not valid'}
                size={100}
                width={100}
                height={100}
                bucketName="avatars"
                isRounded={true}
              />
            </>
          )}
        </Col>
        <Col>
          {' '}
          {
            <div>
              <ReviewsOnSelectedUser
                selectedUserId={landlordId}
                selectedUserFirstName={landlordFirstName}
                selectedUserLastName={landlordLastName}
                selectedUserType={UserType.Landlord}
              />
            </div>
          }
        </Col>
        <Col>
          {' '}
          {/* <MessageSender
            recipientFirstName={landlordFirstName}
            recipientLastName={landlordLastName}
            recipientUserId={landlordId}
            senderFirstName={userFirstName}
            senderLastName={userLastName}
            isChat={false}
          /> */}
          <ContactFoundUser recipientUserId={landlordId} />
        </Col>
      </Row>
    </div>
  )
}
