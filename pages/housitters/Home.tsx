import { useRouter } from 'next/router'
import SignOut from '../../components/Buttons/SignOut'
import SidebarFilter from '../../components/SidebarFilter'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectFirstNameState,
  setAvailability,
  selectAvailabilityState,
  selectIsLoggedState,
} from '../../slices/userSlice'
import { selectLocationsState, setLocationsState } from '../../slices/housitterSlice'
import { LANDLORDS_ROUTES, LocationIds } from '../../utils/constants'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import HousePost from '../../components/HousePost'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { selectImagesUrlsState } from '../../slices/postSlice'
import { Nav, NavDropdown, Navbar } from 'react-bootstrap'

export default function Home() {
  const user = useUser()
  const router = useRouter()
  const dispatch = useDispatch()
  const firstName = useSelector(selectFirstNameState)
  const locations = useSelector(selectLocationsState)
  const availability = useSelector(selectAvailabilityState)
  const supabase = useSupabaseClient()
  const [posts, setPosts] = useState([] as Object[])
  const imagesUrls = useSelector(selectImagesUrlsState)
  const isLogged = useSelector(selectIsLoggedState)

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
    if (!user) {
      return
    }

    const asyncWrapper = async () => {
      // I'm not sure you need this, check what happens after sign in
      const dates: any[] = []

      let { data: housittersData, error } = await supabase
        .from('housitters')
        .select(
          `locations, profiles!inner (
            available_dates!inner (start_date, end_date, period_index)
          )`
        )
        .eq('user_id', user.id)
        .single()

      if (error) {
        alert(error.message)
      } else if (housittersData && housittersData.profiles) {
        const newLocations = housittersData.locations
        const locationsChanged = JSON.stringify(locations) !== JSON.stringify(newLocations)

        // since react does a shallow comparison of locations, and therefore will re-render even if the inside values are the same.
        if (locationsChanged && isLogged) {
          dispatch(setLocationsState(newLocations))
        }

        // TODO: just for naming convention (to align with the availabaility object name), traversing again...

        for (const housitterAvailabilitySelector of (housittersData.profiles as any)
          .available_dates) {
          dates.push({
            startDate: housitterAvailabilitySelector.start_date,
            endDate: housitterAvailabilitySelector.end_date,
          })
        }
      }

      // TODO: add a ifActive filter.
      try {
        let { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(
            `landlord_id, start_date, end_date, title, description, images_urls, landlords!inner (
                location, profiles!inner (
                  first_name
                )
            )`
          )
          .in('landlords.location', locations)

        if (postsError) {
          alert(postsError.message)
        } else if (postsData) {
          // TODO: maybe also show how many posts outside its range, so getting from db does make sense...

          // I can compare lengths and see how many relevant posts outside the dates I'm looking for. not necessarily a good feature.
          let postsFilteredByPeriod = postsData.filter((post) => {
            for (const housitterAvailabilitySelector of dates) {
              return (
                housitterAvailabilitySelector.startDate <= post.start_date &&
                housitterAvailabilitySelector.endDate >= post.end_date
              )
            }
          })

          setPosts(postsFilteredByPeriod)
        }
      } catch (e: any) {
        alert(e)
      }

      // for Date filtering, I can also use the 'or' for at least one range, to filter on db call.
    }

    asyncWrapper()
  }, [user, locations, availability])

  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand className="mr-auto" href="#">
          Housitters
        </Navbar.Brand>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <NavDropdown title="My Profile" id="basic-nav-dropdown">
              <NavDropdown.Item href={LANDLORDS_ROUTES.ACCOUNT}>Edit Profile</NavDropdown.Item>
              <SignOut />
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <div>
        <h1>Hello {firstName}! Let's find you a cute pet to feel at home with.</h1>
        <h2>here are all the relvant posts for you</h2>
        <Row className="justify-content-center">
          {posts.length === 0 ? (
            <p>
              There are no available houses with your current filtering. Try expanding your search
              to broader dates or locations.
            </p>
          ) : (
            posts.map((post: any, index: number) => (
              <Col key={index} md={4} className="mb-4">
                <HousePost
                  landlordId={post.landlord_id}
                  title={post.title}
                  description={post.description}
                  location={post.landlords ? post.landlords.location : ''}
                  availability={availability}
                  dogs={post.dogs}
                  cats={post.cats}
                  imagesUrls={post.images_urls ? post.images_urls : ''} // TODO: should have default image
                  key={index}
                />
              </Col>
            ))
          )}
        </Row>
      </div>
      <SidebarFilter
        isHousitter={true}
        showCustomLocations={locations.length < Object.values(LocationIds).length}
        selectionType="checkbox"
      />
    </>
  )
}

// TODO: have the SidebarFilter accept props for location and props for availability
