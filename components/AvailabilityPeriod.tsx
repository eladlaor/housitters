import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

import { useState } from 'react'

/*
  Additions:
    what if endDate is selected to be before today (should disable)
    what if endDate is before startDate (should update startDate)

    Must be more effective with the way i handle the formatting of the dates between operations

    Is the motivation behind using react hooks here (rather than redux store values) good justified?
      (i don't 'need' these flags in different pages, so i don't want to have a heavy system)
*/

import { selectAvailabilityState, setAvailability } from '../slices/userSlice'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'

const EVENT_KEYS = {
  ANYTIME: 'anytime',
  CUSTOM_RANGE: 'custom-range',
}

export default function AvailabilityPeriod({
  period,
  index,
  updateDbInstantly,
}: {
  period: any
  index: number
  updateDbInstantly: boolean
}) {
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const dispatch = useDispatch()
  const availability = useSelector(selectAvailabilityState)

  const [shouldShowCustomSelection, setshouldShowCustomSelection] = useState(
    availability[index].endDate !== new Date(0).toISOString() // the 'Anytime' sign is new Date(0) as endDate.
  )
  const [endDateCurrentSelection, setEndDateCurrentSelection] = useState(
    // TODO: rename, cause its not only endDate.
    shouldShowCustomSelection ? 'custom range' : 'anytime'
  )

  async function handleDatesChange(changedDate: Date, isStart: boolean) {
    // all formatting can be done at the end
    let availabilityToModify = JSON.parse(JSON.stringify(availability))
    let formattedChangedDate = moment(changedDate).format('YYYY-MM-DD')
    let periodBorderType = ''

    if (isStart) {
      periodBorderType = 'startDate'
      availabilityToModify[index] = {
        startDate: formattedChangedDate,
        endDate: moment(availability[index].endDate).format('YYYY-MM-DD'),
      }

      const { startDate: modifiedStart, endDate: modifiedEnd } = availabilityToModify[index]

      if (modifiedEnd <= modifiedStart) {
        let copyOfStartDate = new Date(modifiedStart)
        copyOfStartDate.setDate(copyOfStartDate.getDate() + 1)
        availabilityToModify[index].endDate = moment(copyOfStartDate).format('YYYY-MM-DD')
      }
    } else {
      periodBorderType = 'endDate'
      availabilityToModify[index] = {
        startDate: moment(availability[index].startDate).format('YYYY-MM-DD'),
        endDate: formattedChangedDate,
      }

      const { startDate: modifiedStart, endDate: modifiedEnd } = availabilityToModify[index]

      if (modifiedEnd <= modifiedStart) {
        let startDateToModify = new Date(modifiedEnd)
        startDateToModify.setDate(startDateToModify.getDate() - 1)
        availabilityToModify[index].startDate = moment(startDateToModify).format('YYYY-MM-DD')
      }
    }

    const startDateToUpdateInDb = availabilityToModify[index].startDate
    const endDateToUpdateInDb = availabilityToModify[index].endDate

    if (updateDbInstantly) {
      // TODO: let's take the db names from the generated types in supabase db, let's import them.
      let { error: datesUpdateError } = await supabaseClient.from('available_dates').upsert({
        user_id: user?.id,
        start_date: startDateToUpdateInDb,
        end_date: endDateToUpdateInDb,
        period_index: index,
      })

      if (datesUpdateError) {
        alert(datesUpdateError.message)
        throw datesUpdateError
      }
    }

    dispatch(setAvailability(availabilityToModify))
  }

  function handleDateSelect(date: any) {
    // TODO: just understand the diff between select and change
  }

  function handleSelectionType(e: any) {
    if (e === EVENT_KEYS.CUSTOM_RANGE) {
      setshouldShowCustomSelection(true)
      setEndDateCurrentSelection('custom date') // TODO: can also make a const enum for messages
    } else if (e === EVENT_KEYS.ANYTIME) {
      setshouldShowCustomSelection(false)
      setEndDateCurrentSelection('anytime')
      handleDatesChange(new Date(0), false)
    }
  }

  function addAvailabilityPeriod() {
    let modifiedAvailability = JSON.parse(JSON.stringify(availability))

    let defaultStartDate = new Date()
    let defaultEndDate = new Date()
    defaultEndDate.setDate(defaultStartDate.getDate() + 1)

    modifiedAvailability.push({
      startDate: defaultStartDate.toISOString(),
      endDate: defaultEndDate.toISOString(),
    })

    dispatch(setAvailability(modifiedAvailability))
  }

  return (
    <div>
      <DropdownButton
        id="dropdown-basic-button"
        title={endDateCurrentSelection}
        onSelect={handleSelectionType}
      >
        <Dropdown.Item eventKey={EVENT_KEYS.ANYTIME}>Anytime</Dropdown.Item>
        <Dropdown.Item eventKey={EVENT_KEYS.CUSTOM_RANGE}>Custom Range</Dropdown.Item>
      </DropdownButton>

      <div>
        <div>
          {shouldShowCustomSelection && (
            <div>
              <p>start Date:</p>
              <DatePicker
                selected={new Date(period.startDate)}
                openToDate={new Date()}
                onChange={(date: Date) => handleDatesChange(date, true)}
                onSelect={(date: Date) => handleDateSelect(date)}
              />
            </div>
          )}
        </div>

        {shouldShowCustomSelection && (
          <div>
            <p>end Date:</p>
            <DatePicker
              selected={
                new Date(period.endDate).getFullYear() == 1970
                  ? new Date(period.startDate)
                  : new Date(period.endDate)
              }
              openToDate={new Date(period.startDate)}
              onChange={(date: Date) => handleDatesChange(date, false)}
              onSelect={handleDateSelect}
            />
          </div>
        )}
      </div>
      <div>
        {shouldShowCustomSelection && <button onClick={addAvailabilityPeriod}>add period</button>}
      </div>
      <div>
        <button
          onClick={() => {
            const modifiedAvailability = JSON.parse(JSON.stringify(availability))
            modifiedAvailability.splice(index, 1) // TODO: yeah, it's possible, but there's a simpler way.
            // instead of doing this, I can use the map and filter func: https://beta.reactjs.org/learn/updating-arrays-in-state
            dispatch(setAvailability(modifiedAvailability))
          }}
        >
          {availability.length > 1 ? 'remove the above period' : ''}
        </button>
      </div>
    </div>
  )
}
