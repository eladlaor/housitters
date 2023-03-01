import {
  selectLocationsState as selectHousitterLocationsState,
  setLocationsState as setHousitterLocationsState,
} from '../slices/housitterSlice'
import {
  selectLocationState as selectHouseOwnerLocationState,
  setLocationState as setHouseOwnerLocationState,
} from '../slices/houseOwnerSlice'
import { useSelector, useDispatch } from 'react-redux'
import Form from 'react-bootstrap/Form'
import { LocationIds, LocationDescriptions } from '../utils/constants'
import { FormCheckType } from 'react-bootstrap/esm/FormCheck'

export default function LocationSelector({
  selectionType,
  housitter,
}: {
  selectionType: FormCheckType
  housitter: boolean
}) {
  const dispatch = useDispatch()
  const locations = housitter
    ? useSelector(selectHousitterLocationsState)
    : useSelector(selectHouseOwnerLocationState)

  // TODO: there is a bug on page refresh!
  // also, think of how to create initialState in a better way.

  function handleHouseOwnerSelectedLocation(e: any) {
    dispatch(setHouseOwnerLocationState(e.target.id))
  }

  function handleHousitterSelectedLocation(e: any) {
    // parse and stringify in order to create a deep copy of the object, modify it (otherwise read-only) and dispatch
    let locationsToModify = JSON.parse(JSON.stringify(locations)) as Record<string, boolean>

    const receivedLocation = e.target.id as keyof typeof locations

    locationsToModify[receivedLocation] = !locationsToModify[receivedLocation]

    console.log(e.target.name)
    dispatch(setHousitterLocationsState(locationsToModify))
  }

  // TODO: to display properly, would need to search the array every time.
  // change hard coded ids to the enum.
  return (
    <Form onChange={housitter ? handleHousitterSelectedLocation : handleHouseOwnerSelectedLocation}>
      <div key={`default-${selectionType}`} className="mb-3">
        {Object.values(LocationIds).map((loc) => (
          <Form.Check
            type={selectionType}
            id={loc}
            label={LocationDescriptions[loc]}
            checked={
              housitter
                ? ((locations as Record<string, boolean>)[loc] as unknown as boolean)
                : loc === locations
            }
            name={housitter ? loc : 'singleLocationChoice'}
          />
        ))}
      </div>
    </Form>
  )
}
