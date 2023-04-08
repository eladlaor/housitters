import { useRouter } from 'next/router'
import SignOut from '../../components/Buttons/SignOut'
import GoToProfileButton from '../../components/GoToProfileButton'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectFirstNameState,
  setAvailability,
  selectAvailabilityState,
} from '../../slices/userSlice'
import { selectLocationsState, setLocationsState } from '../../slices/housitterSlice'
import { HOUSITTERS_ROUTES } from '../../utils/constants'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

import HousePost from '../../components/HousePost'

import { setLocationState } from '../../slices/landlordSlice'
export default function Home() {
  const user = useUser()
  const router = useRouter()
  const dispatch = useDispatch()
  const firstName = useSelector(selectFirstNameState)
  const locations = useSelector(selectLocationsState)
  const availability = useSelector(selectAvailabilityState)
  const supabase = useSupabaseClient()
  const [posts, setPosts] = useState([{}])

  // TODO: can set loading states if needed

  /*
    filters:
        when

        where
  */

  /*
            what to show on a landlord card:
              when
              where
              picture
              how many animals
              the start of the free text (no headline needed) with a 'read more' option which open the add as a modal and allows you to send message.
        */

  /*
    on first render:
      use the following filters to produce the data

  */

  useEffect(() => {
    if (user) {
      const asyncWrapper = async () => {
        // I'm not sure you need this, check what happens after sign in
        let { data: housittersData, error } = await supabase
          .from('housitters')
          .select(
            `locations, profiles!inner (
            available_dates!inner (start_date, end_date)
          )`
          )
          .eq('user_id', user.id)
          .single()

        if (error) {
          alert(error.message)
        } else if (housittersData && housittersData.profiles) {
          dispatch(setLocationsState(housittersData.locations))

          // TODO: get available dates as you should, dispatch as you should, and only then see how filter with multiple ranges...

          // TODO: type it better
          const dates = housittersData.profiles as {
            available_dates: [{ start_date: any; end_date: any }]
          }

          dispatch(setAvailability(dates.available_dates))
        }

        // TODO: add a ifActive filter.
        let { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(
            `user_id, start_date, end_date, title, description, landlords!inner (
              location, profiles!inner (
                first_name, pets!inner (
                  dogs, cats
                )
              )
          )`
          )
          .in('landlords.location', locations)

        // TODO: for Date filtering, I can use the 'or' for at least one range, should be better.

        // TODO: how to only query dates in the selected time period
        // lets first see that i can query with regular fields
        if (postsError) {
          alert(postsError.message)
        } else if (postsData) {
          // TODO: filter dates...
          // TODO: maybe also show how many posts outside its range, so getting from db does make sense...

          setPosts(postsData)
          console.log('this is postsData:', postsData)
        }
      }

      asyncWrapper()
    }
  }, [user])

  return (
    <div>
      <h1>Hello {firstName}! Let's find you a cute pet to feel at home with.</h1>
      <GoToProfileButton accountRoute={HOUSITTERS_ROUTES.ACCOUNT} />
      <h2>here are all the relvant posts for you</h2>
      {posts.map((post: any) => (
        <HousePost
          title={post.title}
          text={post.description}
          location={post.landlords ? post.landlords.location : ''}
          startDate={post.startDate}
          endDate={post.endDate}
          dogs={post.dogs}
          cats={post.cats}
        />
      ))}
      <SignOut />
    </div>
  )
}
