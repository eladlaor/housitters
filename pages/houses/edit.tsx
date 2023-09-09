import { Container, Button, Form, FormControl, Row, InputGroup, Col } from 'react-bootstrap'
import { LocationDescriptions, PageRoutes, UserType } from '../../utils/constants'
import DatePicker from 'react-datepicker'
import AvailabilitySelector from '../../components/AvailabilitySelector'
import { useSupabaseClient, useSessionContext, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { removeInvalidCharacters, resizeImage } from '../../utils/files'
import { useRouter } from 'next/router'
import moment from 'moment'
import { getUrlFromSupabase } from '../../utils/helpers'

export default function EditHouse() {
  const supabaseClient = useSupabaseClient()
  const { isLoading, session } = useSessionContext()
  const router = useRouter()
  const user = useUser()

  const [availability, setAvailability] = useState([])
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [dogs, setDogs] = useState(0)
  const [cats, setCats] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [dateRanges, setDateRanges] = useState([[null, null]] as [null | Date, null | Date][])

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/')
    }
    if (!isLoading && session) {
      supabaseClient
        .from('posts')
        .select('*')
        .eq('landlord_id', session.user.id)
        .single()
        .then(({ data }) => {
          setTitle(data?.title)
          setDescription(data?.description)
          setImageUrls(data?.images_urls || [])
        })

      supabaseClient
        .from('landlords')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
        .then(({ data }) => {
          setLocation(data?.location)
        })

      supabaseClient
        .from('available_dates')
        .select('*')
        .eq('user_id', session.user.id)
        .then(({ data }) => {
          if (data)
            setDateRanges(data.map((row) => [new Date(row.start_date), new Date(row.end_date)]))
        })

      supabaseClient
        .from('pets')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
        .then(({ data }) => {
          setDogs(data?.dogs)
          setCats(data?.cats)
        })
    }
  }, [isLoading, session])

  function addDateRange() {
    setDateRanges([...dateRanges, [null, null]])
  }

  // TODO: not finished yet: fix the remove period button
  // TODO: add the Anytime support
  // update in db in order to keep track of additional periods after re-render
  async function updateDateRange(index: number, value: [null | Date, null | Date]) {
    const ranges = [...dateRanges]
    ranges[index] = value

    const startDateDb = new Date(moment(value[0] ? value[0] : new Date()).format('YYYY-MM-DD'))
    const endDateDb = new Date(moment(value[1] ? value[1] : new Date(0)).format('YYYY-MM-DD'))

    const availabilityToUpsert = {
      user_id: session!.user.id,
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

  // TODO: fix
  function removeDateRange(index: number) {
    const ranges = [...dateRanges]
    ranges.splice(index, 1)
    setDateRanges(ranges)
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    let { error: postUploadError } = await supabaseClient.from('posts').upsert({
      landlord_id: session!.user.id,
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
      user_id: session!.user.id,
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
      .eq('user_id', session!.user.id)

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

  return (
    <Container>
      <h1>Edit post</h1>
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
                          startDate={start}
                          endDate={end}
                          placeholderText="Anytime"
                          onChange={(value) => {
                            updateDateRange(index, value)
                          }}
                          isClearable={true}
                        />
                      </Col>
                      <Col xs="auto">
                        <Button className="w-auto" onClick={() => {}} variant="primary-outline">
                          Anytime
                        </Button>
                      </Col>
                      <Col xs="auto">
                        <Button
                          className="w-auto"
                          disabled={!index}
                          onClick={() => removeDateRange(index)}
                          variant="primary-outline"
                        >
                          ❌
                        </Button>
                      </Col>
                    </Row>
                  </div>
                ))}
              <br />
              <div style={{ textAlign: 'right' }}>
                <Button onClick={addDateRange}>Add another range</Button>
              </div>

              {availability.map((period, index) => (
                <AvailabilitySelector
                  key={index}
                  period={period}
                  index={index}
                  updateDbInstantly={true}
                />
              ))}
            </Form.Group>
            <Form.Group>
              <Form.Label>Where</Form.Label>

              <Form.Select
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Default select example"
              >
                {Object.entries(LocationDescriptions).map(([key, value]) => (
                  <option key={key} selected={key == location} value={key}>
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

      {/*<HousePreview
                        landlordId={user ? user.id : ''}
                        title={title}
                        description={description}
                        location={oldLocation}
                        availability={availability}
                        dogs={pets.dogs}
                        cats={pets.cats}
                        imagesUrls={fileNames} // TODO: should have default image
                        addMissingDetailsHandler={handleShowNewPostModal}
                      />
                      <Button variant="danger" onClick={(e) => handleDeletePost(e)}>
                        Delete post
                      </Button>
                      {availability.length > closedSits.length && (
                        <Button variant="success" onClick={handleFoundSitter}>
                          I found a sitter
                        </Button>
                      )}

                      <Modal
                        show={showFoundSitterModal}
                        onHide={() => setShowFoundSitterModal(false)}
                      >
                        <Modal.Header>
                          <Modal.Title>Select the sitter you found</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <div>
                            <Form>
                              {housitters.map((sitter: any, index: number) => {
                                const isThisTheSelectedHousitter =
                                  sitter.housitterId === selectedHousitterId

                                return (
                                  <div key={index}>
                                    <Form.Group>
                                      <Form.Check
                                        type="radio"
                                        key={index}
                                        onChange={handleSelectedFoundSitter}
                                        value={sitter.housitterId}
                                        label={`${sitter.firstName} ${sitter.lastName}`}
                                        name="singleSitterChoice"
                                        checked={isThisTheSelectedHousitter}
                                      />
                                      {isThereAnySelectedSitter && isThisTheSelectedHousitter && (
                                        <ListGroup>
                                          <ListGroup.Item>
                                            {availability.map((period, index) => {
                                              const startDateAsString = period.startDate.toString()
                                              if (
                                                !closedSits.find(
                                                  (closedSit) =>
                                                    closedSit.startDate === startDateAsString
                                                )
                                              ) {
                                                return (
                                                  <Form.Check
                                                    type="checkbox"
                                                    key={index}
                                                    label={`${startDateAsString} until ${period.endDate.toString()}`}
                                                    name={startDateAsString}
                                                    value={startDateAsString}
                                                    onChange={handleBindSitterWithPeriod}
                                                    checked={preConfirmedSelectionOfClosedSitsPerSitter.startDates.includes(
                                                      startDateAsString
                                                    )}
                                                  />
                                                )
                                              }
                                            })}
                                          </ListGroup.Item>
                                        </ListGroup>
                                      )}
                                    </Form.Group>
                                  </div>
                                )
                              })}
                              <hr />
                              <Button variant="primary" onClick={handleConfirmSitterSelection}>
                                Confirm
                              </Button>
                              <Button
                                type="submit"
                                variant="warning"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setShowFoundSitterModal(false)
                                }}
                              >
                                Cancel
                              </Button>
                            </Form>
                          </div>
                        </Modal.Body>
                      </Modal>
                      <Button onClick={handleShowNewPostModal}>Edit Post</Button>
      */}
    </Container>
  )
}
