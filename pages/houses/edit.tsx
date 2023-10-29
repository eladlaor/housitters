import { Container, Button, Form, FormControl, Row, InputGroup, Col } from 'react-bootstrap'
import { LocationDescriptions, LocationIds, PageRoutes, UserType } from '../../utils/constants'
import DatePicker from 'react-datepicker'
import { useSupabaseClient, useSessionContext, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { removeInvalidCharacters, resizeImage } from '../../utils/files'
import { useRouter } from 'next/router'
import moment from 'moment'
import { getUrlFromSupabase, handleError } from '../../utils/helpers'
import { DatePickerSelection } from '../../types/clientSide'
import { useTranslation } from 'react-i18next'

export default function EditHouse() {
  const supabaseClient = useSupabaseClient()
  const { isLoading, session } = useSessionContext()
  const router = useRouter()
  const user = useUser()
  const userId = user?.id

  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [dogs, setDogs] = useState(0)
  const [cats, setCats] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [dateRanges, setDateRanges] = useState([[null, null]] as DatePickerSelection[])
  const { t } = useTranslation()

  useEffect(() => {
    if (!isLoading && !userId) {
      router.push('/')
    }
    if (!isLoading && userId) {
      supabaseClient
        .from('posts')
        .select('*')
        .eq('landlord_id', userId)
        .single()
        .then(({ data }) => {
          setTitle(data?.title)
          setDescription(data?.description)
          setImageUrls(data?.images_urls || [])
        })

      supabaseClient
        .from('landlords')
        .select('*')
        .eq('user_id', userId)
        .single()
        .then(({ data }) => {
          setLocation(data?.location)
        })

      supabaseClient
        .from('available_dates')
        .select('*')
        .eq('user_id', userId)
        .then(({ data }) => {
          if (data)
            setDateRanges(data.map((row) => [new Date(row.start_date), new Date(row.end_date)]))
        })

      supabaseClient
        .from('pets')
        .select('*')
        .eq('user_id', userId)
        .single()
        .then(({ data }) => {
          setDogs(data?.dogs)
          setCats(data?.cats)
        })
    }
  }, [isLoading, session])

  async function updateDateRange(index: number, updatedRange: [null | Date, null | Date]) {
    const ranges = [...dateRanges]

    const [updatedStartDate, updatedEndDate] = updatedRange
    if (!updatedStartDate && !updatedEndDate) {
      // the Anytime case
      updatedRange = [new Date(), new Date(0)]
    }

    ranges[index] = updatedRange

    const startDateDb = new Date(
      moment(updatedRange[0] ? updatedRange[0] : new Date()).format('YYYY-MM-DD')
    )
    const endDateDb = new Date(
      moment(updatedRange[1] ? updatedRange[1] : new Date(0)).format('YYYY-MM-DD')
    )

    const availabilityToUpsert = {
      user_id: userId,
      start_date: startDateDb,
      end_date: endDateDb,
      period_index: index,
      user_type: UserType.Landlord,
    }

    let { error: datesUpdateError } = await supabaseClient
      .from('available_dates')
      .upsert(availabilityToUpsert)

    if (datesUpdateError) {
      alert(datesUpdateError.message)
      throw datesUpdateError
    }

    setDateRanges(ranges)
  }

  async function removeDateRange(index: number) {
    let { error: deletionError } = await supabaseClient
      .from('available_dates')
      .delete()
      .eq('period_index', index)
      .eq('user_id', user?.id)

    if (deletionError) {
      return handleError(
        deletionError.message,
        'edit remove date range from available_dates delete operation'
      )
    }
    const ranges = [...dateRanges]
    ranges.splice(index, 1)
    setDateRanges(ranges)
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    let { error: postUploadError } = await supabaseClient.from('posts').upsert({
      landlord_id: userId,
      title,
      description,
      images_urls: imageUrls,
      is_active: true,
    })

    if (postUploadError) {
      console.log(postUploadError)
      debugger
      return
    }

    let { error: petUploadError } = await supabaseClient.from('pets').upsert({
      user_id: userId,
      dogs,
      cats,
    })

    if (petUploadError) {
      console.log(petUploadError)
      debugger
      return
    }

    let { error } = await supabaseClient
      .from('landlords')
      .update({
        location,
      })
      .eq('user_id', userId)

    if (error) {
      console.log(error)
      debugger
      return
    }

    alert('successfuly updated post')
    router.push(PageRoutes.HousitterRoutes.Home)
  }

  async function onPostImageSelection(event: any) {
    setUploading(true)
    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      let newfiles = []
      for (const file of event.target.files) {
        const fileName = removeInvalidCharacters(file.name)
        const resizedImage = await resizeImage(file, 1920, 1080)

        let { error: uploadError } = await supabaseClient.storage
          .from('posts')
          .upload(`${user?.id}-${fileName}`, resizedImage, { upsert: true })

        if (uploadError) {
          alert(`error in landlords/Home trying to upload an image to storage ` + uploadError)
          throw uploadError
        }

        newfiles.push(fileName)
        setImageUrls([...new Set([...imageUrls, ...newfiles])])
      }
    } catch (error: any) {
      console.log('failed selecting new image for post. Error: ' + error)
      debugger
    }
    setUploading(false)
  }

  async function handleDeleteImage(index: number) {
    const images = JSON.parse(JSON.stringify(imageUrls))
    images.splice(index, 1)
    setImageUrls(images)
  }

  function addDateRange() {
    setDateRanges([...dateRanges, [new Date(), new Date(0)]])
  }

  return (
    <Container>
      <h1>Edit My Post</h1>
      <Form>
        <Row>
          <Col>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <FormControl
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                }}
              />
            </Form.Group>

            <Form.Group className="mt-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                size="sm"
                as="textarea"
                rows={5}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                }}
              ></Form.Control>
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Upload some pics </Form.Label>
              <input
                onChange={onPostImageSelection}
                type="file"
                name="file"
                accept="image/*"
                multiple
              />

              {uploading && <p>Uploading... Please wait.</p>}

              {imageUrls?.map((url: string, index: number) => (
                <div key={index}>
                  <div
                    style={{ cursor: 'pointer', marginLeft: '-1rem', marginBottom: '-2.5rem' }}
                    onClick={(e) => handleDeleteImage(index)}
                    key={`delete-${index}`}
                  >
                    ❌
                  </div>
                  <img
                    src={getUrlFromSupabase(session?.user?.id + '-' + url, 'posts')}
                    style={{ maxWidth: '5rem', maxHeight: '5rem', margin: '1rem' }}
                    key={index}
                  />
                </div>
              ))}
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Availability</Form.Label>

              {dateRanges &&
                dateRanges.map(([start, end], index) => (
                  <div key={index}>
                    <Row>
                      <Col>
                        <DatePicker
                          selectsRange={true}
                          startDate={end?.getFullYear() === 1970 ? null : start}
                          endDate={end?.getFullYear() === 1970 ? null : end}
                          placeholderText="Anytime"
                          onChange={(value) => {
                            updateDateRange(index, value)
                          }}
                          isClearable={true}
                        />
                        {index === dateRanges.length - 1 && (
                          <div style={{ textAlign: 'right' }}>
                            {dateRanges.length > 1 && (
                              <Button
                                variant="danger"
                                className="mt-4 w-100"
                                onClick={() => removeDateRange(index)}
                              >
                                Remove Range
                              </Button>
                            )}
                            <Button variant="warning" className="mt-4 w-100" onClick={addDateRange}>
                              {t('sidebarFilter.dates.addRange')}
                            </Button>
                          </div>
                        )}
                      </Col>
                    </Row>
                    <hr />
                  </div>
                ))}
              <br />
            </Form.Group>
            <Form.Group>
              <Form.Label>Where</Form.Label>

              <Form.Select
                value={location || ''}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Default select example"
              >
                {Object.entries(LocationDescriptions).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Pets</Form.Label>
              <Row>
                <Col>
                  <InputGroup>
                    <InputGroup.Text>🐶</InputGroup.Text>
                    <Form.Control
                      placeholder="# of dogs"
                      type="number"
                      value={dogs}
                      min={0}
                      onChange={(e) => setDogs(parseInt(e.target.value))}
                    />
                  </InputGroup>
                </Col>
                <Col>
                  <InputGroup>
                    <InputGroup.Text>🐱</InputGroup.Text>
                    <Form.Control
                      placeholder="# of cats"
                      type="number"
                      value={cats}
                      min={0}
                      onChange={(e) => setCats(parseInt(e.target.value))}
                    />
                  </InputGroup>
                </Col>
              </Row>
            </Form.Group>
          </Col>
        </Row>
        <Button type="submit" onClick={(e) => handleSubmit(e)}>
          Save
        </Button>
      </Form>
    </Container>
  )
}
