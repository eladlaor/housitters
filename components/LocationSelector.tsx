import {
  selectLocationsState as selectHousitterLocationsState,
  setLocationsState as setHousitterLocationsState,
} from '../slices/housitterSlice'
import {
  selectLocationState as selectlandlordLocationState,
  setLocationState as setlandlordLocationState,
} from '../slices/landlordSlice'
import { useSelector, useDispatch } from 'react-redux'
import Form from 'react-bootstrap/Form'
import { LocationIds, LocationDescriptions } from '../utils/constants'
import { FormCheckType } from 'react-bootstrap/esm/FormCheck'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { selectIsLoggedState } from '../slices/userSlice'

export default function LocationSelector({
  selectionType,
  isHousitter,
  showCustomLocations,
  updateDbInstantly,
}: {
  selectionType: FormCheckType
  isHousitter: boolean
  showCustomLocations: boolean
  updateDbInstantly: boolean
}) {
  const dispatch = useDispatch()
  const locations = isHousitter
    ? useSelector(selectHousitterLocationsState)
    : useSelector(selectlandlordLocationState)

  const [shouldShowCustomLocations, setShouldShowCustomLocations] = useState(showCustomLocations)
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const isLogged = useSelector(selectIsLoggedState)

  const EVENT_KEYS = {
    ANYWHERE: 'anywhere',
    CUSTOM_LOCATIONS: 'custom locations',
  }

  const [locationCurrentSelectionType, setLocationCurrentSelectionType] = useState(
    showCustomLocations ? EVENT_KEYS.CUSTOM_LOCATIONS : EVENT_KEYS.ANYWHERE
  )

  useEffect(() => {
    if (locations === '') {
      dispatch(setlandlordLocationState(LocationIds.TelAviv))
    }
  }, [])

  function handlelandlordSelectedLocation(e: any) {
    dispatch(setlandlordLocationState(e.target.id))
  }

  async function handleHousitterSelectedLocation(e: any) {
    let locationsToModify = [...(locations as string[])]
    const receivedLocation = e.target.id as keyof typeof locations as string

    const selectedLocationIndex = locationsToModify.indexOf(receivedLocation)
    if (selectedLocationIndex === -1) {
      locationsToModify.push(receivedLocation)
    } else {
      locationsToModify.splice(selectedLocationIndex, 1)
    }

    if (updateDbInstantly) {
      try {
        let { error } = await supabaseClient.from('housitters').upsert({
          user_id: user?.id,
          locations: locationsToModify,
        })

        if (error) {
          alert('error updating locations from filter to db' + error)
          throw error
        }

        dispatch(setHousitterLocationsState(locationsToModify))
      } catch (e) {
        throw e
      }
    } else {
      dispatch(setHousitterLocationsState(locationsToModify))
    }
  }

  async function handleHousitterSelectionType(e: any) {
    if (e === EVENT_KEYS.ANYWHERE) {
      let allLocationsSelected: string[] = []
      Object.values(LocationIds).forEach((location) => {
        allLocationsSelected.push(location)
      })

      if (isLogged) {
        let { error } = await supabaseClient.from('housitters').upsert({
          user_id: user?.id,
          locations: allLocationsSelected,
        })

        if (error) {
          alert('error updating locations from filter to db' + error)
          throw error
        }
      }
      dispatch(setHousitterLocationsState(allLocationsSelected))
      setShouldShowCustomLocations(false)
      setLocationCurrentSelectionType(EVENT_KEYS.ANYWHERE)
    } else if (e === EVENT_KEYS.CUSTOM_LOCATIONS) {
      if (isLogged) {
        let { error } = await supabaseClient.from('housitters').upsert({
          user_id: user?.id,
        })

        if (error) {
          alert('error updating locations from filter to db' + error)
          throw error
        }
      }

      dispatch(setHousitterLocationsState([]))
      setShouldShowCustomLocations(true)
      setLocationCurrentSelectionType(EVENT_KEYS.CUSTOM_LOCATIONS)
    }
  }

  // TODO: to display properly, would need to search the array every time.
  // change hard coded ids to the enum.
  return (
    <>
      <Form>
        <DropdownButton
          id="dropdown-basic-button"
          title={locationCurrentSelectionType}
          onSelect={handleHousitterSelectionType}
        >
          <Dropdown.Item eventKey={EVENT_KEYS.ANYWHERE}>Anywhere</Dropdown.Item>
          <Dropdown.Item eventKey={EVENT_KEYS.CUSTOM_LOCATIONS}>Custom Locations</Dropdown.Item>
        </DropdownButton>

        <div key={`default-${selectionType}`} className="mb-3">
          {shouldShowCustomLocations ? (
            Object.values(LocationIds).map((loc) => (
              <Form.Check
                type={selectionType}
                key={loc}
                id={loc}
                label={LocationDescriptions[loc]}
                checked={
                  isHousitter
                    ? locations.indexOf(loc) !== -1
                    : // the landlord case
                      loc === locations
                }
                name={isHousitter ? loc : 'singleLocationChoice'}
                onChange={
                  isHousitter ? handleHousitterSelectedLocation : handlelandlordSelectedLocation
                }
              />
            ))
          ) : (
            <></>
          )}
        </div>
      </Form>
    </>
  )
}
