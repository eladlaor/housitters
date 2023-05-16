import { useRouter } from 'next/router'
import GoToProfileButton from '../../components/GoToProfileButton'
import { selectFirstNameState, selectIsLoggedState, setFirstName } from '../../slices/userSlice'
import { LANDLORDS_ROUTES, NEW_POST_PROPS, LocationIds } from '../../utils/constants'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { useDispatch, useSelector } from 'react-redux'
import Modal from 'react-bootstrap/Modal'
import { useEffect, useState } from 'react'
import { selectAvailabilityState, setAvailability } from '../../slices/userSlice'
import {
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
import { Dropdown, DropdownButton, FormControl } from 'react-bootstrap'
import PetsCounter from '../../components/PetsCounter'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import AvailableHousitter from '../../components/AvailableHousitter'
import Image from 'next/image'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Resizer from 'react-image-file-resizer'
import SidebarFilter from '../../components/SidebarFilter'
import HousePost from '../../components/HousePost'
import Accordion from 'react-bootstrap/Accordion'
import { settersToInitialStates as postSettersToInitialStates } from '../../slices/postSlice'
import { ImageData } from '../../types/clientSide'

export default function Home() {
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const dispatch = useDispatch()
  const firstName = useSelector(selectFirstNameState)
  const availability = useSelector(selectAvailabilityState)
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const isActive = useSelector(selectIsActiveState)

  const title = useSelector(selectTitleState)
  const description = useSelector(selectDescriptionState)
  const fileNames = useSelector(selectImagesUrlsState)

  const [previewDataUrls, setPreviewDataUrls] = useState([] as ImageData[])

  const location = useSelector(selectLocationState)
  const [housitters, setHousitters] = useState([{} as any]) // TODO: is this the best way to type? no. improve
  const isLogged = useSelector(selectIsLoggedState)

  const pets = useSelector(selectPetsState)

  useEffect(() => {
    // TODO: read about reading foreign tables. https://supabase.com/docs/reference/javascript/select
    // definitely seems like it would be a better way to implement it, in one call to the server.

    // search Filter Foreign Tables https://supabase.com/docs/reference/javascript/using-filters

    if (user) {
      const asyncWrapper = async () => {
        let { data: landlordData, error: landlordError } = await supabaseClient
          .from('landlords')
          .select(
            `location, profiles!inner (
            first_name, available_dates!inner (start_date, end_date, period_index), pets!inner (dogs, cats)
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

          // TODO: lets import the needed type from supabase types and use instead of any.
          dispatch(
            setPetsState({
              dogs: (landlordData.profiles as any).pets.dogs,
              cats: (landlordData.profiles as any).pets.cats,
            })
          )
          dispatch(setFirstName((landlordData.profiles as { first_name: string }).first_name))
        }

        if (!isActive) {
          postSettersToInitialStates.forEach((attributeSetterAndInitialState) => {
            dispatch(
              attributeSetterAndInitialState.matchingSetter(
                attributeSetterAndInitialState.initialState
              )
            )
          })
          setPreviewDataUrls([])
          setHousitters([])
          return
        }

        let { data: activePostData, error: postsError } = await supabaseClient
          .from('posts')
          .select(`description, images_urls, title`)
          .eq('landlord_id', user.id)
          .eq('is_active', true)
          .single()

        if (postsError) {
          if (postsError.details.startsWith('Results contain 0 rows')) {
            console.log(
              'Error: 0 rows returned: even though isActive is set to false, query was sent and no posts found'
            )
          } else {
            alert(`error fetching active posts in landlords/Home: ${postsError.message}`)
            throw postsError
          }
        }

        if (activePostData) {
          const imagesUrlData: ImageData[] = []

          activePostData.images_urls.forEach((postImagesUrl: string, index: number) => {
            imagesUrlData.push({
              url: postImagesUrl,
              id: index,
            })
          })

          // TODO: maybe create a utility which gets a property, checks if it's different, and only then dispatches.
          dispatch(setImagesUrlsState(imagesUrlData))
          dispatch(setDescriptionState(activePostData.description))
          dispatch(setTitleState(activePostData.title))
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
  }, [user, availability, location, isActive])

  // TODO: should move about_me text to the housitters table.

  function handleLocationSelection(key: string | null) {
    setLocationState(key ? key : '')
  }

  async function handleShowNewPostModal() {
    if (fileNames.length > 0) {
      await loadPreviewImages()
    }
    setShowNewPostModal(true)
  }

  function handleCloseNoewPostModal() {
    setPreviewDataUrls([])
    setShowNewPostModal(false)
  }

  function removeInvalidCharacters(fileName: string): string {
    const hebrewToEnglishMap: { [key: string]: string } = {
      א: 'a',
      ב: 'b',
      ג: 'g',
      ד: 'd',
      ה: 'h',
      ו: 'v',
      ז: 'z',
      ח: 'kh',
      ט: 't',
      י: 'y',
      כ: 'k',
      ל: 'l',
      מ: 'm',
      נ: 'n',
      ס: 's',
      ע: 'a',
      פ: 'p',
      צ: 'ts',
      ק: 'k',
      ר: 'r',
      ש: 'sh',
      ת: 't',
      ן: 'n',
      ך: 'k',
      ם: 'm',
      ף: 'p',
      ץ: 'ts',
      '׳': "'",
      '״': '"',
    }

    const hebToEngRegex = new RegExp(Object.keys(hebrewToEnglishMap).join('|'), 'g')
    const noHebrewFileName = fileName.replace(hebToEngRegex, (match) => hebrewToEnglishMap[match])

    const allInvalidFileNameCharacters = /[^a-zA-Z0-9]/g
    return noHebrewFileName.replace(allInvalidFileNameCharacters, '')
  }

  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new window.Image()
        img.src = reader.result as string
        img.onload = () => {
          const aspectRatio = img.width / img.height
          let targetWidth, targetHeight

          if (aspectRatio < 1) {
            // horizontal
            targetWidth = maxWidth
            targetHeight = maxWidth / aspectRatio
          } else {
            // vertical
            targetWidth = maxHeight * aspectRatio
            targetHeight = maxHeight
          }

          Resizer.imageFileResizer(
            file,
            targetWidth,
            targetHeight,
            'JPEG',
            80,
            0,
            (resizedImage: any) => {
              resolve(resizedImage)
            },
            'blob'
          )
        }
      }
    })
  }

  // TODO: get rid of the resolve reject syntax
  const blobToBuffer = (blob: Blob): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsArrayBuffer(blob)
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          const buffer = Buffer.from(reader.result)
          resolve(buffer)
        } else {
          reject(new Error('Failed to convert Blob to Buffer.'))
        }
      }
      reader.onerror = (error) => {
        reject(error)
      }
    })
  }

  async function loadPreviewImages() {
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
    setPreviewDataUrls(previews)
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
          ...previewDataUrls,
          { url: previewDataUrl, id: previewDataUrls.length },
        ]

        setPreviewDataUrls(updatedPreviews)

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

  async function handleDeleteImage(previewData: { url: string; id: number }, e: any) {
    e.preventDefault()
    let copyOfImagesUrls = [...previewDataUrls]
    copyOfImagesUrls = copyOfImagesUrls.filter((img: ImageData) => img.url !== previewData.url)

    let copyOfFileNames = [...fileNames]
    copyOfFileNames = copyOfFileNames.filter(
      (fileData: { url: string; id: number }) => fileData.id != previewData.id
    )

    setPreviewDataUrls(copyOfImagesUrls)
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
        </div>
        {isActive ? (
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
                  <Button variant="success">I found a sitter</Button>
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

                  {previewDataUrls.map((previewData: ImageData, index: number) => (
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
                      about_me: 'hard coded text',
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
