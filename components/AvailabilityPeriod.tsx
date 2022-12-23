import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { selectAvailabilityState, setAvailability } from '../slices/userSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import moment from 'moment'

export default function AvailabilityPeriod() {
  const dispatch = useDispatch()
  const supabaseClient = useSupabaseClient()
  const availability = useSelector(selectAvailabilityState)
  const user = useUser()

  async function getAvailability() {
    if (!user) {
      return
    }

    let { data, error } = await supabaseClient
      .from('housitters')
      .select('availability')
      .eq('user_id', user.id)
      .single()

    if (error) {
      debugger
    }

    if (data) {
      parseDateMultiRange(data.availability)
    }

    // const { data: upsertData, error: upsertError } = await supabaseClient
    //   .from('housitters')
    //   .update([
    //     {
    //       availability: '{[2022-12-01, 2022-12-11]}',
    //     },
    //   ])
    //   .eq('user_id', user.id)
    // if (upsertError) {
    // }
  }

  function parseDateMultiRange(dateRange: string) {
    // maybe regex
    // does dateRange hold the same reference of the original obj ?

    let modifiedAvailability: typeof availability = []

    let startDate = dateRange.substring(2, 12)
    let endDate = dateRange.substring(13, 23)

    modifiedAvailability.push({
      startDate: startDate,
      endDate: endDate,
    })

    dispatch(setAvailability(modifiedAvailability))

    // let modifiedAvailability = JSON.parse(JSON.stringify(dateRange))
  }

  function handleDatesChange(changedDate: Date, isStart: boolean) {
    let updatedAvailability
    let parsedDate = moment(changedDate).format('YYYY-MM-DD')

    if (isStart) {
      updatedAvailability = [
        {
          startDate: parsedDate,
          endDate: availability[0].endDate,
        },
      ]
    } else {
      updatedAvailability = [
        {
          startDate: availability[0].startDate,
          endDate: parsedDate,
        },
      ]
    }

    dispatch(setAvailability(updatedAvailability))
  }

  function handleDateSelect(date: any) {
    console.log('handleDateSelect is triggered')
  }

  useEffect(() => {
    getAvailability()
  }, [user])

  // TODO: what if availability is not rendered yet? (in 'selected')
  return (
    <div>
      <p>startDate</p>
      <DatePicker
        selected={new Date(availability[0].startDate)}
        openToDate={new Date()}
        onChange={(date: Date) => handleDatesChange(date, true)}
        onSelect={(date: Date) => handleDateSelect(date)}
      />
      <p>endDate</p>
      <DatePicker
        selected={new Date(availability[0].endDate)}
        openToDate={new Date(availability[0].startDate)}
        onChange={(date: Date) => handleDatesChange(date, false)}
        onSelect={handleDateSelect}
      />
    </div>
  )
}
