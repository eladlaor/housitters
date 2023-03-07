import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import moment from 'moment'

// can maybe type as HousePostInput
export default function HousePost({
  title,
  text,
  location,
  startDate,
  endDate,
}: {
  title: string
  text: string
  location: string
  startDate: Date
  endDate: Date
}) {
  return (
    <Card bg="light" style={{ width: '18rem' }}>
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>{text}</Card.Text>
        <Button variant="secondary">Send message</Button>
        <Card.Text>{location}</Card.Text>
        <Card.Text>{moment(new Date()).format('YYYY-MM-DD')} - 2023-03-10</Card.Text>
        <Card.Text>can also show total days</Card.Text>
      </Card.Body>
    </Card>
  )
}
