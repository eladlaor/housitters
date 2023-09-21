import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import DatePicker from 'react-datepicker'

import {
  SortingProperties,
  LocationDescriptions,
  LocationSelectionEventKeys,
  PageRoutes,
  UserType,
  NoDescriptionDefaultMessage,
} from '../../utils/constants'

import { DatePickerSelection, ImageData } from '../../types/clientSide'
import HousePreview from '../../components/HousePreview'
import { Row, Col, Alert, Container, Card, Dropdown, Accordion, Button } from 'react-bootstrap'
import { useRouter } from 'next/router'
import { selectPrimaryUseState } from '../../slices/userSlice'
import LocationSelector from '../../components/LocationSelector'
import { handleError } from '../../utils/helpers'
import {
  selectLocationsState as selectHousitterLocationsState,
  setLocationsState as setHousitterLocationsState,
} from '../../slices/housitterSlice'
import Footer from '../../components/Footer'
import Sorter from '../../components/Sorter'
import { countDays } from '../../utils/dates'

export default function Home() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const userId = user?.id
  const router = useRouter()
  const userType = useSelector(selectPrimaryUseState)

  // const [dateRange, setDateRange] = useState([null, null] as (null | Date)[])
  const [isPostComplete, setIsPostComplete] = useState(true)

  const [landlordLocation, setLandlordLocation] = useState(LocationSelectionEventKeys.Anywhere)

  const housitterLocations = useSelector(selectHousitterLocationsState)

  const [availablePosts, setAvailablePosts] = useState([] as any[])
  const [isHousitter, setIsHousitter] = useState(userType === UserType.Housitter)
  const [availabilityFilter, setAvailabilityFilter] = useState([
    [null, null],
  ] as DatePickerSelection[])

  useEffect(() => {
    if (!userId) {
      return
    }

    const loadAvailability = async () => {
      console.log(userId)
      const { error: availabilityError, data: availabilityData } = await supabase
        .from('available_dates')
        .select(`start_date, end_date, user_id`)
        .eq('user_id', userId)
      if (availabilityError) {
        return handleError(availabilityError.message, 'houses.index.useEffect query availability')
      }
      if (availabilityData) {
        setAvailabilityFilter(
          availabilityData.map((row) => [new Date(row.start_date), new Date(row.end_date)])
        )
      }
    }
    loadAvailability()
  }, [userId])

  useEffect(() => {
    if (!userId) {
      return
    } else {
      setIsHousitter(userType === UserType.Housitter)
      const loadRelevantHousePreviews = async () => {
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
          if (
            !housitterLocations.find((loc: string) => loc === LocationSelectionEventKeys.Anywhere)
          ) {
            postsQuery = postsQuery.in('landlords.location', housitterLocations)
          }
        } else {
          if (landlordLocation !== LocationSelectionEventKeys.Anywhere) {
            postsQuery = postsQuery.eq('landlords.location', landlordLocation)
          }
        }

        let { data: postsData, error: postsError } = await postsQuery

        if (postsError) {
          return handleError(postsError.message, 'houses.index.useEffect.postsError')
        } else if (postsData) {
          const { error: availabilityError, data: availabilityData } = await supabase
            .from('available_dates')
            .select(`start_date, end_date, user_id`)
            .eq('user_type', UserType.Landlord)
          if (availabilityError) {
            return handleError(
              availabilityError.message,
              'houses.index.useEffect query availability'
            )
          }

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

            if (availabilityData) {
              const matchedAvailabilityData = availabilityData.filter(
                (availability) => availability.user_id === parsedAvailabePost.landlordId
              )

              let durationInDays = 0
              let modifiedDateRanges = [] as { startDate: string; endDate: string }[]
              for (const period of matchedAvailabilityData) {
                durationInDays = durationInDays + countDays(period.start_date, period.end_date)
                modifiedDateRanges.push({ startDate: period.start_date, endDate: period.end_date })
              }
              parsedAvailabePost.duration = durationInDays
              parsedAvailabePost.dateRanges = modifiedDateRanges
            }

            let landlordFullName: string = ''
            if (post.landlords) {
              landlordFullName = `${(post.landlords as any).profiles?.first_name} ${
                (post.landlords as any).profiles?.last_name
              }`

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

            if (post.landlord_id === userId) {
              if (
                !post?.title ||
                post?.title === landlordFullName ||
                !post?.description ||
                post?.description === NoDescriptionDefaultMessage ||
                !post?.images_urls
              ) {
                setIsPostComplete(false)
              }
            }

            return parsedAvailabePost
          })

          const parsedAvailablePostsFilteredByAvailability = parsedAvailablePosts.filter((post) => {
            return post.dateRanges.some((postRange: any) => {
              // not taking timezones into account
              const postStartDate = new Date(postRange.startDate)
              const postEndDate = new Date(postRange.endDate)
              return availabilityFilter.some(([startDateFilter, endDateFilter]) => {
                return (
                  (startDateFilter &&
                    postStartDate >= startDateFilter &&
                    endDateFilter &&
                    postEndDate <= endDateFilter) ||
                  endDateFilter?.getFullYear() === 1970
                )
              })
            })
          })

          setAvailablePosts(parsedAvailablePostsFilteredByAvailability)
        }
      }

      loadRelevantHousePreviews()
    }
  }, [userId, availabilityFilter, userType, landlordLocation, housitterLocations])

  function handleAvailabilityFilterChange(index: number, updatedRange: DatePickerSelection) {
    const modifiedAvailabilityFilter = [...availabilityFilter]
    const [updatedStartDate, updatedEndDate] = updatedRange
    if (!updatedStartDate && !updatedEndDate) {
      // the Anytime case
      updatedRange = [new Date(), new Date(0)]
    }
    modifiedAvailabilityFilter[index] = updatedRange

    setAvailabilityFilter(modifiedAvailabilityFilter)
  }

  function addAvailabilityFilterRange() {
    setAvailabilityFilter([...availabilityFilter, [new Date(), new Date(0)]])
  }

  function removeAvailabilityFilterRange(index: number) {
    const ranges = [...availabilityFilter]
    ranges.splice(index, 1)
    setAvailabilityFilter(ranges)
  }

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
      case SortingProperties.HousitterDashboard.Duration:
        if (sortOrder === 'asc') {
          sortedPosts.sort((a, b) => a.duration - b.duration)
        } else {
          sortedPosts.sort((a, b) => b.duration - a.duration)
        }
    }

    setAvailablePosts(sortedPosts)
  }

  return (
    <div>
      <div className="content-wrapper">
        <Container>
          <h2>Looking for a great house?</h2>
          <h5>There are {availablePosts.length} available houses for these dates and locations.</h5>

          <Row>
            <Col md={3}>
              {userType === UserType.Landlord && (
                <Card className="sidebar-filter">
                  {isPostComplete ? (
                    <Button
                      onClick={() => {
                        router.push(PageRoutes.LandlordRoutes.EditHouse)
                      }}
                    >
                      Edit Post
                    </Button>
                  ) : (
                    <p style={{ marginBottom: 0 }}>
                      💡
                      <strong
                        onClick={() => {
                          router.push(PageRoutes.LandlordRoutes.EditHouse)
                        }}
                        style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        complete your post
                      </strong>
                      <br />
                      to increase your chances of finding a sitter
                    </p>
                  )}
                </Card>
              )}

              <Card className="sidebar-filter">
                <h4>Dates</h4>
                {availabilityFilter.map(([startDate, endDate], index) => (
                  <div key={index}>
                    <DatePicker
                      selectsRange={true}
                      startDate={endDate?.getFullYear() === 1970 ? null : startDate}
                      endDate={endDate?.getFullYear() === 1970 ? null : endDate}
                      placeholderText="Anytime"
                      isClearable={true}
                      onChange={(update) => {
                        handleAvailabilityFilterChange(index, update)
                      }}
                    />
                    {index === availabilityFilter.length - 1 && (
                      <div style={{ textAlign: 'right' }}>
                        {availabilityFilter.length > 1 && (
                          <Button
                            variant="danger"
                            className="w-100"
                            onClick={() => removeAvailabilityFilterRange(index)}
                          >
                            {' '}
                            Remove Range
                          </Button>
                        )}
                        <Button
                          variant="warning"
                          className="mt-4 w-100"
                          onClick={addAvailabilityFilterRange}
                        >
                          Add Range
                        </Button>
                      </div>
                    )}
                    <hr className="mt-4" />
                  </div>
                ))}
                <h4 className="mt-2">Location</h4>
                {isHousitter ? (
                  <LocationSelector
                    selectionType={isHousitter ? 'checkbox' : 'radio'}
                    isHousitter={isHousitter}
                    updateDbInstantly={false}
                  />
                ) : (
                  <Dropdown>
                    <Dropdown.Toggle variant="success">
                      {landlordLocation !== LocationSelectionEventKeys.Anywhere
                        ? LocationDescriptions[landlordLocation]
                        : LocationSelectionEventKeys.Anywhere}
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
                <hr />

                <h4 className="mt-0">Sort</h4>
                <Sorter
                  sortingProperties={Object.values(SortingProperties.HousitterDashboard)}
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
                        duration={post.duration}
                        dateRanges={post.dateRanges}
                      />
                    </Col>
                  ))
                )}
              </Row>
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />
    </div>
  )
}
