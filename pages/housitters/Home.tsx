import { useRouter } from 'next/router'
import SignOut from '../../components/Buttons/SignOut'
import GoToProfileButton from '../../components/GoToProfileButton'
import { useDispatch, useSelector } from 'react-redux'
import { selectFirstNameState, setAvailability } from '../../slices/userSlice'
import { selectLocationsState, setLocationsState } from '../../slices/housitterSlice'
import { HOUSITTERS_ROUTES } from '../../utils/constants'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'

import HousePost from '../../components/HousePost'

import { setLocationState } from '../../slices/landlordSlice'
export default function Home() {
  const user = useUser()
  const router = useRouter()
  const dispatch = useDispatch()
  const firstName = useSelector(selectFirstNameState)
  const locations = useSelector(selectLocationsState)
  const supabase = useSupabaseClient()
  const [posts, setPosts] = useState([{}])

  // can set loading states if needed

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
        let relevantLocations: string[] = ['']
        let { data: housittersData, error } = await supabase
          .from('housitters')
          .select(`locations, availability`)
          // TODO: nope sirry bob, you must filter at this point, using the settings of the specific housitter. dont get everything
          .eq('user_id', user.id)
          .single()

        if (error) {
          // debugger
          alert(error.message)
        } else if (housittersData) {
          dispatch(setLocationsState(housittersData.locations))
          dispatch(setAvailability(housittersData.availability))
          Object.keys(locations).forEach((loc) => {
            if (locations[loc]) {
              relevantLocations.push(loc)
            }
          })
        }

        let { data: postsData, error: postsError } = await supabase
          .from('active_posts')
          // TODO: nope sirry bob, you must filter at this point, using the settings of the specific housitter. dont get everything

          .select(`landlord_uid, start_date, end_date, location, title, free_text, pets`)
          .in('location', ['nearTa']) // TODO: temp, just until i have the right data in the db.
        // .in('location', relevantLocations)

        // TODO: how to only query dates in the selected time period
        // lets first see that i can query with regular fields
        if (postsError) {
          // debugger
          alert(postsError.message)
        } else if (postsData) {
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
          title={post.title} // not mandatory
          text={post.free_text}
          location={post.location}
          startDate={post.startDate}
          endDate={post.endDate}
        />
      ))}
      <SignOut />
    </div>
  )
}
