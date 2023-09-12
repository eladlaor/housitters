import { Button, Modal, Badge, Col, Row, Spinner } from 'react-bootstrap'
import { useRouter } from 'next/router'
import Card from 'react-bootstrap/Card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCat, faDog } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Image from 'next/image'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectAvatarUrlState, selectPrimaryUseState } from '../slices/userSlice'
import ContactFoundUser from './Contact/ContactFoundUser'
import { LocationDescriptions } from '../utils/constants'
import { ImageData } from '../types/clientSide'
import { selectClosedSitsState, setClosedSitsState } from '../slices/landlordSlice'
import { HousePreviewProps } from '../types/clientSide'

import { getUrlFromSupabase, handleError } from '../utils/helpers'

import { countDays } from '../utils/dates'

export default function HousePreview({
  landlordId,
  title,
  location,
  dogs,
  cats,
  imagesUrls,
  addMissingDetailsHandler,
}: HousePreviewProps) {
  const supabaseClient = useSupabaseClient()
  const dispatch = useDispatch()
  const router = useRouter()

  const [postPicturesFullUrl, setPostPicturesFullUrl] = useState([] as ImageData[])
  const [showModal, setShowModal] = useState(false)

  // const closedSits = useSelector(selectClosedSitsState)

  const [dateRanges, setDateRanges] = useState([] as { startDate: string; endDate: string }[])
  const [duration, setDuration] = useState(1)

  const [landlordAvatarUrl, setLandlordAvatarUrlState] = useState('')

  function handleModalClose() {
    setShowModal(false)
  }

  useEffect(() => {
    if (landlordId) {
      const loadData = async () => {
        let profilesQuery = await supabaseClient
          .from('profiles')
          .select(`avatar_url`)
          .eq('id', landlordId)
          .single()

        const { error, data } = await profilesQuery
        if (error) {
          return handleError(error.message, 'HousePreview.useEffect')
        }

        if (data) {
          setLandlordAvatarUrlState(data.avatar_url)
        }

        const availabailityQuery = await supabaseClient
          .from('available_dates')
          .select(`start_date, end_date`)
          .eq(`user_id`, landlordId)

        const { error: availabilityError, data: availabilityData } = await availabailityQuery
        if (availabilityError) {
          return handleError(availabilityError.message, 'HousePreview.useEffect')
        }

        if (availabilityData) {
          let durationInDays = 0
          let modifiedDateRanges = [] as { startDate: string; endDate: string }[]
          for (const period of availabilityData) {
            durationInDays = durationInDays + countDays(period.start_date, period.end_date)
            modifiedDateRanges.push({ startDate: period.start_date, endDate: period.end_date })
          }
          setDateRanges(modifiedDateRanges)
          setDuration(durationInDays)
        }
      }

      loadData()
    }
  }, [landlordId])

  // function isClosedPeriod(currentPeriodStartDate: string) {
  //   return closedSits.find((closedSit) => closedSit.startDate === currentPeriodStartDate)
  // }

  // async function handleMySitterCancelled(
  //   e: React.FormEvent<HTMLFormElement>,
  //   props: {
  //     housitterId: string
  //     landlordId: string
  //     startDate: string
  //   }
  // ) {
  //   const { housitterId, landlordId, startDate } = props

  //   const { error } = await supabaseClient
  //     .from('closed_sits')
  //     .delete()
  //     .eq('housitter_id', housitterId)
  //     .eq('landlord_id', landlordId)
  //     .eq('start_date', startDate)

  //   if (error) {
  //     alert(`error removing closed sit from db: ${error.message}`)
  //     debugger
  //     throw error
  //   }

  //   const modifiedClosedSits = [...closedSits]
  //   const indexOfRemovedSit = modifiedClosedSits.findIndex(
  //     (closedSit) => closedSit.startDate === startDate
  //   )

  //   modifiedClosedSits.splice(indexOfRemovedSit, 1)
  //   dispatch(setClosedSitsState(modifiedClosedSits))

  //   // TODO: add logic to send an email to housitters.com with the reason for cancellation, and if you feel it is too short notice and irresponsible we give the sitter a yellow card
  // }

  return (
    <Card className="house-preview">
      {landlordAvatarUrl ? (
        <Card.Img
          variant="top"
          src={
            imagesUrls[0]?.url
              ? getUrlFromSupabase(landlordId + '-' + imagesUrls[0]?.url, 'posts')
              : getUrlFromSupabase(landlordAvatarUrl, 'avatars')
          }
        />
      ) : (
        <Spinner />
      )}
      <div className="image-details">
        <Badge>{LocationDescriptions[location]}</Badge>
        <br />
        {!!dogs && (
          <Badge>
            <FontAwesomeIcon icon={faDog} /> {dogs}
          </Badge>
        )}

        {!!cats && (
          <Badge className="ms-1">
            <FontAwesomeIcon icon={faCat} /> {cats}
          </Badge>
        )}
        <br />
        {duration !== 0 &&
          dateRanges?.map((period, index) => <Badge key={index}>{period.startDate}</Badge>)}
        {duration !== 0 && <br />}
        <Badge>{duration ? `${duration} days` : 'flexible'}</Badge>
      </div>
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        {/* {imagesUrls[0]?.url ? ( */}
        {/*   <img */}
        {/*     src={getUrlFromSupabase(landlordId + '-' + imagesUrls[0]?.url, 'posts')} */}
        {/*     alt="Thumbnail" */}
        {/*     height={100} */}
        {/*     width={100} */}
        {/*   /> */}
        {/* ) : userType === UserType.Landlord ? ( */}
        {/*   <Button onClick={addMissingDetailsHandler!} variant="primary"> */}
        {/*     add pictures */}
        {/*   </Button> */}
        {/* ) : ( */}
        {/*   'this house has no pictures yet' */}
        {/* )} */}
        {/* availability.map((period, index) => (
          <React.Fragment key={index}>
            <ul>
              <li>
                {userType === UserType.Landlord &&
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
              </li>
            </ul>
          </React.Fragment>
        ))*/}
        <Row className="mt-3">
          <Col xs={6}>
            <Button
              variant="outline-primary"
              size="sm"
              className="w-100"
              onClick={() => {
                router.push(`/houses/${landlordId}`)
              }}
            >
              Details
            </Button>
          </Col>
          <Col xs={6}>
            <ContactFoundUser size="sm" className="w-100" recipientUserId={landlordId} />
          </Col>
        </Row>
      </Card.Body>
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
    </Card>
  )
}
