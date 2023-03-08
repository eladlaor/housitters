import Card from 'react-bootstrap/Card'
import { HousitterCardProps } from '../types/clientSide'
import Button from 'react-bootstrap/Button'

export default function Housitter({ props }: { props: HousitterCardProps }) {
  return (
    <div>
      <Card bg="light" style={{ width: '18rem' }}>
        <Card.Body>
          <Card.Title>
            {' '}
            {props.firstName} {props.lastName}
          </Card.Title>
          <Card.Text>the about_me text</Card.Text>
          <Button variant="secondary">Send message</Button>
        </Card.Body>
      </Card>
    </div>
  )
}
