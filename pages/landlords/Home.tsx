import { useRouter } from 'next/router'
import GoToProfileButton from '../../components/GoToProfileButton'
import {
  selectAvatarUrlState,
  selectFirstNameState,
  selectIsLoggedState,
  setAvatarUrl,
  setFirstName,
} from '../../slices/userSlice'
import { LANDLORDS_ROUTES, LocationIds, USER_TYPE } from '../../utils/constants'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { useDispatch, useSelector } from 'react-redux'
import Modal from 'react-bootstrap/Modal'
import { useEffect, useState } from 'react'
import { selectAvailabilityState, setAvailability } from '../../slices/userSlice'
import {
  selectClosedSitsState,
  selectLocationState,
  selectPetsState,
  setLocationState,
  setPetsState,
} from '../../slices/landlordSlice'
import {
  selectImagesUrlsState,
  selectDescriptionState,
  selectIsActiveState,
  selectTitleState,
  setImagesUrlsState,
  setDescriptionState,
  setIsActiveState,
  setTitleState,
} from '../../slices/postSlice'
import AvailabilitySelector from '../../components/AvailabilitySelector'
import SignOut from '../../components/Buttons/SignOut'
import { Dropdown, DropdownButton, FormControl, ListGroup, ListGroupItem } from 'react-bootstrap'
import PetsCounter from '../../components/PetsCounter'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import AvailableHousitter from '../../components/AvailableHousitter'
import Image from 'next/image'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import SidebarFilter from '../../components/SidebarFilter'
import HousePost from '../../components/HousePost'
import Accordion from 'react-bootstrap/Accordion'
import { ImageData } from '../../types/clientSide'
import Picture from '../../components/Picture'
import { blobToBuffer, removeInvalidCharacters, resizeImage } from '../../utils/files'
import Alert from 'react-bootstrap/Alert'

export default function Home() {
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const router = useRouter()

  const dispatch = useDispatch()
  const firstName = useSelector(selectFirstNameState)
  const availability = useSelector(selectAvailabilityState)

  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [showFoundSitterModal, setShowFoundSitterModal] = useState(false)
  const [showSitterSelectionVerification, setShowSitterSelectionVerification] = useState(false)
  const [postPreviewDataUrls, setPostPreviewDataUrls] = useState([] as ImageData[])
  const [housitters, setHousitters] = useState([{} as any]) // TODO: lets improve this type
  const [selectedHousitterId, setSelectedHousitterId] = useState('' as string)
  const [isThereAnySelectedSitter, setIsThereAnySelectedSitter] = useState(false)
  const [closedSit, setClosedSit] = useState({
    housitterId: selectedHousitterId,
    startDates: [] as string[],
  })

  const isActivePost = useSelector(selectIsActiveState)
  const title = useSelector(selectTitleState)
  const description = useSelector(selectDescriptionState)
  const fileNames = useSelector(selectImagesUrlsState)
  const avatarUrl = useSelector(selectAvatarUrlState)
  const location = useSelector(selectLocationState)
  const isLogged = useSelector(selectIsLoggedState)
  const pets = useSelector(selectPetsState)
  const closedSits = useSelector(selectClosedSitsState)

  useEffect(() => {
    // TODO: read about reading foreign tables. https://supabase.com/docs/reference/javascript/select
    // definitely seems like it would be a better way to implement it, in one call to the server.

    // search Filter Foreign Tables https://supabase.com/docs/reference/javascript/using-filters

    if (user) {
      const asyncWrapper = async () => {
        const isAfterSignup = router.query.isAfterSignup
        if (isAfterSignup) {
          console.log('is after signup')
        }

        let { data: landlordData, error: landlordError } = await supabaseClient
          .from('landlords')
          .select(
            `location, profiles!inner (
            first_name, avatar_url, available_dates!inner (start_date, end_date, period_index), pets!inner (dogs, cats)
          )`
          )
          .eq('user_id', user.id)
          .single()

        if (landlordError) {
          alert('error when querying landlords table in landlords home' + landlordError.message)
        } else if (landlordData && landlordData.profiles) {
          const newLocation = landlordData.location
          const locationChanged = JSON.stringify(location) !== JSON.stringify(newLocation)
          if (locationChanged && isLogged) {
            dispatch(setLocationState(landlordData.location))
          }

          dispatch(setAvatarUrl((landlordData.profiles as any).avatar_url))

          // TODO: lets import the needed type from supabase types and use instead of any.
          dispatch(
            setPetsState({
              dogs: (landlordData.profiles as any).pets.dogs,
              cats: (landlordData.profiles as any).pets.cats,
            })
          )
          dispatch(setFirstName((landlordData.profiles as { first_name: string }).first_name))
        }

        let { data: activePostData, error: postsError } = await supabaseClient
          .from('posts')
          .select(`description, images_urls, title`)
          .eq('landlord_id', user.id)
          .eq('is_active', true)
        // not using single() filter to prevent 0 rows error when no active post

        if (postsError) {
          alert(`error fetching active posts in landlords/Home: ${postsError.message}`)
          throw postsError
        }

        if (activePostData && activePostData[0]) {
          // never more than a single result
          const activePost = activePostData[0] // TODO:
          dispatch(setIsActiveState(true))
          const imagesUrlData: ImageData[] = []

          activePost.images_urls.forEach((postImagesUrl: string, index: number) => {
            imagesUrlData.push({
              url: postImagesUrl,
              id: index,
            })
          })

          // TODO: maybe create a utility which gets a property, checks if it's different, and only then dispatches.
          dispatch(setImagesUrlsState(imagesUrlData))
          dispatch(setDescriptionState(activePost.description))
          dispatch(setTitleState(activePost.title))
        }

        if (!isActivePost) {
          // returning all post slice to initial state except isActive, because of race condition with the above
          dispatch(setDescriptionState(''))
          dispatch(setTitleState(''))
          dispatch(setImagesUrlsState([])), setPostPreviewDataUrls([])
          setHousitters([])
          console.log('no active post, returning')
          return
        }

        let { data: housitterData, error: housitterError } = await supabaseClient
          .from('profiles')
          .select(
            `id, first_name, last_name, avatar_url, housitters!inner (
            id, locations, experience
          ), available_dates!inner (user_id, start_date, end_date)`
          )
          .eq('primary_use', 'housitter')
          .contains('housitters.locations', [location])

        // filtering by availability, maybe there's a way to filter by availability on server-side?
        // meanwhile we'll do it client side, using user_id to kind of join the dates with the relavant sitter.
        // maybe there's a server-side solution, which will be better.

        // TODO: check what you get at the response obj, when you have multiple housitters corresponsding to the location

        if (housitterError) {
          alert(
            'error when querying housitters from profiles in landlords home' +
              housitterError.message
          )
        }

        let availableHousitters: {
          firstName: string
          lastName: string
          housitterId: string
          avatarUrl: string
          locations: string[]
          availability: { startDate: Date; endDate: Date }[]
        }[] = []

        if (housitterData) {
          for (const housitter of housitterData) {
            let currentSitterAvailability: any[] = []
            currentSitterAvailability = (
              housitter.available_dates as { start_date: string; end_date: string }[]
            ).map(({ start_date, end_date }: { start_date: string; end_date: string }) => ({
              startDate: new Date(start_date),
              endDate: new Date(end_date),
            }))

            availableHousitters.push({
              firstName: housitter.first_name,
              lastName: housitter.last_name,
              housitterId: housitter.id,
              avatarUrl: housitter.avatar_url,
              availability: currentSitterAvailability,
              locations: Array.isArray(housitter.housitters)
                ? housitter.housitters[0].locations
                : housitter.housitters?.locations,
            })

            availableHousitters = availableHousitters.filter((sitter) => {
              return sitter.availability.some((sitterPeriod) => {
                return availability.some((landlordPeriod) => {
                  const landlordStartDateAsDate = new Date(landlordPeriod.startDate)
                  const landlordEndDateAsDate = new Date(landlordPeriod.endDate)

                  return (
                    landlordPeriod.endDate.startsWith('1970') ||
                    sitterPeriod.endDate.getFullYear().toString() == '1970' ||
                    (landlordStartDateAsDate >= sitterPeriod.startDate &&
                      landlordEndDateAsDate <= sitterPeriod.endDate)
                  )
                })
              })
            })
          }

          setHousitters(availableHousitters)
        }
      }

      asyncWrapper().catch((e) => {
        alert(e.message)
      })
    }
  }, [user, availability, location, isActivePost])

  // TODO: should move about_me text to the housitters table.

  function handleLocationSelection(key: string | null) {
    setLocationState(key ? key : '')
  }

  async function handleShowNewPostModal() {
    if (fileNames.length > 0) {
      await loadPostPreviewImages()
    }
    setShowNewPostModal(true)
  }

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
        alert(`failed downloading preview image: ${error.message}`)
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

  async function onPostImageSelection(event: any) {
    try {
      // setUploadingImage(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      for (const file of event.target.files) {
        const fileName = removeInvalidCharacters(file.name)
        const resizedImage = await resizeImage(file, 1920, 1080)

        let { error: uploadError } = await supabaseClient.storage
          .from('posts')
          .upload(`${user?.id}-${fileName}`, resizedImage, { upsert: true })

        if (uploadError) {
          alert(`error in landlords/Home trying to upload an image to storage ` + uploadError)
          throw uploadError
        }

        const buffer = await blobToBuffer(resizedImage)
        const previewDataUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`
        const updatedPreviews = [
          ...postPreviewDataUrls,
          { url: previewDataUrl, id: postPreviewDataUrls.length },
        ]

        setPostPreviewDataUrls(updatedPreviews)

        const updatedFileNames = [...fileNames, { url: fileName, id: fileNames.length }]
        dispatch(setImagesUrlsState(updatedFileNames)) // TODO: rename. this is for db, to retrieve later.
      }
    } catch (e: any) {
      alert(e)
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault()

    // TODO: deal with multiple availabilities

    let { error: postUploadError } = await supabaseClient.from('posts').upsert({
      landlord_id: user?.id,
      title,
      description,
      images_urls: fileNames.map((file) => file.url), // TODO: rename in db AND fix the update scenario.
      is_active: true,
    })

    if (postUploadError) {
      alert('error updating images urls in db: ' + postUploadError.message)
      throw postUploadError
    }

    // TODO: should probably get created_at also, and use it also as a primary key, to allow multiple past posts.
    let { error: petUploadError } = await supabaseClient.from('pets').upsert({
      user_id: user?.id,
      dogs: pets.dogs,
      cats: pets.cats,
    })

    if (petUploadError) {
      alert('error upserting pets: ' + petUploadError.message)
    }

    dispatch(setIsActiveState(true))

    alert('submitted successfully')
    setShowNewPostModal(false)
  }

  async function handleDeleteImage(previewData: ImageData, e: any) {
    e.preventDefault()
    let copyOfImagesUrls = [...postPreviewDataUrls]
    copyOfImagesUrls = copyOfImagesUrls.filter((img: ImageData) => img.url !== previewData.url)

    let copyOfFileNames = [...fileNames]
    copyOfFileNames = copyOfFileNames.filter(
      (imageData: ImageData) => imageData.id != previewData.id
    )

    setPostPreviewDataUrls(copyOfImagesUrls)
    dispatch(setImagesUrlsState(copyOfFileNames))
  }

  async function handleDeletePost(e: any) {
    let { error } = await supabaseClient
      .from('posts')
      .delete()
      .eq('landlord_id', user?.id)
      .eq('is_active', true)

    if (error) {
      alert(`error deleting post: ${error.message}`)
      throw error
    }

    dispatch(setIsActiveState(false))
    alert('successfully deleted the post')
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
      setClosedSit({ ...closedSit, housitterId: sitterId })
    }, 0)
  }

  async function handleConfirmSitterSelection(e: any) {
    e.preventDefault()
    closedSit.startDates.forEach(async (startDate) => {
      const { error } = await supabaseClient.from('closed_sits').upsert({
        landlord_id: user?.id,
        housitter_id: selectedHousitterId,
        start_date: startDate,
      })

      if (error) {
        alert(`error upserting closed sit for date:${startDate}. Error: ${error.message}`)
        debugger
        throw error
      }
    })

    alert(`successfuly closed sit`)
    setShowFoundSitterModal(false)
  }

  async function handleBindSitterWithPeriod(e: any) {
    e.preventDefault()

    const startPeriodsToModify = [...closedSit.startDates]
    const selectedStartDate = e.target.value
    const indexOfSelectedStartDate = startPeriodsToModify.indexOf(selectedStartDate)

    if (indexOfSelectedStartDate === -1) {
      startPeriodsToModify.push(selectedStartDate)
    } else {
      startPeriodsToModify.splice(indexOfSelectedStartDate, 1)
    }

    // again, strangely, the code seems to be structured properly in terms of order of operations, but still setTimeout seems to be the only solution for the race condition
    setTimeout(() => {
      setClosedSit({
        housitterId: selectedHousitterId,
        startDates: startPeriodsToModify,
      })
    }, 0)
  }

  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand className="mr-auto" href="#">
          Housitters
        </Navbar.Brand>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <NavDropdown title="My Profile" id="basic-nav-dropdown">
              <NavDropdown.Item href={LANDLORDS_ROUTES.ACCOUNT}>Edit Profile</NavDropdown.Item>
              <SignOut />
            </NavDropdown>
            <Nav.Link href="#available-housitters">Available Housitters</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <div className="container">
        <div>
          <h1>Mazal tov {firstName} on your upcoming vacation!</h1>
          {user && (
            <Picture
              isIntro={false}
              uid={user.id}
              url={avatarUrl}
              email={user.email as string}
              primaryUse={USER_TYPE.Landlord}
              size={100}
              width={100} // should persist dimensions of image upon upload
              height={100}
              disableUpload={true}
              bucketName="avatars"
              isAvatar={true}
              promptMessage=""
            />
          )}
        </div>
        {isActivePost ? (
          <div>
            <h1>here is your current post</h1>
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>My Active Post</Accordion.Header>
                <Accordion.Body>
                  <HousePost
                    landlordId={user ? user.id : ''}
                    title={title}
                    description={description}
                    location={location}
                    availability={availability}
                    dogs={pets.dogs}
                    cats={pets.cats}
                    imagesUrls={fileNames} // TODO: should have default image
                  />
                  <Button variant="danger" onClick={(e) => handleDeletePost(e)}>
                    Delete post
                  </Button>
                  <Button variant="success" onClick={handleFoundSitter}>
                    I found a sitter
                  </Button>
                  <Modal show={showFoundSitterModal} onHide={() => setShowFoundSitterModal(false)}>
                    <Modal.Header>
                      <Modal.Title>Select the sitter you found</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div>
                        <Form>
                          {housitters.map((sitter: any, index: number) => {
                            const isThisTheSelectedHousitter =
                              sitter.housitterId === selectedHousitterId

                            return (
                              <div key={index}>
                                <Form.Group>
                                  <Form.Check
                                    type="radio"
                                    key={index}
                                    onChange={handleSelectedFoundSitter}
                                    value={sitter.housitterId}
                                    label={`${sitter.firstName} ${sitter.lastName}`}
                                    name="singleSitterChoice"
                                    checked={isThisTheSelectedHousitter}
                                  />
                                  {isThereAnySelectedSitter && isThisTheSelectedHousitter && (
                                    <ListGroup>
                                      <ListGroup.Item>
                                        {availability.map((period, index) => {
                                          const startDateAsString = period.startDate.toString()
                                          if (
                                            !closedSits.find(
                                              (closedSit) =>
                                                closedSit.startDate === startDateAsString
                                            )
                                          ) {
                                            return (
                                              <Form.Check
                                                type="checkbox"
                                                key={index}
                                                label={`${startDateAsString} until ${period.endDate.toString()}`}
                                                name={startDateAsString}
                                                value={startDateAsString}
                                                onChange={handleBindSitterWithPeriod}
                                                checked={closedSit.startDates.includes(
                                                  startDateAsString
                                                )}
                                              />
                                            )
                                          }
                                        })}
                                      </ListGroup.Item>
                                    </ListGroup>
                                  )}
                                </Form.Group>
                              </div>
                            )
                          })}
                          <hr />
                          <Button variant="primary" onClick={handleConfirmSitterSelection}>
                            Confirm
                          </Button>
                          <Button
                            type="submit"
                            variant="warning"
                            onClick={(e) => {
                              e.preventDefault()
                              setShowFoundSitterModal(false)
                            }}
                          >
                            Cancel
                          </Button>
                        </Form>
                      </div>
                    </Modal.Body>
                  </Modal>
                  <Button onClick={handleShowNewPostModal}>Edit Post</Button>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
        ) : (
          <div>
            <Button
              style={{ position: 'relative', left: '50%', transform: 'translateX(-50%)' }}
              variant="primary"
              onClick={handleShowNewPostModal}
            >
              Create new post
            </Button>
            <br />
            <br />
          </div>
        )}

        <div>
          <Modal show={showNewPostModal} onHide={handleCloseNoewPostModal}>
            <Modal.Header closeButton>
              <Modal.Title style={{ color: 'blue' }}>lets create new post</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group>
                  <Form.Label>availability</Form.Label>

                  {availability.map((period, index) => (
                    <AvailabilitySelector
                      key={index}
                      period={period}
                      index={index}
                      updateDbInstantly={true}
                    />
                  ))}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Location</Form.Label>
                  <DropdownButton
                    id="dropdown-basic-button"
                    title={location}
                    onSelect={handleLocationSelection}
                  >
                    <Dropdown.Item eventKey={LocationIds.Abroad}>
                      {LocationIds.Abroad}
                    </Dropdown.Item>
                    <Dropdown.Item eventKey={LocationIds.TelAviv}>
                      {LocationIds.TelAviv}
                    </Dropdown.Item>
                    <Dropdown.Item eventKey={LocationIds.Eilat}>{LocationIds.Eilat}</Dropdown.Item>
                  </DropdownButton>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Pets</Form.Label>
                  <PetsCounter />
                </Form.Group>
                <Form.Group>
                  <Form.Group>
                    <Form.Label>this could be title</Form.Label>
                    <FormControl
                      type="text"
                      value={title}
                      onChange={(e) => {
                        dispatch(setTitleState(e.target.value))
                      }}
                    />
                  </Form.Group>
                  <h1>Description</h1>
                  <Form.Control
                    className="text-end"
                    size="sm"
                    as="textarea"
                    rows={5}
                    value={description}
                    onChange={(e) => {
                      dispatch(setDescriptionState(e.target.value))
                    }}
                  ></Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Upload some pics </Form.Label>
                  <input
                    onChange={onPostImageSelection}
                    type="file"
                    name="file"
                    accept="image/*"
                    multiple
                  />

                  {postPreviewDataUrls.map((previewData: ImageData, index: number) => (
                    <div key={index}>
                      <Image src={previewData.url} height={50} width={50} key={index} />
                      <Button
                        variant="danger"
                        onClick={(e) => handleDeleteImage(previewData, e)}
                        key={`delete-${index}`}
                        name={`image-${index}`}
                      >
                        delete
                      </Button>
                    </div>
                  ))}
                </Form.Group>

                <Button type="submit" onClick={(e) => handleSubmit(e)}>
                  find me a sitter
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
          <div className="sitters-and-filter">
            <div id="available-housitters" className="available-housitters">
              <h3>
                here are the housitters who are available in your specified dates and location:
              </h3>

              {housitters.map(
                (
                  sitter: any,
                  index: number // TODO: type 'sitter' with a new type of Db housitterdata
                ) => (
                  <AvailableHousitter
                    props={{
                      firstName: sitter.firstName,
                      lastName: sitter.lastName,
                      about_me: 'hard coded about_me text',
                      avatarUrl: sitter.avatarUrl,
                      housitterId: sitter.housitterId,
                    }}
                    key={index}
                  />
                )
              )}
            </div>
            <div className="sidebar-filter">
              <SidebarFilter isHousitter={false} showCustomLocations={true} selectionType="radio" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/*
  on page render, i want to get from the db just the housitters that meet the filter.

  then, every handler for every filter button, will get all relevant housitters.
  
  but the db call, and the subsequent setState func for housittersToDisplay, will need no further filtering.

  so the actual component Housitter just wants the properties to show on the card

*/
