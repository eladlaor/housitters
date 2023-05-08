import { useRouter } from 'next/router'
import GoToProfileButton from '../../components/GoToProfileButton'
import { selectFirstNameState, setFirstName } from '../../slices/userSlice'
import { LANDLORDS_ROUTES, NEW_POST_PROPS, LocationIds } from '../../utils/constants'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { useDispatch, useSelector } from 'react-redux'
import Modal from 'react-bootstrap/Modal'
import { useEffect, useState } from 'react'
import { selectAvailabilityState, setAvailability } from '../../slices/userSlice'
import { selectLocationState, selectPetsState, setLocationState } from '../../slices/landlordSlice'
import { selectImagesUrlsState, setImagesUrlsState } from '../../slices/postSlice'
import AvailabilityPeriod from '../../components/AvailabilityPeriod'
import SignOut from '../../components/Buttons/SignOut'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import PetsCounter from '../../components/PetsCounter'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import AvailableHousitter from '../../components/AvailableHousitter'
import Image from 'next/image'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Resizer from 'react-image-file-resizer'

export default function Home() {
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const dispatch = useDispatch()
  const firstName = useSelector(selectFirstNameState)
  const availability = useSelector(selectAvailabilityState)
  const [showNewPostModal, setShowNewPostModal] = useState(false)

  const imagesUrls = useSelector(selectImagesUrlsState)

  const [previewDataUrls, setPreviewDataUrls] = useState([''] as Array<String>)

  const location = useSelector(selectLocationState)
  const [freeTextState, setFreeTextState] = useState('')
  const [housitters, setHousitters] = useState([{} as any]) // TODO: is this the best way to type

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
            first_name
          )`
          )
          .eq('user_id', user.id)
          .single()

        if (landlordError) {
          alert(landlordError.message)
        } else if (landlordData) {
          dispatch(setLocationState(landlordData.location))
          dispatch(setFirstName((landlordData.profiles as { first_name: string }).first_name))
        }

        const arr = [location]

        let { data: housitterData, error: housitterError } = await supabaseClient
          .from('profiles')
          .select(
            `id, first_name, last_name, avatar_url, housitters!inner (
            id, locations, experience
          )`
          )
          .eq('primary_use', 'housitter')
          .contains('housitters.locations', [location])
        // TODO: check what you get at the response obj, when you have multiple housitters corresponsding to the location

        if (housitterError) {
          alert(housitterError.message)
        }

        // TODO: stupid temp solution until syntax fix for filter on query
        if (housitterData) {
          console.log(housitterData)
          setHousitters(housitterData)
        }
      }

      asyncWrapper().catch((e) => {
        alert(e.message)
      })
    }
  }, [user])

  // TODO: should move about_me text to the housitters table.

  function handleLocationSelection(key: string | null) {
    setLocationState(key ? key : '')
  }

  function handleShowNewPostModal() {
    setShowNewPostModal(true)
  }

  function handleCloseNoewPostModal() {
    setShowNewPostModal(false)
  }

  function removeInvalidCharacters(fileName: string): string {
    const allInvalidFileNameCharacters = /[^a-zA-Z0-9]/g

    return fileName.replace(allInvalidFileNameCharacters, '')
  }

  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      Resizer.imageFileResizer(
        file,
        maxWidth,
        maxHeight,
        'JPEG',
        80,
        0,
        (resizedImage: any) => {
          resolve(resizedImage)
        },
        'blob'
      )
    })
  }

  const blobToBuffer = (blob: Blob): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
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
      reader.readAsArrayBuffer(blob)
    })
  }

  async function onPostImageSelection(event: any) {
    try {
      // setUploadingImage(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      for (const file of event.target.files) {
        const fileName = removeInvalidCharacters(file.name)

        let { error: uploadError } = await supabaseClient.storage
          .from('posts')
          .upload(`${user?.id}-${fileName}`, file, { upsert: true })

        if (uploadError) {
          debugger
          throw uploadError
        }

        const resizedImage = await resizeImage(file, 50, 50)
        const buffer = await blobToBuffer(resizedImage)

        const previewDataUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`
        const updatedPreviews = [...previewDataUrls, previewDataUrl]
        setPreviewDataUrls(updatedPreviews)

        const updatedFileNames = [...imagesUrls, fileName]
        dispatch(setImagesUrlsState(updatedFileNames)) // TODO: rename. this is for db, to retrieve later.
      }
    } catch (e: any) {
      alert(e)
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault()

    // TODO: deal with multiple availabilities

    let { error: imageUploadError } = await supabaseClient.from('posts').upsert({
      landlord_id: user?.id,
      start_date: new Date(availability[0].startDate), // TODO: fix
      end_date: new Date(availability[0].endDate), // TODO: fix
      description: freeTextState, // TODO: rename
      images_urls: imagesUrls,
    })

    if (imageUploadError) {
      alert('error updating images urls in db: ' + imageUploadError.message)

      throw imageUploadError
    }

    dispatch(setImagesUrlsState([]))

    alert('submitted successfully')
    setShowNewPostModal(false)
  }

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand className="mr-auto" href="#">
          Housitters
        </Navbar.Brand>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <NavDropdown title="My Profile" id="basic-nav-dropdown">
              <NavDropdown.Item href={LANDLORDS_ROUTES.ACCOUNT}>Edit Profile</NavDropdown.Item>
              <SignOut />
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <div className="container">
        <div>
          <h1>Mazal tov {firstName} on your upcoming vacation!</h1>
          <h2>I see you're looking for sitters in {location}</h2>
        </div>
        <div>
          <GoToProfileButton accountRoute={LANDLORDS_ROUTES.ACCOUNT} />
        </div>
        <div>
          <Button
            style={{ position: 'relative', left: '50%', transform: 'translateX(-50%)' }}
            variant="primary"
            onClick={handleShowNewPostModal}
          >
            Create new post
          </Button>
          <Modal show={showNewPostModal} onHide={handleCloseNoewPostModal}>
            <Modal.Header closeButton>
              <Modal.Title style={{ color: 'blue' }}>lets create new post</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group>
                  <Form.Label>availability</Form.Label>

                  {availability.map((period, index) => (
                    <AvailabilityPeriod key={index} period={period} index={index} />
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
                  <h1 style={{ color: 'blue' }}>free text</h1>
                  <Form.Control
                    className="text-end"
                    size="sm"
                    as="textarea"
                    rows={5}
                    value={freeTextState}
                    onChange={(e) => {
                      setFreeTextState(e.target.value)
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

                  {previewDataUrls.map((url: any, index: number) => (
                    <div>
                      <Image src={url} height={50} width={50} key={index} />
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          let copyOfImagesUrls = [...previewDataUrls]
                          copyOfImagesUrls = copyOfImagesUrls.filter((img: any) => img !== url)
                          setPreviewDataUrls(copyOfImagesUrls)
                        }}
                        key={`delete-${index}`}
                      >
                        delete
                      </button>
                    </div>
                  ))}
                </Form.Group>

                <Button type="submit" onClick={(e) => handleSubmit(e)}>
                  find me a sitter
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
          <h1>here are available housitters for you:</h1>

          {housitters.map(
            (
              sitter: any,
              index: number // TODO: type 'sitter' with a new type of Db housitterdata
            ) => (
              <AvailableHousitter
                props={{
                  firstName: sitter.first_name,
                  lastName: sitter.last_name,
                  about_me: 'hard coded text',
                  avatarUrl: sitter.avatar_url,
                  housitterId: sitter.housitter_id,
                }}
                key={index}
              />
            )
          )}
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
