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
  setPetsState,
  modifiedLocation,
} from '../../slices/landlordSlice'
import AvailabilityPeriod from '../../components/AvailabilityPeriod'
import SignOut from '../../components/Buttons/SignOut'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import PetsCounter from '../../components/PetsCounter'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import Housitter from '../../components/Housitter'
import { HousitterCardProps } from '../../types/clientSide'

export default function Home() {
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const firstName = useSelector(selectFirstNameState)
  const availability = useSelector(selectAvailabilityState)
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [imagesSrc, setImagesSrc] = useState([] as any)
  const [freeTextState, setFreeTextState] = useState('')
  const pets = useSelector(selectPetsState)
  const [housitterCards, setHousitterCards] = useState([] as Array<HousitterCardProps>)

  const location = useSelector(selectLocationState)

  useEffect(() => {
    // TODO: read about reading foreign tables. https://supabase.com/docs/reference/javascript/select
    // definitely seems like it would be a better way to implement it, in one call to the server.

    // search Filter Foreign Tables https://supabase.com/docs/reference/javascript/using-filters

    // type things correctly, be careful from 'array of arrays'.
    // housitters can be either an object or an array.

    /*
      explanation about !inner: 
        according to supabase api, '!inner' allows filtering parent table results, if the foreign table's filter isn't satisfied.
    */

    if (user) {
      const asyncWrapper = async () => {
        let { data: compositeUserData, error } = await supabaseClient
          .from('profiles')
          .select(
            `id, first_name, last_name, birthday, housitters!inner (    
            locations, experience
          )`
          )
          // .eq('primary_use', 'housitter') // so, i don't need this one, cause i query with a foreign key which is defined in the table itself.
          .eq(`housitters.locations->${location}`, true) // https://supabase.com/docs/reference/javascript/using-filters (filter by values within a json column)
        // just no default location here for some reason, fix that bug and you're good with it
        // .eq(`housitters.locations->${location}`, true) // https://supabase.com/docs/reference/javascript/using-filters (filter by values within a json column)
        // TODO: would also need to filter by availability of course

        if (error) {
          alert(error.message)
        }

        if (compositeUserData) {
          let filteredHousitters: HousitterCardProps[] = []

          filteredHousitters = compositeUserData.map((data) => {
            return {
              firstName: data.first_name,
              lastName: data.last_name,
            }
          })

          setHousitterCards(filteredHousitters)
        }
      }

      asyncWrapper().catch((e) => {
        alert(e.message)
      })
    }
  }, [user, housitterCards]) // TODO: the page gets rendered reppeatedly, and I dont know why, seems like redundant renders are occuring nonstop.

  // TODO: should move about_me text to the housitters table.

  function handleLocationSelection(key: string | null) {
    const modifiedLocation = JSON.parse(JSON.stringify(key))
    dispatch(setLocationState(modifiedLocation))
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

    const { data, error } = await supabaseClient.from('active_posts').insert([
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
          {housitterCards
            ? housitterCards.map((housitter: HousitterCardProps) => (
                <Housitter
                  props={{
                    firstName: housitter.firstName,
                    lastName: housitter.lastName,
                  }}
                />
              ))
            : 'no available housitters'}
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
