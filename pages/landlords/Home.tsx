import { useRouter } from 'next/router'
import GoToProfileButton from '../../components/GoToProfileButton'
import { selectFirstNameState } from '../../slices/userSlice'
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
import AvailabilityPeriod from '../../components/AvailabilityPeriod'
import SignOut from '../../components/Buttons/SignOut'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import PetsCounter from '../../components/PetsCounter'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import AvailableHousitter from '../../components/Housitter'
import { debug } from 'console'
import HousitterIntro from '../housitters/Intro'

export default function Home() {
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const dispatch = useDispatch()
  const firstName = useSelector(selectFirstNameState)
  const availability = useSelector(selectAvailabilityState)
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [imagesSrc, setImagesSrc] = useState([] as any)
  const location = useSelector(selectLocationState)
  const [freeTextState, setFreeTextState] = useState('')
  const pets = useSelector(selectPetsState)
  const [housitters, setHousitters] = useState([{}])

  useEffect(() => {
    // TODO: read about reading foreign tables. https://supabase.com/docs/reference/javascript/select
    // definitely seems like it would be a better way to implement it, in one call to the server.

    // search Filter Foreign Tables https://supabase.com/docs/reference/javascript/using-filters

    if (user) {
      const asyncWrapper = async () => {
        let { data: landlordData, error: landlordError } = await supabaseClient
          .from('landlords')
          .select(`location`)
          .eq('user_id', user.id)
          .single()

        if (landlordError) {
          alert(landlordError.message)
        } else if (landlordData) {
          dispatch(setLocationState(landlordData.location))
        }

        const arr = [location]

        let { data: housitterData, error: housitterError } = await supabaseClient
          .from('profiles')
          .select(
            `id, first_name, last_name, housitters!inner (
            id, locations, experience
          )`
          )
          .eq('primary_use', 'housitter')
          .contains('housitters.locations', [location])
        // TODO: check what you get at the response obj, when you have multiple housitters corresponsding to the location

        if (housitterError) {
          debugger
          alert(housitterError.message)
        }

        // TODO: stupid temp solution until syntax fix for filter on query
        if (housitterData) {

          setHousitters(housitterData)
        }
      }

      asyncWrapper().catch((e) => {
        debugger
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

  // why would i decide to use '
  function onFileUpload(e: any) {
    for (const file of e.target.files) {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        setImagesSrc((images: any) => [...images, reader.result])
      }

      reader.onerror = () => {
        console.log(reader.error)
        throw reader.error
      }
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault()

    // TODO: deal with multiple availabilities

    const { data, error } = await supabaseClient.from('posts').insert([
      {
        landlord_uid: user?.id,
        start_date: new Date(availability[0].startDate),
        end_date: new Date(availability[0].endDate),
        location: location,
        free_text: freeTextState, // TODO: rename
        pets,
      },
    ])

    if (error) {
      alert(error.message)
      throw error
    }

    alert('submitted successfully')
  }

  return (
    <div>
      <h1>Mazal tov {firstName} on your upcoming vacation!</h1>
      <h2>I see you're looking for sitters in {location}</h2>
      <GoToProfileButton accountRoute={LANDLORDS_ROUTES.ACCOUNT} />
      <div>
        <Button
          style={{ position: 'relative', left: '50%' }}
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
                  <Dropdown.Item eventKey={LocationIds.Abroad}>{LocationIds.Abroad}</Dropdown.Item>
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
                <Form.Label>Upload some pics</Form.Label>
                <input onChange={onFileUpload} type="file" name="file" multiple />
                {imagesSrc.map((link: any) => (
                  <img src={link} />
                ))}
              </Form.Group>

              <Button type="submit" onClick={(e) => handleSubmit(e)}>
                find me a sitter
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
        <div>
          <h1>here are available housitters for you:</h1>
          {housitters.map((sitter) => (
            <AvailableHousitter
              props={{
                firstName: sitter.first_name,
                lastName: sitter.last_name,
                about_me: 'yo yo',
              }}
            />
          ))}
        </div>
        <SignOut />
      </div>
    </div>
  )
}

/*
  on page render, i want to get from the db just the housitters that meet the filter.

  then, every handler for every filter button, will get all relevant housitters.
  
  but the db call, and the subsequent setState func for housittersToDisplay, will need no further filtering.

  so the actual component Housitter just wants the properties to show on the card

*/
