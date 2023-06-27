import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectFirstNameState,
  selectAvailabilityState,
  selectIsLoggedState,
  setAvatarUrl,
} from '../../slices/userSlice'
import { selectLocationsState, setLocationsState } from '../../slices/housitterSlice'
import {
  PageRoutes,
  LocationIds,
  USER_TYPE,
  DefaultFavouriteUser,
  SortingProperties,
} from '../../utils/constants'

import { ImageData } from '../../types/clientSide'

import SidebarFilter from '../../components/SidebarFilter'
import HomeNavbar from '../../components/HomeNavbar'
import HousePreview from '../../components/HousePreview'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Container } from 'react-bootstrap'
import Link from 'next/link'

import { selectAvailablePostsState, setAvailablePosts } from '../../slices/availablePostsSlice'
import { selectAllFavouriteUsers, setAllFavouriteUsers } from '../../slices/favouritesSlice'

export default function Home() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const dispatch = useDispatch()
  const firstName = useSelector(selectFirstNameState)
  const locations = useSelector(selectLocationsState)
  const availability = useSelector(selectAvailabilityState)
  const isLogged = useSelector(selectIsLoggedState)

  const availablePosts = useSelector(selectAvailablePostsState)

  const favouriteUsers = useSelector(selectAllFavouriteUsers)

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

      try {
        let { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(
            `landlord_id, title, description, images_urls, landlords!inner (
                location, profiles!inner (
                  first_name, available_dates (start_date, end_date), pets!inner (
                    dogs, cats
                  )
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
          // I can compare lengths and see how many relevant posts outside the dates I'm looking for. not necessarily a good feature.
          let postsFilteredByPeriod = postsData.filter((post) => {
            return (post?.landlords as any).profiles?.available_dates.some((postPeriod: any) => {
              for (const housitterAvailabilitySelector of housitterAvailableDates) {
                return (
                  housitterAvailabilitySelector.endDate.startsWith('1970') ||
                  new Date(postPeriod.end_date).getFullYear().toString() === '1970' ||
                  (housitterAvailabilitySelector.startDate <= postPeriod.start_date &&
                    housitterAvailabilitySelector.endDate >= postPeriod.end_date)
                )
              }
            })
          })

          const parsedAvailablePosts = postsFilteredByPeriod.map((post) => {
            let parsedAvailabePost = {
              landlordId: post.landlord_id,
              title: post.title,
              description: post.description,
              imagesUrls: post.images_urls
                ? post.images_urls.map((imageUrl: string, index: number) => ({
                    url: imageUrl,
                    id: index,
                  }))
                : '',
            } as any

            if (post.landlords) {
              if (Array.isArray(post.landlords)) {
                parsedAvailabePost.location = post.landlords[0] ? post.landlords[0].location : ''
                parsedAvailabePost.dogs = (post.landlords as any).profiles?.pets?.dogs
                parsedAvailabePost.cats = (post.landlords as any).profiles?.pets?.cats
              } else {
                parsedAvailabePost.location = post.landlords.location
                parsedAvailabePost.dogs = (post.landlords.profiles as any).pets?.dogs
                parsedAvailabePost.cats = (post.landlords.profiles as any).pets?.cats
              }
            }

            return parsedAvailabePost
          })

          dispatch(setAvailablePosts(parsedAvailablePosts))

          const { error: favouritesError, data: favouritesData } = await supabase
            .from('favourites')
            .select('created_at, favourite_user_type, favourite_user_id')
            .eq('marked_by_user_id', user!.id)

          if (favouritesError) {
            alert(`failed retrieving favourites: ${favouritesError}`)
            debugger
            throw favouritesError
          }

          if (favouritesData) {
            let retrievedFavouriteUsers = [] as (typeof DefaultFavouriteUser)[]

            retrievedFavouriteUsers = favouritesData.map((favouriteUser) => ({
              favouriteUserType: USER_TYPE.Landlord,
              favouriteUserId: favouriteUser.favourite_user_id,
              markedByUserId: user!.id,
            }))

            const favouritesChanged =
              JSON.stringify(retrievedFavouriteUsers) !== JSON.stringify(favouriteUsers)

            if (favouritesChanged) {
              dispatch(setAllFavouriteUsers(retrievedFavouriteUsers))
            }
          }
        }
      } catch (e: any) {
        alert(e.message)
        debugger
      }

      // for Date filtering, I can also use the 'or' for at least one range, to filter on db call.
    }

    asyncWrapper()
  }, [user, locations, availability, firstName])

  function sortPosts(sortByProperty: string) {
    let sortedPosts: any[] = [...availablePosts]

    if (typeof sortedPosts[0][sortByProperty] === 'string') {
      // TODO: currently no such filter for posts
      // sortedPosts.sort((a, b) => a.firstName.localeCompare(b.firstName))
    } else if (sortByProperty === SortingProperties.PetsQuantity) {
      sortedPosts.sort((a, b) => a.dogs + a.cats - (b.dogs + b.cats))
    }

    dispatch(setAvailablePosts(sortedPosts))
  }

  return (
    <>
      <HomeNavbar
        userType={USER_TYPE.Housitter}
        accountRoute={PageRoutes.HousitterRoutes.Account}
      />

      <Container>
        <h2>
          Hello {firstName}! <br /> Let's find you a cute pet to feel at home with.
        </h2>

        <h2>here are all the relevant posts for you</h2>
        <Row>
          <Col md={9}>
            <Row>
              {availablePosts.length === 0 ? (
                <div>
                  <p>
                    There are currently no available houses for you.
                    <br />
                    Try expanding your search to broader dates or locations.
                    <br />
                    you should know: landlords can still find you and contact you directly{' '}
                  </p>
                </div>
              ) : (
                availablePosts.map((post: any, index: number) => (
                  <Col key={index} md={4} className="mb-4">
                    <Link href={`/housitters/house/${post.landlordId}`}>
                      <a>
                        <HousePreview
                          landlordId={post.landlordId}
                          title={post.title}
                          description={post.description}
                          location={post.location}
                          availability={availability} // the sitter availability
                          dogs={post.dogs}
                          cats={post.cats}
                          key={index}
                          imagesUrls={
                            post.imagesUrls
                              ? post.imagesUrls.map((imageData: ImageData) => ({
                                  url: imageData.url,
                                  id: imageData.id,
                                }))
                              : ''
                          } // TODO: should have default image
                        />
                      </a>
                    </Link>
                  </Col>
                ))
              )}
            </Row>
          </Col>
          <Col md={3}>
            <SidebarFilter
              isHousitter={true}
              showCustomLocations={locations.length < Object.values(LocationIds).length}
              selectionType="checkbox"
              sortElementsHandler={sortPosts}
            />
          </Col>
        </Row>
      </Container>
    </>
  )
}

// TODO: have the SidebarFilter accept props for location and props for availability
