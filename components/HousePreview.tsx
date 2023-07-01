import { Button, ListGroup, Modal, Badge } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendar,
  faCalendarCheck,
  faCat,
  faDog,
  faDoorOpen,
} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Image from 'next/image'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectIsLoggedState, selectPrimaryUseState } from '../slices/userSlice'
import { LocationDescriptions, USER_TYPE, DefaultFavouriteUser } from '../utils/constants'
import { ImageData } from '../types/clientSide'
import Picture from './Picture'
import { selectClosedSitsState, setClosedSitsState } from '../slices/landlordSlice'
import { HousePreviewProps, ClosedSit } from '../types/clientSide'
import {
  selectLandlordAvatarUrlState,
  setLandlordAvatarUrlState,
  setLandlordFirstNameState,
  setLandlordLastNameState,
} from '../slices/availablePostsSlice'
import { RootState } from '../store'
import DateDisplayer from './utils/DateDisplayer'
import Link from 'next/link'

export default function HousePreview({
  landlordId,
  title,
  description,
  location,
  availability,
  dogs,
  cats,
  imagesUrls,
  addMissingDetailsHandler,
}: HousePreviewProps) {
  const supabaseClient = useSupabaseClient()
  const dispatch = useDispatch()

  const [postPicturesFullUrl, setPostPicturesFullUrl] = useState([] as ImageData[])
  const [showModal, setShowModal] = useState(false)
  const userType = useSelector(selectPrimaryUseState)

  const closedSits = useSelector(selectClosedSitsState)

  const isLogged = useSelector(selectIsLoggedState)

  const landlordAvatarUrl = useSelector((state: RootState) =>
    selectLandlordAvatarUrlState(state, landlordId)
  )

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
          .select('first_name, last_name, avatar_url')
          .eq('id', landlordId)
          .single()
        if (landlordError) {
          alert(`error loading landlord data: ${landlordError.message}`)
          debugger
          throw landlordError
        } else if (landlordData) {
          dispatch(
            setLandlordFirstNameState({ landlordId, landlordFirstName: landlordData.first_name })
          )

          dispatch(
            setLandlordLastNameState({ landlordId, landlordLastName: landlordData.last_name })
          )

          dispatch(
            setLandlordAvatarUrlState({ landlordId, landlordAvatarUrl: landlordData.avatar_url })
          )
        }

        // TODO: should not to do it by default, only if it's a landlord, and should filter out for sitter dashboard
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

          closedSitsData.forEach((closedSit: any) => {
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

          const closedSitsChanged =
            JSON.stringify(modifiedClosedSits) !== JSON.stringify(closedSits)

          if (closedSitsChanged) {
            dispatch(setClosedSitsState(modifiedClosedSits))
          }
        }
      } catch (e: any) {
        alert(e)
        debugger
        throw e
      }
    }
    loadLandlordData(landlordId)

    // const index = availablePosts.findIndex((post) => post.landlordId === landlordId)
    // if (index !== -1 && availablePosts[index].landlordId !== '') {
    //   loadLandlordData(supabaseClient, landlordId) // using another dispatch inside there
    // }
    downloadPostImagesAndSetPostPicturesPreview(landlordId, imagesUrls)
  }, [landlordId, imagesUrls, closedSits])

  // TODO: duplicated in Picture.tsx
  // TODO: this is a bad mixup of getter and setter, a getter should not set.
  async function downloadPostImagesAndSetPostPicturesPreview(
    landlordId: string,
    imagesUrls: ImageData[]
  ) {
    try {
      if (!isLogged || !imagesUrls) {
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
      alert('error downloading post images: ' + error)
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
    <div>
      <Card bg="light" style={{ width: '18rem' }}>
        <Card.Body className="text-center">
          <Card.Title>{title}</Card.Title>
          {postPicturesFullUrl[0] ? (
            <Image src={postPicturesFullUrl[0].url} alt="Thumbnail" height={100} width={100} />
          ) : userType === USER_TYPE.Landlord ? (
            <Button onClick={addMissingDetailsHandler!} variant="primary">
              add pictures
            </Button>
          ) : (
            'this house has no pictures yet'
          )}
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

          <Card.Text>{LocationDescriptions[location]}</Card.Text>
          <hr />
          <Card.Text>
            <FontAwesomeIcon icon={faDog} /> {dogs}
            <br />
            <FontAwesomeIcon icon={faCat} /> {cats}
          </Card.Text>
          <hr />

          <div>
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
                              <Badge bg="danger">Closed</Badge>
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
            <hr />
            <Link href={`/${landlordId}`}>
              <a className="house-preview">
                See More {'   '} <FontAwesomeIcon icon={faDoorOpen} /> <br />
                The Door Is Open
              </a>
            </Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
