import Card from 'react-bootstrap/Card'
import { HousitterCardProps } from '../types/clientSide'
import Button from 'react-bootstrap/Button'

export default function Housitter({ props }: { props: HousitterCardProps }) {
  return (
    <div>
      <Card bg="light" style={{ width: '18rem' }}>
        <Card.Body>
          <Card.Title>some title</Card.Title>
          <Card.Text>
            {props.firstName} {props.lastName}
          </Card.Text>
          <Button variant="secondary">Send message</Button>
        </Card.Body>
      </Card>
    </div>
  )
}
