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
import { LocationIds, LocationDescriptions, LocationSelectionEventKeys } from '../utils/constants'
import { FormCheckType } from 'react-bootstrap/esm/FormCheck'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { handleError } from '../utils/helpers'

export default function LocationSelector({
  selectionType,
  isHousitter,
  showCustomLocations,
  updateDbInstantly,
}: {
  selectionType: FormCheckType
  isHousitter: boolean
  showCustomLocations?: boolean
  updateDbInstantly: boolean
}) {
  const dispatch = useDispatch()
  const locations = isHousitter
    ? useSelector(selectHousitterLocationsState)
    : useSelector(selectlandlordLocationState)

  const [shouldShowCustomLocations, setShouldShowCustomLocations] = useState(showCustomLocations)
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const userId = user?.id

  const [locationCurrentSelectionType, setLocationCurrentSelectionType] = useState('')

  useEffect(() => {
    if (!user) {
      setLocationCurrentSelectionType(LocationSelectionEventKeys.Anywhere)
      return
    }

    const getLocationData = async () => {
      if (isHousitter) {
        const { data, error } = await supabaseClient
          .from('housitters')
          .select('locations')
          .eq('user_id', userId)
          .single()
        if (error) {
          return handleError(error.message, ' ')
        }

        if (data) {
          let modifiedLocations = Array.isArray(data.locations) ? data.locations : [data.locations]

          const modifiedShouldShow =
            modifiedLocations.length > 0 &&
            modifiedLocations.length < Object.values(LocationIds).length

          setShouldShowCustomLocations(modifiedShouldShow)
          setLocationCurrentSelectionType(
            modifiedShouldShow
              ? LocationSelectionEventKeys.CustomLocations
              : LocationSelectionEventKeys.Anywhere
          )

          dispatch(setHousitterLocationsState(modifiedLocations))
        } else {
          const { data, error } = await supabaseClient
            .from('landlords')
            .select('location')
            .eq('user_id', userId)
            .single()
          if (error) {
            return handleError(error.message, 'houses.index.useEffect: get landlord location')
          }

          if (data) {
            if (data.location !== location) {
              dispatch(setlandlordLocationState(location))
            }
          }
        }
      }
    }

    getLocationData()
  }, [])

  async function handleLandlordSelectedLocation(e: any) {
    const newLocation = e.target.id

    if (updateDbInstantly) {
      await supabaseClient.from('landlords').upsert({
        user_id: user?.id,
        location: newLocation,
      })
    }

    dispatch(setlandlordLocationState(newLocation))
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
    if (e === LocationSelectionEventKeys.Anywhere) {
      let allLocationsSelected: string[] = []
      Object.values(LocationIds).forEach((location) => {
        allLocationsSelected.push(location)
      })

      if (updateDbInstantly) {
        let { error } = await supabaseClient.from('housitters').upsert({
          user_id: user?.id,
          locations: allLocationsSelected,
        })

        if (error) {
          return handleError(error.message, 'LocationSelector.handleHousitterSelectionType')
        }
      }

      dispatch(setHousitterLocationsState(allLocationsSelected))
      setShouldShowCustomLocations(false)
      setLocationCurrentSelectionType(LocationSelectionEventKeys.Anywhere)
    } else if (e === LocationSelectionEventKeys.CustomLocations) {
      if (updateDbInstantly) {
        let { error } = await supabaseClient.from('housitters').upsert({
          user_id: user?.id,
        })

        if (error) {
          return handleError(error.message, 'LocationSelector.handleHousitterSelectionType')
        }
      }

      dispatch(setHousitterLocationsState([]))
      setShouldShowCustomLocations(true)
      setLocationCurrentSelectionType(LocationSelectionEventKeys.CustomLocations)
    }
  }

  // TODO: to display properly, would need to search the array every time.
  // change hard coded ids to the enum.

  return (
    <>
      <Form>
        {isHousitter && (
          <DropdownButton
            id="dropdown-basic-button"
            title={locationCurrentSelectionType}
            onSelect={handleHousitterSelectionType}
          >
            {isHousitter && (
              <Dropdown.Item eventKey={LocationSelectionEventKeys.Anywhere}>Anywhere</Dropdown.Item>
            )}
            <Dropdown.Item eventKey={LocationSelectionEventKeys.CustomLocations}>
              Select Areas
            </Dropdown.Item>
          </DropdownButton>
        )}
        <div key={`default-${selectionType}`} className="mb-3 mt-3">
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
                  isHousitter ? handleHousitterSelectedLocation : handleLandlordSelectedLocation
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
