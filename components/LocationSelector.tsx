import {
  selectLocationsState as selectHousitterLocationsState,
  setLocationsState as setHousitterLocationsState,
} from '../slices/housitterSlice'
import {
  selectLocationState as selectlandlordLocationState,
  setLocationState as setlandlordLocationState,
  setLocationState,
} from '../slices/landlordSlice'
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
    : useSelector(selectlandlordLocationState)

  // TODO: there is a bug on page refresh!
  // also, think of how to create initialState in a better way.

  function handlelandlordSelectedLocation(e: any) {
    dispatch(setlandlordLocationState(e.target.id))
  }

  function handleHousitterSelectedLocation(e: any) {
    if (!housitter) {
      dispatch(setLocationState(e.target.id))
    } else {
      let locationsToModify = JSON.parse(JSON.stringify(locations)) as string[]
      const receivedLocation = e.target.id as keyof typeof locations as string

      const selectedLocationIndex = locationsToModify.indexOf(receivedLocation)
      if (selectedLocationIndex === -1) {
        locationsToModify.push(receivedLocation)
      } else {
        locationsToModify.splice(selectedLocationIndex)
      }

      dispatch(setHousitterLocationsState(locationsToModify))
    }
  }

  // TODO: to display properly, would need to search the array every time.
  // change hard coded ids to the enum.
  return (
    <Form onChange={housitter ? handleHousitterSelectedLocation : handlelandlordSelectedLocation}>
      <div key={`default-${selectionType}`} className="mb-3">
        {Object.values(LocationIds).map((loc) => (
          <Form.Check
            type={selectionType}
            key={loc}
            id={loc}
            label={LocationDescriptions[loc]}
            defaultChecked={
              housitter ? locations.indexOf(loc) !== -1 : loc === locations // the landlord case (locations will hold only one value. should rename TODO:)
            }
            name={housitter ? loc : 'singleLocationChoice'}
          />
        ))}
      </div>
    </Form>
  )
}
