import { Button } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import { HousitterProps } from '../types/clientSide'

export default function Housitter({ props }: { props: HousitterProps }) {
  return (
    <div>
      <Card bg="light" style={{ width: '18rem' }}>
        <Card.Body>
          <Card.Title>
            {props.firstName} {props.lastName}
          </Card.Title>
          <Card.Text>{props.about_me}</Card.Text>
          <Button variant="secondary">Send message</Button>
        </Card.Body>
      </Card>
    </div>
  )
}
