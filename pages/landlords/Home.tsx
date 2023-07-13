import { useRouter } from 'next/router'
import {
  selectAvatarUrlState,
  selectFirstNameState,
  selectIsLoggedState,
  selectLastNameState,
  setAvatarUrl,
  setFirstName,
} from '../../slices/userSlice'

import { ClosedSit, DbAvailableHousitter, DefaultAvailablePostType } from '../../types/clientSide'
import { UserType, DefaultFavouriteUser, PageRoutes } from '../../utils/constants'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { useDispatch, useSelector } from 'react-redux'
import Modal from 'react-bootstrap/Modal'
import { useEffect, useState } from 'react'
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
  setImagesUrlsState,
  setDescriptionState,
  setIsActiveState,
  setTitleState,
} from '../../slices/createPostSlice'
import {
  setImagesUrlsState as setAvailablePostSetImagesUrlsState,
  setAvailablePosts,
} from '../../slices/availablePostsSlice'

import { selectAllFavouriteUsers, setAllFavouriteUsers } from '../../slices/favouritesSlice'

import AvailabilitySelector from '../../components/AvailabilitySelector'

import PetsCounter from '../../components/PetsCounter'
import LocationSelector from '../../components/LocationSelector'

import { Col, Container, FormControl, ListGroup, Row } from 'react-bootstrap'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import AvailableHousitter from '../../components/AvailableHousitter'
import Image from 'next/image'

import SidebarFilter from '../../components/SidebarFilter'
import HousePreview from '../../components/HousePreview'
import Accordion from 'react-bootstrap/Accordion'
import { ImageData } from '../../types/clientSide'

import { blobToBuffer, removeInvalidCharacters, resizeImage } from '../../utils/files'
import HomeNavbar from '../../components/HomeNavbar'

export default function Home() {
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const router = useRouter()

  const dispatch = useDispatch()
  const firstName = useSelector(selectFirstNameState)
  const lastName = useSelector(selectLastNameState)
  const avatarUrl = useSelector(selectAvatarUrlState)
  const availability = useSelector(selectAvailabilityState)

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
  const location = useSelector(selectLocationState)
  const isLogged = useSelector(selectIsLoggedState)
  const pets = useSelector(selectPetsState)
  const closedSits = useSelector(selectClosedSitsState)

  const isAfterSignup = router.query.isAfterSignup

  const favouriteUsers = useSelector(selectAllFavouriteUsers)

  useEffect(() => {
    if (!user || !isLogged) {
      return
    }
    const asyncWrapper = async () => {
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

        activePost.images_urls?.forEach((postImagesUrl: string, index: number) => {
          imagesUrlData.push({
            url: postImagesUrl,
            id: index,
          })
        })

        // TODO: maybe create a utility which gets a property, checks if it's different, and only then dispatches.
        dispatch(setImagesUrlsState(imagesUrlData))
        dispatch(setDescriptionState(activePost.description))
        dispatch(setTitleState(activePost.title))

        const availablePostRedux: DefaultAvailablePostType = {
          landlordId: user.id,
          landlordAvatarUrl: avatarUrl,
          landlordFirstName: firstName,
          landlordLastName: lastName,
          title: 'available house',
          description: `a description hasn\n't been written yet`,
          location: landlordData?.location,
          dogs: pets.dogs,
          cats: pets.cats,
          imagesUrls: imagesUrlData,
        }

        dispatch(setAvailablePosts([availablePostRedux]))
      }

      if (!isActivePost) {
        // returning all post slice to initial state except isActive, because of race condition with the above
        dispatch(setDescriptionState(''))
        dispatch(setTitleState(''))
        dispatch(setImagesUrlsState([])), setPostPreviewDataUrls([])
      }

      let { data: housitterData, error: housitterError } = await supabaseClient
        .from('profiles')
        .select(
          `id, first_name, last_name, avatar_url, housitters!inner (
            id, locations, experience, about_me
          ), available_dates!inner (user_id, start_date, end_date)`
        )
        .eq('primary_use', 'housitter')
        .contains('housitters.locations', [location])

      if (housitterError) {
        alert(
          'error when querying housitters from profiles in landlords home' + housitterError.message
        )
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

      const { error: favouritesError, data: favouritesData } = await supabaseClient
        .from('favourites')
        .select('created_at, favourite_user_type, favourite_user_id')
        .eq('marked_by_user_id', user!.id)

      if (favouritesError) {
        alert(`failed retrieving favourites: ${favouritesError}`)
        debugger
        throw favouritesError
      }

      if (favouritesData) {
        let retrievedFavouriteUsers = [] as (typeof DefaultFavouriteUser)[]

        retrievedFavouriteUsers = favouritesData.map(
          (favouriteUser: { favourite_user_id: any }) => ({
            favouriteUserType: UserType.Housitter,
            favouriteUserId: favouriteUser.favourite_user_id,
            markedByUserId: user!.id,
          })
        )

        const favouritesChanged =
          JSON.stringify(retrievedFavouriteUsers) !== JSON.stringify(favouriteUsers)

        if (favouritesChanged) {
          dispatch(setAllFavouriteUsers(retrievedFavouriteUsers))
        }
      }
    }

    asyncWrapper().catch((e) => {
      alert(e.message)
    })
  }, [user, availability, location, isActivePost])

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
        // TODO: dispatch to availablePosts slice
        dispatch(
          setAvailablePostSetImagesUrlsState({ landlordId: user!.id, imagesUrls: updatedFileNames })
        )
      }
    } catch (e: any) {
      alert(e)
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault()

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
        alert(`error upserting closed sit for date:${startDate}. Error: ${error.message}`)
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

    alert(`successfuly closed sit`)
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
    <>
      <HomeNavbar userType={UserType.Landlord} />
      <Container>
        <div className="welcome-to-dashboard-msg">
          <h2>
            Welcome{isAfterSignup ? '' : ' back'}, {firstName}!
          </h2>
          <h5 className="center-element">
            There are currently {housitters.length} available sitters for you.
          </h5>
          <hr />
        </div>
        <Col md={9}>
          <Row>
            <Col md={6}></Col>
            <Col md={6}>
              {isActivePost ? (
                <div>
                  <Accordion>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>My Post</Accordion.Header>
                      <Accordion.Body>
                        <HousePreview
                          landlordId={user ? user.id : ''}
                          title={title}
                          description={description}
                          location={location}
                          availability={availability}
                          dogs={pets.dogs}
                          cats={pets.cats}
                          imagesUrls={fileNames} // TODO: should have default image
                          addMissingDetailsHandler={handleShowNewPostModal}
                        />
                        <Button variant="danger" onClick={(e) => handleDeletePost(e)}>
                          Delete post
                        </Button>
                        {availability.length > closedSits.length && (
                          <Button variant="success" onClick={handleFoundSitter}>
                            I found a sitter
                          </Button>
                        )}

                        <Modal
                          show={showFoundSitterModal}
                          onHide={() => setShowFoundSitterModal(false)}
                        >
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
                                                const startDateAsString =
                                                  period.startDate.toString()
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
                                                      checked={preConfirmedSelectionOfClosedSitsPerSitter.startDates.includes(
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
                <div className="create-new-post-prompt">
                  <Button
                    style={{
                      position: 'relative',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '250px',
                      maxWidth: '100%',
                    }}
                    variant="primary"
                    onClick={handleShowNewPostModal}
                  >
                    {isAfterSignup ? 'Complete your post' : 'Create a new post'}
                  </Button>
                  <br />
                  <br />
                </div>
              )}
            </Col>
          </Row>
        </Col>

        <Modal show={showNewPostModal} onHide={handleCloseNoewPostModal}>
          <Modal.Header>
            <Modal.Title>let's create a new post</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>When?</Form.Label>

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
                <Form.Label>Where?</Form.Label>
                <LocationSelector
                  selectionType="radio"
                  isHousitter={false}
                  showCustomLocations={true}
                  updateDbInstantly={true}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Pets</Form.Label>
                <PetsCounter />
              </Form.Group>
              <Form.Group>
                <Form.Label>Title</Form.Label>
                <FormControl
                  type="text"
                  value={title}
                  onChange={(e) => {
                    dispatch(setTitleState(e.target.value))
                  }}
                />
              </Form.Group>

              <Form.Group className="mt-2">
                <Form.Label>Description</Form.Label>
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
              <Form.Group className="mt-3">
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

        <Row>
          <Col md={9} style={{ paddingRight: '30px' }}>
            <Row>
              {housitters.length > 0 &&
                housitters.map(
                  (
                    sitter: any,
                    index: number // TODO: type 'sitter' with a new type of Db housitterdata
                  ) => (
                    <Col md={3} key={index} style={{ margin: '70px' }}>
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
                    </Col>
                  )
                )}
            </Row>
          </Col>
          <Col md={3}>
            <SidebarFilter
              isHousitter={false}
              showCustomLocations={true}
              selectionType="radio"
              sortElementsHandler={sortHousitters}
            />
          </Col>
        </Row>
      </Container>
    </>
  )
}
