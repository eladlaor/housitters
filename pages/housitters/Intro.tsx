import { useRouter } from 'next/router'
import AvailabilityPeriod from '../../components/AvailabilityPeriod'
import { selectAvailabilityState, setFirstName } from '../../slices/userSlice'
import { useDispatch, useSelector } from 'react-redux'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import moment from 'moment'
import LocationSelector from '../../components/LocationSelector'

export default function HousitterIntro() {
  const router = useRouter()
  const dispatch = useDispatch()

  const availability = useSelector(selectAvailabilityState)

  function handleSelect(e: any) {
    console.log(e)
    dispatch(setFirstName(e))
  }

  return (
    <div>
      <p>ok lets find you a house</p>
      <div>
        <h1>WHEN are we talking about here?</h1>
        {availability.map((period, index) => (
          <AvailabilityPeriod key={index} period={period} index={index} />
        ))}
      </div>
      <div>
        <h1>Where?</h1>
        <LocationSelector />
      </div>
    </div>
  )
}
