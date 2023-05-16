import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

import { useEffect, useState } from 'react'

import {
  selectAvailabilityState,
  selectPrimaryUseState,
  setAvailability,
} from '../slices/userSlice'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { Button } from 'react-bootstrap'

const EVENT_KEYS = {
  ANYTIME: 'anytime',
  CUSTOM_RANGE: 'custom range',
}

export default function AvailabilitySelector({
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
  const primaryUse = useSelector(selectPrimaryUseState)

  const [shouldShowCustomSelection, setshouldShowCustomSelection] = useState(
    availability[index].endDate !== new Date(0).toISOString() // the 'Anytime' sign is new Date(0) as endDate.
  )
  const [endDateCurrentSelection, setEndDateCurrentSelection] = useState(
    // TODO: rename, cause its not only endDate.
    shouldShowCustomSelection ? EVENT_KEYS.CUSTOM_RANGE : EVENT_KEYS.ANYTIME
  )

  useEffect(() => {
    if (!user) {
      return
    }

    const asyncWrapper = async () => {
      const { data: availableDates, error } = await supabaseClient
        .from('available_dates')
        .select('start_date, end_date')
        .eq('user_id', user?.id)

      if (error) {
        alert(error.message)
        throw error
      }

      // TODO: this is duplicated in Account and should be moved to utils, or as part of the api route handler which should replace the above.
      if (availableDates) {
        const availableDatesAsReduxType = availableDates.map((date) => {
          return {
            startDate: date.start_date,
            endDate: date.end_date,
          }
        })

        dispatch(setAvailability(availableDatesAsReduxType))

        if (!availableDatesAsReduxType[0].endDate.startsWith('1970')) {
          setshouldShowCustomSelection(true)
          setEndDateCurrentSelection(EVENT_KEYS.CUSTOM_RANGE)
        } else {
          setshouldShowCustomSelection(false)
          setEndDateCurrentSelection(EVENT_KEYS.ANYTIME)
        }
      }
    }

    asyncWrapper()
  }, [user])

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
        let copyOfStartDate = new Date(modifiedStart) // rename
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
        user_type: primaryUse,
      })

      if (datesUpdateError) {
        alert(datesUpdateError.message)
        throw datesUpdateError
      }
    }

    dispatch(setAvailability(availabilityToModify))
  }

  async function handleSelectionType(e: any) {
    let modifiedAvailability = [...availability]
    if (e === EVENT_KEYS.CUSTOM_RANGE) {
      setshouldShowCustomSelection(true)
      setEndDateCurrentSelection(EVENT_KEYS.CUSTOM_RANGE)
      handleDatesChange(new Date(), true)
    } else if (e === EVENT_KEYS.ANYTIME) {
      setshouldShowCustomSelection(false)
      setEndDateCurrentSelection(EVENT_KEYS.ANYTIME)

      const formattedAnytimeDate = moment(new Date(0)).format('YYYY-MM-DD')
      if (updateDbInstantly) {
        // TODO: aware that I'm removing first element and then inserting, rather than updating it.
        const removalPromises = modifiedAvailability.map(async (period: any, index: number) => {
          let { error: deletionError } = await supabaseClient
            .from('available_dates')
            .delete()
            .eq('period_index', index)
            .eq('user_id', user?.id)

          if (deletionError) {
            alert(deletionError.message)
            throw deletionError
          }
        })

        await Promise.all(removalPromises)

        let { error: datesUpdateError } = await supabaseClient.from('available_dates').upsert({
          user_id: user?.id,
          start_date: new Date(), // it doesnt matter, as only endDate determines if it's anytime.
          end_date: formattedAnytimeDate,
          period_index: 0,
          user_type: primaryUse,
        })

        if (datesUpdateError) {
          alert(datesUpdateError.message)
          throw datesUpdateError
        }
      }

      modifiedAvailability.splice(1)
      modifiedAvailability[0] = {
        ...modifiedAvailability[0],
        endDate: formattedAnytimeDate,
      }
    }

    dispatch(setAvailability(modifiedAvailability))
  }

  async function addAvailabilitySelector() {
    let modifiedAvailability = JSON.parse(JSON.stringify(availability))
    const length = availability.length
    const indexToAdd = length

    let defaultStartDate = new Date()
    let defaultEndDate = new Date()
    defaultEndDate.setDate(defaultStartDate.getDate() + 1)

    const formattedStartDate = defaultStartDate.toISOString()
    const formattedEndDate = defaultEndDate.toISOString()

    modifiedAvailability.push({
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    })

    if (updateDbInstantly) {
      console.log('UPDATING IN ADD AVAILABILITY from index: ' + indexToAdd)
      let { error: datesUpdateError } = await supabaseClient.from('available_dates').upsert({
        user_id: user?.id,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        period_index: indexToAdd,
        user_type: primaryUse,
      })

      if (datesUpdateError) {
        alert(datesUpdateError.message)
        throw datesUpdateError
      }
      console.log('SUCCESSFULLY UPDATED IN ADD AVAILABILITY')
    }

    dispatch(setAvailability(modifiedAvailability))
  }

  async function removeAvailabilitySelector() {
    const modifiedAvailability = JSON.parse(JSON.stringify(availability))
    modifiedAvailability.splice(index, 1) // TODO: yeah, it's possible, but there's a simpler way.
    // instead of doing this, I can use the map and filter func: https://beta.reactjs.org/learn/updating-arrays-in-state

    if (updateDbInstantly) {
      console.log('removing for index: ' + index)

      let { error: deletionError } = await supabaseClient
        .from('available_dates')
        .delete()
        .eq('period_index', index)
        .eq('user_id', user?.id)

      if (deletionError) {
        alert(deletionError.message)
        throw deletionError
      }
      console.log('successfully removed available_dates row for index: ' + index)
    }

    dispatch(setAvailability(modifiedAvailability))
  }

  return (
    <div>
      {index === 0 && (
        <DropdownButton
          id="dropdown-basic-button"
          title={endDateCurrentSelection}
          onSelect={handleSelectionType}
        >
          <Dropdown.Item eventKey={EVENT_KEYS.ANYTIME}>Anytime</Dropdown.Item>
          <Dropdown.Item eventKey={EVENT_KEYS.CUSTOM_RANGE}>Custom Range</Dropdown.Item>
        </DropdownButton>
      )}

      <div>
        <div>
          {shouldShowCustomSelection && (
            <div>
              <p>start Date:</p>
              <DatePicker
                selected={new Date(period.startDate)}
                openToDate={new Date()}
                onChange={(date: Date) => handleDatesChange(date, true)}
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
            />
          </div>
        )}
      </div>
      <div>
        {shouldShowCustomSelection && index === availability.length - 1 && (
          <Button onClick={addAvailabilitySelector}>add period</Button>
        )}
      </div>
      <div>
        {shouldShowCustomSelection &&
          availability.length > 1 &&
          index === availability.length - 1 && (
            <div>
              <Button onClick={removeAvailabilitySelector}>remove the above period</Button>
            </div>
          )}
      </div>
      <hr />
    </div>
  )
}