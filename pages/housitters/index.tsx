import { useRouter } from 'next/router'
import {
  selectAvatarUrlState,
  selectFirstNameState,
  selectIsLoggedState,
  selectLastNameState,
  setAvatarUrl,
  setFirstName,
} from '../../slices/userSlice'

import { LocationDescriptions } from '../../utils/constants'
import { ClosedSit, DbAvailableHousitter, DefaultAvailablePostType } from '../../types/clientSide'
import { UserType, DefaultFavouriteUser, PageRoutes } from '../../utils/constants'
import { Button, Form, Modal, Card, Dropdown } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import { selectAvailabilityState } from '../../slices/userSlice'
import {
  selectClosedSitsState,
  selectLocationState,
  selectPetsState,
  setClosedSitsState,
  setLocationState,
  setPetsState,
} from '../../slices/landlordSlice'
import {
  selectImagesUrlsState,
  selectDescriptionState,
  selectIsActiveState,
  selectTitleState,
} from '../../slices/createPostSlice'

import { selectAllFavouriteUsers, setAllFavouriteUsers } from '../../slices/favouritesSlice'

import { Col, Container, Row } from 'react-bootstrap'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import AvailableHousitter from '../../components/AvailableHousitter'
import Image from 'next/image'

import SidebarFilter from '../../components/SidebarFilter'
import Accordion from 'react-bootstrap/Accordion'
import { ImageData } from '../../types/clientSide'

import { blobToBuffer } from '../../utils/files'
import { handleError } from '../../utils/helpers'
import AvailabilitySelector from '../../components/AvailabilitySelector'

export default function Home() {
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const userType = router.query.userType // TODO: what if the user navigates here directly not via login. This value should be retrieved from db.

  const dispatch = useDispatch()
  const firstName = useSelector(selectFirstNameState)
  const lastName = useSelector(selectLastNameState)
  const avatarUrl = useSelector(selectAvatarUrlState)
  const availability = useSelector(selectAvailabilityState)

  const [dateRange, setDateRange] = useState([null, null] as (null | Date)[])
  const [startDate, endDate] = dateRange
  const [location, setLocation] = useState(null as null | string)

  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [showFoundSitterModal, setShowFoundSitterModal] = useState(false)
  const [postPreviewDataUrls, setPostPreviewDataUrls] = useState([] as ImageData[])
  const [housitters, setHousitters] = useState([{} as any]) // TODO: lets improve this type
  const [selectedHousitterId, setSelectedHousitterId] = useState('' as string)
  const [isThereAnySelectedSitter, setIsThereAnySelectedSitter] = useState(false)
  const [
    preConfirmedSelectionOfClosedSitsPerSitter,
    setPreConfirmedSelectionOfClosedSitsPerSitter,
  ] = useState({
    housitterId: '',
    startDates: [],
  } as {
    housitterId: string
    startDates: string[]
  })

  const isActivePost = useSelector(selectIsActiveState)
  const title = useSelector(selectTitleState)
  const description = useSelector(selectDescriptionState)
  const fileNames = useSelector(selectImagesUrlsState)
  const oldLocation = useSelector(selectLocationState)
  const pets = useSelector(selectPetsState)
  const closedSits = useSelector(selectClosedSitsState)

  const isAfterSignup = router.query.isAfterSignup

  const favouriteUsers = useSelector(selectAllFavouriteUsers)

  useEffect(() => {
    if (!user) {
      router.push('/')
    } else {
      const getData = async () => {
        let query = supabaseClient
          .from('profiles')
          .select(
            `id, first_name, last_name, avatar_url, housitters!inner (
            id, locations, experience, about_me
          ), available_dates!inner (user_id, start_date, end_date)`
          )
          .eq('primary_use', 'housitter')
          .contains('housitters.locations', [location])

        let { data: housitterData, error: housitterError } = await query

        if (housitterError) {
          return handleError(housitterError.message, 'housitters.index.useEffect')
        }

        let availableHousitter: DbAvailableHousitter
        let availableHousitters: (typeof availableHousitter)[] = []

        if (housitterData) {
          for (const housitter of housitterData) {
            let currentSitterAvailability: any[] = []
            currentSitterAvailability = (
              housitter.available_dates as { start_date: string; end_date: string }[]
            ).map(({ start_date, end_date }: { start_date: string; end_date: string }) => ({
              startDate: new Date(start_date),
              endDate: new Date(end_date),
            }))

            availableHousitter = {
              firstName: housitter.first_name,
              lastName: housitter.last_name,
              housitterId: housitter.id,
              avatarUrl: housitter.avatar_url,
              availability: currentSitterAvailability,
              locations: [],
              experience: 0,
              about_me: '',
            }

            // shouldn't be an array, but due to some supabase inconsistency, this is here as a safeguard
            if (Array.isArray(housitter.housitters)) {
              availableHousitter.locations = housitter.housitters[0].locations
              availableHousitter.experience = housitter?.housitters[0].experience
              availableHousitter.about_me = housitter?.housitters[0].about_me
            } else {
              availableHousitter.locations = housitter.housitters?.locations
              availableHousitter.experience = housitter?.housitters?.experience
              availableHousitter.about_me = housitter?.housitters?.about_me
            }

            availableHousitters.push(availableHousitter)
          }

          if (startDate && endDate) {
            availableHousitters = availableHousitters.filter((sitter) =>
              sitter.availability.some(
                (availability) =>
                  availability.startDate <= startDate && availability.endDate >= endDate
              )
            )
          }

          setHousitters(availableHousitters)
        }
      }

      getData().catch((e) => {
        console.log(e.message)
      })
    }
  }, [user, availability, location, isActivePost, dateRange])

  // async function handleShowNewPostModal() {
  //   if (fileNames.length > 0) {
  //     await loadPostPreviewImages()
  //   }
  //   setShowNewPostModal(true)
  // }

  function handleCloseNoewPostModal() {
    setPostPreviewDataUrls([])
    setShowNewPostModal(false)
  }

  // TODO: should paramterize to load any kind of image
  async function loadPostPreviewImages() {
    let previews: ImageData[] = []
    const downloadPromises = fileNames.map(async (fileName) => {
      let { error, data: imageData } = await supabaseClient.storage
        .from('posts')
        .download(`${user?.id}-${fileName.url}`)
      if (error) {
        console.log(`failed downloading preview image: ${error.message}`)
        throw error
      } else if (imageData) {
        const buffer = await blobToBuffer(imageData)
        const previewDataUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`
        previews.push({ url: previewDataUrl, id: fileName.id })
      }
    })

    await Promise.all(downloadPromises)
    setPostPreviewDataUrls(previews)
  }

  function handleFoundSitter(e: any) {
    e.preventDefault()
    setShowFoundSitterModal(true)
  }

  function handleSelectedFoundSitter(e: any) {
    e.preventDefault()

    setIsThereAnySelectedSitter(true)

    // knowingly, this is a bit of a strange workaround, but it seems that even though the order of operations are fine, still - the checkbox 'checked' prop is not able to successfuly get the 'true' value in isThisSelectedSitter.
    const sitterId = e.target.value
    setTimeout(() => {
      setSelectedHousitterId(sitterId)
      setPreConfirmedSelectionOfClosedSitsPerSitter({
        housitterId: sitterId,
        startDates: [...preConfirmedSelectionOfClosedSitsPerSitter.startDates],
      })
    }, 0)
  }

  async function handleConfirmSitterSelection(e: any) {
    e.preventDefault()
    let confirmedClosedSitsToUpdate: ClosedSit[] = []

    // for...of will ensure that each iteration will begin after the previous async operation completed
    for (const startDate of preConfirmedSelectionOfClosedSitsPerSitter.startDates) {
      const { error } = await supabaseClient.from('closed_sits').upsert({
        landlord_id: user?.id,
        housitter_id: selectedHousitterId,
        start_date: startDate,
      })

      if (error) {
        console.log(`error upserting closed sit for date:${startDate}. Error: ${error.message}`)
        debugger
        throw error
      }

      confirmedClosedSitsToUpdate.push({
        housitterId: selectedHousitterId,
        housitterAvatarUrl: '',
        housitterFirstName: '',
        housitterLastName: '',
        startDate: startDate,
      })
    }

    dispatch(setClosedSitsState(confirmedClosedSitsToUpdate))
    setPreConfirmedSelectionOfClosedSitsPerSitter({ housitterId: '', startDates: [] })

    console.log(`successfuly closed sit`)
    setShowFoundSitterModal(false)
  }

  function sortHousitters(sortByProperty: string, sortOrder: string) {
    let sortedHousitters: any[] = [...housitters]
    if (typeof sortedHousitters[0][sortByProperty] === 'string') {
      if (sortOrder === 'asc') {
        sortedHousitters.sort((a, b) => a[sortByProperty].localeCompare(b[sortByProperty]))
      } else {
        sortedHousitters.sort((a, b) => b[sortByProperty].localeCompare(a[sortByProperty]))
      }
    } else {
      if (sortOrder === 'asc') {
        sortedHousitters.sort((a, b) => a[sortByProperty] - b[sortByProperty])
      } else {
        sortedHousitters.sort((a, b) => b[sortByProperty] - a[sortByProperty])
      }
    }

    setHousitters(sortedHousitters)
  }

  async function handleBindSitterWithPeriod(e: any) {
    e.preventDefault()

    const preConfirmedStartPeriodsToModify = [
      ...preConfirmedSelectionOfClosedSitsPerSitter.startDates,
    ]
    const selectedStartDate = e.target.value
    const indexOfSelectedStartDate = preConfirmedStartPeriodsToModify.indexOf(selectedStartDate)

    if (indexOfSelectedStartDate === -1) {
      preConfirmedStartPeriodsToModify.push(selectedStartDate)
    } else {
      preConfirmedStartPeriodsToModify.splice(indexOfSelectedStartDate, 1)
    }

    // again, strangely, the code seems to be structured properly in terms of order of operations, but still setTimeout seems to be the only solution for the race condition
    setTimeout(() => {
      setPreConfirmedSelectionOfClosedSitsPerSitter({
        housitterId: selectedHousitterId,
        startDates: preConfirmedStartPeriodsToModify,
      })
    }, 0)
  }

  return (
    <Container>
      <h2>Looking for a house-sitter?</h2>
      <h5>There are currently {housitters.length} available sitters for you.</h5>

      <Row>
        <Col md={3}>
          {userType === UserType.Landlord && (
            <Card className="sidebar-filter">
              {isActivePost ? (
                <div>
                  <Accordion>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>My Post</Accordion.Header>
                      <Accordion.Body></Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </div>
              ) : (
                <p style={{ marginBottom: 0 }}>
                  💡 Try&nbsp;
                  <strong
                    onClick={() => {
                      router.push(PageRoutes.HousitterRoutes.EditHouse)
                    }}
                    style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    completing your post
                  </strong>
                  &nbsp;to increase your chances of finding a sitter!
                </p>
              )}
            </Card>
          )}
          <Card className="sidebar-filter">
            <h4>Dates</h4>
            {/* <DatePicker
              className="w-100"
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              placeholderText="Anytime"
              onChange={(update) => {
                setDateRange(update)
              }}
              isClearable={true}
            /> */}
            {availability.map((period, index) => (
              <AvailabilitySelector
                key={index}
                period={period}
                index={index}
                updateDbInstantly={true}
              />
            ))}
            <h4>Location</h4>
            <Dropdown>
              <Dropdown.Toggle variant="success">
                {location ? LocationDescriptions[location] : 'Anywhere'}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setLocation(null)}>Anywhere</Dropdown.Item>
                <Dropdown.Divider />
                {Object.entries(LocationDescriptions).map(([key, value]) => (
                  <Dropdown.Item key={key} onClick={() => setLocation(key)}>
                    {value}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <h4>Sort</h4>
            <SidebarFilter
              isHousitter={false}
              showCustomLocations={true}
              selectionType="radio"
              sortElementsHandler={sortHousitters}
            />
          </Card>
        </Col>

        <Col md={9} style={{ paddingRight: '30px' }}>
          <Row>
            {housitters.length == 0 ? (
              <p style={{ marginTop: '2rem', fontSize: '1.5rem', textAlign: 'center' }}>
                😢
                <br />
                Sorry, but there are no sitters matching your search. Please try adjusting your
                filters.
              </p>
            ) : (
              housitters.map(
                (
                  sitter: any,
                  index: number // TODO: type 'sitter' with a new type of Db housitterdata
                ) => (
                  <AvailableHousitter
                    housitterId={sitter.housitterId}
                    firstName={sitter.firstName}
                    lastName={sitter.lastName}
                    experience={sitter.experience}
                    about_me={
                      sitter.about_me
                        ? sitter.about_me
                        : `${sitter.firstName} didn't write a bio yet`
                    }
                    avatarUrl={sitter.avatarUrl}
                    key={index}
                  />
                )
              )
            )}
          </Row>
        </Col>
      </Row>
    </Container>
  )
}
