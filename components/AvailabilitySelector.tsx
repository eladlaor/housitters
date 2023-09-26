// DEPRECATED

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
import { handleError } from '../utils/helpers'

const EVENT_KEYS = {
  ANYTIME: 'Anytime',
  CUSTOM_RANGE: 'Custom range',
}

export default function AvailabilitySelector({
  period,
  index,
  updateDbInstantly,
  className,
}: {
  period: any
  index: number
  updateDbInstantly: boolean
  className?: string
}) {
  try {
    new Date(period.startDate)
  } catch {
    period.startDate = new Date().toISOString().substring(0, 10)
  }
  try {
    new Date(period.endDate)
  } catch {
    period.endDate = new Date().toISOString().substring(0, 10)
  }
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const userId = user?.id
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
    if (!userId) {
      return
    }

    const asyncWrapper = async () => {
      const { data: availableDates, error } = await supabaseClient
        .from('available_dates')
        .select('start_date, end_date')
        .eq('user_id', userId)

      if (error) {
        alert(error.message)
        throw error
      }

      // TODO: this is duplicated in Account and should be moved to utils, or as part of the api route handler which should replace the above.
      if (availableDates && availableDates.length > 0) {
        const availableDatesAsReduxType = availableDates.map((date) => {
          return {
            startDate: date.start_date,
            endDate: date.end_date,
          }
        })

        dispatch(setAvailability(availableDatesAsReduxType))

        if (
          availableDatesAsReduxType.length > 0 &&
          !availableDatesAsReduxType[0].endDate.startsWith('1970')
        ) {
          setshouldShowCustomSelection(true)
          setEndDateCurrentSelection(EVENT_KEYS.CUSTOM_RANGE)
        } else {
          setshouldShowCustomSelection(false)
          setEndDateCurrentSelection(EVENT_KEYS.ANYTIME)
        }
      }
    }

    asyncWrapper()
  }, [userId])

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

  async function handleSelectionType(e: string | null) {
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
        const removalPromises = modifiedAvailability.map(async (period: any, index: number) => {
          let { error: deletionError } = await supabaseClient
            .from('available_dates')
            .delete()
            .eq('period_index', index)
            .eq('user_id', user?.id)

          if (deletionError) {
            return handleError(deletionError.message, 'AvailabilitySelector delete operation')
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
    }

    dispatch(setAvailability(modifiedAvailability))
  }

  async function removeAvailabilitySelector() {
    const modifiedAvailability = JSON.parse(JSON.stringify(availability))
    modifiedAvailability.splice(index, 1)

    if (updateDbInstantly) {
      let { error: deletionError } = await supabaseClient
        .from('available_dates')
        .delete()
        .eq('period_index', index)
        .eq('user_id', user?.id)

      if (deletionError) {
        alert(deletionError.message)
        throw deletionError
      }
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
              <p className="mb-0 mt-3">start Date:</p>
              <DatePicker
                className={className ? className : ''}
                selected={new Date(period.startDate)}
                openToDate={new Date()}
                onChange={(date: Date) => handleDatesChange(date, true)}
              />
            </div>
          )}
        </div>

        {shouldShowCustomSelection && (
          <div>
            <p className="mb-0 mt-3">end Date:</p>
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
      <div className="mt-3">
        {shouldShowCustomSelection && index === availability.length - 1 && (
          <Button onClick={addAvailabilitySelector}>add period</Button>
        )}
      </div>
      <div>
        {shouldShowCustomSelection &&
          availability.length > 1 &&
          index === availability.length - 1 && (
            <div>
              <Button variant="danger" onClick={removeAvailabilitySelector} className="mt-3">
                remove period
              </Button>
            </div>
          )}
      </div>
      <hr />
    </div>
  )
}
