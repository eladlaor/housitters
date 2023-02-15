import { selectLocationsState, setLocationsState } from '../slices/housitterSlice'
import { useSelector, useDispatch } from 'react-redux'
import Form from 'react-bootstrap/Form'

export default function LocationSelector() {
  const dispatch = useDispatch()
  const locations = useSelector(selectLocationsState)

  // TODO: there is a bug on page refresh!
  // also, think of how to create initialState in a better way.

  function handleSelectedLocation(e: any) {
    // parse and stringify in order to create a deep copy of the object, modify it (otherwise read-only) and dispatch
    let locationsToModify = JSON.parse(
      JSON.stringify(
        locations
          ? locations
          : {
              north: false,
              haifa: false,
              pardesHana: false,
              hasharon: false,
              ta: false,
              nearTa: false,
              rishonToAshkelon: false,
              ashkelonToBeerSheva: false,
              beerSheva: false,
              eilat: false,
            }
      )
    ) as typeof locations

    const receivedLocation = e.target.id as keyof typeof locations

    locationsToModify[receivedLocation] = !locationsToModify[receivedLocation]

    dispatch(setLocationsState(locationsToModify))
  }

  // TODO: to display properly, would need to search the array every time.
  // change hard coded ids to the enum.
  return (
    <Form onChange={handleSelectedLocation}>
      <div key="default-checkbox" className="mb-3">
        <Form.Check
          type="checkbox"
          id="north"
          label="Northern than Haifa"
          checked={locations['north']} // TODO: parameter.
        />
        <Form.Check type="checkbox" id="haifa" label="Haifa and around" />
        <Form.Check type="checkbox" id="pardesHana" label="Pardes-hana and around" />
        <Form.Check type="checkbox" id="hasharon" label="Hasharon" />
        <Form.Check type="checkbox" id="ta" label="Tel Aviv" />
        <Form.Check type="checkbox" id="nearTa" label="Near Tel Aviv" />
        <Form.Check type="checkbox" id="RishonToAshkelon" label="Between Rishon and Ashkelon" />
        <Form.Check type="checkbox" id="ashkelonToBeerSheva" label="Between Rishon and Ashkelon" />
        <Form.Check type="checkbox" id="beerSheva" label="Beer Sheva and around" />
        <Form.Check type="checkbox" id="eilat" label="Eilat" />
      </div>
    </Form>
  )
}
