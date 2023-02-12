import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import { selectLocationsState, setLocations } from '../slices/userSlice'
import { useSelector, useDispatch } from 'react-redux'
import Form from 'react-bootstrap/Form'

export default function LocationSelector() {
  const dispatch = useDispatch()
  const locations = useSelector(selectLocationsState)

  // TODO: there is a bug on page refresh!

  function handleSelectedLocation(e: any) {
    // debugger
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
              RishonToAshkelon: false,
              ashkelonToBeerSheva: false,
              beerSheva: false,
              eilat: false,
            }
      )
    )
    const locationKeyToModify = (
      e.target.id ? e.target.id : false
    ) as keyof typeof locationsToModify

    locationsToModify[locationKeyToModify] = !locationsToModify[locationKeyToModify]
    dispatch(setLocations(locationsToModify))
  }

  return (
    <Form onChange={handleSelectedLocation}>
      <div key="default-checkbox" className="mb-3">
        <Form.Check type="checkbox" id="north" label="Northern than Haifa" />
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
