import { selectLocationsState, setLocationsState } from '../slices/housitterSlice'
import { useSelector, useDispatch } from 'react-redux'
import Form from 'react-bootstrap/Form'
import { LocationIds, LocationDescriptions } from '../utils/constants'

export default function LocationSelector() {
  const dispatch = useDispatch()
  const locations = useSelector(selectLocationsState)

  // TODO: there is a bug on page refresh!
  // also, think of how to create initialState in a better way.

  function handleSelectedLocation(e: any) {
    // parse and stringify in order to create a deep copy of the object, modify it (otherwise read-only) and dispatch
    let locationsToModify = JSON.parse(JSON.stringify(locations)) as typeof locations

    const receivedLocation = e.target.id as keyof typeof locations

    locationsToModify[receivedLocation] = !locationsToModify[receivedLocation]

    dispatch(setLocationsState(locationsToModify))
  }

  // TODO: to display properly, would need to search the array every time.
  // change hard coded ids to the enum.
  return (
    <Form onChange={handleSelectedLocation}>
      <div key="default-checkbox" className="mb-3">
        {Object.values(LocationIds).map((loc) => (
          <Form.Check
            type="checkbox"
            id={loc}
            label={LocationDescriptions[loc]}
            checked={locations[loc]}
          />
        ))}
      </div>
    </Form>
  )
}
