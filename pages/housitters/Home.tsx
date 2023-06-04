import { useDispatch, useSelector } from 'react-redux'
import {
  selectFirstNameState,
  selectAvailabilityState,
  selectIsLoggedState,
  selectAvatarUrlState,
  setAvatarUrl,
} from '../../slices/userSlice'
import { selectLocationsState, setLocationsState } from '../../slices/housitterSlice'
import { LANDLORDS_ROUTES, LocationIds, USER_TYPE } from '../../utils/constants'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { selectImagesUrlsState } from '../../slices/postSlice'
import { Nav, NavDropdown, Navbar } from 'react-bootstrap'

import HousePost from '../../components/HousePost'
import Picture from '../../components/Picture'
import SignOut from '../../components/Buttons/SignOut'
import SidebarFilter from '../../components/SidebarFilter'
import Inbox from '../../components/Inbox'

export default function Home() {
  const user = useUser()
  const dispatch = useDispatch()
  const firstName = useSelector(selectFirstNameState)
  const locations = useSelector(selectLocationsState)
  const availability = useSelector(selectAvailabilityState)
  const supabase = useSupabaseClient()
  const [posts, setPosts] = useState([] as Object[])
  const isLogged = useSelector(selectIsLoggedState)
  const avatarUrl = useSelector(selectAvatarUrlState)

  // TODO: can set loading states if needed

  useEffect(() => {
    if (!user) {
      return
    }

    const asyncWrapper = async () => {
      // I'm not sure you need this, check what happens after sign in
      const housitterAvailableDates: any[] = []

      let { data: housittersData, error } = await supabase
        .from('housitters')
        .select(
          `locations, profiles!inner (
            avatar_url, available_dates!inner (start_date, end_date, period_index)
          )`
        )
        .eq('user_id', user.id)
        .single()

      if (error) {
        alert(error.message)
        debugger
      } else if (housittersData && housittersData.profiles) {
        const newLocations = housittersData.locations
        const locationsChanged = JSON.stringify(locations) !== JSON.stringify(newLocations)

        // since react does a shallow comparison of locations, and therefore will re-render even if the inside values are the same.
        if (locationsChanged && isLogged) {
          dispatch(setLocationsState(newLocations))
        }

        dispatch(setAvatarUrl((housittersData.profiles as any).avatar_url))

        // TODO: just for naming convention (to align with the availabaility object name), traversing again...
        for (const housitterAvailabilitySelector of (housittersData.profiles as any)
          .available_dates) {
          housitterAvailableDates.push({
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
            `landlord_id, title, description, images_urls, landlords!inner (
                location, profiles!inner (
                  first_name, available_dates (start_date, end_date)
                )
            )`
          )
          .in('landlords.location', locations)
          .eq('is_active', true)

        if (postsError) {
          alert(postsError.message)
          debugger
          throw postsError
        } else if (postsData) {
          // TODO: maybe also show how many posts outside its range, so getting from db does make sense...

          // I can compare lengths and see how many relevant posts outside the dates I'm looking for. not necessarily a good feature.
          let postsFilteredByPeriod = postsData.filter((post) => {
            return (post?.landlords as any).profiles?.available_dates.some((postPeriod: any) => {
              for (const housitterAvailabilitySelector of housitterAvailableDates) {
                return (
                  housitterAvailabilitySelector.endDate.startsWith('1970') ||
                  postPeriod.end_date.getFullYear().toString() === '1970' ||
                  (housitterAvailabilitySelector.startDate <= postPeriod.start_date &&
                    housitterAvailabilitySelector.endDate >= postPeriod.end_date)
                )
              }
            })
          })

          setPosts(postsFilteredByPeriod)
        }
      } catch (e: any) {
        alert(e.message)
        debugger
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
        {user && (
          <Picture
            isIntro={false}
            uid={user.id}
            url={avatarUrl}
            email={user.email as string}
            primaryUse={USER_TYPE.Housitter}
            size={100}
            width={100} // should persist dimensions of image upon upload
            height={100}
            disableUpload={true}
            bucketName="avatars"
            isAvatar={true}
            promptMessage=""
          />
        )}
        <h2>here are all the relevant posts for you</h2>
        <Row className="justify-content-center">
          {posts.length === 0 ? (
            <p>
              There are no available houses with your current filtering.
              <br />
              Try expanding your search to broader dates or locations. k?
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
                  key={index}
                  imagesUrls={
                    post.images_urls
                      ? post.images_urls.map((imageUrl: string) => ({ url: imageUrl, id: index }))
                      : ''
                  } // TODO: should have default image
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
      <Inbox />
    </>
  )
}

// TODO: have the SidebarFilter accept props for location and props for availability
