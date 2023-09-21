import { useRouter } from 'next/router'
import { selectPrimaryUseState } from '../../slices/userSlice'
import DatePicker from 'react-datepicker'

import {
  LocationDescriptions,
  LocationSelectionEventKeys,
  SortingProperties,
} from '../../utils/constants'
import { DatePickerSelection, DbAvailableHousitter } from '../../types/clientSide'
import { UserType, PageRoutes } from '../../utils/constants'
import { Button, Card, Dropdown } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'

import { Col, Container, Row } from 'react-bootstrap'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import AvailableHousitter from '../../components/AvailableHousitter'
import { handleError } from '../../utils/helpers'
import Footer from '../../components/Footer'
import Sorter from '../../components/Sorter'

export default function Home() {
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const userId = user?.id
  const router = useRouter()
  const userTypeRedux = useSelector(selectPrimaryUseState)
  const userType = router.query.userType || userTypeRedux

  const [dateRange, setDateRange] = useState([null, null] as (null | Date)[])
  const [startDate, endDate] = dateRange
  const [location, setLocation] = useState(null as null | string)

  const [housitters, setHousitters] = useState([{} as any]) // TODO: lets improve this type
  const [selectedHousitterId, setSelectedHousitterId] = useState('' as string)
  // const [isThereAnySelectedSitter, setIsThereAnySelectedSitter] = useState(false)
  const [
    preConfirmedSelectionOfClosedSitsPerSitter,
    setPreConfirmedSelectionOfClosedSitsPerSitter,
  ] = useState({
    housitterId: '',
    startDates: [],
  } as {
    housitterId: string
    startDates: string[]
  })

  // const isActivePost = useSelector(selectIsActiveState)
  const [isPostComplete, setIsPostComplete] = useState(true)

  const [availabilityFilter, setAvailabilityFilter] = useState([
    [null, null],
  ] as DatePickerSelection[])

  useEffect(() => {
    if (!userId) {
      return
    }

    const loadAvailability = async () => {
      const { error: availabilityError, data: availabilityData } = await supabaseClient
        .from('available_dates')
        .select(`start_date, end_date, user_id`)
        .eq('user_id', userId)
      if (availabilityError) {
        return handleError(
          availabilityError.message,
          'housitters.index.useEffect availability query'
        )
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
      router.push('/')
    } else {
      const getData = async () => {
        let query = supabaseClient
          .from('profiles')
          .select(
            `id, first_name, last_name, avatar_url, housitters!inner (
            id, locations, experience, about_me
          ), available_dates!inner (user_id, start_date, end_date)`
          )
          .eq('primary_use', 'housitter')
          .contains('housitters.locations', [location])

        let { data: housitterData, error: housitterError } = await query

        if (housitterError) {
          return handleError(housitterError.message, 'housitters.index.useEffect')
        }

        let availableHousitter: DbAvailableHousitter
        let availableHousitters: (typeof availableHousitter)[] = []

        if (housitterData) {
          for (const housitter of housitterData) {
            let parsedSitterAvailability: { startDate: Date; endDate: Date }[] = []
            parsedSitterAvailability = (
              housitter.available_dates as { start_date: string; end_date: string }[]
            ).map(({ start_date, end_date }: { start_date: string; end_date: string }) => ({
              startDate: new Date(start_date),
              endDate: new Date(end_date),
            }))

            let isSitterAvailableInFilterDates = false
            for (const sitterAvailabilityPeriod of parsedSitterAvailability) {
              const sitterStartDate = sitterAvailabilityPeriod.startDate
              const sitterEndDate = sitterAvailabilityPeriod.endDate
              isSitterAvailableInFilterDates = availabilityFilter.some(
                ([startDateFilter, endDateFilter]) => {
                  return (
                    endDateFilter?.getFullYear() === 1970 ||
                    (startDateFilter &&
                      sitterStartDate >= startDateFilter &&
                      endDateFilter &&
                      sitterEndDate <= endDateFilter)
                  )
                }
              )
            }

            if (!isSitterAvailableInFilterDates) {
              continue
            }

            availableHousitter = {
              firstName: housitter.first_name,
              lastName: housitter.last_name,
              housitterId: housitter.id,
              avatarUrl: housitter.avatar_url,
              availability: parsedSitterAvailability,
              locations: [],
              experience: 0,
              about_me: '',
            }

            // shouldn't be an array, but due to some supabase inconsistency, this is here as a safeguard
            if (Array.isArray(housitter.housitters)) {
              availableHousitter.locations = housitter.housitters[0].locations
              availableHousitter.experience = housitter?.housitters[0].experience
              availableHousitter.about_me = housitter?.housitters[0].about_me
            } else {
              availableHousitter.locations = housitter.housitters?.locations
              availableHousitter.experience = housitter?.housitters?.experience
              availableHousitter.about_me = housitter?.housitters?.about_me
            }

            availableHousitters.push(availableHousitter)
          }

          if (startDate && endDate) {
            availableHousitters = availableHousitters.filter((sitter) =>
              sitter.availability.some(
                (availability) =>
                  availability.startDate <= startDate && availability.endDate >= endDate
              )
            )
          }

          setHousitters(availableHousitters)

          if (userType === UserType.Landlord) {
            const { error, data } = await supabaseClient
              .from('posts')
              .select('title, description, images_urls')
              .eq('landlord_id', userId)
              .single()

            if (error) {
              return handleError(error.message, 'housitters.index.useEffect')
            }

            if (!data?.title || !data?.description || !data?.images_urls) {
              setIsPostComplete(false)
            }
          }
        }
      }

      getData().catch((e) => {
        console.log(e.message)
      })
    }
  }, [userId, availabilityFilter, location, dateRange])

  function sortHousitters(sortByProperty: string, sortOrder: string) {
    let sortedHousitters: any[] = [...housitters]
    if (typeof sortedHousitters[0][sortByProperty] === 'string') {
      if (sortOrder === 'asc') {
        sortedHousitters.sort((a, b) => a[sortByProperty].localeCompare(b[sortByProperty]))
      } else {
        sortedHousitters.sort((a, b) => b[sortByProperty].localeCompare(a[sortByProperty]))
      }
    } else {
      if (sortOrder === 'asc') {
        sortedHousitters.sort((a, b) => a[sortByProperty] - b[sortByProperty])
      } else {
        sortedHousitters.sort((a, b) => b[sortByProperty] - a[sortByProperty])
      }
    }

    setHousitters(sortedHousitters)
  }

  async function handleBindSitterWithPeriod(e: any) {
    e.preventDefault()

    const preConfirmedStartPeriodsToModify = [
      ...preConfirmedSelectionOfClosedSitsPerSitter.startDates,
    ]
    const selectedStartDate = e.target.value
    const indexOfSelectedStartDate = preConfirmedStartPeriodsToModify.indexOf(selectedStartDate)

    if (indexOfSelectedStartDate === -1) {
      preConfirmedStartPeriodsToModify.push(selectedStartDate)
    } else {
      preConfirmedStartPeriodsToModify.splice(indexOfSelectedStartDate, 1)
    }

    // again, strangely, the code seems to be structured properly in terms of order of operations, but still setTimeout seems to be the only solution for the race condition
    setTimeout(() => {
      setPreConfirmedSelectionOfClosedSitsPerSitter({
        housitterId: selectedHousitterId,
        startDates: preConfirmedStartPeriodsToModify,
      })
    }, 0)
  }

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

  return (
    <div>
      <div className="content-wrapper">
        <Container>
          <h2>Looking for a house-sitter?</h2>
          <h5>There are currently {housitters.length} available sitters for you.</h5>

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
                      to increase your chances of finding a sitter!
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
                <h4>Location</h4>
                <Dropdown>
                  <Dropdown.Toggle variant="success">
                    {location
                      ? LocationDescriptions[location]
                      : LocationSelectionEventKeys.Anywhere}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setLocation(null)}>Anywhere</Dropdown.Item>
                    <Dropdown.Divider />
                    {Object.entries(LocationDescriptions).map(([key, value]) => (
                      <Dropdown.Item key={key} onClick={() => setLocation(key)}>
                        {value}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
                <hr />
                <h4>Sort</h4>

                <Sorter
                  sortingProperties={Object.values(SortingProperties.LandlordDashboard)}
                  sortElementsHandler={sortHousitters}
                />
              </Card>
            </Col>

            <Col md={9} style={{ paddingRight: '30px' }}>
              <Row>
                {housitters.length == 0 ? (
                  <p style={{ marginTop: '2rem', fontSize: '1.5rem', textAlign: 'center' }}>
                    😢
                    <br />
                    Sorry, but there are no sitters matching your search. Please try adjusting your
                    filters.
                  </p>
                ) : (
                  housitters.map(
                    (
                      sitter: any,
                      index: number // TODO: type 'sitter' with a new type of Db housitterdata
                    ) => (
                      <AvailableHousitter
                        housitterId={sitter.housitterId}
                        firstName={sitter.firstName}
                        lastName={sitter.lastName}
                        experience={sitter.experience}
                        about_me={
                          sitter.about_me
                            ? sitter.about_me
                            : `${sitter.firstName} didn't write a description yet.`
                        }
                        avatarUrl={sitter.avatarUrl}
                        key={index}
                      />
                    )
                  )
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
