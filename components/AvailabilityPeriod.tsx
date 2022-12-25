import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { selectAvailabilityState, setAvailability } from '../slices/userSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import moment from 'moment'

export default function AvailabilityPeriod({ period, index }: { period: any; index: number }) {
  const dispatch = useDispatch()
  const supabaseClient = useSupabaseClient()
  const availability = useSelector(selectAvailabilityState)
  const user = useUser()

  function handleDatesChange(changedDate: Date, isStart: boolean) {
    debugger
    let modifiedAvailability = JSON.parse(JSON.stringify(availability))
    let parsedDate = moment(changedDate).format('YYYY-MM-DD')

    if (isStart) {
      modifiedAvailability[index] = {
        startDate: parsedDate,
        endDate: availability[index].endDate,
      }
    } else {
      modifiedAvailability[index] = {
        startDate: availability[index].startDate,
        endDate: parsedDate,
      }
    }

    dispatch(setAvailability(modifiedAvailability))
  }

  function handleDateSelect(date: any) {
    console.log('handleDateSelect is triggered')
  }

  // useEffect(() => {}, [user])

  // TODO: what if availability is not rendered yet? (in 'selected')
  return (
    <div>
      <p>startDate</p>
      <DatePicker
        selected={new Date(period.startDate)}
        openToDate={new Date()}
        onChange={(date: Date) => handleDatesChange(date, true)}
        onSelect={(date: Date) => handleDateSelect(date)}
      />
      <p>endDate</p>
      <DatePicker
        selected={new Date(period.endDate)}
        openToDate={new Date(period.startDate)}
        onChange={(date: Date) => handleDatesChange(date, false)}
        onSelect={handleDateSelect}
      />
    </div>
  )
}
