import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  SortingProperties,
  LocationDescriptions,
  LocationSelectionEventKeys,
  PageRoutes,
  UserType,
  LocationIds,
} from '../../utils/constants'

import { ImageData } from '../../types/clientSide'
import SidebarFilter from '../../components/SidebarFilter'
import DatePicker from 'react-datepicker'
import HousePreview from '../../components/HousePreview'
import { Row, Col, Alert, Container, Card, Dropdown, Accordion } from 'react-bootstrap'
import { useRouter } from 'next/router'
import { selectIsActiveState } from '../../slices/createPostSlice'
import { selectAvailabilityState, selectPrimaryUseState } from '../../slices/userSlice'
import AvailabilitySelector from '../../components/AvailabilitySelector'
import LocationSelector from '../../components/LocationSelector'
import { arraysContainSameElements, handleError } from '../../utils/helpers'
import {
  selectLocationsState as selectHousitterLocationsState,
  setLocationsState as setHousitterLocationsState,
} from '../../slices/housitterSlice'

export default function Home() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const isActivePost = useSelector(selectIsActiveState)
  const userType = useSelector(selectPrimaryUseState)

  const [dateRange, setDateRange] = useState([null, null] as (null | Date)[])
  const [startDate, endDate] = dateRange

  const [landlordLocation, setLandlordLocation] = useState('Anywhere')

  const housitterLocations = useSelector(selectHousitterLocationsState)

  const [availablePosts, setAvailablePosts] = useState([] as any[])
  const availability = useSelector(selectAvailabilityState)
  const [isHousitter, setIsHousitter] = useState(userType === UserType.Housitter)

  useEffect(() => {
    if (!user) {
      return
    } else {
      setIsHousitter(userType === UserType.Housitter)
      const asyncWrapper = async () => {
        // if (user && !isLogged) {
        //   // I'm not sure you need this, check what happens after sign in
        //   const housitterAvailableDates: any[] = []

        //   let { data: housittersData, error } = await supabase
        //     .from('housitters')
        //     .select(
        //       `locations, profiles!inner (
        //       avatar_url, available_dates!inner (start_date, end_date, period_index)
        //     )`
        //     )
        //     // .eq('user_id', user.id)
        //     .single()

        //   if (error) {
        //     console.log(error.message)
        //     debugger
        //   } else if (housittersData && housittersData.profiles) {
        //     const newLocations = housittersData.locations
        //     const locationsChanged = JSON.stringify(locations) !== JSON.stringify(newLocations)

        //     // since react does a shallow comparison of locations, and therefore will re-render even if the inside values are the same.
        //     if (locationsChanged && isLogged) {
        //       dispatch(setLocationsState(newLocations))
        //     }

        //     dispatch(setAvatarUrl((housittersData.profiles as any).avatar_url))

        //     // TODO: just for naming convention (to align with the availabaility object name), traversing again...
        //     for (const housitterAvailabilitySelector of (housittersData.profiles as any)
        //       .available_dates) {
        //       housitterAvailableDates.push({
        //         startDate: housitterAvailabilitySelector.start_date,
        //         endDate: housitterAvailabilitySelector.end_date,
        //       })
        //     }
        //   }

        //   try {
        //     let { data: postsData, error: postsError } = await supabase
        //       .from('posts')
        //       .select(
        //         `landlord_id, title, description, images_urls, landlords!inner (
        //           location, profiles!inner (
        //             first_name, available_dates (start_date, end_date), pets!inner (
        //               dogs, cats
        //             )
        //           )
        //       )`
        //       )
        //       .in('landlords.location', locations)
        //       .eq('is_active', true)

        //     if (postsError) {
        //       console.log(postsError.message)
        //       debugger
        //       throw postsError
        //     } else if (postsData) {
        //       // I can compare lengths and see how many relevant posts outside the dates I'm looking for. not necessarily a good feature.
        //       let postsFilteredByPeriod = postsData.filter((post) => {
        //         return (post?.landlords as any).profiles?.available_dates.some((postPeriod: any) => {
        //           for (const housitterAvailabilitySelector of housitterAvailableDates) {
        //             return (
        //               housitterAvailabilitySelector.endDate.startsWith('1970') ||
        //               new Date(postPeriod.end_date).getFullYear().toString() === '1970' ||
        //               (housitterAvailabilitySelector.startDate <= postPeriod.start_date &&
        //                 housitterAvailabilitySelector.endDate >= postPeriod.end_date)
        //             )
        //           }
        //         })
        //       })

        //       const parsedAvailablePosts = postsFilteredByPeriod.map((post) => {
        //         let parsedAvailabePost = {
        //           landlordId: post.landlord_id,
        //           title: post.title,
        //           description: post.description,
        //           imagesUrls: post.images_urls
        //             ? post.images_urls.map((imageUrl: string, index: number) => ({
        //                 url: imageUrl,
        //                 id: index,
        //               }))
        //             : '',
        //         } as any

        //         if (post.landlords) {
        //           if (Array.isArray(post.landlords)) {
        //             parsedAvailabePost.location = post.landlords[0] ? post.landlords[0].location : ''
        //             parsedAvailabePost.dogs = (post.landlords as any).profiles?.pets?.dogs
        //             parsedAvailabePost.cats = (post.landlords as any).profiles?.pets?.cats
        //           } else {
        //             parsedAvailabePost.location = post.landlords.location
        //             parsedAvailabePost.dogs = (post.landlords.profiles as any).pets?.dogs
        //             parsedAvailabePost.cats = (post.landlords.profiles as any).pets?.cats
        //           }
        //         }

        //         return parsedAvailabePost
        //       })

        //       dispatch(setAvailablePosts(parsedAvailablePosts))

        //       const { error: favouritesError, data: favouritesData } = await supabase
        //         .from('favourites')
        //         .select('created_at, favourite_user_type, favourite_user_id')
        //         .eq('marked_by_user_id', user!.id)

        //       if (favouritesError) {
        //         console.log(`failed retrieving favourites: ${favouritesError}`)
        //         debugger
        //         throw favouritesError
        //       }

        //       if (favouritesData) {
        //         let retrievedFavouriteUsers = [] as (typeof DefaultFavouriteUser)[]

        //         retrievedFavouriteUsers = favouritesData.map((favouriteUser) => ({
        //           favouriteUserType: UserType.Landlord,
        //           favouriteUserId: favouriteUser.favourite_user_id,
        //           markedByUserId: user!.id,
        //         }))

        //         const favouritesChanged =
        //           JSON.stringify(retrievedFavouriteUsers) !== JSON.stringify(favouriteUsers)

        //         if (favouritesChanged) {
        //           dispatch(setAllFavouriteUsers(retrievedFavouriteUsers))
        //         }
        //       }
        //     }
        //   } catch (e: any) {
        //     console.log(e.message)
        //     debugger
        //   }

        //   // for Date filtering, I can also use the 'or' for at least one range, to filter on db call.
        // } else {

        let postsQuery = supabase
          .from('posts')
          .select(
            `landlord_id, title, description, images_urls, landlords!inner (
          location, profiles!inner (
            first_name, avatar_url, available_dates (start_date, end_date), pets!inner (
              dogs, cats
            )
          )
      )`
          )
          .eq('is_active', true)

        if (isHousitter) {
          if (!housitterLocations.find((loc: string) => loc === 'Anywhere')) {
            postsQuery = postsQuery.in('landlords.location', housitterLocations)
          }
        } else {
          postsQuery = postsQuery.eq('landlords.location', landlordLocation)
        }

        let { data: postsData, error: postsError } = await postsQuery

        if (postsError) {
          console.log(postsError.message)
          debugger
          throw postsError
        } else if (postsData) {
          // I can compare lengths and see how many relevant posts outside the dates I'm looking for. not necessarily a good feature.
          // let postsFilteredByPeriod = postsData.filter((post) => {
          //   return (post?.landlords as any).profiles?.available_dates.some((postPeriod: any) => {
          //     for (const housitterAvailabilitySelector of housitterAvailableDates) {
          //       return (
          //         housitterAvailabilitySelector.endDate.startsWith('1970') ||
          //         new Date(postPeriod.end_date).getFullYear().toString() === '1970' ||
          //         (housitterAvailabilitySelector.startDate <= postPeriod.start_date &&
          //           housitterAvailabilitySelector.endDate >= postPeriod.end_date)
          //       )
          //     }
          //   })
          // })

          const parsedAvailablePosts = postsData.map((post) => {
            let parsedAvailabePost = {
              landlordId: post.landlord_id,
              title: post.title,
              description: post.description,
              imagesUrls: post.images_urls // TODO: should type
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

          setAvailablePosts(parsedAvailablePosts)
          // }
        }
      }

      asyncWrapper()
    }
  }, [user, availability, userType, landlordLocation, housitterLocations])

  function sortPosts(sortByProperty: string, sortOrder: string) {
    let sortedPosts: any[] = [...availablePosts]

    switch (sortByProperty) {
      case SortingProperties.HousitterDashboard.PetsQuantity:
        if (sortOrder === 'asc') {
          sortedPosts.sort((a, b) => a.dogs + a.cats - (b.dogs + b.cats))
        } else {
          sortedPosts.sort((a, b) => b.dogs + b.cats - (a.dogs + a.cats))
        }
        break
    }

    setAvailablePosts(sortedPosts)
  }

  return (
    <Container>
      <h2>Looking for a great house?</h2>
      <h5>Let's find a cute pet for you to feel at home with.</h5>

      <Row>
        <Col md={3}>
          {userType === UserType.Landlord && (
            <Card className="sidebar-filter">
              {isActivePost ? (
                <div>
                  <Accordion>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>My Post</Accordion.Header>
                      <Accordion.Body></Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </div>
              ) : (
                <p style={{ marginBottom: 0 }}>
                  💡 Try&nbsp;
                  <strong
                    onClick={() => {
                      router.push(PageRoutes.HousitterRoutes.EditHouse)
                    }}
                    style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    completing your post
                  </strong>
                  &nbsp;to increase your chances of finding a sitter!
                </p>
              )}
            </Card>
          )}

          <Card className="sidebar-filter">
            <h4>Dates</h4>
            {/* <DatePicker
              className="w-100"
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              placeholderText="Anytime"
              onChange={(update) => {
                setDateRange(update)
              }}
              isClearable={true}
            /> */}
            {availability.map((period, index) => (
              <AvailabilitySelector
                className="w-100"
                key={index}
                period={period}
                index={index}
                updateDbInstantly={true}
              />
            ))}
            <h4>Location</h4>
            {isHousitter ? (
              <LocationSelector
                selectionType={isHousitter ? 'checkbox' : 'radio'}
                isHousitter={isHousitter}
                showCustomLocations={
                  isHousitter
                    ? housitterLocations.length > 0 &&
                      housitterLocations.length < Object.values(LocationIds).length
                    : true
                }
                updateDbInstantly={true}
              />
            ) : (
              <Dropdown>
                <Dropdown.Toggle variant="success">
                  {landlordLocation !== 'Anywhere'
                    ? LocationDescriptions[landlordLocation]
                    : 'Anywhere'}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => setLandlordLocation(LocationSelectionEventKeys.Anywhere)}
                  >
                    Anywhere
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  {Object.entries(LocationDescriptions).map(([key, value]) => (
                    <Dropdown.Item key={key} onClick={() => setLandlordLocation(key)}>
                      {value}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            )}
            <h4>Sort</h4>

            <SidebarFilter
              isHousitter={true}
              showCustomLocations={false}
              selectionType="checkbox"
              sortElementsHandler={sortPosts}
            />
          </Card>
        </Col>
        <Col md={9}>
          <Row
          // className={
          //   availablePosts.length === 0
          //     ? 'h-100 align-items-center justify-content-center '
          //     : ''
          // }
          // style={availablePosts.length === 0 ? { minHeight: '300px' } : {}}
          >
            {availablePosts.length === 0 ? (
              <Alert variant="info" className="text-center alert-trimmed mx-auto">
                There are currently no available houses for these settings.
                <br className="mb-2" />
                Try broader dates or locations.
              </Alert>
            ) : (
              availablePosts.map((post: any, index: number) => (
                <Col key={index} md={4} className="mt-4">
                  <HousePreview
                    landlordId={post.landlordId}
                    title={post.title}
                    description={post.description}
                    location={post.location}
                    dogs={post.dogs}
                    cats={post.cats}
                    key={index}
                    imagesUrls={
                      post.imagesUrls
                        ? post.imagesUrls.map((imageData: ImageData) => ({
                            url: imageData.url,
                            id: imageData.id,
                          }))
                        : []
                    }
                    addMissingDetailsHandler={null}
                  />
                </Col>
              ))
            )}
          </Row>
        </Col>
      </Row>
    </Container>
  )
}

// TODO: have the SidebarFilter accept props for location and props for availability
